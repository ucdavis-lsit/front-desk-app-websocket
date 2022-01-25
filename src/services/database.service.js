const { Client } = require('pg');

const dbclient = new Client({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DB_NAME,
});

dbclient.connect().then(() => {
	console.log('setup listener');
	dbclient.query('LISTEN guests');
});

module.exports = dbclient;