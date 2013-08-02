var nodefs = require('node-fs');
var childproc = require('child_process');
var moment = require ('moment');
var path = require('path');
var mmm = require('mmmagic'),
    Magic = mmm.Magic;
var mime = new Magic(mmm.MAGIC_MIME_TYPE);
var database;
var fs;

moment.lang ('sv');
exports.init = function (db, f){
	database = db;
	fs = f;
}

exports.saveImage = function (req, callback){
	var eventID = req.param('eventID');
	var eventTitle = req.param('eventTitle');
	var objectiveID = req.param ('objectiveID');
	var group = req.session.user.group;
	var originalFilename = req.files.imageFile.name;
	var filename = getFilename (originalFilename);
	var basedir = path.resolve (__dirname);
	var urlPath = "/images/"+eventTitle+"/"+filename;
	var folder = path.join (basedir, "public", "images", eventTitle);
	var thumbsFolder = path.join (folder, "thumbs");
	var filePath = path.join(folder,filename);
	fs.readFile(req.files.imageFile.path, function (err, data) {
		detectFiletype (req.files.imageFile.path, function (isImage){
			if (isImage){
				nodefs.mkdir (thumbsFolder, 0777, true, function(err){
					if (err)
						console.log ("Error mking dir: "+err);
					else{
						fs.writeFile(filePath, data, function (err) {
							if (err)
								console.log ("Error writing file: "+filePath);
							else{
								saveThumbnail (filePath, function (){
									saveToDB (urlPath, eventID, objectiveID, group, function (err, o){
										callback (err, o);
									});
								});
							}
						});
					}
				});
			}
			else{
				callback ("Filen måste vara en bild!", null);
			}
		});
	});
	
}

exports.setThumbnailPaths = function (images) {
	images.forEach (function (image, imageIndex, images) {
		var url = image.url;
		var fileName = path.basename (url);
		var thumbsName = path.dirname (url) + "/thumbs/" + fileName;
		image.thumbnail = thumbsName;
	});
}

function saveThumbnail (file, callback){
	var dest = getThumbnailFilename (file);
	var command = "convert "+file+" -resize 50x50! "+dest;
	childproc.exec(command, [], function (err, out, stderr){
		callback ();
	});
}

function saveToDB (urlPath, eventID, objectiveID, group, callback){
	database.saveImage ({	url : urlPath,
							eventID : eventID,
							objectiveID: objectiveID, // optional! I have no idea what I'm doing /jens wtf works even worse now /bystam
							group : group
						}, function (e, o){
							if (e)
								callback ("error saving image url to db: "+ urlPath, o);
							else
								callback (null, urlPath);
						});
}

function detectFiletype (path, callback){
	mime.detectFile(path, function(err, result) {
    	if (err)
    		callback (false);
    	else{
    		var isImage = result.indexOf("image") != -1;
    		callback (isImage);
    	}
	});
}

function getFilename (originalName){
	var extension = path.extname (originalName);
	var name = moment().format("lll")+getRandInt ()+extension;
	name = name.split(":").join("").split (" ").join("");
	return name;
}

function getThumbnailFilename (originalName){
	var base = path.basename (originalName);
	var folder = path.join (path.dirname (originalName),"thumbs");
	return path.join (folder, base);
}

function getRandInt() {
  return Math.floor((Math.random()+1) * (10000));
}