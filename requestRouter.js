//We need a lot of stuff in this file
var database = require('./database');
var eventsHandler = require('./events');
var helper = require ('./mods/helper')
var userHandler = require('./userHandler');
var helper = require ('./mods/helper');
var fs = require('fs');
var imageHelper = require ('./imageHelper');

var moment = require ('moment');
moment.lang ('sv');
//we don't want to initialize the db twice, so send the database variable to all handlers
imageHelper.init (database, fs, moment);
userHandler.init (database);
eventsHandler.init (database, imageHelper, helper);


//Here we define all the paths for the app
// The path structure works like this:
// app.{METHOD}. ({PATH}, requesthandlers...)
// Example: app.post ('/fuck', isLoggedIn, balls) makes a POST request to /fuck go to the function isLoggedIn,
// which checks if the user is logged in and calls the function balls, which (hopefully) renders a page
// You can define as many request handlers as you wish
exports.setRoutes = function (app){
	// Event view, likely reached from link bar
	app.get ('/event', isLoggedIn, eventsHandler.handleEventRequest);
	// display the given image
	app.get ('/image', isLoggedIn, eventsHandler.displayImage);
	//Login view, Tries to log in using cookie, renders login form if none exists
	app.get ('/login', userHandler.autoLogin);
	// Authenticates a login request
	app.post ('/login', userHandler.auth);
	//Just renders the news view
	app.get ('/news', isLoggedIn, news);
	//Creates a user using the parameters of the POST request made
	app.post ('/makeuser', isLoggedIn, adminRole, userHandler.handleCreateUserRequest);
	// renders admin view
	app.get ('/admin', isLoggedIn, adminRole, admin);
	// renders the almighty Daddmin menu
	app.get ('/dadmin', isLoggedIn, daddeRole, dadmin);
	// destroys session cookie and renders login form
	app.get ('/logout', logout);
	// Creates a new event using the parameters of the request
	app.post ('/createEvent', isLoggedIn, adminRole, eventsHandler.createEvent);
	// Deals with image upload requests (n0llan tries to upload images of momsen)
	app.post ('/uploadImage', eventsHandler.uploadImage);
	// remove an image
	app.post ('/removeImage', isLoggedIn, daddeRole, eventsHandler.removeImage);
	// Creates a new objective with the parameters of the request
	app.post ('/createObjectives', isLoggedIn, adminRole, eventsHandler.createObjectives);
	// Deals with saving uploaded JSON files as objectives
	app.post ('/uploadObjectiveFile', isLoggedIn, adminRole, eventsHandler.parseObjectiveFile);
	// TODO redesign objectives to not be bound to a specific group
	// assigns the objectives in the request to the group specified in the request
	app.post ('/assignObjectives', isLoggedIn, adminRole, eventsHandler.assignObjectives);
	//Create a news post
	app.post ('/createNewsItem', isLoggedIn, createNews);
	//Render text ulpoad form for an objective
	app.get ('/uploadTextForm', isLoggedIn, showTextUploadForm);
	//Save uploaded objective text and render the event
	app.post('/saveObjectiveText', isLoggedIn, saveObjectiveText);
	// I don't know why the fuck I made this. This is retarded
	app.get ('/fail', fail);
	app.get('/', function (req, res){ res.redirect('/login')});
	//404
	app.get('*', balls);
}

//Just render the goddamn admin page
function admin(req, res){
	helper.renderAdminPage (req, res, database, {});
}

function dadmin(req, res) {
	helper.renderDadminPage (req, res, database, {});
}

//destroy cookies, redirect to root
function logout (req, res){
		res.clearCookie('username');
		res.clearCookie('password');
		req.session.destroy(function(e){ res.redirect('/');		});
}

function daddeRole (req, res, next) {
	if (req.session.user.dadmin)
		next ();
	else
		res.redirect ('/');
}

//  check this sessions user for the admin attribute and call next if true, else redirect to root
function adminRole (req, res, next){
	if (req.session.user.admin)
		next ();
	else
		res.redirect('/');
}

// Check if this session has a user attached to it
function isLoggedIn (req, res, next){
	if (req.session.user != null)
		next ();
	else
		res.redirect ('/login');
}

// Delete fucking everything, remake admin account
function deleteall (req, res){
	database.delAllRecords (function (e,o){
		console.log ("deleted everything");
		userHandler.createUser ("dad", "dad", "bystam@kth.se",
			"M", true, false, function(data) {
			userHandler.createUser ("dkd", "dkd", "jensarv@gmail.com" , 
			"ALL", true, true, function(data){
						console.log ("got user data");
						helper.renderPage (req, res, 'login.jade', 	{
							title:"Logga in", 
							message:"Tog bort hela databasen. "+
									"Återskapade adminkontot:" +
									"Namn: "+data.user + 
									"Pass: "+data.password +
									"Email: "+data.email +
									"Dadmin: "+data.dadmin +
									"Admin: "+data.admin
							});
					});
		});
	});
	
}
// WHY
function fail (req, res){
	helper.renderPage (req, res, 'kefft.jade', 
		{title:'Failed', message:'allt gick till helvete'});
}
//Render the news page
function news (req, res){
	database.getNews (req.session.user.group, function (e, newsList){
		fixTimestamps (newsList);
		if (e)
			helper.renderPage (req, res, 'news.jade', {title:'News', message : e});
		else
			helper.renderPage (req, res, 'news.jade', {title:'News', newsList : newsList});
	});
}

function fixTimestamps (list) {
	list.forEach (function (entry) {
		var date = entry._id.getTimestamp ();
		var mom = moment (date);
		entry.timestamp = mom.format ('LLLL');
	});
}

function createNews (req, res){
	var group = req.param ('group');
	var admin = req.session.user.admin;
	var dadmin = req.session.user.dadmin;
	//Check permissions
	if (!admin){
		if (!dadmin)
			res.redirect ('/');
		if (req.session.user.group != group)
			res.redirect ('/');
		group = req.session.user.group;
	}
	database.saveNewsItem ({headline : req.param ('headline'),
							text : req.param ('text'),
							group : group}, function (err, item) {
		if (admin)
			helper.renderAdminPage (req, res, database, {message : err});
		else
			helper.renderDadminPage (req, res, database, {message : err});
	});

}
function showTextUploadForm (req, res){
	var id = req.query.id;
	var group = req.session.user.group;
	database.getObjectiveTextByID (id, group, function (text){
		console.log ("rendering: "+text);
		helper.renderPage (req, res, 'textUpload.jade', {text:text, id:id});
	});
}

function saveObjectiveText (req, res){
	var group = req.session.user.group;
	var text = req.param ('text');
	var id = req.param ('id');
	database.getObjectiveById (id, function (err, objective){
		req.query.eventID = objective.eventID;
		objective.groups.forEach (function (groupProperty){
			if (groupProperty.group == group){
				groupProperty.objectiveText = text;
				objective.save (function (e, o){ if (e) console.log (e)});
			}
		});
		eventsHandler.handleEventRequest (req, res);
	});

}

// write out a raw 404 page with yolo swaggins. Maybe we should make something nice here
function balls (req, res){
	res.writeHeader (404, {"Content-type":"text/html"});
	res.end (errorHTML ("404 - BORTA!"));
}

exports.serverError = function(err, req, res, next){
	console.error(err.stack);
	res.writeHeader (500, {"Content-type":"text/html"});
  	res.send(500, errorHTML ("Allt gick dåligt. Serverfel! :("));
}

function errorHTML (message){
	return "<html><body bgcolor=#F400A1><h1><center>"+message+"<br></center></h1></body></html>"
}
