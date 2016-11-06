import websocket
import random

UM_DEARBORN_LOGO_PATH = 'umdlogo.jpg'
BUGS_BUNNY_SOUND = 'bugsbunny1.wav'
LIONS_LOGO = 'detroit-lions-logo.jpeg'
READ_FILE_BYTES = 'rb'
PACKET_HEADER = '01111110'
PACKET_LENGTH = 1024
BYTE_LENGTH = 8
WAV_LENGTH = 16
CRC = '11101'
DIVISOR_LENGTH = len(CRC) - 1
END_BIT = '1\n'
BITS_IN_BYTE = 256
# DATA_LENGTH is the length of data we can send in one
# packet, so it is PACKET_LENGTH - size of header - counter (1 byte)
DATA_LENGTH = 1024 - len(PACKET_HEADER) - BYTE_LENGTH

def get_binary(input_string, extension='jpg', is_counter=False):
	if extension in ['jpg', 'jpeg'] or is_counter:
		sample_length = BYTE_LENGTH
	else:
		sample_length = WAV_LENGTH
	binary = '{0:b}'.format(input_string)
	if (sample_length == 8 and len(binary) > sample_length):
		print(extension, binary)
	return '0'*(sample_length-len(binary)) + binary

def get_file_binary_string(file_path):
	logo_file = open(file_path, READ_FILE_BYTES)
	data = logo_file.read()
	logo_file.close()
	binary_representation = ''
	for byte in data:
		binary_form = get_binary(byte, file_path.split('.')[-1])
		binary_representation += binary_form
	return binary_representation

def perform_CRC(divisor, packet):
	packet_length = len(packet)
	crc_length = len(CRC)
	offset = crc_length
	numerator = packet[0:offset]
	while offset <= packet_length:
		numerator = '{0:b}'.format(int(numerator, 2) ^ int(divisor, 2))
		numerator = '0'*(crc_length-len(numerator))+numerator
		numerator = numerator[1:]
		if (offset==packet_length):
			break
		numerator += packet[offset]
		offset += 1
	return packet[:-(crc_length-1)] + numerator

def create_packets(binary, extension):
	packets = []
	packet = ''
	counter = 0
	while binary:
		packet = PACKET_HEADER + get_binary(counter%BITS_IN_BYTE, extension, True) + binary[:DATA_LENGTH] + '0'*DIVISOR_LENGTH
		packet = perform_CRC(CRC, packet)
		binary = binary[DATA_LENGTH:]
		counter += 1
		packets.append(packet)
	return packets

def package_and_send(file_name, socket, create_error=False):
	binary = get_file_binary_string(file_name)
	packets = create_packets(binary, file_name.split('.')[-1])
	random_error_package = None
	error_name = ''
	if create_error:
		error_name = 'error_'
		random_error_package = random.randint(0, len(packets))
	for index, packet in enumerate(packets):
		if random_error_package and random_error_package==index:
			bad_packet = '1' * len(packet)
			socket.send(bad_packet)
		else:
			socket.send(packet)
		valid_response = socket.recv()
		if valid_response == '0':
			print('sending corrected packet')
			socket.send(packet)
			socket.recv()
	socket.send(END_BIT + error_name + file_name)
	socket.recv()

if __name__=='__main__':
	socket = websocket.WebSocket()
	socket.connect('ws://localhost:3000')
	package_and_send(LIONS_LOGO,socket)
	package_and_send(UM_DEARBORN_LOGO_PATH, socket)
	package_and_send(BUGS_BUNNY_SOUND, socket)
	package_and_send(UM_DEARBORN_LOGO_PATH, socket, create_error=True)
	socket.close()
	