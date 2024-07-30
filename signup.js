require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import routes
const getLoginPage = require('./routes/get/getLoginPage');
const logoutUser = require('./routes/get/logoutUser');
const getProtectedPage = require('./routes/get/getProtectedPage');
const getSignupPage = require('./routes/get/getSignupPage');
const deleteUser = require('./routes/post/deleteUser');
const loginUser = require('./routes/post/loginUser');
const signUpUser = require('./routes/post/signUpUser');
const S3GetUserPic = require('./routes/get/S3Get_user_pic');
const S3PostUserPic = require('./routes/post/S3Post_user_pic');
const getResetPasswordPage = require('./routes/get/resetpassword');
const resetPassword = require('./routes/post/resetpassword');

const { createUsersTable } = require('./database');

const app = express();

// Middleware setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 } // 1 minute
}));

// Logging middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url} at ${new Date().toISOString()}`);
  next();
});

// Middleware to check if user is logged in
app.use((req, res, next) => {
  const publicPaths = [
    '/loginUser',
    '/signUpUser',
    '/getLoginPage',
    '/getSignupPage',
    '/resetPassword',
    '/getResetPasswordPage'
  ];
  if (!req.session.user && !publicPaths.includes(req.path)) {
    req.session.message = 'Your session has expired. Please log in again.';
    return res.redirect('/getLoginPage');
  }
  next();
});

// Route handling
app.use('/getLoginPage', getLoginPage);
app.use('/logoutUser', logoutUser);
app.use('/getProtectedPage', getProtectedPage);
app.use('/getSignupPage', getSignupPage);
app.use('/deleteUser', deleteUser);
app.use('/loginUser', loginUser);
app.use('/signUpUser', signUpUser);
app.use('/S3Get_user_pic', S3GetUserPic);
app.use('/S3Post_user_pic', S3PostUserPic);
app.use('/getResetPasswordPage', getResetPasswordPage); // Route for reset password page
app.use('/resetPassword', resetPassword); // Route for password reset

// Initialize database
createUsersTable();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
