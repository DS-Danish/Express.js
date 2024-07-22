const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const app = express();
var session = require('express-session');


// MySQL setup
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'danish_test' // Ensure this matches your actual database name
};


app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!"}));


const connection = mysql.createConnection(dbConfig);

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Middleware for parsing JSON and URL-encoded content
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for parsing cookies
app.use(cookieParser());

// Error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON');
    return res.status(400).json({ message: 'Invalid JSON' }); // Bad request
  }
  next();
});


// session
app.get('/', function(req, res){
   if(req.session.page_views){
      req.session.page_views++;
      res.send("You visited this page " + req.session.page_views + " times");
   } else {
      req.session.page_views = 1;
      res.send("Welcome to this page for the first time!");
   }
});

// Function to fetch user by email and phone number
function getUserByEmailAndPhone(email, phoneNumber, callback) {
  const sql = 'SELECT * FROM users WHERE email = ? AND phone_number = ?';
  connection.query(sql, [email, phoneNumber], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
}

// Function to fetch user by email or phone number
function getUserByEmailOrPhone(email, phoneNumber, callback) {
  const sql = 'SELECT * FROM users WHERE email = ? OR phone_number = ?';
  connection.query(sql, [email, phoneNumber], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
}

// Function to update user password by email
function setPassword(email, password, callback) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = 'UPDATE users SET password = ? WHERE email = ?';
  connection.query(sql, [hashedPassword, email], (err, results) => {
    if (err) {
      console.error('Error updating password:', err);
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
}

// Function to add a new user
function addUser(name, email, password, phoneNumber, callback) {
  const sql = 'INSERT INTO users (name, email, password, phone_number) VALUES (?, ?, ?, ?)';
  const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password
  connection.query(sql, [name, email, hashedPassword, phoneNumber], (err, results) => {
    if (err) {
      console.error('Error adding user:', err);
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
}

// Validate email format
function validateEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

// Validate phone number format (assuming a basic check for digits only)
function validatePhoneNumber(phoneNumber) {
  const re = /^\d+$/;
  return re.test(phoneNumber);
}

// POST route for user registration
app.post('/register', (req, res) => {
  const { name, email, password, phone_number } = req.body;
  console.log('Register endpoint hit', req.body);

  if (!name || !email || !password || !phone_number) {
    console.error('All fields are required');
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!validateEmail(email)) {
    console.error('Invalid email format');
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!validatePhoneNumber(phone_number)) {
    console.error('Invalid phone number format');
    return res.status(400).json({ message: 'Invalid phone number format' });
  }

  addUser(name, email, password, phone_number, (err, results) => {
    if (err) {
      console.error('Internal server error', err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.status(201).json({ message: 'User registered successfully' });
    }
  });
});

// POST route for login
app.post('/login', (req, res) => {
  const { email, password, phone_number } = req.body;
  console.log('Login endpoint hit', req.body);

  if (!email || !password || !phone_number) {
    console.error('All fields are required');
    return res.status(400).json({ message: 'All fields are required' });
  }

  getUserByEmailAndPhone(email, phone_number, (err, results) => {
    if (err) {
      console.error('Internal server error', err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      if (results.length > 0) {
        // Check if the provided password matches the hashed password
        const user = results[0];
        const passwordMatch = bcrypt.compareSync(password, user.password);

        if (passwordMatch) {
          // Passwords match, set cookie or session as needed
          res.cookie('user_id', user.id).json({ message: 'Login successful' });
        } else {
          console.error('Invalid credentials');
          res.status(401).json({ message: 'Invalid credentials' });
        }
      } else {
        console.error('Invalid credentials');
        res.status(401).json({ message: 'Invalid credentials' });
      }
    }
  });
});

// POST route to set password
app.post('/setpassword', (req, res) => {
  const { email, password } = req.body;
  console.log('Set password endpoint hit', req.body);

  if (!email || !password) {
    console.error('Email and password are required');
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (!validateEmail(email)) {
    console.error('Invalid email format');
    return res.status(400).json({ message: 'Invalid email format' });
  }

  setPassword(email, password, (err, results) => {
    if (err) {
      console.error('Internal server error', err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      if (results.affectedRows > 0) {
        // Password updated successfully
        res.status(200).json({ message: 'Password set successfully' });
      } else {
        console.error('Failed to set password');
        res.status(401).json({ message: 'Failed to set password' });
      }
    }
  });
});

// DELETE route to remove person by ID
app.delete('/people/:id', (req, res) => {
  const personId = req.params.id;
  console.log('Delete person endpoint hit', personId);

  if (!validatePhoneNumber(personId)) {
    console.error('Invalid ID format');
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  deletePersonById(personId, (err, response) => {
    if (err) {
      console.error('Error in deleting record id', personId, err);
      res.status(500).json({ message: "Error in deleting record id " + personId });
    } else {
      res.json({ message: "Person with id " + personId + " removed." });
    }
  });
});

// Route to search users by email or phone number
app.get('/search', (req, res) => {
  const { email, phone_number } = req.query;
  console.log('Search endpoint hit', req.query);

  if (!email && !phone_number) {
    console.error('Email or phone number is required');
    return res.status(400).json({ message: 'Email or phone number is required' });
  }

  getUserByEmailOrPhone(email, phone_number, (err, results) => {
    if (err) {
      console.error('Internal server error', err);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      if (results.length > 0) {
        res.json(results);
      } else {
        console.error('No user found');
        res.status(404).json({ message: 'No user found' });
      }
    }
  });
});

// Route to clear a specific cookie
app.get('/clear_cookie_name', (req, res) => {
  res.clearCookie('name');
  res.send('Cookie name cleared');
});

// Route to set a cookie
app.get('/setcookie', (req, res) => {
  res.cookie('name', 'express').send('Cookie set'); // Sets name = express
});

// Route to check cookies
app.get('/checkcookie', (req, res) => {
  console.log('Cookies:', req.cookies);
  res.send('Check your server console for cookies.');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
