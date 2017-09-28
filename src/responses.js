const fs = require('fs');
// pull in the file system module
const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const style = fs.readFileSync(`${__dirname}/../client/style.css`);

const crypto = require('crypto');

const users = {};
const etag = crypto.createHash('sha1').update(JSON.stringify(users));
const digest = etag.digest('hex');


// function to handle the index page
const getIndex = (request, response) => {
  // set status code (200 success) and content type
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

// gets css
const getStyle = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(style);
  response.end();
};

// takes request, response, status code, and object to send
const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  // send response with json object
  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

// Does the same as the aforemented above, without the JSON body
const respondJSONMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };
    // send response without json object, just headers
  response.writeHead(status, headers);
  response.end();
};

// return user object as JSON
const getUsers = (request, response) => {
  const responseJSON = {
    users,
  };
  /*
  if (request.headers['if-none-match'] === digest) {
    // return 304 response without message 
    return respondJSONMeta(request, response, 304);
  }
*/
  return respondJSON(request, response, 200, responseJSON);
};

const addUser = (request, response, body) => {
  const responseJSON = {
    message: 'Name and age are both required',
  };

  if (!body.name || !body.age) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  // if users name exists, switch to 204 for updated status
  if (users[body.name]) {
    responseCode = 204;
  } else {
    users[body.name] = {};
  }

  users[body.name].name = body.name;
  users[body.name].age = body.age;

  if (responseCode === 201) {
    responseJSON.message = `Name: ${users[body.name].name} , Age: ${users[body.name].age}`;
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSON(request, response, responseCode);
};

const success = (request, response) => {
  // message to send
  const responseJSON = {
    message: 'This is a successful response',
    id: 'success',
  };

  // send our json with a success status code
  respondJSON(request, response, 200, responseJSON);
};

const notReal = (request, response) => {
  // error message with a description and consistent error id
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notReal',
  };

    // return our json with a 404 not found error code
  respondJSON(request, response, 404, responseJSON);
};


// function for 404 not found without message
const notRealMeta = (request, response) => {
  // return a 404 without an error message
  respondJSONMeta(request, response, 404);
};

const getUsersMeta = (request, response) => {
  if (request.headers['if-none-match'] === digest) {
    return respondJSONMeta(request, response, 304);
  }

  // return 200 without message, just the meta data
  return respondJSONMeta(request, response, 200);
};

  // exports to set functions to public.
module.exports = {
  success,
  notReal,
  notRealMeta,
  getUsers,
  getUsersMeta,
  addUser,
  getIndex,
  getStyle,
};
