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

router.get('/', (req, res) => {
  res.status(200).send('Ok');
});

app.use("", router)


dbclient.on('notification', async function (msg) {
	if(msg.payload){
		let guest = JSON.parse(msg.payload);
		
		// TODO filter by domain/subdomain
		const response = await fetch( `${api_url}agent?key=${api_key}` )
		.then( res => res.json() )
		.then( data => data )
		.catch(err => {
			console.error('Failed to get agents',err);
		 });

		let agent_emails = response.map(agent => agent.email);

		wss.clients.forEach((wsClient) => {
			if(agent_emails.indexOf(wsClient.email) > -1){
				wsClient.send(JSON.stringify(guest));
			}
		});
	}
});