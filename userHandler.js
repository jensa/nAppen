var helper = require ('./mods/helper');
var database;

exports.init = function (db){
	database = db;
}

exports.auth = function (req, res){
		database.manualLogin(req.param('username'), req.param('password'), 
		function(e, o){
			if (!o){
				helper.renderPage (req, res, 'login.jade',  
							{title: 'Login',message: 'Fel användarnamn eller lösenord'});
			}else{
				req.session.user = o;
				res.cookie('username', o.username, { maxAge: 900000 });
				res.cookie('password', o.password, { maxAge: 900000 });
				res.redirect ('/news');
			}
		});
}

exports.handleCreateUserRequest = function (req, res){
	var user = req.param ('user');
	var pwd = req.param('pwd');
	var email = req.param('email');
	var admin = false;
	if (req.param('admin') == 'true')
		admin = true;
	createUser (user, pwd, email, admin, function (data){
		if (data.error)
			helper.renderPage (req, res, 'madeuser', 
						{
							title: "Misslyckades att skapa användare", 
							error:data.error
						});
		else
			helper.renderPage (req, res, 'madeuser.jade', data);
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

exports.autoLogin = function (req, res){
		if (req.cookies.username == undefined || req.cookies.password == undefined){
			helper.renderPage(req, res, 'login.jade', { title: 'Logga in' });
		} else{
			database.autoLogin(req.cookies.username, req.cookies.password, function(o){
				if (o != null){
					req.session.user = o;
					res.redirect('/news');
				}	else{
					helper.renderPage (req, res, 'login.jade', {title: 'Logga in'});
				}
			});
		}
}