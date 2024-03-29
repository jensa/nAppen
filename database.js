var bcrypt = require('bcrypt-nodejs');

// I think we can remove these
var MongoDB = require('mongodb').Db;
var Server = require('mongodb').Server;
//******************************

var mongoose = require('mongoose');

var dbPort = 27017;
var dbHost = 'localhost';
var dbName = 'test';
var ALLGROUP = "ALL";

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
	dadmin : Boolean,
	admin : Boolean,
	group : String
});
User = mongoose.model ('users', userSchema);

var eventSchema = new mongoose.Schema({
	title : String,
	description : String,
	url : String,
});
Event = mongoose.model ('events', eventSchema);

var imageSchema = new mongoose.Schema ({
	url : String,
	eventID : String,
	objectiveID: String, // optional! I have no idea what I'm doing. wtf works even worse now /bystam
	group : String
});

Image = mongoose.model ('images', imageSchema);

var objectiveSchema = new mongoose.Schema({
	title : String,
	description : String,
	eventID : String,
	groups : [{group:String, placement:Number, objectiveText:String}]// the groups who has this assignment, their objective text, and the placement of the objective in that group. This could be bad...
});

Objective = mongoose.model ('objectives', objectiveSchema);

var newsSchema = new mongoose.Schema ({
	headline : String,
	text : String,
	group : String // ALL for global news
});

News = mongoose.model ('news', newsSchema);


/* login validation methods */

exports.autoLogin = function(user, pass, callback){
	User.findOne({username:user}, function(e, o) {
	if (o) {
		o.password == pass ? callback(o) : callback(null);
	} else {
		callback(null);
	}
	});
}

exports.manualLogin = function(user, pass, callback) {
	User.findOne({username:user}, function(e, o) {
		if (o == null) {
			callback('user-not-found');
		} else {
			validatePassword(pass, o.password, function(err, res) {
				if (res) {
					callback(null, o);
				} else {
					callback('invalid-password');
				}
			});
		}
	});
}

/* record insertion, update & deletion methods */

