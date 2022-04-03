const express = require('express');
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

    router.get('/images/:id', (req, res, next) => {
        db.query(
            `SELECT * FROM images WHERE img_id = ?`,
            [req.params.id],
            (error, results) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ status: 'error' });
                } else {
                    res.json({ results: results })
                    // res.status(200).json(results[0].img_path);
                    // res.render("image", {path: results[0].img_path, mime: results[0].img_mime})
                }
            }
        )
    })

    router.post('/images', upload.single("img_file"), (req, res) => {
        let imgParams = {
            img_path: req.file.path,
            img_mime: req.file.mimetype,
            img_main: parseInt(req.body.img_main)
        }
        let artcl_id = parseInt(req.body.artcl_id);
        let col_id = req.body.col_id;
        db.query(
            `INSERT INTO images SET img_path = '${imgParams.img_path}', img_mime = '${imgParams.img_mime}',
             img_main = ${imgParams.img_main}`,
            imgParams,
            (error, results) => {
                if (error) {
                    console.log(error)
                    res.status(500).json({ status: 'error up' });
                } else {
                    if (artcl_id) {
                        let img_id = results.insertId;
                        let artImgParams = {
                            img_id: img_id,
                            artcl_id: artcl_id
                        }
                        db.query(
                            `INSERT INTO art_img SET img_id = ${artImgParams.img_id}, artcl_id = ${artImgParams.artcl_id}`,
                            artImgParams,
                            (error) => {
                                if (error) {
                                    console.log(error)
                                    res.status(500).json({ status: 'error down' });
                                } else {
                                    res.status(200).json({ status: 'ok' });
                                }
                            }
                        )
                    } else if(col_id) {
                        let img_id = results.insertId;
                        let colImgParams = {
                            img_id: img_id,
                            col_id: col_id
                        }
                        db.query(
                            `INSERT INTO col_img SET img_id = ${colImgParams.img_id}, col_id = ${colImgParams.col_id}`,
                            colImgParams,
                            (error) => {
                                if (error) {
                                    console.log(error)
                                    res.status(500).json({ status: 'error down' });
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

    router.delete('/images/:id', (req, res) => {
        let date = new Date();
        let id = req.params.id;

        let conv_date = "'" + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' +
            date.getDate() + ' ' + date.getHours() + ':' +
            date.getMinutes() + ':' + date.getSeconds() + "'";

        let params = {
            date: conv_date,
            id: id
        }
        db.query(
            `UPDATE images SET img_dated = ${params.date} WHERE img_id = ${id}`,
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