const express = require("express");
const router = express.Router();
const sequelize = require("../db");

const checkRole = require("../middleware/checkRole");

const {
	Doctor,
	Patient,
	Appointment,
	Schedule,
	User,
	Message,
} = require("../models");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/create-send", checkRole(["super-admin", "admin", "nurse", "doctor"]), async (req, res) => {
	const transaction = await sequelize.transaction();

  const { senderId, receiverId, content } = req.body;

  let conversationId = [senderId, receiverId].sort((a, b) => a - b).join('_');

	try {
		const sender = await User.findByPk(senderId);
		const receiver = await User.findByPk(receiverId);

		if (!sender || !receiver) {
			return res.status(404).json({ error: "User not found" });
		}

		const message = await Message.create({ senderId, receiverId, content, conversationId }, { transaction });
    await transaction.commit();
		return res.status(201).json(message);
	} catch (error) {
    console.log(error);
    await transaction.rollback();
		return res.status(500).json({ error: "Failed to send message" });
	}
});

module.exports = router;
