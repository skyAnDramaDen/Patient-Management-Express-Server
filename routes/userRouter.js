const express = require("express");
const router = express.Router();

const argon2 = require("argon2");
const sequelize = require("../db");

const { Doctor, Patient, Appointment, Schedule, User } = require("../models");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/create", async (req, res) => {
	const transaction = await sequelize.transaction();
	const { username, password, role } = req.body;

	try {
		const hashedPassword = await argon2.hash(password.trim());

		const allowedRoles = ["doctor", "nurse", "admin", "super-admin", "patient"];

		if (!allowedRoles.includes(role)) {
			await transaction.rollback();
			return res.status(400).json({ message: "Invalid role" });
		}
		let user = await User.findOne({ where: { username } });

		if (user) {
			await transaction.rollback();
			throw new Error("A user with this username exists already.");
		}

		user = await User.create(
			{
				username,
				password: hashedPassword.trim(),
				role,
			},
			{ transaction }
		);

		await transaction.commit();

		return res
			.status(201)
			.json({ message: "User registered successfully", user });
	} catch (error) {
		await transaction.rollback();
		return res.status(500).send("Server Error");
	}
});

router.put("/edit/:id", async (req, res) => {
	const { id } = req.params;
	const { username, password, role } = req.body;

	try {
		let user = await User.findByPk(id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (username) {
			user.username = username;
		}
		if (password) {
			user.password = await argon2.hash(password.trim());
		}
		if (role) {
			const allowedRoles = [
				"doctor",
				"nurse",
				"admin",
				"super-admin",
				"patients",
			];
			if (!allowedRoles.includes(role)) {
				return res.status(400).json({ message: "Invalid role" });
			}
			user.role = role;
		}

		await user.save();
		return res.status(200).json({ message: "User updated successfully", user });
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Server Error", error: error.message });
	}
});

router.post("/delete/:id", async (req, res) => {
	const transaction = await sequelize.transaction();
	const { id } = req.params;

	try {
		const user = await User.findByPk(id);

		if (!user) {
			await transaction.rollback();
			return res.status(404).json({ message: "User not found" });
		}

		await user.destroy({ transaction });

		await transaction.commit();
		return res.status(200).json({ message: "User deleted successfully" });
	} catch (err) {
		await transaction.rollback();
		return res.status(400).json({ error: "Failed to find user" });
	}
});

router.get("/get-user-details-by/:id", async (req, res) => {
	const id = req.params.id;
	const user = await User.findOne({
		where: {
			id: id,
		},
		attributes: {
			exclude: ["password"],
		},
	});

	try {
		return res.status(201).json(user);
	} catch (error) {
		return res.status(501).json(error);
	}
});

router.post("/update-user-details/:id", async (req, res) => {
	const transaction = await sequelize.transaction();

	const id = req.params.id;

	const { password, username } = req.body;

	// if (!password || password.trim().length === 0) {
	// 	return res.status(400).json({ error: "Password is required" });
	// }

	// if (!username || username.trim().length === 0) {
	// 	return res.status(400).json({ error: "Username is required" });
	// }

	try {
		const user = await User.findOne({
			where: {
				id: id,
			},
			transaction,
		})

		if (!user) {
			await transaction.rollback();
			return res.status(404).json({
				success: false,
				message: "User not found"
			})
		}

		if (username) {
			user.username = username;
		}

		if (password) {
			user.password = password;
		}

		await user.save({ transaction });
		
		await transaction.commit();

		return res.status(200).json({
			success: true,
			user: updatedUser,
		});
	} catch (error) {
		await transaction.rollback();
		return res.status(500).json({ error: "Failed to update user" });
	}
});

router.get("/get-all-users", async (req, res) => {
	const users = await User.findAll();

	try {
		return res.status(201).json(users);
	} catch (error) {
		return res.status(501).json({
			message: "There has been an error",
		});
	}
});

module.exports = router;
