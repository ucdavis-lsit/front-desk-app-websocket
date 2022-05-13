require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const wss = require( './services/websocket.service.js' );
const dbclient = require('./services/database.service.js');

const fetch = require('node-fetch');
const api_url = process.env.API_URL;
const api_key = process.env.API_KEY;


// Express app
const app = express();

server = app.listen(80);
server.on('upgrade', (request, socket, head) => {
	wss.handleUpgrade(request, socket, head, socket => {
		wss.emit('connection', socket, request);
	});
});


// Express routes
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).send('Ok');
});

app.use("", router)


dbclient.on('notification', async function (msg) {
	if( msg.channel === 'agents' ){
		const payload = JSON.parse( msg.payload );
		const agent = payload.data

		wss.clients.forEach(( wsClient ) => {
			if( agent.domain == wsClient.domain ){
				const agent_event = {
					"event": "refresh_agent_list",
				}
				wsClient.send( JSON.stringify(agent_event) );
			}
		});
	} else if( msg.channel === 'guests' ){
		const payload = JSON.parse( msg.payload );
		const guest = payload.data

		wss.clients.forEach(( wsClient ) => {
			if( guest.domain == wsClient.domain ){
				const guest_event = {
					"event": "refresh_guest_list",
				}
				wsClient.send( JSON.stringify(guest_event) );
			}
		});
	} else if ( msg.channel === 'announcements' ){
		const domain = JSON.parse(msg.payload).data.domain;
		wss.clients.forEach(( wsClient ) => {
			if( domain == wsClient.domain ){
				const announcement_event = {
					"event": "refresh_announcements",
				}
				wsClient.send( JSON.stringify(announcement_event) );
			}
		});
	}
});