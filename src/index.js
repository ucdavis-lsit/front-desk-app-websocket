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
		console.log("guest", guest)

		const response = await fetch( `${api_url}agent?key=${api_key}&subdomain=${guest.subdomain}` )
		.then( res => res.json() )
		.then( data => data )
		.catch(err => {
			console.error('Failed to get agents',err);
		 });

		let agent_emails = response.map(agent => agent.email);
		console.log("emails",agent_emails);

		const guest_resp = await fetch( `${api_url}guest?key=${api_key}&subdomain=${guest.subdomain}` )
		.then( res => res.json() )
		.then( data => data )
		.catch(err => {
			console.error('Failed to get guest list',err);
		 });
		console.log("guest list", guest_resp)

		wss.clients.forEach((wsClient) => {
			console.log("wsclient info",wsClient.subdomain,wsClient.email)
			if(guest.subdomain == wsClient.subdomain && agent_emails.indexOf(wsClient.email) > -1){
				const guest_event = {
					"event": "update_guest_list",
					"guests": guest_resp
				}
				wsClient.send(JSON.stringify(guest_event));
			}
		});
	}
});