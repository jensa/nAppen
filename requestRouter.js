var database = require('./database');
var eventsHandler = require('./events');
var helper = require ('./mods/helper')
var userHandler = require('./userHandler');
userHandler.init (database);
eventsHandler.init (database);

exports.setRoutes = function (app){
app.get ('/event', isLoggedIn, eventsHandler.handleEventRequest);
app.get ('/login', userHandler.autoLogin);
app.post ('/login', userHandler.auth);
app.get ('/news', isLoggedIn, news);
app.post ('/makeuser', isLoggedIn, adminRole, userHandler.handleCreateUserRequest);
app.get ('/admin', isLoggedIn, adminRole, admin);
app.get ('/logout', logout);
app.get ('/createEvent', isLoggedIn, adminRole, eventsHandler.createEvent);
app.get ('/fail', fail);
app.get ('/DELETE', isLoggedIn, adminRole, deleteall);
app.get('/', function (req, res){ res.redirect('/login')});
//404
app.get('*', balls);
}

function admin(req, res){
	helper.renderPage (req, res, 'adminview.jade', {title:'Admin'});
}

function logout (req, res){
		res.clearCookie('username');
		res.clearCookie('password');
		req.session.destroy(function(e){ res.redirect('/');		});
}

function adminRole (req, res, next){
	console.log ("processing adminrole: "+req.session.user.admin);
	if (req.session.user.admin)
		next ();
	else
		res.redirect('/');
}

function isLoggedIn (req, res, next){
	if (req.session.user != null)
		next ();
	else
		res.redirect ('/login');
}

function deleteall (req, res){
	database.delAllRecords (null);
	createUser ("jerre", "jerre", "jensarv@gmail.com", true, function(data){
		helper.renderPage (req, res, 'login.jade', 	{
								title:"Logga in", 
								message:"Tog bort hela databasen. "+
										"Återskapade adminkontot:" +
										"Namn: "+data.user + 
										"Pass: "+data.password +
										"Email: "+data.email +
										"Admin: "+data.admin
								});
	});
	
}

function fail (req, res){
	helper.renderPage (req, res, 'kefft.jade', {title:'Failed', message:'allt gick till helvete'});
}

function news (req, res){
	helper.renderPage (req, res, 'news.jade', {title:'News'})
}

function balls (req, res){
	res.writeHeader (404, {"Content-type":"text/html"});
	res.end ("<html><body bgcolor=#F400A1><h3><center>BORTA!<br><img src='https://sphotos-b.xx.fbcdn.net/hphotos-prn2/p480x480/969566_549584988426424_342740630_n.jpg'></center></h3></body></html>");
}