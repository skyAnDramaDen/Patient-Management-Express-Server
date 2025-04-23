const express = require("express");
const router = express.Router();
const { Op } = require('sequelize');

const sequelize = require('../db');

const { Doctor, Patient, Appointment, Schedule, User, Ward, Room, Bed, Admission, Transfer, BillingCategory } = require('../models');

router.get("/", async (req, res) => {
    try {
        const billing_category = await BillingCategory.findAll();

        return res.status(201).json(billing_category);
    } catch (error) {
        return res.status(501).json({ message: "there has been an error" })
    }
})

router.post("/create", async (req, res) => {
    const { name, rate, description } = req.body.categoryData;
    const { group } = req.body;

    const transaction = await sequelize.transaction();

    let words = name.split(" ");

    let retrievalName = "";

    if (words.length == 0) {
        return Error("There is no word");
    } else if (words.length == 1) {
        retrievalName = words[0].toLowerCase();
    } else {
        for (let x = 0; x < words.length; x++) {
            retrievalName += words[x].toLowerCase();
            if (x < (words.length - 1)) {
                retrievalName += "_";
            }
        }
    }

    const category_data = {
        name: name,
        rate: rate,
        description: description,
        retrievalName: retrievalName,
        group: group
    }

    try {
        const billing_category = await BillingCategory.create(category_data, { transaction });
        await transaction.commit();
        return res.status(201).json(billing_category);
    } catch (error) {
        await transaction.rollback();
        return res.status(501).json({
            success: false,
            message: "The category was not created successfully"
        });
    }
});

router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const transaction = await sequelize.transaction();
  
    try {
      const billing_category = await BillingCategory.findByPk(id);
  
      if (!billing_category) {
        await transaction.rollback();
        return res.status(404).json({ message: "billing category not found" });
      }
  
      await billing_category.destroy({ transaction });
      await transaction.commit();
      return res.status(200).json({ message: "billing category deleted successfully" });
    } catch (error) {
        await transaction.rollback();
        return res.status(200).json({
            success: false,
            message: "billing category deleted successfully"
        });
    }
})

router.post("/update/:id", async (req, res) => {
    const id = req.params.id;
    const transaction = await sequelize.transaction();

    const { columnName, value } = req.body;

    try {
        const billing_category = await BillingCategory.findOne({
            where: { id: id },
            transaction,
        })

        await billing_category.update({ [columnName]: value }, { transaction });
        await transaction.commit();

        return res.status(201).json({ message: "The category was successfully updated" })
    } catch (error) {
        await transaction.rollback();
        return res.status(201).json({
            success: false,
            message: "The category was not successfully updated"
        })
    }
})

module.exports = router;