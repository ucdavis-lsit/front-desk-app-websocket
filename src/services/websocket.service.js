const ws = require('ws');
const url = require('url');
const jwt = require('jsonwebtoken');
const { decode } = require('punycode');
const fetch = require('node-fetch');

const jwtSecret = process.env.JWT_SECRET;
const api_url = process.env.API_URL;
const api_key = process.env.API_KEY;

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
		console.log("token is",decoded)
		if ( err ) {
			console.log( err );
			console.log( "Invalid JWT" )
				ws.terminate()
		} else {
			if( !decoded.email ){
				console.error("JWT must contain user_id")
				ws.terminate()
			} else {
				ws.email = decoded.email;
				ws.subdomain = decoded.subdomain;
				console.log("wsclient connected info",ws.subdomain,ws.email)
			}
		}
	});

	ws.on('close', function close() {
		console.log('websocket closed');
		//TODO more helpful logging
	});
	
	ws.on('message', function message(data) {
		console.log('WSS Recieved', data);
		//TODO remove if clients cant talk back
	});
	
	ws.on('pong', function pong(){
		console.log("pong")
		this.isAlive = true;
	});

	ws.on('error', function error(){
		console.error("error")
	});

});

// Check connections every 30 seconds
const interval = setInterval(function ping() {
	wss.clients.forEach(function each(ws) {
	  if (ws.Alive === false) return ws.terminate();
  
	  ws.isAlive = false;
	  ws.ping();
	  console.log("ping")
	});
  }, 30000);

module.exports = wss;