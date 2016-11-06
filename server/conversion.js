var test_bin = '10011100';


var stringToByte = function(binary_string){
	var total_int = 0;
	for (var i=0;i<8;i++){
		var binary_value = binary_string[i] === '1' ? 1 : 0;
		total_int += binary_value * Math.pow(2, 7-i);
	}
	return total_int;
}

console.log(stringToByte(test_bin));

module.exports = {
	stringToByte: stringToByte
}
