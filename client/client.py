import websocket

UM_DEARBORN_LOGO_PATH = 'umdlogo.jpg'
BUGS_BUNNY_SOUND = 'bugsbunny1.wav'
READ_FILE_BYTES = 'rb'
PACKET_HEADER = '01111110'
PACKET_LENGTH = 1024
BYTE_LENGTH = 8
WAV_LENGTH = 16
CRC = '11101'
END_BIT = '1\n'
# DATA_LENGTH is the length of data we can send in one
# packet, so it is PACKET_LENGTH - size of header - counter (1 byte)
DATA_LENGTH = 1024 - len(PACKET_HEADER) - BYTE_LENGTH

def get_binary(input, extension='jpg', is_counter=False):
	if extension == 'jpg' or is_counter:
		sample_length = BYTE_LENGTH
	else:
		sample_length = WAV_LENGTH
	binary = '{0:b}'.format(input)
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

def create_packets(binary, extension):
	packets = []
	packet = ''
	counter = 0
	while binary:
		packet = PACKET_HEADER + get_binary(counter, extension, True) + binary[:DATA_LENGTH] + CRC
		binary = binary[DATA_LENGTH:]
		counter += 1
		packets.append(packet)
	return packets

def package_and_send(file_name, socket):
	binary = get_file_binary_string(file_name)
	packets = create_packets(binary, file_name.split('.')[-1])
	for packet in packets:
		socket.send(packet)
	socket.send(END_BIT + file_name)

if __name__=='__main__':
	socket = websocket.WebSocket()
	socket.connect('ws://localhost:3000')
	package_and_send(UM_DEARBORN_LOGO_PATH, socket)
	package_and_send(BUGS_BUNNY_SOUND, socket)
	socket.close()
	