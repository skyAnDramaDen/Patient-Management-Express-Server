const express = require("express");
const router = express.Router();
const { Op, Sequelize } = require("sequelize");
const sequelize = require("../db");

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const {
	Doctor,
	Patient,
	Appointment,
	Schedule,
	User,
	Ward,
	Room,
	Bed,
	Admission,
	Floor,
	WardAdmission,
	Transfer,
	HospitalCharge,
	BillingCategory,
	BillingInformation,
	ChargeBreakdown,
	PatientNurse,
	WardNurse,
	Nurse,
} = require("../models");

const checkRole = require("../middleware/checkRole");

router.get("/", checkRole(["nurse", "super-admin"]), async (req, res) => {
	try {
		const admission = await Admission.findAll({
            where: {
                status: "admitted",
            },
			include: [
				{
					model: Patient,
					as: "admissionPatient",
					required: true,
				},
				{
					model: WardAdmission,
					as: "wardAdmissions",
					required: true,
					include: [
						{
							model: Ward,
							as: "ward",
							required: true,
							include: [
								{
									model: Floor,
									as: "floor"
								}
							]
						},
					],
				},
			],
		});

		return res.status(201).json(admission);
	} catch (error) {
		return res.status(501).json(error);
	}
});

router.post("/create", checkRole(["nurse", "super-admin"]), async (req, res) => {
	const {
		bedId,
		patientId,
		reasonForAdmission,
		wardId: wardId,
		type: type,
	} = req.body;

	const now = new Date();

	const admission_data = {
		bedId: bedId,
		patientId: patientId,
		admissionDate: now,
		reasonForAdmission: reasonForAdmission,
		status: "admitted",
		wardId: wardId,
		type: type,
	};

	const transaction = await sequelize.transaction();

	try {
		const patient_admissions = await Admission.findAll({
			where: {
				patientId: patientId,
				status: "admitted",

				//below is for negation, sql equivalent of NOT
				// status: {
				//     [Sequelize.Op.ne]: 'admitted'
				// }
			},
			transaction,
		});

		if (patient_admissions.length > 0) {
			await transaction.rollback();
			return res.status(409).json({
				message:
					"The patient is already admitted and cannot be admitted again.",
			});
		}

		const admission = await Admission.create(admission_data, { transaction });

		const admissionFeeCategory = await BillingCategory.findOne({
			where: { retrievalName: "admission_fee" },
		});

		if (!admissionFeeCategory) {
			await transaction.rollback();
			return res
				.status(404)
				.json({ error: "Admission Fee category not found." });
		}

		const hospitalCharge = await HospitalCharge.create({
			patientId,
			admissionId: admission.id,
			categoryId: admissionFeeCategory.id,
			quantity: 1,
			ratePerUnit: admissionFeeCategory.rate,
			totalCharge: admissionFeeCategory.rate * 1,
		}, { transaction });

		await WardAdmission.create({
			admissionId: admission.id,
			wardId: wardId,
			transferDate: admission.admissionDate,
		}, { transaction });

		await transaction.commit();

		return res.status(201).json({
			message: "Patient admitted successfully and Admission Fee charged.",
			admission,
			hospitalCharge,
		});
	} catch (error) {
		await transaction.rollback();
		return res.status(501).json(error);
	}
});

router.post("/delete/:id", checkRole(["nurse", "super-admin"]), async (req, res) => {
	const { id } = req.params;
	const transaction = await sequelize.transaction();

	try {
		const admission = await Appointment.findByPk(id);

		if (!admission) {
			await transaction.rollback();
			return res.status(404).json({ message: "Admission not found" });
		}

		await admission.destroy({ transaction });
		await transaction.commit();
		return res.status(200).json({ message: "Admission deleted successfully" });
	} catch (error) {
		await transaction.rollback();
		return res.status(500).json(error);
	}
});

router.get("/get-admission-by-patient/:id", checkRole(["nurse", "super-admin"]), async (req, res) => {
	const id = req.params.id;

	try {
		const admission = await Admission.findOne({
			include: [
				{
					model: Patient,
					as: "admissionPatient",
					required: true,
					where: { id: id },
				},
			],
		});

		return res.status(201).json(admission);
	} catch (error) {
		return res.status(501).json(error);
	}
});

router.get("/get-patient", checkRole(["nurse", "super-admin"]), async (req, res) => {
	const { search } = req.query;

	try {
		const patients = await Patient.findAll({
			where: {
				[Op.or]: [
					{
						firstName: {
							[Op.like]: `%${search}%`,
						},
					},
					{
						lastName: {
							[Op.like]: `%${search}%`,
						},
					},
				],
			},
		});

		return res.json(patients);
	} catch (error) {
		return res.status(500).send("Server Error");
	}
});

