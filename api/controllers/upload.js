const AWS = require('aws-sdk')
const async = require('async')
const bucketName = "alexmassbucket"
const path = require('path')
const fs = require('fs')
let pathParams, image, imageName;
var uuidv4 = require('uuid/v4');

/** Load Config File */
AWS.config.loadFromPath('config.js')

/** After config file load, create object for s3*/
const s3 = new AWS.S3({region: 'us-west-1'})
const createMainBucket = (callback) => {
	// Create the parameters for calling createBucket
	const bucketParams = {
	   Bucket : bucketName
	};
	s3.headBucket(bucketParams, function(err, data) {
	   if (err) {
	   	console.log("ErrorHeadBucket", err)
	      	s3.createBucket(bucketParams, function(err, data) {
			   if (err) {
			   	console.log("Error", err)
			      callback(err, null)
			   } else {
			      callback(null, data)
			   }
			});
	   } else {
	      callback(null, data)
	   }
	})
}

const createItemObject = (callback) => {
  const params = {
        Bucket: bucketName,
        Key: 'images/'+`${imageName}`,
        ACL: 'public-read',
        Body:image
    };
	s3.putObject(params, function (err, data) {
		if (err) {
	    	console.log("Error uploading image: ", err);
	    	callback(err, null)
	    } else {
	    	console.log("Successfully uploaded image on S3", data);
	    	callback(null, data)
	    }
	})
}
exports.upload = (req, res, next) => {
	var tmp_path = req.files.file.path;
    console.log("item", req.files.file)
	var tmp_path = req.files.file.path;
	image = fs.createReadStream(tmp_path);
    imageName = uuidv4() + '.jpg';
    async.series([
        createMainBucket,
        createItemObject
        ], (err, result) => {
        if(err) return res.send(err)
        else return res.json({message: "Successfully uploaded",
            result: result
      })
    })
}
exports.displayForm = (req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/html"
    });
    res.write(
        '<img src="https://s3-us-west-1.amazonaws.com/pandeysoni/Kobe-Bryant-1.jpg" />'
    );
    res.end();
};
