const express = require("express");
const router = express.Router();
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../db');

const { Doctor, Patient, Appointment, Schedule, User, Ward, Room, Bed, Admission, Floor, WardAdmission, Transfer, HospitalCharge } = require('../models');

router.get("/", async (req, res) => {
    try {
        const admission = await Admission.findAll({
            include: [
                {
                    model: Patient,
                    as: "admissionPatient",
                    required: true,
                }
            ]
        });

        res.status(201).json(admission);
    } catch (error) {
        console.log(error);
    }
})

router.post("/create", async (req, res) => {
    const { bedId, patientId, reasonForAdmission, wardId: wardId, type: type } = req.body;
    const now = new Date();

    const admission_data = {
        bedId: bedId,
        patientId: patientId,
        admissionDate: now,
        reasonForAdmission: reasonForAdmission,
        status: "admitted",
        wardId: wardId,
        type: type
    }

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
            }
        })
    
        if (patient_admissions.length > 0) {
            await transaction.rollback();
            return res.status(409).json({
                message: "The patient is already admitted and cannot be admitted again."
            });
        }

        const admission = await Admission.create(admission_data, { transaction });

        const admissionFeeCategory = await BillingCategory.findOne({
            where: { retrievalName: 'admission_fee' }
        });

        if (!admissionFeeCategory) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Admission Fee category not found.' });
        }

        const hospitalCharge = await HospitalCharge.create({
            patientId,
            admissionId: admission.id,
            categoryId: admissionFeeCategory.id,
            quantity: 1,
            ratePerUnit: admissionFeeCategory.rate,
            totalCharge: admissionFeeCategory.rate * 1
        });
        
        await WardAdmission.create({
            admissionId: admission.id,
            wardId: wardId,
            transferDate: admission.admissionDate,
        });

        await transaction.commit();

        res.status(201).json({
            message: "Patient admitted successfully and Admission Fee charged.",
            admission,
            hospitalCharge
        });
        
    } catch (error) {
        await transaction.rollback();
        res.status(501).json(error);
    }
});

router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const admission = await Appointment.findByPk(id);
  
      if (!admission) {
        return res.status(404).json({ message: "Admission not found" });
      }
  
      await admission.destroy();
      res.status(200).json({ message: "Admission deleted successfully" });
    } catch (error) {
        console.log(error);
    }
})

router.get("/get-admission-by-patient/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const admission = await Admission.findOne({
            include: [
                {
                    model: Patient,
                    as: "admissionPatient",
                    required: true,
                    where: { id: id }
                }
            ]
        })

        res.status(201).json(admission);
    } catch (error) {
        console.log(error);
    }
})

router.get("/get-patient", async (req, res) => {
    const { search } = req.query;

    try {
        const patients = await Patient.findAll({
          where: {
            [Op.or]: [
              {
                firstName: {
                    [Op.like]: `%${search}%`
                }
              },
              {
                  lastName: {
                      [Op.like]: `%${search}%`
                  }
              }
            ]
          }
        });

        res.json(patients);
    } catch (error) {
        res.status(500).send('Server Error');
    }
})

router.post("/get-beds-by-type", async (req, res) => {
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
                type: bedType
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
                        }
                    ]
                }
            ]
        })

        res.status(201).json(beds);
    } catch (error) {
        console.log(error);
    }
})

router.get("/get-available-beds-by-ward/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const beds = await Bed.findAll({
            where: {
                status: "available"
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
                                id: id
                            }
                        }
                    ]
                }
            ]
        })

        res.status(201).json(beds);
    } catch (error) {
        console.log(error);
    }
})

router.get("/get-floors", async (req, res) => {
    try {
        const floors = await Floor.findAll();
        res.status(201).json(floors);
    } catch (error) {
        console.log(error);
    }
})

router.get("/get-floor-wards/:id", async (req, res) => {
    const id = req.params.id;
    
    try {
        const wards = await Ward.findAll({
            where: {
                floorId: id
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
                            required: false
                        }
                    ]
                }
            ]
        })

        res.status(201).json(wards);
    } catch (error) {
        console.log(error);
    }
})

router.get("/view-admission/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const admission = await Admission.findOne({
            where: {
                id: id
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
                                }
                            ]
                        }
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
                            required: true
                        }
                    ]
                }
            ]
        })

        res.status(201).json(admission);
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;