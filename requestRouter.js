var rh = './requesthandlers/';
var events = require(rh+'events');
var news = require(rh+'news');
var login = require (rh+'login');

function route (path){
	if (path.indexOf("event") !== -1)
		return events.handle;
	if (path.indexOf ("login") !== -1)
		return login.handle;
	if (path.indexOf ("news") !== -1)
		return news.handle;
	return balls;
}

function balls (req, res){
	res.writeHeader (404, {"Content-type":"text/html"});
	res.end ("<html><body bgcolor=#F400A1><h3><center>BORTA!<br><img src='https://sphotos-b.xx.fbcdn.net/hphotos-prn2/p480x480/969566_549584988426424_342740630_n.jpg'></center></h3></body></html>");
}
exports.route = route;