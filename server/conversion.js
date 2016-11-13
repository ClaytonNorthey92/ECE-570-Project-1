
var stringToByte = function(binary_string){
	var total_int = 0;
	for (var i=0;i<binary_string.length;i++){
		var binary_value = binary_string[i] === '1' ? 1 : 0;
		total_int += binary_value * Math.pow(2, (binary_string.length - 1)-i);
	}
	return total_int;
}

module.exports = {
	stringToByte: stringToByte
}
