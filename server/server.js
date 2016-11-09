var websocket = require('nodejs-websocket');
var conversion = require('./conversion.js');
var file_system = require('fs');

var config = {
	PORT_NUMBER: 3000,
	HEADER_START: 0,
	HEADER_END: 8,
	COUNTER_START: 8,
	COUNTER_END: 16,
	BYTE_LENGTH: 8,
	WAV_LENGTH: 16,
	DIVISOR: '11101',
	CRC_LENGTH: 4,
};

var serverLog = function(message){
	console.log(Date.now() + ' --- ', message);
}

var get_header = function(input_string){
	return input_string.substring(config.HEADER_START, config.HEADER_END);
}

var get_counter = function(input_string){
	var counter = input_string.substring(config.COUNTER_START, config.COUNTER_END);
	return parseInt(counter, 2);
}

var validate_CRC = function(input_string){
	var length = input_string.length;
	var divisor_length = config.DIVISOR.length;
	var offset = divisor_length;
	var numerator = input_string.substring(0, offset);
	var new_numerator = '';
	while (offset <= length){
		for (var i=0;i<divisor_length;i++){
			new_numerator = new_numerator + (numerator[i]===config.DIVISOR[i] ? 0 : 1);
		}
		numerator = new_numerator.substring(1);
		new_numerator = '';
		if (offset === length){
			break;
		}
		numerator += input_string[offset];
		offset++;
	}
	var valid = '0000' === numerator;
	if (!valid){
		serverLog('Message invalid with remainder: ' + numerator);
	}
	return valid;
}

var get_data = function(input_string){
	return input_string.substring(config.COUNTER_END, (input_string.length) - config.CRC_LENGTH);
}

var fill_buffer = function(buffer, data, sample_length){
	var start = 0, end = sample_length;
	var buffer_position = 0;
	var this_byte;
	while (start<data.length){
		this_byte = conversion.stringToByte(data.substring(start, end));
		if (sample_length === config.BYTE_LENGTH){
			buffer.writeUInt8(this_byte, buffer_position);
		} else {
			buffer.writeUInt16LE(this_byte, buffer_position);
		}
		start += sample_length;
		end += sample_length;
		buffer_position++;
	}
}

var get_sample_length = function(file_name){
	var sample_length;
	if (file_name.indexOf('.wav') != -1){
		sample_length = config.WAV_LENGTH;
	} else if (file_name.indexOf('.jpg') != -1 || file_name.indexOf('jpeg') != -1){
		sample_length = config.BYTE_LENGTH;
	} else {
		serverLog('Could not determine file format.')
	}
	return sample_length;
}

serverLog('Starting server on port ' + config.PORT_NUMBER);

var server = websocket.createServer(function(connection){
	serverLog('Connection opened.');
	var fullData = '';
	connection.on('text', function(input_string){
		var counter, valid, data, header;
		if (input_string.substring(0,2) === '1\n'){
			var sample_length = get_sample_length(input_string);
			serverLog('End bit received, assembling file.');
			serverLog(fullData.length/sample_length)
			var buffer;
			var buffer_length = Math.ceil(fullData.length/sample_length + 1);
			if (sample_length === config.BYTE_LENGTH){
				buffer = new Buffer(buffer_length);
			} else {
				buffer = Buffer(buffer_length);
			}
			fill_buffer(buffer, fullData, sample_length);
			serverLog(buffer);
			file_system.writeFile('output_static/' + input_string.replace('1\n', ''), buffer, function(error){
				if (error){
					serverLog('An error has occured writing to file ' + error);
				}
			});
			fullData = '';
			connection.send('1');
		} else {
			valid = validate_CRC(input_string);
			counter = get_counter(input_string);
			if (!valid){
				serverLog('Message is invalid!');
				connection.send('0')
			} else {
				data = get_data(input_string);
				header = get_header(input_string);
				file_system.writeFile('message_log/' + Date.now() + '.log', input_string, function(error){
					if (error){
						serverLog('An error has occured writing to file ' + error);
					}
				});
				fullData = fullData + data;
				connection.send('1');
			}
		}
	});
	connection.on('close', function(code, reason){
		serverLog('Connection closed.');
	});
}).listen(config.PORT_NUMBER);
