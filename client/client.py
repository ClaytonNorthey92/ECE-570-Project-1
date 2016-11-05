import websocket

UM_DEARBORN_LOGO_PATH = 'umdlogo.jpg'
READ_FILE_BYTES = 'rb'
PACKET_HEADER = '01111110'
PACKET_LENGTH = 1024
BYTE_LENGTH = 8
CRC = '11101'
# DATA_LENGTH is the length of data we can send in one
# packet, so it is PACKET_LENGTH - size of header - counter (1 byte)
DATA_LENGTH = 1024 - len(PACKET_HEADER) - BYTE_LENGTH

def get_binary(input):
	binary = '{0:b}'.format(input)
	return '0'*(BYTE_LENGTH-len(binary)) + binary

def get_file_binary_string(file_path):
	logo_file = open(file_path, READ_FILE_BYTES)
	data = logo_file.read()
	logo_file.close()
	binary_representation = ''
	for byte in data:
		binary_form = get_binary(byte)
		binary_representation += binary_form
	return binary_representation

def create_packets(binary):
	packets = []
	packet = ''
	counter = 0
	while binary:
		packet = PACKET_HEADER + get_binary(counter) + binary[:DATA_LENGTH] + CRC
		binary = binary[DATA_LENGTH:]
		counter += 1
		packets.append(packet)
	return packets

if __name__=='__main__':
	socket = websocket.WebSocket()
	socket.connect('ws://localhost:3000')
	binary = get_file_binary_string(UM_DEARBORN_LOGO_PATH)
	packets = create_packets(binary)
	for packet in packets:
		socket.send(packet)
	