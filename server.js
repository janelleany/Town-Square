var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
const fs = require('fs');
var app = express();

var staticPath = path.join(__dirname, '/public');

//Sets up static folder with html,css,js 
app.use(express.static(staticPath));

app.listen(3000, function() {
  console.log('Server running on port 3000');
});

app.post('*', upload.single('video'), function (req, res, next) {
  // req.file is the `avatar` file 
  // req.body will hold the text fields, if there were any 

})
