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
app.use('/api', apiRoutes);

apiRoutes.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

apiRoutes.get('/users', (req, res) => {
  User.find({}, (err, users) => {
    if (err) throw err;
    res.json(users);
  });
});

apiRoutes.post('/authenticate', (req, res) => {
  console.log(req.body);
  User.findOne({ name: req.body.name }, (err, user) => {
    if (err) throw new Error(err);
    if (!user) {
      res.json({ success: false, msg: 'User not found' });
    } else if (user) {
      if (user.password !== req.body.password) {
        res.json({ success: false, msg: 'Invalid password' });
      } else {
        const token = jwt.sign(
          user,
          app.get('superSecret'),
          { expiresIn: '2h' }
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

// TODO: route middleware to verify a token

app.listen(port);
