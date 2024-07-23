const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const getLoginPage = require('./routes/get/getLoginPage');
const logoutUser = require('./routes/get/logoutUser');
const getProtectedPage = require('./routes/get/getProtectedPage');
const getSignupPage = require('./routes/get/getSignupPage');
const deleteUser = require('./routes/post/deleteUser');
const loginUser = require('./routes/post/loginUser');
const signUpUser = require('./routes/post/signUpUser');
const { createUsersTable } = require('./database');

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

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  next();
});

app.use(getLoginPage);
app.use(logoutUser);
app.use(getProtectedPage);
app.use(getSignupPage);
app.use(deleteUser);
app.use(loginUser);
app.use(signUpUser);

createUsersTable();



// Middleware to check if user is logged in
app.use((req, res, next) => {
  if (!req.session.user) {
    if (req.path === '/protected_page') {
      req.session.message = ''; // Clear any existing message if accessing protected page directly
    } else {
      req.session.message = 'Your session has expired. Login Again'; // Set message for session expiration
    }
    return res.redirect('/getLoginPage');
  }
  next();
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
