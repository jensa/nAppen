exports.renderPage = function (req, res, page, options){
	if (req.session.user)
		options.loggedin = true;
	if (getAdminRole (req))
		options.adminrole = true;
	res.render (page, options);
}

function getAdminRole (req){
	var usr = req.session.user;
	if (usr){
		if (usr.admin)
			return true;
	}
	return false;
}