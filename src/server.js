const http = require('http'); // pull in the http server module
const url = require('url'); // pull in the url module
// pull in the query string module
const query = require('querystring');
// pull in response handler file
const handler = require('./responses.js');


// set the port. process.env.PORT and NODE_PORT are for servers like heroku
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// key:value object to look up URL routes to specific functions

// handle HTTP requests. In node the HTTP server will automatically
// send this function request and pre-filled response objects.

// handles GET requests
/*
const handleGet = (request, response, parsedUrl) => {
  // route to correct method based on url
  if (parsedUrl.pathname === '/style.css') {
    handler.getStyle(request, response);
  } else if (parsedUrl.pathname === '/getUsers') {
    handler.getUsers(request, response);
  } else {
    handler.getIndex(request, response);
  }
};
*/
// handles POST requests
const handlePost = (request, response, parsedUrl) => {
  // if post is to /addUser (our only POST url)
  if (parsedUrl.pathname === '/addUser') {
    const res = response;
    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      res.statusCode = 400;
      res.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    // on end of upload stream. 
    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = query.parse(bodyString);

      // pass to our addUser function
      handler.addUser(request, res, bodyParams);
    });
  }
};

const onRequest = (request, response) => {
  // parse the url using url module
  const parsedUrl = url.parse(request.url);

  // grab the query parameters (?key=value&key2=value2&etc=etc)
  // const params = query.parse(parsedUrl.query);

  // check if the path name (the /name part of the url) matches 
  console.log(parsedUrl);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    switch (request.method) {
      case 'GET':
      // handleGet(request, response, parsedUrl);
        if (parsedUrl.pathname === '/') {
        // if homepage, send index
          handler.getIndex(request, response);
        } else if (parsedUrl.pathname === '/style.css') {
        // if stylesheet, send stylesheet
          handler.getStyle(request, response);
        } else if (parsedUrl.pathname === '/getUsers') {
        // if get users, send user object back
          handler.getUsers(request, response);
        } else if (parsedUrl.pathname === '/notReal') {
        // if get users, send user object back
          handler.notReal(request, response);
        } else {
        // if not found, send 404 message
          handler.notReal(request, response);
        }
        break;

      case 'HEAD':
        if (parsedUrl.pathname === '/getUsers') {
        // if get users, send user object back
          handler.getUsersMeta(request, response);
        } else if (parsedUrl.pathname === '/notReal') {
        // if get users, send user object back
          handler.notRealMeta(request, response);
        } else {
        // if not found, send 404 message
          handler.notReal(request, response);
        }
        break;

      case 'POST':
      // handlePost(request, response, parsedUrl);
        if (parsedUrl.pathname === '/addUsers') {
        // if get users, send user object back
          handler.addUsers(request, response);
        } else {
        // if not found, send 404 message
          handler.notReal(request, response);
        }
        break;

      default:

      // handler.notReal(request,response);
    }
  }
};


// start HTTP server 
http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
