// signup.js
// AI-GEN START - ChatGPT GPT4
const express = require('express');
const router = express.Router();
const { pool } = require('../../database');

router.post('/deleteUser', function(req, res){
  const sql = 'Delete from users where id = ?';
  const {id} = req.session.user
      
  pool.query(sql, [id], (err, results) => {
      console.log("err", err);
      console.log("Results", results);

      if (err) {
          console.error('Error Deleting user:', err);
          return res.status(405).send({ message: 'Internal server error' });
      } 
  });

  req.session.destroy();
  res.redirect('/getSignupPage');
});

module.exports = router;
// AI-GEN END
