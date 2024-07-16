const ws = require('ws');
const url = require('url');
const jwt = require('jsonwebtoken');
const { decode } = require('punycode');
const res = require('express/lib/response');
const apiService = require('./api.service')

const jwtSecret = process.env.JWT_SECRET;

const wss = new ws.Server({
	noServer: true,
	path: "/ws",
	clientTracking: true
})


wss.on('connection', function connection( ws, req ) {
	const token = url.parse( req.url, true ).query.token;

	if( !token ){
		ws.terminate()
		console.error("Missing required params");
	}

	jwt.verify( token, jwtSecret, async ( err, decoded ) => {
		if ( err ) {
			console.error( "Invalid JWT" );
			ws.terminate()
		} else {
			if( !decoded.email ){
				console.error( "JWT must contain user_id" )
				ws.terminate()
			} else {
				ws.email = decoded.email;
				ws.domain = decoded.domain;
				ws.is_agent = decoded.is_agent;
				if( ws.is_agent ){
					let agent = await apiService.getAgent( ws.email, ws.domain )
					if( agent ){
						ws.id = agent.id;
						await apiService.updateAgent( ws.id, { status: 'connected' } );
					} else {
						ws.terminate()
					}
				} else {
					let guest = await apiService.getGuest( ws.email, ws.domain )
					if( guest ){
						ws.id = guest.id;
						await apiService.updateGuest( ws.id, { websocket_status: 'connected' } );
					} else {
						ws.terminate()
					}

				}

			}
		}
	});

	ws.on('close', async function close() {
		let isConnected = false;
		for (const client of wss.clients) {
			if (client.is_agent === ws.is_agent && client.email === ws.email && client.domain === ws.domain) {
				isConnected = true;
			  break;
			}
		}
		if(!isConnected){
			if( ws.is_agent ){
				let agent = await apiService.getAgent( ws.email, ws.domain )
				if( agent ){
					ws.id = agent.id;
					await apiService.updateAgent( ws.id, { status: 'disconnected' } );
					await apiService.unclaimGuests( ws.id );
				} else {
					ws.terminate()
				}
			} else {
				let guest = await apiService.getGuest( ws.email, ws.domain )
				if( guest ){
					ws.id = guest.id;
					await apiService.updateGuest( ws.id, { websocket_status: 'disconnected' } );
				} else {
					ws.terminate()
				}

			}
		}
	});
	
	ws.on('message', function message(data) {
		//TODO remove if clients cant talk back
	});
	
	ws.on('pong', function pong(){
		this.isAlive = true;
	});

	ws.on('error', function error(e){
		console.error(e)
	});

});

// Check connections every 30 seconds
const interval = setInterval(function ping() {
	wss.clients.forEach(function each(ws) {
	if (ws.Alive === false) return ws.terminate();

	ws.isAlive = false;
	try {
		ws.ping();
	} catch (error) {
		console.error(error)
	}

	});
  }, 30000);

module.exports = wss;