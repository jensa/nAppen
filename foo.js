var express = require('express')
var app = express ();
var router = require ('./requestRouter');

app.configure(function(){
	//I don't know what half of this does, but I guess it's all needed
	app.set('port', 8000);
	//base dir where we put all .jade files
	app.set('views', __dirname + '/views');
	//set jade as templating engine
	app.set('view engine', 'jade');
	// this is needed for template inheritance in jade. Don't know why
	app.set('view options', { layout: false });
	//what the fuck is this
	app.locals.pretty = true;
	//base dir for static assets (client javascript, stylesheets)
	app.use(express.static(__dirname + '/public'));
	//for some fucking reason we need to specify these
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'super-duper-secret-secret' }));
	app.use(express.methodOverride());
	
});

//This is supposed to do something but I think its safe to remove it
app.configure('development', function(){
app.use(express.errorHandler());
});

// This is where everything important happens
router.setRoutes (app);

app.listen(8000);
