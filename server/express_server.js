var express = require('express');
var path = require('path');

var app = express();

app.set('port', 3001);

app.use('/public', express.static('output_static'));

var server = app.listen(app.get('port'), function(){
    console.log('Starting static server.');
});