router.post("/get-beds-by-type", checkRole(["nurse", "super-admin"]), async (req, res) => {
	const bedType = req.body.bedType;

	try {
		// const beds = await Bed.findAll({
		//     where: {
		//         [Op.or]: [
		//             { status: 'available' },
		//             { type: 'pediatric' }
		//         ]
		//     }
		// });

		const beds = await Bed.findAll({
			where: {
				status: "available",
				type: bedType,
			},
			include: [
				{
					model: Room,
					as: "room",
					required: true,
					include: [
						{
							model: Ward,
							as: "ward",
							required: true,
						},
					],
				},
			],
		});

		return res.status(201).json(beds);
	} catch (error) {
		return res.status(501).json(error);
	}
});

router.get("/get-available-beds-by-ward/:id", checkRole(["nurse", "super-admin"]), async (req, res) => {
	const id = req.params.id;

	try {
		const beds = await Bed.findAll({
			where: {
				status: "available",
			},
			include: [
				{
					model: Room,
					as: "room",
					required: true,
					include: [
						{
							model: Ward,
							as: "ward",
							required: true,
							where: {
								id: id,
							},
						},
					],
				},
			],
		});

		return res.status(201).json(beds);
	} catch (error) {
		return res.status(501).json(error);
	}
});

router.get("/get-floors", checkRole(["nurse", "super-admin"]), async (req, res) => {
	try {
		const floors = await Floor.findAll();
		return res.status(201).json(floors);
	} catch (error) {
		return res.status(501).json(error);
	}
});

router.get("/get-floor-wards/:id", checkRole(["nurse", "super-admin"]), async (req, res) => {
	const id = req.params.id;

	try {
		const wards = await Ward.findAll({
			where: {
				floorId: id,
			},
			include: [
				{
					model: Room,
					as: "rooms",
					required: false,
					include: [
						{
							model: Bed,
							as: "beds",
							required: false,
						},
					],
				},
			],
		});

		return res.status(201).json(wards);
	} catch (error) {
		return res.status(501).json(error);
	}
});

router.get("/view-admission/:id", checkRole(["nurse", "super-admin"]), async (req, res) => {
	const id = req.params.id;

	try {
		const admission = await Admission.findOne({
			where: {
				id: id,
			},
			include: [
				{
					model: Patient,
					as: "admissionPatient",
					required: true,
				},
				{
					model: WardAdmission,
					as: "wardAdmissions",
					include: [
						{
							model: Ward,
							as: "ward",
							require: true,
							include: [
								{
									model: Floor,
									as: "floor",
								},
							],
						},
					],
				},
				{
					model: Transfer,
					as: "transfers",
					include: [
						{
							//the alias for this is shortened and thats the convention
							//its actually previousBedId in the association but with
							//aliasing, the id part of the alias is taken out.
							//take note
							model: Bed,
							as: "previousBed",
							required: true,
						},
					],
				},
			],
		});

		return res.status(201).json(admission);
	} catch (error) {
		return res.status(501).json(error);
	}
});

router.get("/get-admission-billing-categories", checkRole(["nurse", "super-admin"]), async (req, res) => {
	try {
		const admission_billing_categories = await BillingCategory.findAll({
			where: {
				group: "admission_fees",
			},
		});

		return res.status(201).json(admission_billing_categories);
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Admission billing categories were not fetched."
		});
	}
});

