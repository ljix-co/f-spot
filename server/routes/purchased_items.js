const express = require('express');

function createRouter(db) {
    const router = express.Router();

    router.post('/purchased_items', (req, res) => {
        let params = {
            itm_id: req.body.itm_id,
            amount: req.body.amount,
            price_per_item: req.body.price_per_item,
            price_total_amount: req.body.price_total_amount
        }
        db.query(
            `INSERT INTO purchased_items SET itm_id = ${params.itm_id},
            amount = ${params.amount}, price_per_item = ${params.price_per_item},
            price_total_amount = ${params.price_total_amount}`,
            params,
            (error, results) => {
                if(error) {
                    console.log(error);
                    res.status(500).json({status: 'error'});
                } else {
                    let id = results.insertId;
                    res.status(200).json({id: id});
                }
            }
        )
    })

    return router;
}
module.exports = createRouter;