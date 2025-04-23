const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const {
	Doctor,
	Patient,
	Appointment,
	Schedule,
	User,
	MedicalRecord,
} = require("../models");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const sequelize = require("../db");

const checkRole = require("../middleware/checkRole");

router.get("/", checkRole(["doctor", "nurse", "super-admin"]), async (req, res) => {
		try {
			const medical_records = await MedicalRecord.findAll({
				include: [
					{
						model: Patient,
						as: "patient",
						required: true,
					},
				],
			});

			return res.status(201).json(medical_records);
		} catch (error) {
			return res.status(500).json({ error: "Failed to fetch medical records" });
		}
	}
);

//this routing might be made redundant as i might start using id instead
router.get("/get-medical-record-by-patients-name", checkRole(["doctor", "nurse", "super-admin"]), async (req, res) => {
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
				include: [
					{
						model: MedicalRecord,
						as: "medical_record",
						required: false,
					},
				],
			});

			return res.json(patients);
		} catch (error) {
			return res.status(500).send("There has been a server error");
		}
	}
);

router.post("/create", checkRole(["doctor", "nurse", "super-admin"]), async (req, res) => {
	const transaction = await sequelize.transaction();
	const data = req.body;

	try {
		const medical_record = await MedicalRecord.create(data, { transaction });

		await transaction.commit();

		return res.status(201).json(medical_record);
	} catch (err) {
		await transaction.rollback();
		return res.status(500).json({ error: "Failed to create medical record" });
	}
});

router.get("/get-by/:id", checkRole(["doctor", "nurse", "super-admin"]), async (req, res) => {
		const id = req.params.id;

		try {
			const medical_record = await Patient.findOne({
				where: { id: id },
				include: [
					{
						model: MedicalRecord,
						as: "medical_record",
						required: false,
					},
				],
			});

			return res.status(201).json(medical_record);
		} catch (error) {
			return res.status(501).json({
				message: "there was an error fetching the medical record",
			});
		}
	}
);

router.post("/update/:id", checkRole(["doctor", "nurse", "super-admin"]), async (req, res) => {
	const transaction = await sequelize.transaction();
	try {
		const { id } = req.params;
		const [updated] = await MedicalRecord.update(req.body, {
			where: { id: id },
			transaction,
		});
		if (updated) {
			const updated_medical_record = await MedicalRecord.findOne({
				where: { id: id },
			});

			await transaction.commit();
			return res.status(200).json(updated_medical_record);
		} else {
			await transaction.rollback();
			throw new Error("Medical record not found");
		}
	} catch (err) {
		await transaction.rollback();
		return res.status(500).json({ error: "Failed to update medical record" });
	}
});

router.post("/delete/:id", checkRole(["super-admin"]), async (req, res) => {
	const transaction = await sequelize.transaction();
	const { id } = req.params;

	try {
		const medical_record = await MedicalRecord.findByPk(id);

		if (!medical_record) {
			await transaction.rollback();
			return res.status(404).json({ message: "Medical record not found" });
		}

		await medical_record.destroy({ transaction });
		await transaction.commit();
		return res.status(200).json({ message: "Medical Record deleted successfully" });
	} catch (error) {
		await transaction.rollback();
		return res.status(501).json({
			message: "There was an error deleting the medical record",
		});
	}
});

module.exports = router;
