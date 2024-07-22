var express = require('express');
var router = express.Router();


router.get('/', function(req, res){
    const clientIp = req.ip;
    console.log(`Client IP address: ${clientIp}`);
    res.send('GET route on things.');
});

router.post('/', function(req, res){
    const clientIp = req.ip;
    console.log(`Client IP address: ${clientIp}`);
    res.send('POST route on things.');
});

router.get('/:name/:id', function(req, res) {
    res.send('id: ' + req.params.id + ' and name: ' + req.params.name);
});



router.get('/:id([0-9]{5})', function(req, res){
    res.send('id: ' + req.params.id);
});

router.get('/first_template', function(req, res){
    res.render('first_view');
});

router.get('/', function(req, res){
    res.cookie('name', 'express').send('cookie set'); //Sets name = express
 });

// Export this router to use in index.js
module.exports = router;
