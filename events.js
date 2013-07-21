var helper = require ('./mods/helper');
var database;

exports.init = function (db){
	database = db;
}

exports.createEvent = function (req, res){
	var desc = req.param('eventDescription');
	var title = req.param ('eventTitle');
	var eventc = {
					description : desc,
					title: title,
					url : -2
					};
	database.addEvent (eventc, function (outcome){
		console.log (outcome);
		helper.renderPage (req, res, 'adminview.jade', {title: 'Admin', message: outcome});
	});
}

// Called from GET /event
exports.handleEventRequest = function (req, res){
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
		helper.renderPage (req, res, 'event.jade', {title:'Events', events:eventArray});
	});
	
}