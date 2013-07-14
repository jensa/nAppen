var express = require('express')
var app = express ();
var router = require ('./requestRouter');
app.configure(function(){
	app.set('port', 8000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.locals.pretty = true;
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'super-duper-secret-secret' }));
	app.use(express.methodOverride());
	app.use(express.static(__dirname + '/app/public'));
});

app.configure('development', function(){
app.use(express.errorHandler());
});

router.setRoutes (app);
app.listen(8000);