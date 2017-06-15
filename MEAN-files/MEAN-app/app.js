require('./api/data/dbconnection.js').open();
var express = require('express'); //express framework
var app = express();
var path = require('path'); 
var bodyParser = require('body-parser');
var fileServer = express.static('public');

var routes = require('./api/routes');
//
app.set('port', 3000);

app.use(function (req, res, next) {
    console.log(req.method, req.url);
    next();
});

app.use(fileServer); 

//url encoded - method by which html forms are sent. extended: false - only need strings and arrays from our form body. if true, we can have access to other data types, but not 
app.use(bodyParser.urlencoded({ extended : false }));

app.use('/api', routes);

var server = app.listen(app.get('port'), function() {
    var port = server.address().port;
    console.log('Magic happens on ' + port);
});

