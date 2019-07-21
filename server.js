'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api.js');
const helmet = require('helmet');
const mongoose = require('mongoose');
var MongoClient = require('mongodb');

var fccTestingRoutes = require('./routes/fcctesting.js');
var runner = require('./test-runner');

const app = express();

const CONNECTION_STRING = process.env.DB;
mongoose.connect(CONNECTION_STRING, {
  useNewUrlParser: true
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
require('dotenv').config();

app.use('/public', express.static(process.cwd() + '/public'));

/*Set content security policy to only allow loading of scripts
and css from my server.*/
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    // User stories say to only use 'self' here, but that's impossible without changing frontend
    styleSrc: ["'self'", "code.jquery.com", "'unsafe-inline'"],
    scriptSrc: ["'self'", "code.jquery.com", "'unsafe-inline'"]
  }
}));
app.use(helmet.xssFilter());

//Index page
app.route('/')
  .get((req, res) => {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//Routing for API
apiRoutes(app);

app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        var error = e;
        console.log('Tests are not valid:');
        console.log(error);
      }
    }, 3500);
  }
});

module.exports = app; //needed for testing
