// server.js
const express        = require('express');
const bodyParser     = require('body-parser');
const app            = express();
const fs = require('fs');

const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 8000;
require('./route')(app);
app.listen(port, () => {
  if (!fs.existsSync('upload')){
    fs.mkdirSync('upload');
  }
  console.log('We are live on ' + port);
});