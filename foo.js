var express = require('express')
var app = express ();
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(express);
var expressValidator = require('express-validator');
var router = require ('./requestRouter');

app.set('views', __dirname + '/views');
app.set('view options', { layout: false });

app.use(express.static(__dirname + '/public'));
app.use(express.cookieParser());
app.use(express.session(
	{
      secret: 'SUPER SECRET',
      store: new MongoStore(
	  {
        db: 'test'
      })
	}));
app.use(expressValidator ());
app.use(flash ());

router.setRoutes (app);
app.listen(8000);