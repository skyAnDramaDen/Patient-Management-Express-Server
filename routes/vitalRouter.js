const express = require("express");
const router = express.Router();

const sequelize = require("../db");

const { Doctor, Patient, Appointment, Schedule, User, Vital } = require("../models");

const checkRole = require("../middleware/checkRole");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/get-patients-latest-vitals/:id", checkRole(["super-admin", "nurse"]), async (req, res) => {
    const id = req.params.id;
    try {
        const vitals = Vital.findOne({
            where: { patientId: req.params.id },
            order: [["createdAt", "DESC"]],
        })

        if (!latestVital) {
            return res.status(404).json({ message: "No vitals found for this patient" });
        }

        return res.status(200).json(latestVital);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "could not retrieve the latest vitals"
        })
    }
})

router.post("/create", async (req, res) => {
	const transaction = await sequelize.transaction();

	try {
        const vital = Vital.create(req.body, { transaction });

		await transaction.commit();

		return res
			.status(201)
			.json(vital);
	} catch (error) {
		await transaction.rollback();
		return res.status(500).send("The vital signs were not saved");
	}
});