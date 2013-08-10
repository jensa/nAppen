var nodefs = require('node-fs');
var childproc = require('child_process');
var path = require('path');
var mmm = require('mmmagic'),
    Magic = mmm.Magic;
var mime = new Magic(mmm.MAGIC_MIME_TYPE);
var database;
var fs;
var moment;
exports.init = function (db, f, mmt){
	database = db;
	fs = f;
	moment = mmt;
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
							else {
								autoOrient (filePath, function () {
									saveThumbnail (filePath, function () {
										saveToDB (urlPath, eventID, objectiveID, group, function (err, o){
											callback (err, o);
										});
									});
								});
							}
						});
					}
				});
			} else {
				callback ("Filen måste vara en bild!", null);
			}
		});
	});
}

exports.removeImage = function (url, callback) {
	database.removeImage (url, function (eventID) {
		var basedir = path.resolve (__dirname);
		url = path.join (basedir, "public", url);
		fs.unlink (url, function (error) {
			fs.unlink (getThumbnailFilename (url), function (error) {
				// TODO check errors?
				callback (error, eventID);
			})
		})
	});
}

exports.setThumbnailPaths = function (images) {
	images.forEach (function (image, imageIndex, images) {
		var url = image.url;
		var filename = path.basename (url);
		var thumbnail = path.dirname (url) + "/thumbs/" + filename;
		image.thumbnail = thumbnail;
	});
}

function autoOrient (filePath, callback) {
	var command = "convert " + filePath + " -auto-orient " + filePath;
	childproc.exec(command, [], function (err, out, stderr){
		callback ();
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