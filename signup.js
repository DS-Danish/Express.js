const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();

// Middleware setup
app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ 
  secret: "Your secret key", 
  resave: false, 
  saveUninitialized: true,
  cookie: { maxAge: 60000 } // 1 minute
}));

// MySQL setup
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'session' // Ensure this matches your actual database name
};

const connection = mysql.createConnection(dbConfig);

let connectionErr, connectionResults;
connection.connect(err => {
    connectionErr = err;
    connectionResults = 'Connected to MySQL';
  
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');

  createUsersTable(); // Create users table if it doesn't exist
});

// Function to create users table if it doesn't exist
const createUsersTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      password VARCHAR(255) NOT NULL
    );
  `;

  connection.query(createTableQuery, (err, results) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('Users table created or already exists');
    }
  });
};

// Signup route
app.get('/signup', function(req, res){
  res.render('signup', { message: '' });
});

app.post('/signup', async function(req, res){
  try {
    const { id, password } = req.body;
    
    if (!id || !password) {
      return res.render('signup', { message: 'All fields are required' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (id, password) VALUES (?, ?)';
    
    connection.query(sql, [id, hashedPassword], (err, results) => {
        console.log("err", err);
        console.log("Results", results);

      if (err) {
        console.error('Error adding user:', err);
        return res.render('signup', { message: 'Internal server error' });
      } else {
        return res.redirect('/login');
      }
    });
  } catch (err) {
    console.error("Error in signup:", err);
    return res.render('signup', { message: 'Internal server error' });
  }
});

// Login route
app.get('/login', function(req, res){
  const message = req.session.message || '';
  req.session.message = ''; // Clear message after reading
  res.render('login', { message });
});

app.post('/login', function(req, res){
  const { id, password } = req.body;

  if (!id || !password) {
    return res.render('login', { message: 'All fields are required' });
  }

  const sql = 'SELECT * FROM users WHERE id = ?';
  connection.query(sql, [id], async (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.render('login', { message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.render('login', { message: 'Invalid user id or password' });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.render('login', { message: 'Invalid user id or password' });
    }

    req.session.user = user;
    req.session.cookie.maxAge = 60000; // 1 minute
    req.session.message = ''; // Clear any existing message on successful login
    return res.redirect('/protected_page');
  });
});

// Middleware to check if user is logged in
app.use((req, res, next) => {
  if (!req.session.user) {
    if (req.path === '/protected_page') {
      req.session.message = ''; // Clear any existing message if accessing protected page directly
    } else {
      req.session.message = 'Your session has expired. Login Again'; // Set message for session expiration
    }
    return res.redirect('/login');
  }
  next();
});

// Protected_page route
app.get('/protected_page', function(req, res){
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('protected_page', { user: req.session.user });
});

// Logout route
app.get('/logout', function(req, res){
  req.session.destroy();
  res.redirect('/login');
});



app.post('/delete', function(req, res){
    const sql = 'Delete from users where id = ?';
    const {id} = req.session.user
        
    connection.query(sql, [id], (err, results) => {
        console.log("err", err);
        console.log("Results", results);

        if (err) {
            console.error('Error Deleting user:', err);
            return res.status(405).send({ message: 'Internal server error' });
        } 
    });

    req.session.destroy();
    res.redirect('/signup');
  });


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
