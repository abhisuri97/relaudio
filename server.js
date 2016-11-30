var express = require('express')
var path = require('path')
var compression = require('compression')
var fs = require('fs');
import getSearchRes from './req';
var app = express()
var DUMMY_RES_FILE = path.join(__dirname, 'results.json');
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
})

app.use(compression())

// serve our static stuff like index.css
app.use(express.static(path.join(__dirname, 'public')))
// send all requests to index.html so browserHistory works
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})
app.post('/api', function (req, res) {
  getSearchRes(req.query.searchString, req.query.vidString).then(function(resp) { res.json(resp) })
});
var PORT = process.env.PORT || 8081
app.listen(PORT, function() {
  console.log('Production Express server running at localhost:' + PORT)
})
