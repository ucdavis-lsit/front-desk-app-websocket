const { Client } = require('pg');

function connect() {
	var dbclient = new Client({
		host: process.env.DATABASE_HOST || '',
		user: process.env.DATABASE_USER || '',
		password: process.env.DATABASE_PASSWORD || '',
		database: process.env.DATABASE_NAME || '',
	});

    dbclient.connect().then(() => {
		dbclient.query( 'LISTEN guests' )
		.then(result => console.log(result))
		.catch(e => console.error("ERROR: ",e.stack))
		dbclient.query( 'LISTEN announcements' )
		.then(result => console.log(result))
		.catch(e => console.error("ERROR: ",e.stack))
	}).catch(e => {
		console.error(e.stack)
		setTimeout(() => {
			console.log("...Reconnecting")
			connect()
		}, 1000);
	  })

    dbclient.on('error', error => {
		console.error("Error with DB connection", error.stack)
        connect();
    });
	return dbclient
}

var dbclient = connect()

module.exports = dbclient;