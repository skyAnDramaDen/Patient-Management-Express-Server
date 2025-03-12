const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Doctor, Patient, Appointment, Schedule, User, MedicalRecord } = require('../models');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/", async (req, res) => {
    console.log("the very southern personn you met");
    try {
        const medical_records = await MedicalRecord.findAll({
            include: [
                {
                    model: Patient,
                    as: 'patient',
                    required: true
                }
            ]
        });

        res.status(201).json(medical_records);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch medical records' });
    }
})



//this routing might be made redundant as i might start using id instead
router.get("/get-medical-record-by-patients-name", async (req, res) => {
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
          },
          include: [
            {
                model: MedicalRecord,
                as: 'medical_record',
                required: false
            }
          ]
        });
        // console.log(patients);

        res.json(patients);
      } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).send('Server Error');
      }
})


router.post("/create", async (req, res) => {
    const data = req.body;

    try {
        const medical_record = await MedicalRecord.create(data);

        res.status(201).json(medical_record);
    } catch (err) {
        console.error('Failed to create medical record:', err);
        res.status(500).json({ error: 'Failed to create medical record' });
    }
})

// /get-by/${medical_record.id}`


router.get("/get-by/:id", async (req, res) => {
  // console.log("this route is being hit right now");
  const id = req.params.id;
  console.log(req.body, id);

  try {
    const medical_record = await Patient.findOne({
      where: { id: id },
      include: [
        {
          model: MedicalRecord,
          as: "medical_record",
          required: false,
        }
      ]
    });
    
    res.status(201).json(medical_record);
  } catch (error) {
    console.log(error);
  }
})

router.post("/update/:id", async (req, res) => {
  console.log('whats gotta be goung on here for a ehile');
    try {
        const { id } = req.params;
        const [updated] = await MedicalRecord.update(req.body, {
            where: { id: id }
        });
        if (updated) {
            const updated_medical_record = await MedicalRecord.findOne({ where: { id: id } });
            res.status(200).json(updated_medical_record);
        } else {
            throw new Error('Medical record not found');
        }
    } catch (err) {
        console.error('Failed to update medical record sentenced to s:', err);
        res.status(500).json({ error: 'Failed to update medical record' });
    }
})

module.exports = router;