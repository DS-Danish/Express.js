// signup.js
// AI-GEN START - ChatGPT GPT4
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const { pool } = require('../../database');

router.post('/loginUser', function(req, res){
    const { id, password } = req.body;
  
    if (!id || !password) {
      return res.render('login', { message: 'All fields are required' });
    }
  
    const sql = 'SELECT * FROM users WHERE id = ?';
    pool.query(sql, [id], async (err, results) => {
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

module.exports = router;
// AI-GEN END
