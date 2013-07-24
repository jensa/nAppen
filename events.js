var helper = require ('./mods/helper');
var fs = require('fs');
var path = require('path');
var nodefs = require('node-fs');
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
	var eventTitle = req.param('eventTitle');
	var objectiveID = req.param ('objectiveID');
	var group = req.session.user.group;
	var originalFilename = req.files.imageFile.name;
	var filename = getFilename (originalFilename);

	console.log ("image file: "+filename+", eventID: "+eventID);
	var basedir = path.resolve (__dirname);
	var urlPath = "/images/"+eventTitle+"/"+filename;
	var folder = path.join (basedir, "public", "images", eventTitle);
	var filePath = path.join(folder,filename);
	fs.readFile(req.files.imageFile.path, function (err, data) {
		nodefs.mkdir (folder, 0777, true, function(err){
			if (err)
				console.log ("Error mking dir: "+err);
			else{
				fs.writeFile(filePath, data, function (err) {
					if (err)
						console.log ("Error writing file: "+filePath);
				});
			}
		});
	});
	database.saveImage ({	url : urlPath,
							eventID : eventID,
							objectiveID: objectiveID, // optional! I have no idea what I'm doing /jens wtf works even worse now /bystam
							group : group
						}, function (e, o){
							if (e)
								console.log ("error saving image url to db: "+newPath);
						});
	showEvent (req, res, eventID, "Laddade upp "+filename);
}

exports.displayImage = function (req, res) {
	var imagePath = req.query.imagePath;
	console.log(imagePath);
	helper.renderPage (req, res, 'image.jade', {imagePath : imagePath});
}

function getFilename (balle){
	return balle;
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
		event.message = message;
		database.getObjectives (userGroup, eventID, function (e,o){
			event.objectives = o;
			database.getImages (eventID, userGroup, function (e, images){
				if (e)
					console.log ("could not load any images: "+e);
				event.images = images;
				helper.renderPage (req, res, 'singleEvent.jade', event);
			})
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
	assignmentList = "";
	objectives.forEach (function (objective){
		database.assignObjective (objective.id, group, objective.placement, function(e, o){
			if (e)
				console.log ("error assigning objective: "+e);
			else{
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