var usermanager = require('./usermanager');

function setRoutes (app){
app.get ('/event', isLoggedIn, event);
app.get ('/login', login);
app.post ('/login', auth);
app.get ('/news', isLogedIn, news);
app.get ('/makeusr', newuser);
app.get ('/fail', fail);
app.get ('/DELETE', deleteall);
app.get('/', function (req, res){ res.redirect('/login')});
//404
app.get('*', balls);
}

function isLoggedIn (req, res){
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

function newuser (req, res){
	var user = req.query.user;
	var pwd = req.query.pwd;
	var email = req.query.email;
	var data = {username: user, password:pwd, email:email};
	usermanager.addNewAccount (data, function (status){
		res.send(status);
	});
}

function login (req, res){
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('login.jade', { title: 'Login' });
		} else{
			usermanager.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
					req.session.user = o;
					res.redirect('/news');
				}	else{
					res.render('login.jade', { title: 'Logga in' });
				}
			});
		}
}

function auth (req, res){
		usermanager.manualLogin(req.param('username'), req.param('password'), function(e, o){
			if (!o){
				res.send(e, 400);
			}else{
				req.session.user = o;
				if (req.param('remember-me') == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.render('news.jade', {title: 'Du gjorde det! du e inloggad!'});
			}
		});
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