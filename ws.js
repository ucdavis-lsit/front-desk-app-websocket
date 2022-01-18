const express = require('express');
const { route } = require('express/lib/application');
const ws = require('ws');

const app = express();
const router = express.Router();

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
});

router.get('/', (req, res) => {
  res.status(200).send('Ok');
});

var clients = new Array;


function handleConnection(client, request) {
	console.log("New Connection");        // you have a new client
	clients.push(client);    // add this client to the clients array

	function endClient() {
		// when a client closes its connection
		// get the client's position in the array
		// and delete it from the array:
		var position = clients.indexOf(client);
		clients.splice(position, 1);
		console.log("connection closed");
	}

	// if a client sends a message, print it out:
	function clientResponse(data) {
		console.log(request.connection.remoteAddress + ': ' + data);
		broadcast(request.connection.remoteAddress + ': ' + data);
	}

	// set up client event listeners:
	client.on('message', clientResponse);
	client.on('close', endClient);
  client.on('error', () => console.log('errored'));
}

// This function broadcasts messages to all webSocket clients
function broadcast(data) {
	// iterate over the array of clients & send data to each
	for (c in clients) {
		clients[c].send(JSON.stringify(data));
	}
}

// listen for clients and handle them:

// Set up a headless websocket server that prints any
// events that come in.
const wsServer = new ws.Server({
	noServer: true,
	path: "/ws"
});
wsServer.on('connection', handleConnection);

// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
const server = app.listen(8080);
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});
app.use("", router)