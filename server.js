const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const config = require('./config');
const User = require('./app/models/users');

const app = express();
const port = 8080 || process.env.PORT;

/*
 * Config
 */
mongoose.connect(config.database);

app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));

/*
 * Routes
 */
app.get('/', (req, res) => {
  res.end(`Hello! This API is at http://localhost:${port}/api`);
});

app.listen(port);
