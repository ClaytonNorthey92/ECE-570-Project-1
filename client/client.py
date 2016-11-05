import websocket

if __name__=='__main__':
	socket = websocket.WebSocket()
	socket.connect('ws://localhost:3000')
	socket.send('Hi, how are you?\n')
