const express = require('express');
const functions = require('../public/javascripts/shared_functions');
function createRouter(db) {
    const router = express.Router();

    router.get('/articles', (req, res, next) => {
        db.query(
            `SELECT artcl_id, artcl_title, artcl_firstpar, artcl_secondpar, artcl_author, articles.artcl_order,
            img_id, img_main, img_img, img_path, img_mime FROM art_img
            INNER JOIN images USING (img_id)
            INNER JOIN articles USING (artcl_id)
            WHERE articles.artcl_visible = 1 AND images.img_dated IS NULL 
            AND articles.artcl_dated IS NULL
            ORDER BY articles.artcl_order;`,
            (error, results) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ status: 'error' });
                } else {
                    let data = [];

                    for (let i = 0; i < results.length; i++) {
                        let result = {
                            id: results[i].artcl_id,
                            title: results[i].artcl_title,
                            firstpar: results[i].artcl_firstpar,
                            secondpar: results[i].artcl_secondpar,
                            author: results[i].artcl_author,
                            order: results[i].artcl_order,
                            visible: results[i].artcl_visible === 1 ? true : false,
                            images: [
                                {
                                    id: results[i].img_id,
                                    main: results[i].img_main === 1 ? true : false,
                                    data: results[i].img_img ? results[i].img_img.toString('base64') : results[i].img_path,
                                    path: results[i].img_path
                                }]
                        };
                        data.push(result);

                        for (let j = i + 1; j < results.length; j++) {
                            if (result.id === results[j].artcl_id) {
                                data[data.indexOf(result)].images.push(
                                    {
                                        id: results[j].img_id,
                                        main: results[j].img_main === 1 ? true : false,
                                        data: results[j].img_img ? results[j].img_img.toString('base64') : results[j].img_path,
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
    })

    router.put('/articles', (req, res) => {
        console.log('put article')
        let arrParams = req.body;
        let params = {
            artcl_id: req.body.artcl_id,
            artcl_title: req.body.artcl_title,
            artcl_firstpar: req.body.artcl_firstpar,
            artcl_secondpar: req.body.artcl_secondpar,
            artcl_visible: req.body.artcl_visible
        }
        let shouldUpdate = false;
        let updateParams = '';
        if (functions.arrayHas(arrParams, 'artcl_title')) {
            updateParams += `artcl_title = "${params.artcl_title}"`;
            shouldUpdate = true;
        }
        if (functions.arrayHas(arrParams, 'artcl_firstpar')) {
            updateParams += `${shouldUpdate ? ', ' : ' '} artcl_firstpar =  "${params.artcl_firstpar}"`;
            shouldUpdate = true;
        }
        if (functions.arrayHas(arrParams, 'artcl_secondpar')) {
            updateParams += `${shouldUpdate ? ', ' : ' '} artcl_secondpar =  "${params.artcl_secondpar}"`;
            shouldUpdate = true;
        }
        if (functions.arrayHas(arrParams, 'artcl_visible')) {
            updateParams += `${shouldUpdate ? ', ' : ' '} artcl_visible =  ${params.artcl_visible}`;
            shouldUpdate = true;
        }
        if (shouldUpdate) {
            console.log('put article')
            db.query(
                `UPDATE articles SET ${updateParams} WHERE artcl_id = ${params.artcl_id}`,
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
    router.post('/articles', (req, res) => {
        let date = new Date;
        let form_date = functions.formatDate(date);
        let params = {
            artcl_author: req.body.artcl_author,
            artcl_title: req.body.artcl_title,
            artcl_firstpar: req.body.artcl_firstpar,
            artcl_secondpar: req.body.artcl_secondpar,
            artcl_order: req.body.artcl_order,
            artcl_datec: form_date,
            artcl_visible: 1
        };
        db.query(
            `INSERT INTO articles SET artcl_author = ${params.artcl_author}, artcl_title = ${params.artcl_title},
            artcl_firstpar = ${params.artcl_firstpar}, artcl_secondpar = ${params.artcl_secondpar}, 
            artcl_order = ${params.artcl_order}, artcl_datec = ${params.artcl_datec}, artcl_visible = ${params.artcl_visible};`,
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
    })
    router.delete('/articles/:id', (req, res) => {
        let date = new Date();
        let form_date = functions.formatDate(date);
        let params = {
            artcl_id: req.params.id,
            artcl_dated: form_date,
            artcl_visible: 0
        }
        db.query(
            `UPDATE articles SET artcl_dated = ${params.artcl_dated}, artcl_visible = ${params.artcl_visible}
             WHERE artcl_id = ${params.artcl_id}`,
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