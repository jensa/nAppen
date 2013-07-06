var express = require('express')
var app = express ();
var expressValidator = require('express-validator');
var router = require ('./requestRouter');

app.set('views', __dirname + '/views');
app.set('view options', { layout: false });

app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());
app.use(expressValidator ());

router.setRoutes (app);
app.listen(8000);