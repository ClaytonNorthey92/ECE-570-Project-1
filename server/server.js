var websocket = require('nodejs-websocket');

var config = {
	PORT_NUMBER: 3000
};

var serverLog = function(message){
	console.log(Date.now() + ' --- ', message);
}

serverLog('Starting server on port ', config.PORT_NUMBER);

var servert = websocket.createServer(function(connection){
	serverLog('Connection opened.');
	connection.on('text', function(input_string){
		serverLog('Message received: ' + input_string);
	});
	connection.on('close', function(code, reason){
		serverLog('Connection closed.')
	});
}).listen(config.PORT_NUMBER);
