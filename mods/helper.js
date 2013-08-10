function renderPage (req, res, page, options) {
	if (req.session.user)
		options.loggedin = true;
	if (getDadminRole (req))
		options.dadminrole = true;
	if (getAdminRole (req))
		options.adminrole = true;
	if (req.session.user)
		options.groupName = getNollegroupName(req.session.user.group);
	else
		options.groupName = '';
	res.render (page, options);
}

function getNollegroupName (letter){
	switch (letter){
		case 'A': return 'and Onion, Sourcream'; break;
		case 'B': return 'burgarchips, Cheese'; break;
		case 'C': return 'Chips med tacosmak'; break;
		case 'D': return 'Dillchips'; break;
		case 'E': return 'Echo'; break;
		case 'F': return 'Fucking grillchips'; break;
		case 'G': return 'Gotländska chips'; break;
		case 'H': return 'Hotel'; break;
		case 'I': return 'India'; break;
		case 'J': return 'Jalapenochips'; break;
		case 'K': return 'Kilo'; break;
		case 'L': return 'Lättsaltade chips'; break;
		case 'M': return 'Mango'; break;
		case 'ALL': return 'Alla grupper'; break;
	}
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

exports.renderDadminPage = function (req, res, database, options) {
	renderPage (req, res, 'dadmin.jade', {});
}

function getAdminRole (req){
	var usr = req.session.user;
	if (usr) {
		if (usr.admin)
			return true;
	}
	return false;
}

function getDadminRole (req) {
	return true; // TODO implement this;
}