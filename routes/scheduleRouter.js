const express = require('express');
const router = express.Router();
const { Schedule } = require("../models"); // Ensure correct path


router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/', async (req, res) => {
    try {
        const schedules = await Schedule.findAll();
        console.log(schedules);
        res.json(schedules);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
});

router.post("/create", async (req, res) => {
    console.log(req.body);
    try {
        console.log(req.body);
        const schedule = await Schedule.create(req.body);
        res.status(201).json(schedule);
    } catch (err) {
        console.error('Failed to create schedule:', err);
        res.status(500).json({ error: 'Failed to create schedule' });
    }
});


module.exports = router;