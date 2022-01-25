const ws = require('ws');
const url = require('url');
const jwt = require('jsonwebtoken');
const { decode } = require('punycode');

const jwtSecret = process.env.JWT_SECRET;

const wss = new ws.Server({
	noServer: true,
	path: "/ws",
	clientTracking: true
})


wss.on('connection', function connection(ws, req) {
	var token = url.parse(req.url, true).query.token;
	jwt.verify(token, jwtSecret, (err, decoded) => {
		console.log("token is",decoded)
        if (err) {
            console.log(err);
            console.log("Invalid JWT")
			ws.terminate()
        } else {
			if(!decoded.email){
				console.error("JWT must contain user_id")
				ws.terminate()
			} else{
				console.log(decoded);
				ws.email = decoded.email;
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