/** callback returns 'success' on success */
function addNewAccount(newData, callback) {
	User.findOne({username:newData.username}, function(e, o) {
		if (o) {
			callback('username-taken');
		} else {
			bcrypt.hash(newData.password, null, null, function(err, hash) {
				var newUser = new User ({	
					username : newData.username, 
					password : hash, 
					email : newData.email,
					dadmin : newData.dadmin,
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

exports.addNewAccount = addNewAccount;

exports.createOrUpdate = function createOrUpdate (data, callback){
	User.findOne ({username:data.username}, function (e, o){
		if (o)
			updateAccount (data, callback);
		else
			addNewAccount (data, callback);
	});
}

function updateAccount(newData, callback) {
	User.findOne({username:newData.username}, function(e, o){
		o.username = newData.username;
		o.email = newData.email;
		o.admin = newData.admin;
		if (newData.password == '') {
			o.save(function(err) {
				if (err) 
					callback(err);
				else 
					callback('success');
			});
		} else {
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
		if (e) {
			callback(e, null);
		} else {
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
	Objective.remove({}, function (e, o){
		Event.remove({}, function(e,o){
			User.remove({}, function(e,o){
				Image.remove({}, callback);
			});

		});
	});
	
	
}

var validatePassword = function(plainPass, hashedPass, callback)
{
	bcrypt.compare(plainPass, hashedPass, callback);
}

exports.getObjectives = function (usergroup, eventID, callback){
	var filter = {};
	if (eventID)
		filter.eventID=eventID;
	if (usergroup != ALLGROUP && usergroup != null)
		filter.groups = {$elemMatch: {group:usergroup}}; // filter on group, use $elemMatch to filter on array elements
	Objective.find(filter).exec (function (e, o){
		if (e)
			callback (e, o);
		else{
			//sort placement->ascending

			o.sort(function(a,b) {
				if (a.groups[0]){
					if (b.groups[0])
						return a.groups[0].placement - b.groups[0].placement;
					else
						return 1;
				} else{
					return -1;
				}
			});
			callback (e, o);
		}
	});
}

exports.addObjective = function (o, callback){
	var obj = new Objective (o);
	obj.save (callback);
}

exports.assignObjective = function (objective, group, placement, callback){
	Objective.findById (objective, function (err, obj){
		if (!err){
			if (!obj.groups)
				obj.groups = new Array ();
			var exists = false;
			for (var i = obj.groups.length - 1; i >= 0; i--) {
				groupProperties = obj.groups[i];
				if (groupProperties.group == group){
					//The property object already exists for this objective/group combo, just edit it.
					groupProperties.placement = placement;
					exists = true;
					break;
				}
			};
			if (!exists)
				obj.groups.push ({group: group, placement:placement});
			obj.save (callback);
		}
		else
			callback (err, obj);
	});
}

exports.getEvents = function (callback){
	Event.find ({}, function (e, o){
		if (!e)
			callback (o);
	});
}

exports.getEventURLByTitle = function (title, callback){
	Event.findOne({title:title}, function (e, o){
		if (e || !o)
			callback (e, o);
		else
			callback (e, o.url);
	});
}

exports.getEvent = function (url, callback){
	Event.findOne ({url:url}, callback);
}

exports.addEvent = function (ev, callback){
	getNewEventURL (ev, function (err, url){
		if (err) {
			callback ("couldnt create hash");
		} else {
			var newEvent = new Event ({
				title: ev.title,
				description : ev.description,
				url: url,
			});
			newEvent.save (function (error, evenz) {
				if (!error)
					callback ("success");
				else if (!evenz)
					callback("event undefined?" + ev+".error: "+error);
				else
					callback ("failed to save event: "+error);
			});
		}
	});
			
}

exports.saveImage = function (img, callback){
	var image = new Image (img);
	image.save (callback);
}

exports.removeImage = function (url, callback) {
	var image = Image.findOne ({url : url}, function (err, image) {
		var eventID = image.eventID;
		Image.remove ({_id : image._id}, function () {
			callback (eventID);
		});
	});
}

exports.getImages = function (eventID, group, callback){
	Image.find ({eventID:eventID, group:group}).exec (callback);
}

exports.getNews = function(group, callback){
	// sort to have latest news first
	News.find ({$or: [ { group : group }, { group : ALLGROUP }]}).sort ( { _id: -1 } ).exec (callback);
}
//Given an objective ID, retrieves the current ObjectiveText for the given group
exports.getObjectiveTextByID = function(id, group, callback){
	Objective.findById(id, function (err, obj){
		var count = 0;
		for (var i = obj.groups.length - 1; i >= 0; i--) {
			var groupProperty = obj.groups[i];
			if (groupProperty.group == group){
				console.log ("returning text: "+groupProperty.objectiveText)
				callback (groupProperty.objectiveText);
			}
		};
		if (obj.groups.length < 1)
			callback ('');
	});
}

exports.getObjectiveById = function (id, callback){
	Objective.findById (id, callback);
}

exports.saveNewsItem = function (newsItem, callback){
	console.log (JSON.stringify (newsItem));
	var item = new News (newsItem);
	item.save (callback);
}

//Get a 8-char hash from the given  string

function getSmallHash (val, callback){
	bcrypt.hash(val.toString (), null, null, function(err, hash) {
		replaceUnsafe(hash, function (safeHash){
			var shortHash = safeHash.substring (safeHash.length-9, safeHash.length-1);
			callback (err, shortHash);
		});
	});
}
exports.getSmallHash = getSmallHash;

// hash the event, get money
function getNewEventURL (event, callback){
	getSmallHash (""+event.title+event.description+event.group, callback);
}

function replaceUnsafe (str, callback){
	var removed = str.split("/").join("");
	if (removed.length < 8){
		removed = removed + "v11D9dD3r13T";
	}
	callback (removed);
}

