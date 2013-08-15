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
		case 'A': return 'Action Man'; break;
		case 'B': return 'Barbie'; break;
		case 'C': return 'Care Bear'; break;
		case 'D': return 'Domino'; break;
		case 'E': return 'Etch-a-Sketch'; break;
		case 'F': return 'Furby'; break;
		case 'G': return 'Gameboy'; break;
		case 'H': return 'Hopprep'; break;
		case 'I': return 'Iprenmannen'; break;
		case 'J': return 'Jack-in-the-Box'; break;
		case 'K': return 'Kubiks Rub'; break;
		case 'L': return 'LEGO'; break;
		case 'M': return 'My Little Pony'; break;
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
	var usr = req.session.user;
	if (usr){
		if (usr.dadmin)
			return true;
	}
	return false;
}