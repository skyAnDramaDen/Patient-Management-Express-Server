const express = require("express");
const router = express.Router();
const { Op, Sequelize } = require('sequelize');

const { Doctor, Patient, Appointment, Schedule, User, Ward, Room, Bed, Admission, Floor } = require('../models');

router.get("/", async (req, res) => {
    try {
        const admission = Admission.findAll();

        res.status(201).json(admission);
    } catch (error) {
        console.log(error);
    }
})

router.post("/create", async (req, res) => {
    console.log("what about what is going on everywhere");
    const { bedId, patientId, reasonForAdmission } = req.body;

    console.log(req.body);

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

    console.log(patient_admissions);

    if (patient_admissions.length > 0) {
        return res.status(409).json({
            message: "The patient is already admitted and cannot be admitted again."
        });
    }

    const now = new Date();

    const admission_data = {
        bedId: bedId,
        patientId: patientId,
        admissionDate: now,
        reasonForAdmission: reasonForAdmission,
        status: "admitted",
    }

    try {
        // const admission = await Admission.create(admission_data);
        // res.status(201).json(admission);
    } catch (error) {
        console.log(error);
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
        console.error('Error fetching patients:', error);
        res.status(500).send('Server Error');
    }
})

router.post("/get-beds-by-type", async (req, res) => {
    const bedType = req.body.bedType;
    // console.log(bedType);

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

        // console.log(beds);
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

        console.log(beds);

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

        // console.log(wards[0].rooms);
        // console.log(wards);
        
        res.status(201).json(wards);
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;