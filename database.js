require('dotenv').config();
const { createPool } = require('mysql');

const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10)
});

// Function to create users table if it doesn't exist
const createUsersTable = () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            s3_key VARCHAR(255) NOT NULL
        );
    `;

    pool.query(createTableQuery, (err, results) => {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('Users table created or already exists');
        }
    });
};

module.exports = {
    pool,
    createUsersTable
};