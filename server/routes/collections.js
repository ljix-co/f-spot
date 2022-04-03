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

const upload = multer({ storage: storage });

function createRouter(db) {
    const router = express.Router();

    router.get('/collections', (req, res) => {
        db.query(
            `SELECT * FROM col_img 
                INNER JOIN collections USING (col_id)
                INNER JOIN images USING (img_id)
                INNER JOIN designers USING (des_id)
                WHERE col_dated IS NULL AND img_dated IS NULL
                ORDER BY col_id; `,
            (error, results) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ status: 'error' });
                } else {
                    let data = [];

                    for (let i = 0; i < results.length; i++) {
                        let result = {
                            id: results[i].col_id,
                            title: results[i].col_title,
                            text: results[i].col_text,
                            text_title: results[i].col_text_title,
                            year: results[i].col_year,
                            season: results[i].col_season,
                            designer: results[i].des_fullname,
                            images: [
                                {
                                    id: results[i].img_id,
                                    main: results[i].img_main === 1 ? true : false,
                                    data: results[i].img_path,
                                    path: results[i].img_path
                                }]
                        };
                        data.push(result);

                        for (let j = i + 1; j < results.length; j++) {
                            if (result.id === results[j].col_id) {
                                data[data.indexOf(result)].images.push(
                                    {
                                        id: results[j].img_id,
                                        main: results[j].img_main === 1 ? true : false,
                                        data: results[j].img_path,
                                        path: results[j].img_path
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
    });
    router.put('/collections', upload.none(), (req, res) => {

        let arrParams = req.body;
        let params = {
            col_id: req.body.col_id,
            col_title: req.body.col_title,
            col_text: req.body.col_text,
            col_text_title: req.body.col_text_title,
            col_year: req.body.col_year,
            col_season: req.body.col_season,
            des_id: req.body.des_id
        }
        let shouldUpdate = false;
        let updateParams = '';
        if (functions.arrayHas(arrParams, 'col_title')) {
            updateParams += `col_title = "${params.col_title}"`;
            shouldUpdate = true;
        }
        if (functions.arrayHas(arrParams, 'col_text')) {
            updateParams += `${shouldUpdate ? ', ' : ' '} col_text =  "${params.col_text}"`;
            shouldUpdate = true;
        }
        if (functions.arrayHas(arrParams, 'col_text_title')) {
            updateParams += `${shouldUpdate ? ', ' : ' '} col_text_title =  "${params.col_text_title}"`;
            shouldUpdate = true;
        }
        if (functions.arrayHas(arrParams, 'col_year')) {
            updateParams += `${shouldUpdate ? ', ' : ' '} col_year =  "${params.col_year}"`;
            shouldUpdate = true;
        }
        if (functions.arrayHas(arrParams, 'col_season')) {
            updateParams += `${shouldUpdate ? ', ' : ' '} col_season =  ${params.col_season}`;
            shouldUpdate = true;
        }
        if (functions.arrayHas(arrParams, 'des_id')) {
            updateParams += `${shouldUpdate ? ', ' : ' '} des_id =  ${params.des_id}`;
            shouldUpdate = true;
        }
        if (shouldUpdate) {
            console.log('put article')
            db.query(
                `UPDATE collections SET ${updateParams} WHERE col_id = ${params.col_id}`,
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
    });
    router.post('/collections', upload.none(), (req, res) => {
        let date = new Date;
        let form_date = functions.formatDate(date);
        let params = {
            title: req.body.col_title,
            text: req.body.col_text,
            col_text_title: req.body.col_text_title,
            year: req.body.col_year,
            season: req.body.col_season,
            des_id: req.body.des_id,
            col_datec: form_date
        }
        db.query(
            `INSERT INTO collections SET col_title='${params.title}', col_text = '${params.text}', 
            col_text_title = '${params.col_text_title}', col_year = ${params.year}, col_season = '${params.season}',
            des_id = ${params.des_id}, col_datec = ${params.col_datec};`,
            params,
            (error, results) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ status: 'error' });
                } else {
                    res.json({ id: results.insertId })
                }
            }
        )
    });
    router.delete('/collections/:id', (req, res) => {
        let date = new Date;
        let form_date = functions.formatDate(date);
        let params = {
            col_id: req.params.id,
            col_dated: form_date
        }
        db.query(
            `UPDATE collections SET col_dated = ${params.form_date} WHERE col_id = ${params.col_id}`,
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