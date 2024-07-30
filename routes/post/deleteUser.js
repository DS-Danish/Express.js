const express = require('express');
const router = express.Router();
const { pool } = require('../../database');

router.post('/', function(req, res){
  if (!req.session.user) {
    req.session.message = 'Please log in to delete your account';
    return res.redirect('/getLoginPage');
  }

  const userId = req.session.user.id;
  const sql = 'DELETE FROM users WHERE id = ?';

  pool.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error Deleting user:', err);
      return res.status(500).send('Internal server error');
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).send('Error logging out');
      }
      res.redirect('/getSignupPage');
    });
  });
});

module.exports = router;
