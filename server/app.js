const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
// const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mysql = require('mysql');

const articles = require('./routes/articles');
const images = require('./routes/images');
const items = require('./routes/items');
const collections = require('./routes/collections');
const customers = require('./routes/customers');
const orders = require('./routes/orders');
const purchased_items = require('./routes/purchased_items');
const order_itm = require('./routes/order_itm');

const app = express();

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'ljilja',
  password: 'prasac123',
  database: 'fashion_spot',
  multipleStatements: true
});
connection.connect();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploaded_images', express.static( 'uploaded_images'));
app.use(cors({
  origin: 'http://localhost:4200'
}));

app.use(articles(connection));
app.use(images(connection));
app.use(items(connection));
app.use(collections(connection));
app.use(customers(connection));
app.use(orders(connection));
app.use(purchased_items(connection));
app.use(order_itm(connection));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
})

module.exports = app;
