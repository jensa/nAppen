var helper = require ('./mods/helper');
var database;

exports.init = function (db){
	database = db;
}

exports.auth = function (req, res){
	database.manualLogin(req.param('username'), req.param('password'), 
	function(e, o) {
		if (!o) {
			helper.renderPage (req, res, 'login.jade',  
						{title: 'Login',message: 'Fel användarnamn eller lösenord'});
		} else {
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
	var group = req.param('group');
	var admin = false;
	if (req.param('admin') == 'true')
		admin = true;
	createUser (user, pwd, email, group, admin, function (data){
		if (data.error)
			helper.renderPage (req, res, 'adminview.jade', 
						{
							title: "Misslyckades att skapa användare", 
							message:data.error
						});
		else
			helper.renderPage (req, res, 'adminview.jade', {
											title: "Admin",
											message:"Skapade Användare.\n"+
													", användarnamn: "+data.user+
													", lösenord: "+data.password+
													", email: "+data.email+
													", grupp: "+data.group+
													", admin: "+data.admin});
	});
}

function createUser (user, pwd, email, grp, admin, callback){
	var data = {username: user, password:pwd, email:email, group:grp, admin:admin};
	database.createOrUpdate (data, function (status){
		if (status == 'success'){
			callback ({	title:'Användare skapad',
											user:user, 
											email:email, 
											password: pwd,
											group: grp,
											admin:admin
										});
		} else {
			callback ({error:"Gick inte att skapa användare"});
		}
	});
}

exports.createUser = createUser;

exports.autoLogin = function (req, res) {
	if (req.cookies.username == undefined || req.cookies.password == undefined){
		helper.renderPage(req, res, 'login.jade', { title: 'Logga in' });
	} else {
		database.autoLogin(req.cookies.username, req.cookies.password, function(o){
			if (o != null) {
				req.session.user = o;
				res.redirect('/news');
			} else {
				helper.renderPage (req, res, 'login.jade', {title: 'Logga in'});
			}
		});
	}
}