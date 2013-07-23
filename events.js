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
		helper.renderAdminPage (req, res, database, {message: outcome});
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
			//console.log (JSON.stringify (o));
			event.objectives = o;
			helper.renderPage (req, res, 'singleEvent.jade', event);
		});
	});
}

exports.createObjectives = function (req, res){
	var title = req.param('objectiveTitle');
	var description = req.param ('objectiveDescription');
	var eventID = req.param ('eventID');

	var obj = {
		title:title,
		description:description,
		eventID:eventID
		};
	database.addObjective(obj, function (e, o){
		var message = "Uppdrag tillagt";
		if (e)
			message = e;
		helper.renderAdminPage (req, res, database, {message:message});
	});
}

exports.getAllObjectives = function (callback){
	database.getObjectives (null, null, function (e, o){
		if (e)
			callback (null);
		else
			callback (o);
	});
}

var assignmentsPerRequest = 10;
exports.assignObjectives =function (req, res){
	var objectives = new Array ();
	var group = req.param ('group');
	for (var i = assignmentsPerRequest; i > 0; i--) {
		var objectiveID = req.param ('objective'+i);
		var placement = req.param ('placement'+i);
		if (objectiveID && placement)
			objectives.push ({id:objectiveID, placement:placement});
	};
	console.log ("objectives to assign: "+JSON.stringify (objectives));
	assignmentList = "";
	objectives.forEach (function (objective){
		database.assignObjective (objective.id, group, objective.placement, function(e, o){
			if (e)
				console.log ("error assigning objective: "+e);
			else{
				console.log ("Assigned objective: "+o.title+" to group: "+group);
				assignmentList = assignmentList + o.title + ", "
			}
		})
	});
	helper.renderAdminPage (req, res, database, {message:"TIlldelat uppdrag"});

}

exports.parseObjectiveFile = function (req, res){
	var filename = req.files.objectiveFile.name;

	fs.readFile(req.files.objectiveFile.path, function (err, data) {
		if (err)
			helper.renderAdminPage (req, res, database, {message:err});
		var newObjectives = JSON.parse (data);
		newObjectives.objectives.forEach (function (objective){
			database.getEventURLByTitle (objective.event, function (e, o){
				if (!e){
					objective.eventID = o;
					database.addObjective(objective);
				}
			});
		});
		helper.renderAdminPage (req, res, database, {message:"Läste in filen"});
	});
}