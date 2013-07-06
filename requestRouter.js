var mongz = require ('mongodb');

function setRoutes (app){
app.get ('/event', event);
app.get ('/login', login);
app.post ('/login', validateLogin);
app.get ('/news', news);
app.get('/', function (req, res){ res.redirect('/login')});
//404
app.get('*', balls);
}

function login (req, res){
	if (req.query.failed)
		res.render ('login.jade', {title:'Login', message:'failed to log in'});
	res.render ('login.jade', {title:'Login', message:'GO LOG IN!'});
}

function validateLogin (req, res){
	var loginSuccessful = true;
	req.assert('username', 'Name is required').notEmpty();
    req.assert('password', 'Password is required').notEmpty();
	var errors = req.validationErrors();
	loginSuccessful = !errors; // TODO: auth, here. yeah.
	if (loginSuccessful) {
		res.redirect ('/news');
	} else{
		console.log (errors);
		res.redirect('/login?failed=true');
	}
}

function event (req, res){
	res.render ('event.jade', {title:'Events'});
}

function news (req, res){
	console.log ('rendering news...');
	res.render ('news.jade', {title:'News'});
}

function balls (req, res){
	res.writeHeader (404, {"Content-type":"text/html"});
	res.end ("<html><body bgcolor=#F400A1><h3><center>BORTA!<br><img src='https://sphotos-b.xx.fbcdn.net/hphotos-prn2/p480x480/969566_549584988426424_342740630_n.jpg'></center></h3></body></html>");
}
exports.setRoutes = setRoutes;