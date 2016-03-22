# S3-restful-integration

This restful API uses GET, POST, PUT and DELETE to make a user and submit files for that user to Amazon Web Services (AWS). To start, start up the server and make a POST to /users with a name property;

example:
curl -X POST --data '{"name":"jason"}' localhost:3000/users

The line above makes a new user in the database with a unique id. Grab that id and put in the :user space below;

Then you can make a POST request to AWS to /users/:user/files.

example:
curl -X POST --data '{"filename":"testfile", "content":"any string for the body of the AWS file"}' localhost:3000/users/:user/files

Finally a url will be saved to the files database. To access that url just make a GET request to;

example:
curl -X GET localhost:3000/users/:user/files 
