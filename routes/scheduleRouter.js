const express = require('express');
const router = express.Router();
const { Schedule } = require("../models"); // Ensure correct path


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

router.get('/', async (req, res) => {
    try {
        const schedules = await Schedule.findAll();
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
});

router.post("/create", async (req, res) => {
    console.log("loremipsorandsomeshit");
    try {
        const scheduleData = {
            date: req.body.date,
            startTime: formatTime(req.body.startTime),
            endTime: formatTime(req.body.endTime),
            status: req.body.status,
            doctorId: req.body.doctorId
        };

        const schedule = await Schedule.create(scheduleData);
        res.status(201).json(schedule);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});


module.exports = router;