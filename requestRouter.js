var database = require('./database');

function setRoutes (app){
app.get ('/event', isLoggedIn, eventHandler);
app.get ('/login', login);
app.post ('/login', auth);
app.get ('/news', isLoggedIn, news);
app.post ('/makeuser', isLoggedIn, adminRole, user);
app.get ('/admin', isLoggedIn, adminRole, admin);
app.get ('/logout', logout);
app.get ('/createEvent', isLoggedIn, adminRole, createEvent);
app.get ('/fail', fail);
app.get ('/DELETE', isLoggedIn, adminRole, deleteall);
app.get('/', function (req, res){ res.redirect('/login')});
//404
app.get('*', balls);
}

function createEvent (req, res){
	var desc = req.param('eventDescription');
	var title = req.param ('eventTitle');
	var eventc = {
					description : desc,
					title: title,
					url : -2
					};
	database.addEvent (eventc, function (outcome){
		console.log (outcome);
		renderPage (req, res, 'adminview.jade', {title: 'Admin', message: outcome});
	});
}

function admin(req, res){
	renderPage (req, res, 'adminview.jade', {title:'Admin'});
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
		renderPage (req, res, 'login.jade', 	{
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
	renderPage (req, res, 'kefft.jade', {title:'Failed', message:'allt gick till helvete'});
}

function user (req, res){
	var user = req.param ('user');
	var pwd = req.param('pwd');
	var email = req.param('email');
	var admin = false;
	if (req.param('admin') == 'true')
		admin = true;
	createUser (user, pwd, email, admin, function (data){
		if (data.error)
			renderPage (req, res, 'madeuser', 
						{
							title: "Misslyckades att skapa användare", 
							error:data.error
						});
		else
			renderPage (req, res, 'madeuser.jade', data);
	});
}

function createUser (user, pwd, email, admin, callback){
	var data = {username: user, password:pwd, email:email, admin:admin};
	database.createOrUpdate (data, function (status){
		if (status == 'success'){
			callback ({	title:'Användare skapad',
											user:user, 
											email:email, 
											password: pwd,
											admin:admin,
										});
		}else
			callback ({error:"Gick inte att skapa användare"});
	});
}

function login (req, res){
		if (req.cookies.username == undefined || req.cookies.password == undefined){
			res.render('login.jade', { title: 'Logga in' });
		} else{
			database.autoLogin(req.cookies.username, req.cookies.password, function(o){
				if (o != null){
					req.session.user = o;
					res.redirect('/news');
				}	else{
					renderPage (req, res, 'login.jade', {title: 'Logga in'});
				}
			});
		}
}

function auth (req, res){
		database.manualLogin(req.param('username'), req.param('password'), 
		function(e, o){
			if (!o){
				renderPage (req, res, 'login.jade',  
							{title: 'Login',message: 'Fel användarnamn eller lösenord'});
			}else{
				req.session.user = o;
				res.cookie('username', o.username, { maxAge: 900000 });
				res.cookie('password', o.password, { maxAge: 900000 });
				res.redirect ('/news');
			}
		});
}

function eventHandler (req, res){
	var eventArray = new Array ();
	database.getEvents (function (events){
		for (es in events){
			var e = events[es];
			var anEvent = 	{
								title: e.title, 
								description : e.description, 
								url : e.url
							};
			eventArray.push (anEvent);
		}
		renderPage (req, res, 'event.jade', {title:'Events', events:eventArray});
	});
	
}

function news (req, res){
	renderPage (req, res, 'news.jade', {title:'News'})
}

function getAdminRole (req){
	var usr = req.session.user;
	if (usr){
		if (usr.admin)
			return true;
	}
	return false;
}

function balls (req, res){
	res.writeHeader (404, {"Content-type":"text/html"});
	res.end ("<html><body bgcolor=#F400A1><h3><center>BORTA!<br><img src='https://sphotos-b.xx.fbcdn.net/hphotos-prn2/p480x480/969566_549584988426424_342740630_n.jpg'></center></h3></body></html>");
}


function renderPage (req, res, page, options){
	if (req.session.user)
		options.loggedin = true;
	if (getAdminRole (req))
		options.adminrole = true;
	res.render (page, options);
}


exports.setRoutes = setRoutes;