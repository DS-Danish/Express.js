// signup.js
// AI-GEN START - ChatGPT GPT4
const express = require('express');
const router = express.Router();
const { pool } = require('../../database');

router.post('/signUpUser', async function(req, res){
    try {
      const { id, password } = req.body;
      
      if (!id || !password) {
        return res.render('signup', { message: 'All fields are required' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const sql = 'INSERT INTO users (id, password) VALUES (?, ?)';
      
      pool.query(sql, [id, hashedPassword], (err, results) => {
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

module.exports = router;
// AI-GEN END
