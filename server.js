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

app.use(bodyParser.urlencoded({ extended: true }));
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

apiRoutes.post('/authenticate', (req, res) => {
  User.findOne({ name: req.body.name }, (err, user) => {
    if (err) throw new Error(err);
    if (!user) {
      res.json({ success: false, msg: 'User not found' });
    } else if (user) {
      if (user.password !== req.body.password) {
        res.json({ success: false, msg: 'Invalid login' });
      } else {
        const token = jwt.sign(
          user.name,
          req.app.settings.superSecret
        );
        res.json({
          success: true,
          message: 'Enjoy your token',
          token,
        });
      }
    }
  });
});

apiRoutes.use((req, res, next) => {
  const token = req.body.token ||
                req.query.token ||
                req.headers['x-access-token'];

  if (token) {
    jwt.verify(token, req.app.settings.superSecret, (err, decoded) => {
      if (err) {
        return res.json({
          success: false,
          message: 'Failed to authenticate token.',
        });
      }
      req.decoded = decoded;
      return next();
    });
  } else {
    return res.status(401).send({
      success: false,
      message: 'No token provided',
    });
  }
  return true;
});

apiRoutes.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

apiRoutes.get('/users', (req, res) => {
  User.find({}, (err, users) => {
    if (err) throw err;
    res.json(users);
  });
});

app.use('/api', apiRoutes);

// TODO: route middleware to verify a token

app.listen(port);
