const express = require('express');
const router = express.Router();
const sequelize = require("../db");

const checkRole = require("../middleware/checkRole");

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
    Nurse,
} = require("../models");


router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const formatTime = (time) => {
    if (time.includes('T')) {
        const [date, timePart] = time.split('T');
        const [hours, minutes, seconds] = timePart.split(':');
        return `${hours}:${minutes}:${seconds ? seconds.split('Z')[0] : '00'}`;
    }
    
    if (time === '00:00') {
        return '00:01:00';
    }
    return time;
};

const getDateAfterNumberOfDays = (daysToAdd, date) => {
    const baseDate = new Date(date);

    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() + daysToAdd);
    return newDate.toDateString();
}

const findNextSunday = () => {
    let today = new Date();
    let nextSunday = new Date(today);

    while (nextSunday.getDay() !== 0) {
        nextSunday.setDate(nextSunday.getDate() + 1);
    }

    const date = new Date(nextSunday);
    
    const formattedDate = date.toISOString().split("T")[0];
    return {
        formattedDate: formattedDate,
        nextSunday: nextSunday.toDateString(),
    };
};

const convertTimeToYYYYMMDDFormat = (date_to_be_formatted) => {
    const date = new Date(date_to_be_formatted);

    const year = String(date.getFullYear()).slice(-2); 
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `20${year}-${month}-${day}`;
}

router.get('/', checkRole(["admin, super-admin"]), async (req, res) => {
    try {
        const schedules = await Schedule.findAll();
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
});

router.post("/create", checkRole(["admin", "super-admin"]), async (req, res) => {
	const transaction = await sequelize.transaction();
    const { startTime, endTime, status, doctorId, date, nurseId } = req.body;
    
    const formattedDate = new Date(date).toISOString().split("T")[0];

    const now = new Date();


    const shiftDuration = req.body.endTime;
    try {
        let scheduleData;
        if (doctorId) {
            scheduleData = {
                date: formattedDate,
                startTime: formatTime(startTime),
                endTime: formatTime(endTime),
                status: status,
                doctorId: doctorId
            };
        }

        if (nurseId) {
            scheduleData = {
                date: formattedDate,
                startTime: formatTime(startTime),
                endTime: formatTime(endTime),
                status: status,
                nurseId: nurseId
            };
        }

        if (formattedDate < now) {
            await transaction.rollback();
            return res.status(401).json({
                success: false,
                message: "Cannot add a schedule for a date that is in the past",
            });
        }

        let fetched_doctor;
        if (doctorId) {
            fetched_doctor = await Doctor.findOne({
                where: {
                    id: doctorId,
                },
                transaction,
                include: [
                    {
                        model: Schedule,
                        as: "schedules",
                        required: true,
                        where: {
                            date: formattedDate
                        }
                    }
                ]
            })
        }

        let fetched_nurse;
        if (nurseId) {
            fetched_nurse = await Nurse.findOne({
                where: {
                    id: nurseId,
                },
                transaction,
                include: [
                    {
                        model: Schedule,
                        as: "schedules",
                        required: true,
                        where: {
                            date: formattedDate
                        }
                    }
                ]
            })
        }

        const dateOnly = now.toISOString().split("T")[0];

        if (nurseId) {
            if (fetched_nurse) {
                if (fetched_nurse.schedules.length > 0) {
                    transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: "Nurse is scheduled for the same day already."
                    })
                }
            }
        }

        if (doctorId) {
            if (fetched_doctor) {
                if (fetched_doctor.schedules.length > 0) {
                    transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: "Doctor is scheduled for the same day already."
                    })
                }
            }
        }
        
        if (dateOnly > formattedDate) {
            transaction.rollback();
            return res.status(408).json({
                success: false,
                message: "Cannot create a schedule for a date that is in the past.",
                code: "past"
            })
        } else {
            const schedule = await Schedule.create(scheduleData, { transaction });
            transaction.commit();
            return res.status(201).json(schedule);
        }
    } catch (err) {
        transaction.rollback();
        return res.status(500).json(err);
    }
});

