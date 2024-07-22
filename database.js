


// Load environment variables from .env file
require('dotenv').config();

const { createPool } = require('mysql');

const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10)
});

pool.query('SELECT * FROM users', (err, result, fields) => {
    if (err) {
        return console.log(err);
    }
    return console.log(result);
});
