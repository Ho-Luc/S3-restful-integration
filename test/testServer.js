'use strict'

let chai = require('chai');
let chaiHTTP = require('chai-http');
chai.use(chaiHTTP);
let request = chai.request;
let expect = chai.expect;
var mongoose = require('mongoose');
let Users = require(__dirname + '/../models/users_model');
let Files = require(__dirname + '/../models/files_model');
let AWS = require('aws-sdk');
let fs = require('fs');
let s3 = new AWS.S3();
require(__dirname + '/../server');
let testId;


describe('testing /users', () => {
  it('expect user to have the name sam with status 200, on POST', (done) => {
    request('localhost:3000')
      .post('/users')
      .send('{"name":"sam"}')
      .end((err, res) => {
        expect(err).to.eql(null);
        expect(res.body.data.name).to.eql('sam');
        expect(res.body.status).to.eql(200);
        expect(res).to.be.json;
        done();
      })
  })

  it('expect, res to be JSON with status 200, on GET', (done) => {
    request('localhost:3000')
      .get('/users')
      .end((err, res) => {
        expect(err).to.eql(null);
        expect(res).to.be.json;
        expect(res.body.status).to.eql(200);
        expect(res.header['content-type']).to.eql('application/json; charset=utf-8');
        done();
      })
  })

  after((done) => {
    testId = null;
    mongoose.connection.db.dropDatabase(() => {
      done();
    })
  })
})



describe('testing /users/:user', () => {
  beforeEach((done) => {
    var newUser = new Users({"name":"TestName"});
    newUser.save((err, user) => {
      testId = user._id;
      this.newUser = user
      done();
    })
  })

  afterEach((done) => {
    mongoose.connection.db.dropDatabase(() => {
      done();
    })
  })

  it('expect res to unique ID to be json with the name: TestName and status code 200', (done) => {
    request('localhost:3000')
      .get('/users/' + testId)
      .end((err, res) => {
        expect(err).to.eql(null);
        expect(res).to.be.json;
        expect(res.body.data.name).to.eql('TestName');
        expect(res.body.data).to.have.a.property('_id');
        expect(res.body.data._id).to.be.eql(testId.toString());
        done();
      })
  })

  it('expect PUT,to override previous ID with the name: jason and status code 200', (done) => {
    request('localhost:3000')
      .put('/users/' + testId)
      .send('{"name":"jason"}')
      .end((err, res) => {
        expect(err).to.eql(null);
        expect(res.body.status).to.eql(200);
        expect(res.body.data['name']).to.eql('jason');
        expect(res).to.be.json;
        done();
      })
  })

  it('expect DELETE to have status 200, with a message \'User removed\'', (done) => {
    request('localhost:3000')
      .delete('/users/' + testId)
      .end((err, res) => {
        expect(err).to.eql(null);
        expect(res.status).to.eql(200);
        expect(res.body['message']).to.eql('User removed.');
        expect(res).to.be.json;

        done();
      })
  })
})



describe('testing /users/:user/files', () => {
  beforeEach((done) => {
    var newUser = new Users({"name":"TestName"});
    newUser.save((err, user) => {
      testId = user._id;
      this.newUser = user
      done();
    })
  })

  afterEach((done) => {
    mongoose.connection.db.dropDatabase(() => {
      done();
    })
  })

  it('expect res of 200 with a message: \'Data successfully saved to S3.\'', (done) => {
    request('localhost:3000')
      .post('/users/' + testId + '/files')
      .send('{"filename":"testFile", "content":"hello world"}')
      .end((err, res) => {
        expect(err).to.eql(null);
        expect(res).to.be.json;
        done();
      })
  })
})



describe('testing /files/:file', () => {
  beforeEach((done) => {
    var newFile = new Files({"filename":"TestName"});
    newFile.save((err, file) => {
      testId = file._id;
      this.newFile = file
      done();
    })
  })

  afterEach((done) => {
    mongoose.connection.db.dropDatabase(() => {
      done();
    })
  })

  it('expect filename to be equal to TestName, with a status of 200', (done) => {
    request('localhost:3000')
      .get('/files/' + testId)
      .end((err, res) => {
        expect(err).to.eql(null);
        expect(res).to.be.json;
        expect(res.body.status).to.eql(200);
        expect(res.body.data.filename).to.eql('TestName');
        done();
      })
  })

  it('expect filename to be equal to filename: edittedFile, with status 200', (done) => {
    request('localhost:3000')
      .put('/files/' + testId)
      .send('{"filename":"edittedFile"}')
      .end((err, res) => {
        expect(err).to.eql(null);
        expect(res).to.be.json;
        expect(res.body.status).to.eql(200);
        expect(res.body.data).to.eql('File updated.');
        done();
      })
  })

  it('expect DELETE to have status 200, with a message \'File removed\'', (done) => {
    request('localhost:3000')
      .delete('/files/' + testId)
      .end((err, res) => {
        console.log(res.body);
        expect(err).to.eql(null);
        expect(res.status).to.eql(200);
        expect(res.body.message).to.eql('file removed');
        expect(res).to.be.json;
        done();
      })
  })

})
