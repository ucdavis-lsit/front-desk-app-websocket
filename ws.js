require('dotenv').config()
const express = require('express');
const { route } = require('express/lib/application');
const ws = require('ws');
const url = require('url');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser')

const jwtSecret = process.env.JWT_SECRET;

// Express app
const app = express();
app.use(bodyParser.json({
    type: "*/*"
}));

// Initiate WebSocket server and listen on port 80 at /ws via express
const wss = new ws.Server({
	noServer: true,
	path: "/ws",
	clientTracking: true
})

server = app.listen(80);
server.on('upgrade', (request, socket, head) => {
	wss.handleUpgrade(request, socket, head, socket => {
		wss.emit('connection', socket, request);
	});
});

wss.on('connection', function connection(ws, req) {
	var token = url.parse(req.url, true).query.token;
	jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            console.log("Invalid JWT")
			ws.terminate()
        } else {
			if(!decoded.user_id){
				console.error("JWT must contain user_id")
				ws.terminate()
			} else{
				ws.user_id = decoded.user_id;
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


// Express routes
const router = express.Router();

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
});

router.get('/', (req, res) => {
  res.status(200).send('Ok');
});

router.post('/messages', (req, res) => {
	console.log("POST to messages",req.body);
	res.status(200).send('Ok');
});

app.use("", router)