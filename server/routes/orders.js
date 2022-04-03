const express = require('express');

function createRouter(db) {
    const router = express.Router();

    //GET IZVUĆI PREKO VEZNE TABELE
    // router.get('/', (req, res) => {
    //     db.query(
    //         `SELECT * FROM orders`,
    //         (error, results) => {
    //             if(error) {
    //                 console.log(error);
    //                 res.status(500).json({status: 'error'});
    //             } else {
    //                 let data = [];

    //                 for(let i = 0; i < results.length; i++) {
    //                     let result = {
    //                         order_id: results[i].order_id,
    //                         cust_id: results[i].cust_id,
    //                         items: [],
    //                         total_price: results[i].total_price
    //                     }
    //                     db.query
    //                 }
    //             }
    //         }
    //     )
    // })
    router.post('/orders', (req, res) => {
        let params = {
            cust_id: req.body.cust_id,
            total_price: req.body.total_price
        }
        db.query(
            `INSERT INTO orders SET cust_id = ${params.cust_id}, total_price = ${params.total_price}`,
            params,
            (error, results) => {
                if(error) {
                    console.log(error);
                    res.status(500).json({status: 'error'});
                } else {
                    let id = results.insertId;
                    res.json({id: id});
                }
            }
        )
    })

    return router;
}
module.exports = createRouter;