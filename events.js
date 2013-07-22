var helper = require ('./mods/helper');
var database;

nollegroups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];

exports.init = function (db){
	database = db;
}

exports.createEvent = function (req, res){
	var desc = req.param('eventDescription');
	var title = req.param ('eventTitle');
	var text = req.param ('eventText');

	var eventc = {
					description : desc,
					title: title,
					text: text
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
	var filename = req.param ('imageFile');
	console.log ("image file: "+filename+", eventID: "+eventID);
	// after uploading,
	showEvent (req, res, eventID, "Laddade upp "+filename);
}

function listEvents (req, res, message){
	var eventArray = new Array ();
	database.getEvents (req.session.user.group, function (events){
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

function showEvent (req, res, eventID, message){
	var userGroup = req.session.user.group;
	console.log ("get event: "+eventID);
	database.getEvent (eventID, function (err, event){
		if (err)
			listEvents (req, res, err);
		if (event == undefined)
			listEvents (req, res, err);
		if (event.group != userGroup)
			listEvents (req, res, 'Du har inte access till det valda eventet');
		//TODO här: adda ajax till singleEvent.jade som laddar bilderna.
		//det kanske blir jättejobbigt, men vafan
		event.message = message;
		helper.renderPage (req, res, 'singleEvent.jade', event);
	});
}