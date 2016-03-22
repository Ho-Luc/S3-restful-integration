'use strict'
let Users = require(__dirname + '/../models/users_model');
let Files = require(__dirname + '/../models/files_model');
let AWS = require('aws-sdk');
let fs = require('fs');
let s3 = new AWS.S3();

module.exports = (apiRouter) => {
  apiRouter.route('/users')
    .get((req, res) => {
      Users.find({}, (err, user) => {
        res.json({
          status: 200,
          data: user
        })
        res.end();
      })
    })
    .post((req, res) => {
      req.on('data', (data) => {
        req.body = JSON.parse(data);
        let newUser = new Users(req.body);
        newUser.save((err, user) => {
          res.json({
            status: 200,
            data: user
          })
          res.end();
        })
      })
    })

  apiRouter.route('/users/:user')
    .get((req, res) => {
      Users.findById(req.params.user, (err, user) => {
        res.json({
          status: 200,
          data: user
        })
        res.end();
      })
    })
    .put((req, res) => {
      req.on('data', (data) => {
        req.body = JSON.parse(data);
        Users.update({_id: req.params.user}, req.body, (err, user) => {
          res.json({
            status: 200,
            data: req.body
          })
          res.end();
        })
      })
    })
    .delete((req, res) => {
      Users.findById({_id: req.params.user}).populate('files').exec((err, user) => {
        if (user.files) {
          user.files.forEach((file) => {
            let params = {
              Bucket: 'luctestbucket',
              Key: file.filename
            }
            s3.deleteObject(params, (err, data) => {
              if (err) throw err;
              console.log('files deleted');
            })
          })
        }

        user.remove((err, user) => {
          if(err) throw err;
          res.json({
            status: 200,
            message: 'User removed.'
          })
          res.end();
        })

      })
    })

  apiRouter.route('/users/:user/files')
    .get((req, res) => {
      Users.findById({_id: req.params.user}).populate('files').exec((err, user) => {
        res.json({
          status: 200,
          data: user.files
        })
        res.end();
      })
    })
    .post((req, res) => {
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
          let newFile = new Files({filename:req.body.filename, url:url});
          newFile.save((err, data) => {
            if (err) throw err;
            Users.findByIdAndUpdate(req.params.user, {$push: {files: newFile._id}}, (err, user) => {
              if(err) throw err;
            })
          })
        })
        res.json({
          status: 200,
          message: 'Data successfully saved to S3.'
        })
        res.end();
      })
    })

}
