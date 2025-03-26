const express = require('express');
const router = express.Router();

require('dotenv').config();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const store_items = new Map([
    [
        1, { priceInPennies: 15, name: "Test payment numnero uno" }
    ],
    [
        2, { priceInPennies: 10, name: "Test payment number 2" }
    ]
])

router.post("/create-checkout-session", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: req.body.items.map((item) => {
                const store_item = store_items.get(item.id);
                return {
                    price_data: {
                        currency: "gbp",
                        product_data: {
                            name: store_item.name
                        },
                        unit_amount: store_item.priceInPennies
                    },
                    quantity: item.quantity
                }
            }),
            //TODO: change urls to environment url when switching to production -> {process.env.SERVER_URL}
            success_url: "http://localhost:3001/payments/success",
            cancel_url: "http://localhost:3001/payments/failure",
        })
        
        res.json({ url: session.url });
    } catch (error) {
        console.log(error.raw);
    }
})

module.exports = router;