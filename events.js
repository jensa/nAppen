var helper = require ('./mods/helper');
var fs = require('fs');
var database;

nollegroups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];

exports.init = function (db){
	database = db;
}

exports.createEvent = function (req, res){
	var desc = req.param('eventDescription');
	var title = req.param ('eventTitle');
	var eventc = {
					description : desc,
					title: title,
				};
	database.addEvent (eventc, function (outcome) {
		console.log (outcome);
		helper.renderPage (req, res, 'adminview.jade', {title: 'Admin', message: outcome});
	});
}

// Called from GET /event
exports.handleEventRequest = function (req, res){
	var eventID = req.query.eventID
	if (eventID){
		showEvent (req, res, eventID);
	} else {
		listEvents (req, res);
	}
}

exports.uploadImage = function (req, res){
	var eventID = req.param('eventID');
	var filename = req.files.imageFile.name;
	console.log ("image file: "+filename+", eventID: "+eventID);
	// after uploading,

	fs.readFile(req.files.imageFile.path, function (err, data) {
		var newPath = __dirname + "/images/" + filename;
		fs.writeFile(newPath, data, function (err) {
			// lolwut
		});
	});
	showEvent (req, res, eventID, "Laddade upp "+filename);
}

function listEvents (req, res, message){
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
		helper.renderPage (req, res, 'event.jade', {title:'Events', events:eventArray, message:message});
	});
}

exports.eventTitles = function (callback){
	var eventArray = new Array ();
	database.getEvents (function (events){
		for (es in events){
			var e = events[es];
			var anEvent = 	{
				title: e.title, 
				url : e.url
			};
			eventArray.push (anEvent);
		}
		callback (eventArray);
	});
}

function showEvent (req, res, eventID, message) {
	var userGroup = req.session.user.group;
	database.getEvent (eventID, function (err, event){
		if (err)
			listEvents (req, res, err);
		if (event == undefined)
			listEvents (req, res, err);
		//TODO här: adda ajax till singleEvent.jade som laddar bilderna.
		//det kanske blir jättejobbigt, men vafan
		event.message = message;
		database.getObjectives (userGroup, eventID, function (e,o){
			event.objectives = o;
			helper.renderPage (req, res, 'singleEvent.jade', event);
		});
	});
}

exports.createObjectives = function (req, res){
	var group = req.param('group');
	var title = req.param('objectiveTitle');
	var description = req.param ('objectiveDescription');
	var eventID = req.param ('eventID');

	database.addObjective(title, description, group, eventID, function (e, o){
		var message = "Uppdrag tillagt";
		if (e)
			message = e;
		helper.renderPage (req, res, 'adminview.jade', {message:message});
	});

}