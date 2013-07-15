var usermanager = require('./usermanager');

function setRoutes (app){
app.get ('/event', isLoggedIn, event);
app.get ('/login', login);
app.post ('/login', auth);
app.get ('/news', isLoggedIn, news);
app.get ('/usr', isLoggedIn, user);
app.get ('/admin', isLoggedIn, adminRole, admin);
app.get ('/logout', logout);
app.get ('/fail', fail);
app.get ('/DELETE', isLoggedIn, deleteall);
app.get('/', function (req, res){ res.redirect('/login')});
//404
app.get('*', balls);
}

function admin(req, res){
	res.send ("ADMIN ACCESS");
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
	usermanager.delAllRecords (null);
	res.send ("dleted errthang");
}

function fail (req, res){
	res.render ('kefft.jade', {title:'Failed', message:'alt gick till helvete'});
}

function user (req, res){
	var user = req.query.user;
	var pwd = req.query.pwd;
	var email = req.query.email;
	var admin = false;
	if (req.query.admin == 'true')
		admin = true;
	var data = {username: user, password:pwd, email:email, admin:admin};
	usermanager.createOrUpdate (data, function (status){
		if (status == 'success')
			res.redirect ('/');
		else
			res.send (status);
	});
}

function login (req, res){
		if (req.cookies.username == undefined || req.cookies.password == undefined){
			res.render('login.jade', { title: 'Login' });
		} else{
			usermanager.autoLogin(req.cookies.username, req.cookies.password, function(o){
				if (o != null){
					req.session.user = o;
					res.redirect('/news');
				}	else{
					res.render('login.jade', { title: 'Logga in'});
				}
			});
		}
}

function auth (req, res){
		usermanager.manualLogin(req.param('username'), req.param('password'), function(e, o){
			if (!o){
				res.render ('login.jade', {title: 'Login',message: 'Fel användarnamn eller lösenord'});
			}else{
				req.session.user = o;
				res.cookie('username', o.username, { maxAge: 900000 });
				res.cookie('password', o.password, { maxAge: 900000 });
				res.redirect ('/news');
			}
		});
}

function event (req, res){
	res.render ('event.jade', {title:'Events'});
}

function news (req, res){
	res.render ('news.jade', {title:'News'});
}

function balls (req, res){
	res.writeHeader (404, {"Content-type":"text/html"});
	res.end ("<html><body bgcolor=#F400A1><h3><center>BORTA!<br><img src='https://sphotos-b.xx.fbcdn.net/hphotos-prn2/p480x480/969566_549584988426424_342740630_n.jpg'></center></h3></body></html>");
}

exports.setRoutes = setRoutes;