router.post("/process-payment/:id", checkRole(["nurse", "super-admin"]), async (req, res) => {
	const id = req.params.id;

	let quantities = {
		hoursStayed: 0,
		lunches: 0,
		dinners: 0,
		breakfasts: 0,
	};

	const calculateStayDetails = (patient) => {
		let admissionDate;

		if (patient.admissions[0].admissionDate) {
			admissionDate = new Date(patient.admissions[0].admissionDate);
		}

		const now = new Date();

		const hoursStayed = Math.floor((now - admissionDate) / (1000 * 60 * 60));

		const daysStayed = Math.floor(hoursStayed / 24);
		const remainingHours = hoursStayed % 24;

		const currentHour = now.getHours();
		let breakfasts = daysStayed;
		let lunches = daysStayed;
		let dinners = daysStayed;

		if (currentHour >= 9) breakfasts += 1;
		if (currentHour >= 12) lunches += 1;
		if (currentHour >= 18) dinners += 1;

		return {
			hoursStayed,
			breakfasts,
			lunches,
			dinners,
		};
	};

	const transaction = await sequelize.transaction();

	const fetched_patient = await Patient.findOne({
		where: {
			id: id,
		},
		include: [
			{
				model: BillingInformation,
				as: "billing_information",
				required: false,
			},
			{
				model: Admission,
				as: "admissions",
				required: false,
				where: {
					status: "admitted",
				},
			},
		],
	});

	if (!fetched_patient) {
		return res.status(404).json({
			success: false,
			message: "Patient does not have billing details",
		});
	} else if (fetched_patient) {
		if (
			!fetched_patient.billing_information ||
			(!fetched_patient.billing_information.paymentMethodId &&
				!fetched_patient.billing_information.customerId)
		) {
			return res.status(404).json({
				success: false,
				message: "Patient does not have payment method details saved.",
			});
		} else {
			if (
				fetched_patient.billing_information.paymentMethodId &&
				fetched_patient.billing_information.customerId
			) {
				const billing_categories = await BillingCategory.findAll({
					where: {
						group: "admission_fees",
					},
				});

				let fees = {
					admissionFee: billing_categories.find((item) => item.code == "1123"),
					bedAllocationFee: billing_categories.find(
						(item) => item.code == "1244"
					),
					lunch: billing_categories.find((item) => item.code == "1327"),
					dinner: billing_categories.find((item) => item.code == "9251"),
					breakfast: billing_categories.find((item) => item.code == "8734"),
					hourlyBedUse: billing_categories.find((item) => item.code == "5230"),
				};

				const meals = calculateStayDetails(fetched_patient);

				const { lunches, dinners, breakfasts, hoursStayed } = meals;
				const calculateTotal = () => {
					let total = 0;
					let admission;

					if (fees.admissionFee) total += Number(fees.admissionFee.rate);

					if (fees.bedAllocationFee)
						total += Number(fees.bedAllocationFee.rate);
					if (fees.hourlyBedUse)
						total += Number(fees.hourlyBedUse.rate * hoursStayed);
					if (fees.lunch) total += Number(fees.lunch.rate * lunches);
					if (fees.dinner) total += Number(fees.dinner.rate * dinners);
					if (fees.breakfast) total += Number(fees.breakfast.rate * breakfasts);

					return total;
				};

				const calculateIndividualTotals = () => {
					let admission_fee_total = fees.admissionFee.rate;
					let bed_allocation_fee_total = fees.bedAllocationFee.rate;
					let hourly_bed_use_total = fees.hourlyBedUse.rate * hoursStayed;
					let lunch_total = fees.lunch.rate * lunches;
					let dinner_total = fees.dinner.rate * dinners;
					let breakfast_total = fees.breakfast.rate * breakfasts;

					return {
						admission_fee: {
							quantity: 1,
							total: admission_fee_total,
						},
						bed_allocation_fee: {
							quantity: 1,
							total: bed_allocation_fee_total,
						},
						hourly_bed_use: {
							quantity: hoursStayed,
							total: hourly_bed_use_total,
						},
						lunch: {
							quantity: lunches,
							total: lunch_total,
						},
						dinner: {
							quantity: dinners,
							total: dinner_total,
						},
						breakfast: {
							quantity: breakfasts,
							total: breakfast_total,
						},
					};
				};

				let individual_totals = calculateIndividualTotals();

				let total_amount;

				const charge_breakdowns = await ChargeBreakdown.findAll({
					where: {
						admissionId: fetched_patient.admissions[0].id,
					},
				});

				charge_breakdowns.forEach((charge_breakdown) => {
					total_amount += charge_breakdown.total;
				});

				if (charge_breakdowns.length > 0) {
					for (const charge_breakdown of charge_breakdowns) {
						await charge_breakdown.destroy();
					}
				}

				total_amount = calculateTotal();

				for (const billing_category of billing_categories) {
					if (individual_totals[billing_category.retrievalName]) {
						const { quantity, total } =
							individual_totals[billing_category.retrievalName];

						await ChargeBreakdown.create({
							patientId: fetched_patient.id,
							admissionId: fetched_patient.admissions[0].id,
							billingCategoryId: billing_category.id,
							quantity,
							totalCost: Number(total),
						});
					}
				}

				try {
					const paymentIntent = await stripe.paymentIntents.create({
						amount: Math.round(total_amount * 100),
						currency: "gbp",
						customer: fetched_patient.billing_information.customerId,
						payment_method: fetched_patient.billing_information.paymentMethodId,
						off_session: true,
						confirm: true,
					});

					await transaction.commit();

					return res.status(200).json({
						success: true,
						message: "Payment processed successfully",
						paymentIntent,
					});
				} catch (error) {
					await transaction.rollback();

					return res.status(500).json({
						success: false,
						message: "Failed to process payment",
						error: error.message,
					});
				}
			}
		}
	}
});

