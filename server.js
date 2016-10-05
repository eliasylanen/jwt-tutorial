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

app.get('/setup', (req, res) => {
  const elias = new User({
    name: 'Elias Ylänen',
    password: 'password',
    admin: true,
  });

  elias.save((err) => {
    if (err) throw err;
    console.log('User saved');
    res.json({ success: true });
  });
});

/*
 * API routes
 */
const apiRoutes = express.Router();
app.use('/api', apiRoutes);

// TODO: route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.get('/authenticate', (req, res) => {
  res.json(req.body.name);
});
// TODO: route middleware to verify a token

apiRoutes.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

apiRoutes.get('/users', (req, res) => {
  User.find({}, (err, users) => {
    if (err) throw err;
    res.json(users);
  });
});

app.listen(port);
