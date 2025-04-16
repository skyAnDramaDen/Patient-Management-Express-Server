const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const sequelize = require("../db");

const {
	Doctor,
	Patient,
	Appointment,
	Schedule,
	User,
	MedicalRecord,
} = require("../models");

const checkRole = require("../middleware/checkRole");

const argon2 = require("argon2");
const saltRounds = 10;

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/", checkRole(["nurse", "super-admin"]), async (req, res) => {
	let page = parseInt(req.query.page) || 1;
	const pageSize = parseInt(req.query.pageSize) || 2;

	try {
		const totalRecords = await Patient.count();
		if (page > 2) {
			page -= 1;
		} else if (page == 2) {
			page = 1;
		} else if (page == 1) {
			page = 0;
		}

		const patients = await Patient.findAll({
			limit: pageSize,
			offset: page * pageSize,
		});

		res.json({
			patients,
			totalRecords,
			totalPages: Math.ceil(totalRecords / pageSize),
			currentPage: page,
		});

		// const patients = await Patient.findAll();
		// // console.log(patients);
		// res.json(patients);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch patients" });
	}
});

router.get("/patients-list", checkRole(["nurse", "doctor", "super-admin"]), async (req, res) => {
	try {
		const patients = await Patient.findAll({
			include: [
				{
					model: MedicalRecord,
					as: "medical_record",
					required: true
				}
			]
		})

		if (!patients) {
			res.status(404).json({
				message: "No patient records were retrieved"
			})
		}

		res.status(201).json(patients);
	} catch (error) {
		res.status(501).json({
			message: "There has been a server side error"
		})
	}
})

router.post("/create", checkRole(["nurse", "super-admin"]), async (req, res) => {
	const { username, password, role } = req.body.user;
	const transaction = await sequelize.transaction();

	try {
		if (!username || !password || !role) {
            throw new Error("Missing required user fields.");
        }

		const hashedPassword = await argon2.hash(password.trim());
		const user = await User.create({
			username,
			password: hashedPassword,
			role,
		}, { transaction });

		if (!req.body.patient) {
            throw new Error("Patient data is required.");
        }

		const patientData = { ...req.body.patient, userId: user.id };
		
		const patient = await Patient.create(patientData, { transaction });

		const medicalRecord = await MedicalRecord.create({ patientId: patient.id }, { transaction });
		await transaction.commit();

		res.status(201).json(patient);
	} catch (err) {
		await transaction.rollback();
		res.status(500).json(err);
	}
});

router.get("/get-patients-by-name", checkRole(["nurse", "super-admin"]), async (req, res) => {
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

		res.json(patients);
	} catch (error) {
		res.status(500).send("Server Error");
	}
});

router.put("/edit/:id", checkRole(["nurse", "super-admin"]), async (req, res) => {
	try {
		const { id } = req.params;
		const [updated] = await Patient.update(req.body, {
			where: { id: id },
		});
		if (updated) {
			const updatedPatient = await Patient.findOne({ where: { id: id } });
			res.status(200).json(updatedPatient);
		} else {
			throw new Error("Patient not found");
		}
	} catch (err) {
		res.status(500).json({ error: "Failed to update patient" });
	}
});

router.post("/delete/:id", checkRole(["super-admin"]), async (req, res) => {
	const { id } = req.params;

	try {
		const patient = await Patient.findByPk(id);

		if (!patient) {
			return res.status(404).json({ message: "Patient not found" });
		}

		await patient.destroy();
		res.status(200).json({ message: "Patient deleted successfully" });
	} catch (err) {
		res.status(501).json({
			message: "There was an error deleting the patient"
		})
	}
});

module.exports = router;
