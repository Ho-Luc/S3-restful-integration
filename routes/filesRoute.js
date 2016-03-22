'use strict'
let Files = require(__dirname + '/../models/files_model');
let AWS = require('aws-sdk');
let s3 = new AWS.S3();


module.exports = (apiRouter) => {
  apiRouter.route('/files/:file')
    .get((req, res) => {
      Files.findById(req.params.file, (err, file) => {
        res.json({
          status: 200,
          data: file
        })
        res.end();
      })
    })
    .put((req, res) => {
      req.on('data', (data) => {
        req.body = JSON.parse(data);
        let params = {
          Bucket: 'luctestbucket',
          Key: req.body.filename,
          ACL: 'public-read-write',
          Body: req.body.content
        }

        s3.putObject(params, (err, data) => {
          if (err) throw err;
        })

        s3.getSignedUrl('putObject', params, (err, url) => {
          Files.findByIdAndUpdate(req.params.file, {$set: {filename: req.body.filename ,url: url}}, (err, user) => {
            if(err) throw err;
          })
        })

        res.json({
          status: 200,
          data: 'File updated.'
        })
        res.end();
      })
    })
    .delete((req, res) => {
      Files.findById(req.params.file, (err, file) => {
        file.remove((err, file) => {
          res.json({
            status: 200,
            message: 'file removed'
          })
          res.end();
        })
      })
    })
}
