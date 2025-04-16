const express = require("express");
const router = express.Router();

const argon2 = require("argon2");

const { Doctor, Patient, Appointment, Schedule, User } = require("../models");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/create", async (req, res) => {
	const { username, password, role } = req.body;

	try {
		const hashedPassword = await argon2.hash(password.trim());

		const allowedRoles = ["doctor", "nurse", "admin", "super-admin", "patient"];

		if (!allowedRoles.includes(role)) {
			return res.status(400).json({ message: "Invalid role" });
		}
		let user = await User.findOne({ where: { username } });

		if (user) {
			throw new Error("A user with this username exists already.");
		}

		const isPasswordValid = await argon2.verify(
			hashedPassword.trim(),
			password.trim()
		);

		user = await User.create({
			username,
			password: hashedPassword.trim(),
			role,
		});
		res.status(201).json({ message: "User registered successfully", user });
	} catch (error) {
		res.status(500).send("Server Error");
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
		res.status(200).json({ message: "User updated successfully", user });
	} catch (error) {
		res.status(500).json({ message: "Server Error", error: error.message });
	}
});

router.post("/delete/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const user = await User.findByPk(id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		await user.destroy();
		res.status(200).json({ message: "User deleted successfully" });
	} catch (err) {
		res.status(400).json({ error: "Failed to find user" });
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
		res.status(201).json(user);
	} catch (error) {
		res.status(501).json(error);
	}
});

router.post("/update-user-details/:id", async (req, res) => {
	console.log("details are for the critical");
	const id = req.params.id;

	const { password, username } = req.body;

	// if (!password || password.trim().length === 0) {
	// 	return res.status(400).json({ error: "Password is required" });
	// }

	// if (!username || username.trim().length === 0) {
	// 	return res.status(400).json({ error: "Username is required" });
	// }

	if (username || password) {
		let hashedPassword
    
    if (password) {
      hashedPassword = await argon2.hash(password.trim());
    }
    
		let user_data;
    
    if (username) {
      if (password) {
        user_data = {
          username: username,
          password: hashedPassword,
        };
      } else {
        user_data = {
          username: username,
        };
      }
    } else {
      user_data = {
        password: hashedPassword,
      };
    }

		try {
			const [updated] = await User.update(user_data, {
				where: { id: id },
			});
			if (updated) {
				const updatedUser = await User.findOne({ where: { id: id } });
				res.status(200).json({
					success: true,
					user: updatedUser,
				});
			} else {
				throw new Error("User not found");
			}
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: "Failed to update user" });
		}
	}
});

router.get("/get-all-users", async (req, res) => {
  const users = await User.findAll();

  try {
    res.status(201).json(users);
  } catch (error) {
    res.status(501).json({
      message: "There has been an error"
    })
  }
})

module.exports = router;
