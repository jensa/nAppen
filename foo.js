var http = require ('http');
var url = require ('url');
var requestRouter = require ("./requestRouter");
var server = getServer ();

server.listen (8000, '127.0.0.1');

function getServer (){
	function onRequest (req, res) {
		var path = url.parse (req.url).pathname;
		var handleRequest = requestRouter.route (path);
		handleRequest (req, res);
	}
	var server = http.createServer (onRequest);
	return server;
}