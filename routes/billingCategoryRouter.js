const express = require("express");
const router = express.Router();
const { Op } = require('sequelize');

const sequelize = require('../db');

const { Doctor, Patient, Appointment, Schedule, User, Ward, Room, Bed, Admission, Transfer, BillingCategory } = require('../models');

router.get("/", async (req, res) => {
    console.log("someone is tryiing to get the billing categories");
    try {
        const billing_category = await BillingCategory.findAll();

        res.status(201).json(billing_category);
    } catch (error) {
        console.log(error);
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
        code: group
    }

    console.log(category_data);

    try {
        const billing_category = await BillingCategory.create(category_data);
        await transaction.commit();
        res.status(201).json(billing_category);
    } catch (error) {
        await transaction.rollback();
        console.log(error);
        res.status(501).json(error);
    }
});

router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const billing_category = await BillingCategory.findByPk(id);
  
      if (!billing_category) {
        return res.status(404).json({ message: "billing category not found" });
      }
  
      await billing_category.destroy();
      res.status(200).json({ message: "billing category deleted successfully" });
    } catch (error) {
        console.log(error);
    }
})

router.post("/update/:id", async (req, res) => {
    const id = req.params.id;

    const { columnName, value } = req.body;

    try {
        const billing_category = await BillingCategory.findOne({
            where: { id: id },
        })

        await billing_category.update({ [columnName]: value });

    } catch (error) {
        console.log(error);
    }
})

module.exports = router;