router.post('/delete/:id', checkRole(["admin, super-admin"]), async (req, res) => {
    const { id } = req.params;
  
    try {
      const schedule = await Schedule.findByPk(id);
  
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
  
      await schedule.destroy();
      return res.status(200).json({ message: "Schedule deleted successfully" });
    } catch (error) {
        console.log(error);
    }
})

router.post("/cancel-schedule", checkRole(["admin", "super-admin"]), async (req, res) => {
	const transaction = await sequelize.transaction();
    const { schedule } = req.body;

    try {
        const fetched_schedule = await Schedule.findOne({
            where: {
                id: schedule.id,
            },
            transaction,
        })

        if (!fetched_schedule) {
            await transaction.rollback();
            res.status(404).json({
                success: false,
                message: "Schedule not found"
            })
        }

        await fetched_schedule.destroy({ transaction });
        await transaction.commit();
        res.status(200).json({
            success: true,
            id: schedule.id,
        })
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            success: false,
            message: "There was an error cancelling the scheduling."
        })
    }
})

router.post("/create-schedule-for-coming-week", checkRole(["super-admin", "admin"]), async (req, res) => {
	const transaction = await sequelize.transaction();
    const { weekdays, doctorId, nurseId } = req.body;
    
    try {
        let doctor;
        if (doctorId) {
            doctor = await Doctor.findOne({
                where: {
                    id: doctorId,
                },
                transaction,
            })

            if (!doctor) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: "No such doctor exists"
                });
            }
        }

        let nurse;
        if (nurseId) {
            nurse = await Nurse.findOne({
                where: {
                    id: nurseId,
                }
            })

            if (!nurse) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: "No such doctor exists"
                });
            }
        }

        const { formattedDate, nextSunday } = findNextSunday();
        
        let existing_schedules;
        if (doctor) {
            existing_schedules = await Schedule.findAll({
                where: {
                    doctorId: doctorId,
                    status: "available"
                },
                transaction,
            })
        }

        if (nurse) {
            existing_schedules = await Schedule.findAll({
                where: {
                    nurseId: nurseId,
                    status: "available"
                },
                transaction,
            })
        }

        const dayOffsetMap = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6,
        };

        for (const [day, data] of Object.entries(weekdays)) {
            if (!data.selected) continue;

            const offset = dayOffsetMap[day];
            if (offset === undefined) continue;

            const scheduleDate = convertTimeToYYYYMMDDFormat(
                getDateAfterNumberOfDays(offset, nextSunday)
            );

            const conflict = existing_schedules.some(s => s.date === scheduleDate);
            if (conflict) {
                await transaction.rollback();
                return res.status(409).json({
                    success: false,
                    message: `The ${doctor ? "doctor" : "nurse"} is already scheduled for ${scheduleDate}`,
                });
            }
        }

        const created_schedules = [];

        for (const [day, data] of Object.entries(weekdays)) {
            if (!data.selected || !data.time) continue;

            const offset = dayOffsetMap[day];
            if (offset === undefined) continue;

            const scheduleDate = convertTimeToYYYYMMDDFormat(
                getDateAfterNumberOfDays(offset, nextSunday)
            );

            let startTime, endTime;
            if (data.time === '8:30pm - 8:30am') {
                startTime = "20:30";
                endTime = "08:30";
            } else {
                startTime = "08:30";
                endTime = "20:30";
            }

            let newSchedule;
            if (doctor) {
                newSchedule = await Schedule.create({
                    startTime,
                    endTime,
                    date: scheduleDate,
                    doctorId,
                    status: "available"
                }, { transaction });
            }

            if (nurse) {
                newSchedule = await Schedule.create({
                    startTime,
                    endTime,
                    date: scheduleDate,
                    nurseId,
                    status: "available"
                }, { transaction });
            }

            created_schedules.push(newSchedule);
        }

        await transaction.commit();
        return res.status(200).json({
            success: true,
            created_schedules: created_schedules,
        });
    } catch (error) {
        await transaction.rollback();
        
        return res.status(500).json({
            success: false,
            message: "There was an error creating the schedules"
        })
    }
})


module.exports = router;