router.post("/save-billing-details", checkRole(["nurse", "super-admin"]), async (req, res) => {
	const { patientId, paymentMethodId } = req.body;

	if (!patientId || !paymentMethodId) {
		return res
			.status(400)
			.json({ message: "Patient ID and Payment Method ID are required" });
	}

	try {
		const patient = await Patient.findOne({
			where: {
				id: patientId,
			},
			include: [
				{
					model: BillingInformation,
					as: "billing_information",
					required: false,
				},
			],
		});

		if (!patient) {
			return res.status(404).json({ message: "Patient not found" });
		}

		const customer = await stripe.customers.create({
			email: patient.email,
		});

		await stripe.paymentMethods.attach(paymentMethodId, {
			customer: customer.id,
		});

		if (patient.billing_information[0]) {
			res.redirect(`/process-payment/${patientId}`);
		}

		await BillingInformation.create({
			patientId: patientId,
			paymentMethodId: paymentMethodId,
			customerId: customer.id,
			billingAddress: patient.addressLine1,
		});

		return res.redirect(`/process-payment/${patient.id}`);
	} catch (error) {
		return res.status(500).json({
			message:
				"An error occurred while creating the customer or attaching the payment method",
			error,
		});
	}
});

router.post("/discharge-patient/:id", checkRole(["nurse", "super-admin"]), async (req, res) => {
	const id = req.params.id;
	const payment_type = req.body.paymentType;

    const transaction = await sequelize.transaction();

	try {
		const admission = await Admission.findOne({
			where: {
				patientId: id,
				status: "admitted",
			},
		});

        if (!admission) {
			await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "No active admission found for this patient.",
            });
        }

        if (admission.status == "discharged") {
			await transaction.rollback();
            return res.status(200).json({
                success: true,
                message: "The patient has been discharged already.",
            });
        }

		admission.dischargeDate = new Date();

		admission.status = "discharged";
		admission.paymentType = payment_type;
		await admission.save({ transaction });
        await transaction.commit();
		return res.status(201).json({
			success: true,
			message: "Patient discharged successfully",
			admission: admission,
		});
	} catch (error) {
        await transaction.rollback();
		return res.status(500).json({
            success: false,
            message: "An error occurred while discharging the patient.",
        });
	}
});

router.post("/assign-patient-nurse", checkRole(["super-admin", "admin"]), async (req, res) => {
	const transaction = await sequelize.transaction();
	const { patientId, nurseId, admissionId } = req.body;
	let nurse;

	console.log(req.body);

	try {
		const existing_patient_nurse = await PatientNurse.findOne({
			where: {
				patientId,
				admissionId,
			}
		})
	
		if (existing_patient_nurse) {
			if (existing_patient_nurse.nurseId == nurseId) {
				await transaction.rollback();
				return res.status(409).json({
					success: false,
					message: "The nurse is already assigned to the patient"
				});
			}

			existing_patient_nurse.nurseId = nurseId;
			await existing_patient_nurse.save({ transaction });
			await transaction.commit();

			nurse = await Nurse.findOne({
				where: {
					id: nurseId,
				},
			})

			if (!nurse) {
				await transaction.rollback();
				return res.status(400).json({
					success: false,
					message: "No nure was found"
				});
			}

			return res.status(200).json({
				success: true,
				nurse: nurse,
			});
		} else {
			const patient_nurse = await PatientNurse.create({ patientId, nurseId, admissionId }, { transaction });
			await transaction.commit();

			nurse = await Nurse.findOne({
				where: {
					id: nurseId,
				},
			})

			if (!nurse) {
				await transaction.rollback();
				return res.status(400).json({
					success: false,
					message: "No nure was found"
				});
			}

			return res.status(200).json({
				nurse: nurse,
				success: true,
			});
		}
	} catch (error) {
		await transaction.rollback();
		return res.status(500).json(error);
	}
})

router.post("/get-assigned-nurse", checkRole(["super-admin", "admin"]), async (req, res) => {
	const { patientId, admissionId } = req.body;

	console.log(patientId, admissionId);

	try {
		const existing_patient_nurse = await PatientNurse.findOne({
			where: {
				patientId: patientId,
				admissionId: admissionId,
			},
			include: [
				{
				  model: Admission,
				  as: "admission",
				  where: { patientId, status: 'admitted' },
				  required: true,
				},
				{
				  model: Nurse,
				  as: "nurse",
				  required: true,
				}
			]
		})

		return res.status(200).json({
			success: true,
			assignedNurse: existing_patient_nurse,
		})
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "There was an eerror fetching the assigned nurse",
		})
	}

})

module.exports = router;
