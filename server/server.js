var websocket = require('nodejs-websocket');
var conversion = require('./conversion.js');
var file_system = require('fs');

var config = {
	PORT_NUMBER: 3000,
	HEADER_START: 0,
	HEADER_END: 8,
	COUNTER_START: 8,
	COUNTER_END: 16,
	CRC_LENGTH: 5,
	BITE_LENGTH: 8
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
	return input_string.substring(config.COUNTER_END, (input_string.length) - config.CRC_LENGTH);
}

var fill_buffer = function(buffer, data){
	var start = 0, end = config.BITE_LENGTH;
	var buffer_position = 0;
	var this_byte;
	while (start<data.length){
		this_byte = conversion.stringToByte(data.substring(start, end));
		buffer.writeUInt8(this_byte, buffer_position);
		start += config.BITE_LENGTH;
		end += config.BITE_LENGTH;
		buffer_position++;
	}
}

serverLog('Starting server on port ' + config.PORT_NUMBER);

var servert = websocket.createServer(function(connection){
	serverLog('Connection opened.');
	var fullData = '';
	connection.on('text', function(input_string){
		var counter, crc, data, header;
		serverLog('Message received: ' + input_string);
		if (input_string.substring(0,2) === '1\n'){
			serverLog('End bit received, assembling file.');
			var buffer = new Buffer(fullData.length/config.BITE_LENGTH);
			fill_buffer(buffer, fullData);
			serverLog(buffer);
			file_system.writeFile(input_string.replace('1\n', ''), buffer, (error)=>{
				if (error){
					serverLog('An error has occured writing to file ' + error);
				}
			});

		} else {
			counter = get_counter(input_string);
			crc = get_CRC(input_string);
			data = get_data(input_string);
			serverLog("data " + data);
			header = get_header(input_string);
			fullData = fullData + data;
		}
	});
	connection.on('close', function(code, reason){
		serverLog('Connection closed.');
	});
}).listen(config.PORT_NUMBER);
