var fs = require("fs"),
    DataFilePath=__dirname+ '/data/MOCK_ASSETS.json';


var express = require('express');
var serveIndex = require('serve-index');
var app = express();

app.use('/', express.static(__dirname + '/'));
app.use('/libs', express.static(__dirname + '/node_modules'));
app.use('/libs', serveIndex('node_modules', {'icons': true}));

app.get('/api/asset/search', function(req, res){
    var file = fs.readFileSync(DataFilePath, 'utf8');
    res.send(JSON.parse(file));
});

var server = app.listen(3000, function () {
    var host = server.address().address
    var port = server.address().port
});
