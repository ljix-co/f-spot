let express = require('express');

function createRouter(db) {
    const router = express.Router();

    router.post('/order_itm', (req, res) => {
        let params = {
            order_id: req.body.order_id,
            puritm_id: req.body.puritm_id
        }
        db.query(
            `INSERT INTO order_item SET order_id = ${params.order_id},
            puritm_id = ${params.puritm_id}`,
            params,
            (error) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ status: 'error' });
                } else {
                    res.status(200).json({ status: 'ok' });
                }
            })
    })

    return router;
}
module.exports = createRouter;