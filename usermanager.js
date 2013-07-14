var bcrypt = require('bcrypt');
var MongoDB = require('mongodb').Db;
var Server = require('mongodb').Server;
var mongoose = require('mongoose');

var dbPort = 27017;
var dbHost = 'localhost';
var dbName = 'test';

/* establish the database connection 

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
db.open(function(e, d){
	if (e) {
		console.log(e);
	}	else{
		console.log('connected to database :: ' + dbName);
	}
});*/

mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log ('opened db connection');
});

var userSchema = new mongoose.Schema({
		username : String,
		password : String,
		email : String
});
User = mongoose.model ('users', userSchema);

/* login validation methods */

exports.autoLogin = function(user, pass, callback){
	User.findOne({username:user}, function(e, o) {
		console.log ("checking username "+user);
	if (o){
		o.password == pass ? callback(o) : callback(null);
	}else{
		callback(null);
	}
	});
}

exports.manualLogin = function(user, pass, callback){
	User.findOne({username:user}, function(e, o) {
	if (o == null){
		callback('user-not-found');
	}else{
		validatePassword(pass, o.password, function(err, res) {
			if (res){
				callback(null, o);
			}	else{
				callback('invalid-password');
			}
		});
		}
	});
}

/* record insertion, update & deletion methods */

/** callback returns 'success' on success */
exports.addNewAccount = function(newData, callback){
	User.findOne({username:newData.username}, function(e, o) {
		if (o){
			callback('username-taken');
		}else{
			User.findOne({email:newData.email}, function(e, o) {
				if (o){
					callback('email-taken');
				}else{
					bcrypt.hash(newData.password, 8, function(err, hash) {
						var newUser = new User ({	
													username : newData.username, 
													password : hash, 
													email : newData.email
												});
						newUser.save (function(error, user){
							if (!error)
								callback ("success");
							else
								callback ("failed to save user:"+user.username);
						});
					});
				}
			});
		}
	});
}

exports.updateAccount = function(newData, callback)
{
	User.findOne({username:newData.username}, function(e, o){
		o.username = newData.name;
		o.email = newData.email;
		if (newData.password == ''){
			User.save(o, {safe: true}, function(err) {
				if (err) 
					callback(err);
				else 
					callback(null, o);
			});
		}else{
			bcrypt.hash(newData.pass, 8, function(err, hash) {
				o.pass = hash;
				User.save(o, {safe: true}, function(err) {
					if (err) callback(err);
					else callback(null, o);
				});
			});
		}
	});
}

exports.updatePassword = function(email, newPass, callback){
	User.findOne({email:email}, function(e, o){
		if (e){
			callback(e, null);
		}else{
			bcrypt.hash(newPass, 8, function(err, hash) {
				o.password = hash;
				User.save(o, {safe: true}, callback);
			});
		}
	});
}

/* account lookup methods */

exports.deleteAccount = function(id, callback){
	User.remove({_id: getObjectId(id)}, callback);
}

exports.getAccountByEmail = function(email, callback){
	User.findOne({email:email}, function(e, o){ callback(o); });
}

exports.validateResetLink = function(email, passHash, callback){
	User.find({ $and: [{email:email, pass:passHash}] }, function(e, o){
		callback(o ? 'ok' : null);
	});
}

exports.delAllRecords = function(callback)
{
	User.remove({}, callback); // reset User collection for testing //
}

var validatePassword = function(plainPass, hashedPass, callback)
{
	bcrypt.compare(plainPass, hashedPass, callback);
}

