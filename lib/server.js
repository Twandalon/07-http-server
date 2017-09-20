'use strict';

const http = require('http');
const requestParser = require('./request-parser.js');
const cowsay = require('cowsay');

const app = http.createServer((req, res) => {
  //console.log('got a request!')
  //console.log('req.method', req.method)
  //console.log('req.headers', req.headers)

  requestParser(req)
  .then(req => {
    // handle routes
    const pathname = req.url.pathname;
    console.log('pathname:', pathname);
    console.log(req.headers);
    if(req.method === 'GET' && req.url.pathname === '/'){
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(`<!DOCTYPE html>
      <html>
        <head> <title> cowsay </title> </head>
        <body>
        <li><a href="/cowsay">cowsay</a></li>
        <h2> This is my cowsay project </h2>
        </body>
      </html>`);
      res.end();
      return;  // break out of the (req, res) => {} callback
    }

    if(req.method === 'GET' && req.url.pathname === '/cowsay'){
      console.log('query:', req.url.query);
      var text = req.url.query.text;
      if(text === undefined || text === ''){
        text = 'I need something good to say';
      }
      let cow = cowsay.say({text: text});
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(`<!DOCTYPE html>
        <html>
          <head> <title> cowsay </title> </head>
          <body>
          <pre>
          ${cow}
          </pre>
          </body>
        </html>`);
      res.end();
      return;
    }

    if(req.method === 'GET' && req.url.pathname === '/api/cowsay'){
      let responseBody = {};
      let statusCode = 200;
      text = req.url.query.text;
      console.log('query:', req.url.query);
      if (JSON.stringify(req.url.query) === JSON.stringify({})) {
        console.log('empty');
        statusCode = 400;
        responseBody = {
          error: 'invalid request: query is required',
        };
      } else if (text === undefined || text === '') {
        const inputError = {error: 'invalid request: text query required'};
        responseBody = inputError;
        statusCode = 400;
      } else {
        let cow = cowsay.say({text: text});
        responseBody = {
          content: cow,
        };
      }
      res.writeHead(statusCode, {'Content-Type': 'application/json'});
      res.write(JSON.stringify(responseBody));
      res.end();
      return;  // break out of the (req, res) => {} callback
    }

    if(req.method === 'POST' && req.url.pathname === '/api/cowsay'){
      let responseBody = {};
      let statusCode = 200;
      if (JSON.stringify(req.body) === JSON.stringify({})) {
        statusCode = 400;
        responseBody = {
          error: 'invalid request: body required',
        };
      } else if (req.body.text === undefined || req.body.text === ''){
        responseBody = {
          error: 'invalid request: text required',
        };
        statusCode = 400;
      } else {
        let cow = cowsay.say({text: req.body.text});
        responseBody = {
          content: cow,
        };
      }
      res.writeHead(statusCode, {'Content-Type': 'application/json'});
      res.write(JSON.stringify(responseBody));
      res.end();
      return;  // break out of the (req, res) => {} callback
    }

    if(req.method === 'POST' && req.url.pathname === '/echo'){
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.write(JSON.stringify(req.body));
      res.end();
      return;  // break out of the (req, res) => {} callback
    }

    // 404 for any request to a non route
    // respond to the client
    res.writeHead(404, {
      'Content-Type': 'text/plain',
    });
    res.write(`resource ${req.url.pathname} not found!`);
    res.end();
  })
  .catch(err => {
    console.log(err);
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.write('bad request');
    res.end();
  });
  // register routes
});

// export interface
module.exports = {
  start: (port, callback) => app.listen(port, callback),
  stop: (callback) => app.close(callback),
};
