const express = require('express');
const functions = require('../public/javascripts/shared_functions');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploaded_images/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname)
    }
})

const upload = multer({ storage: storage })

function createRouter(db) {
    const router = express.Router();

    router.get('/items', (req, res, next) => {
        db.query(
            `SELECT itm_id, col_id, itm_title, itm_naturalorigin, 
            itm_material, itm_price, itm_img, des_fullname, siz_size, amount, siz_id 
            FROM itm_size 
            INNER JOIN items USING (itm_id)
            INNER JOIN sizes USING (siz_id)
            INNER JOIN collections USING (col_id)
            INNER JOIN designers USING (des_id)
            WHERE items.itm_dated IS NULL AND 
            itm_size.amount IS NOT null AND  itm_size.amount > 0;`,
            (error, results) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ status: 'error' });
                } else {
                    let data = [];

                    for (let i = 0; i < results.length; i++) {
                        let result = {
                            id: results[i].itm_id,
                            title: results[i].itm_title,
                            natural_org: results[i].itm_naturalorigin,
                            material: results[i].itm_material,
                            price: results[i].itm_price,
                            path: results[i].itm_img,
                            designer: results[i].des_fullname,
                            collection: results[i].col_title,
                            sizes: [
                                {
                                    id: results[i].siz_id,
                                    siz_size: results[i].siz_size,
                                    amount: results[i].amount
                                }]
                        };
                        data.push(result);

                        for (let j = i + 1; j < results.length; j++) {
                            if (result.id === results[j].itm_id) {
                                data[data.indexOf(result)].sizes.push(
                                    {
                                        id: results[j].siz_id,
                                        siz_size: results[j].siz_size,
                                        amount: results[j].amount
                                    })

                                results.splice(j, 1);
                                j--;
                            }
                        }
                    }
                    res.status(200).json(data);
                }
            }
        )
    })

    router.put('/items', upload.single('itm_img'), (req, res) => {
        console.log('put article')
        let arrParams = req.body;
        let params = {
            itm_id: req.body.itm_id,
            itm_title: req.body.itm_title,
            itm_naturalorigin: req.body.itm_naturalorigin,
            itm_material: req.body.itm_material,
            itm_price: req.body.itm_price,
            itm_img: req.file.path,
            col_id: req.body.col_id
        }
        let shouldUpdate = false;
        let updateParams = '';
        if (functions.arrayHas(arrParams, 'itm_title')) {
            updateParams += `itm_title = "${params.itm_title}"`;
            shouldUpdate = true;
        }
        if (functions.arrayHas(arrParams, 'itm_naturalorigin')) {
            updateParams += `${shouldUpdate ? ', ' : ' '} itm_naturalorigin =  "${params.itm_naturalorigin}"`;
            shouldUpdate = true;
        }
        if (functions.arrayHas(arrParams, 'itm_material')) {
            updateParams += `${shouldUpdate ? ', ' : ' '} itm_material =  "${params.itm_material}"`;
            shouldUpdate = true;
        }
        if (functions.arrayHas(arrParams, 'itm_price')) {
            updateParams += `${shouldUpdate ? ', ' : ' '} itm_price =  ${params.itm_price}`;
            shouldUpdate = true;
        }
        if (functions.arrayHas(arrParams, 'col_id')) {
            updateParams += `${shouldUpdate ? ', ' : ' '} col_id =  ${params.col_id}`;
            shouldUpdate = true;
        }
        if (functions.arrayHas(arrParams, 'itm_img')) {
            updateParams += `${shouldUpdate ? ', ' : ' '} itm_img =  ${params.itm_img}`;
            shouldUpdate = true;
        }
        if (shouldUpdate) {
            db.query(
                `UPDATE items SET ${updateParams} WHERE itm_id = ${params.itm_id}`,
                params,
                (error) => {
                    if (error) {
                        console.log(error)
                        res.status(500).json({ status: 'error' });
                    } else {
                        res.status(200).json({ status: 'ok' })
                    }
                }
            )
        }
    })
    router.put('/items/:id', (req, res) => {
        let params = {
            itm_id: req.params.id,
            siz_id: req.body.siz_id,
            amount: req.body.amount
        }
        db.query(
            `SELECT * FROM itm_size WHERE itm_id = ${params.itm_id} AND siz_id = ${params.siz_id}`,
            params,
            (error, results) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ status: 'error' });
                } else {
                    if (results.length > 0) {
                        let amount = results[0].amount - params.amount
                        db.query(
                            `UPDATE itm_size SET amount = ${amount} WHERE itm_id = ${params.itm_id} AND  siz_id = ${params.siz_id}`,
                            params,
                            (error) => {
                                if (error) {
                                    console.log(error);
                                    res.status(500).json({ status: 'error' });
                                } else {
                                    res.json({ message: 'Size updated.' });
                                }
                            }
                        )
                    } else {
                        db.query(
                            `INSERT INTO itm_size SET itm_id = ${params.itm_id}, siz_id = ${params.siz_id},
                         amount = ${params.amount};`,
                            params,
                            (error) => {
                                if (error) {
                                    console.log(error);
                                    res.status(500).json({ status: 'error' });
                                } else {
                                    res.status(200).json({ status: 'ok' });
                                }
                            }
                        )
                    }
                }
            }
        )

    })
    router.post('/items', upload.single('itm_img'), (req, res) => {
        let params = {
            itm_title: req.body.itm_title,
            itm_naturalorigin: req.body.itm_naturalorigin,
            itm_material: req.body.itm_material,
            itm_price: req.body.itm_price,
            col_id: req.body.col_id,
            itm_img: req.file.path

        };
        db.query(
            `INSERT INTO items SET itm_title = '${params.itm_title}', itm_naturalorigin = '${params.itm_naturalorigin}',
            itm_material = '${params.itm_material}', itm_price = ${params.itm_price},  col_id = ${params.col_id},
            itm_img = '${params.itm_img}';`,
            params,
            (error, results) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ status: 'error' });
                } else {
                    let id = results.insertId;
                    res.json({ id: id })
                    // res.status(200).json({status: 'ok'})
                }
            }
        )
    })
    router.post('/items/:id', upload.none(), (req, res) => {
        let params = {
            itm_id: req.params.id,
            siz_id: req.body.siz_id,
            amount: req.body.amount
        }
        db.query(
            `INSERT INTO itm_size SET itm_id = ${params.itm_id}, siz_id = ${params.siz_id},
         amount = ${params.amount};`,
            params,
            (error) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ status: 'error' });
                } else {
                    res.status(200).json({ status: 'ok' });
                    // res.json({message: 'New item added'})
                }
            }
        )
    })
    router.delete('/items/:id', (req, res) => {
        let date = new Date();
        let form_date = functions.formatDate(date);
        let params = {
            itm_id: req.params.id,
            itm_dated: form_date
        }
        db.query(
            `UPDATE items SET itm_dated = ${params.itm_dated}
             WHERE itm_id = ${params.itm_id}`,
            params,
            (error) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ status: 'error' });
                } else {
                    res.status(200).json({ status: 'deleted' });
                }
            }
        )
    })

    return router;
}

module.exports = createRouter;