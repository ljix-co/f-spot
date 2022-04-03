const express = require('express');

function createRouter(db) {
    const router = express.Router();

    router.post('/customers', (req, res) => {
        let params = {
            cust_fullname: req.body.fullname,
            cust_email: req.body.email,
            cust_phone: req.body.phone,
            cust_address: req.body.address,
            cust_city: req.body.city,
            cust_country: req.body.country
        }
        db.query(
            `SELECT * FROM customers WHERE cust_fullname = "${params.cust_fullname}" AND
            cust_address = "${params.cust_address}" AND cust_email = "${params.cust_email}"`,
            params,
            (error, results) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ status: 'up_error' });
                } else {
                    if (results.length > 0) {
                        let id = results[0].cust_id;
                        res.json({ id: id })
                    } else {
                        db.query(
                            `INSERT INTO customers SET cust_fullname = "${params.cust_fullname}",
                             cust_email = "${params.cust_email}", cust_phone = "${params.cust_phone}",
                             cust_address = "${params.cust_address}", cust_city = "${params.cust_city}",
                             cust_country = "${params.cust_country}"`,
                            params,
                            (error, results) => {
                                if (error) {
                                    console.log(error);
                                    res.status(500).json({ status: 'error' });
                                } else {
                                    let id = results.insertId;
                                    res.json({ id: id })
                                }
                            })
                    }
                }
            }
        )
    })

    return router;
}

module.exports = createRouter;