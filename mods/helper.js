function renderPage (req, res, page, options) {
	if (req.session.user)
		options.loggedin = true;
	if (getAdminRole (req))
		options.adminrole = true;
	res.render (page, options);
}

exports.renderPage = renderPage;

exports.renderAdminPage = function (req, res, database, options){
	options = {title: "Admin"};
	database.getEvents (function (events){
		var eventArray = new Array ();
		for (es in events){
			var e = events[es];
			var anEvent = 	{
				title: e.title, 
				url : e.url
			};
			eventArray.push (anEvent);
		}
		options.events = eventArray;
		database.getObjectives (null, null, function (e, o){
			if (e)
				options.message = e;
			else
				options.objectives = o;
			renderPage (req, res, 'adminview.jade', options);
		});
	});
}

function getAdminRole (req){
	var usr = req.session.user;
	if (usr) {
		if (usr.admin)
			return true;
	}
	return false;
}