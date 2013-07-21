var bcrypt = require('bcrypt');
var MongoDB = require('mongodb').Db;
var Server = require('mongodb').Server;
var mongoose = require('mongoose');

var dbPort = 27017;
var dbHost = 'localhost';
var dbName = 'test';

/* establish the database connection */

mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log ('opened db connection');
});

/* Schema definitions */
var userSchema = new mongoose.Schema({
		username : String,
		password : String,
		email : String,
		admin : Boolean,
		group : String
});
User = mongoose.model ('users', userSchema);

var eventSchema = new mongoose.Schema({
	title : String,
	description : String,
	url : Number,
	text : String,
	group : String

});
Event = mongoose.model ('events', eventSchema);

var imageSchema = new mongoose.Schema ({
		url : String,
		event : String,
		group : String
});
Image = mongoose.model ('images', imageSchema);

/* login validation methods */

exports.autoLogin = function(user, pass, callback){
	User.findOne({username:user}, function(e, o) {
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
function addNewAccount(newData, callback){
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
													email : newData.email,
													admin : newData.admin,
													group : newData.group
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

exports.addNewAccount = addNewAccount;

exports.createOrUpdate = function createOrUpdate (data, callback){
	console.log ("updating with admin="+data.admin);
	User.findOne ({username:data.username}, function (e, o){
		if (o)
			updateAccount (data, callback);
		else
			addNewAccount (data, callback);
	});
}

function updateAccount(newData, callback)
{
	User.findOne({username:newData.username}, function(e, o){
		o.username = newData.username;
		o.email = newData.email;
		o.admin = newData.admin;
		if (newData.password == ''){
			o.save(function(err) {
				if (err) 
					callback(err);
				else 
					callback('success');
			});
		}else{
			bcrypt.hash(newData.password, 8, function(err, hash) {
				o.password = hash;
				o.save(function(err) {
					if (err) 
						callback(err);
					else 
						callback('success');
				});
			});
		}
	});
}
exports.updateAccount = updateAccount;


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
	Event.remove({}, callback);
}

var validatePassword = function(plainPass, hashedPass, callback)
{
	bcrypt.compare(plainPass, hashedPass, callback);
}

exports.getEvents = function (callback){
	Event.find ({}, function (e, o){
		console.log ("objects found: "+o);
		if (!e)
			callback (o);
	});
}

exports.addEvent = function (ev, callback){
	getNextEventID (function (id){
		var nextID = id +1;
		var newEvent = new Event ({
							title: ev.title,
							description : ev.description,
							url: nextID
						});
		newEvent.save (function (error, evenz){
			if (!error)
				callback ("success");
			else if (!evenz)
				callback("event undefined?" + ev+".error: "+error);
			else
				callback ("failed to save event: "+error);
		});
	});
			
}

function getNextEventID (callback){
	Event.find({},'url',{
							skip:0,
							limit:10,
							sort:{
									url: -1 //descending
								}
							}, 
							function(err,latestEventUrls){
								if (latestEventUrls.length == 0)
									callback (-1);
								else{
									console.log ("latest eventurl:"+latestEventUrls[0].url);
									callback (latestEventUrls[0].url);
								}
							});
}

