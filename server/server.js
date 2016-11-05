var websocket = require('nodejs-websocket');

var config = {
	PORT_NUMBER: 3000,
	HEADER_START: 0,
	HEADER_END: 8,
	COUNTER_START: 8,
	COUNTER_END: 16,
	CRC_LENGTH: 5
};

var serverLog = function(message){
	console.log(Date.now() + ' --- ', message);
}

var get_header = function(input_string){
	return input_string.substring(config.HEADER_START, config.HEADER_END);
}

var get_counter = function(input_string){
	var counter = input_string.substring(config.COUNTER_START, config.COUNTER_END);
	console.log(counter);
	return parseInt(counter, 2);
}

var get_CRC = function(input_string){
	return input_string.substring(input_string.length - config.CRC_LENGTH);
}

var get_data = function(input_string){
	return input_string.substring(config.COUNTER_END, input_string.length - config.CRC_LENGTH);
}

serverLog('Starting server on port ' + config.PORT_NUMBER);

var servert = websocket.createServer(function(connection){
	serverLog('Connection opened.');
	connection.on('text', function(input_string){
		var counter = get_counter(input_string);
		var crc = get_CRC(input_string);
		var data = get_data(input_string);
		var header = get_header(input_string);
		serverLog('Message received: ' + data);

	});
	connection.on('close', function(code, reason){
		serverLog('Connection closed.')
	});
}).listen(config.PORT_NUMBER);
