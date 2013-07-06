var mongoose = require('mongoose');
var bcrypt = require('bcrypt')
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log ('opened db connection');
});


passport.use(new LocalStrategy(authUser));

var userSchema = new mongoose.Schema({
	username : String,
	password : String
});

userSchema.pre('save', function(next) {
	var user = this;

	if(!user.isModified('password')) 
		return next();
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if(err) 
			return next(err);
		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) 
				return next(err);
			user.password = hash;
			next();
		});
	});
});

var User = mongoose.model ('users', userSchema);

function authUser (username, password, done) {
	console.log ("authing:"+username+", "+password);
//	if (username == '' || username == 'Namn')
//		return done (null, false, {message: 'Måste fylla i användarnamnet'});
//	if (password == '')
//		return done (null, false, {message: 'Måste fylla i lösenordet'});
    User.find({ username: username }).exec(function(err, user) {
		console.log ("user:"+user+", err: "+err);
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
     // if (!user.validPassword(password)) {
   //     return done(null, false, { message: 'Incorrect password.' });
   //   }
      return done(null, user);
    });
 }

function setRoutes (app){
app.use(passport.initialize());
app.use(passport.session());

app.get ('/event', event);
app.get ('/login', login);
app.post ('/login', auth () );
app.get ('/news', news);
app.get ('/makeusr', newuser);
app.get('/', function (req, res){ res.redirect('/login')});
//404
app.get('*', balls);
}

function newuser (req, res){
	var user = req.query.user;
	var pwd = req.query.pwd;
	console.log ("making new user:"+user+", pass:"+pwd);
	var newUser = new User ({username: user, password : pwd});
	console.log ("made user");
	newUser.save(function (err) {if (err) console.log ('Error on save!')});
	console.log ("saved");
	res.redirect('/event');
}

function login (req, res){
	if (req.query.msg=='failedval')
		res.render ('login.jade', {title:'Login', message:'Ett eller flera fält tomma'});
	else if (req.query.msg=='failedauth')
		res.render ('login.jade', {title:'Login', message:'Fel användarnamn eller lösenord'});
	res.render ('login.jade', {title:'Login'});
}

function auth (){
	return passport.authenticate('local', { successRedirect: '/news',
			failureRedirect: '/event',
			failureFlash: false });
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