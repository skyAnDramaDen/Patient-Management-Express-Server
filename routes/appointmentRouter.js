const express = require('express');
const router = express.Router();
const { Doctor, Patient, Appointment, Schedule, User, Admission } = require('../models');
const sequelize = require("../db");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const checkRole = require("../middleware/checkRole");

router.get("/", checkRole(["nurse", "super-admin"]), async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            include: [
                {
                    model: Doctor,
                    as: 'doctor',
                    required: true,
                },
                {
                    model: Patient,
                    as: 'patient',
                    required: true
                }
            ]
        });

        res.status(201).json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
})

router.post("/create", checkRole(["nurse", "super-admin"]), async (req, res) => {
	const transaction = await sequelize.transaction();

    const { patientId, doctorId, time, date, status } = req.body;
    try {
        const existing_appointment = await Appointment.findAll({
            where: {
                patientId: patientId,
                status: "scheduled",
            },
            transaction,
        })

        const existing_admission = await Admission.findAll({
            where: {
                patientId: patientId,
                status: "admitted",
            },
            transaction,
        })

        if (existing_admission.length > 0) {
            transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Patient is admitted and so an appointment cannot be set."
            });
        }

        if (existing_appointment.length > 0) {
            transaction.rollback();
            return res.status(400).json({ error: "Patient already has a scheduled appointment." });
        }
        const created_appointment = await Appointment.create(req.body, { transaction });
        transaction.commit();

        res.status(201).json(created_appointment);
    } catch (error) {
        transaction.rollback();
        
        res.status(500).json({
            success: false,
            message: "There was a server error.",
            error: error.message || "Unknown error occurred.",
        });
    }
})

router.post("/add-appointment-note/:id", checkRole(["super-admin", "doctor"]), async (req, res) => {
	const transaction = await sequelize.transaction();

    const { notes } = req.body;
    
    const id = req.params.id;

    try {
        const appointment = await Appointment.findOne({
            where: {
                id: id
            },
            transaction
        });

        if (!appointment) {
            return res.status(404).json({
                messge: "Appointment not found"
            })
        }

        appointment.notes = notes;
        await appointment.save({transaction});
        await transaction.commit();
        return res.status(200).json({
            success: true,
            message: "Doctor's note added successfully"
        });
    } catch (error) {
        await transaction.rollback();
        res.status(501).json({
            message: "There has been an error adding the doctor's note"
        });
    }

})

router.post("/conclude-appointment/:id", checkRole(["super-admin", "doctor"]), async (req, res) => {
    const transaction = await sequelize.transaction();
    const id = req.params.id;

    try {
        const appointment = await Appointment.findOne({
            where: {
                id: id,
            },
            transaction,
        })

        if (!appointment) {
            return res.status(401).json({
                success: false,
                message: "Appointment not found"
            })
        }

        if (appointment.status == "scheduled") {
            appointment.status = "completed";
            await appointment.save({transaction});
        }

        await transaction.commit();
        res.status(200).json({
            success: true,
            message: "The appointment has been completed",
            appointment: appointment
        });
    } catch (error) {
        transaction.rollback();
        res.status(500).json({
            success: false,
            message: "The appointment was not successfully set as completed."
        })
    }
})

router.get("/get-patient-appointment/:id", checkRole(["super-admin", "nurse"]), async (req, res) => {
    const id = req.params.id;

    try {
        const patient = await Patient.findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: Appointment,
                    as: "appointments",
                    required: true,
                    where: {
                        status: "scheduled"
                    }
                }
            ]
        })

        if (!patient) {
            return res.status(401).json({
                success: false,
                message: "Patient does note have a scheduled appointment."
            })
        }

        res.status(200).json(patient);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "There was a server error"
        });
    }
})

router.post("/reschedule-patient-appointment", async (req, res) => {
    const transaction = await sequelize.transaction();
    console.log(req.body);
    const { patientId, appointmentId, date, time, doctorId } = req.body;

    try {
        const appointment = await Appointment.findOne({
            where: {
                id: appointmentId,
            },
            transaction,
        })

        if (!appointment) {
            transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Appointment was not found."
            })
        }

        if (appointment.patientId != patientId) {
            transaction.rollback();
            return res.status(401).json({
                success: false,
                message: "Appointment is not relatred to the said patient."
            })
        }

        appointment.doctorId = doctorId;
        appointment.date = date;
        appointment.time = time;
        await appointment.save({ transaction })
        await transaction.commit();

        res.status(200).json({
            success: true,
            message: "The appointment has been rescheduled successfully",
            appointment: appointment,
        });
    } catch (error) {
        await transaction.rollback();
        console.log(error);
        res.status(500).json({
            success: false,
            message: "There was a server error"
        });
    }
})

module.exports = router;