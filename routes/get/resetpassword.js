const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('getresetpassword'); // This should match the Pug file name
});

module.exports = router;
