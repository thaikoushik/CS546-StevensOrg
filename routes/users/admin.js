/* Admin routes*/
const express = require('express');
const router = express.Router();
const eventData = require("../../data/eventData");
const multer = require('multer');
const path = require('path');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploaded/files/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '.jpg'); //Appending .jpg
    }
});

router.get('/', (req, res) => {
    res.render('users/admin_home');
});

router.post('/createEvent', multer({ storage: storage }).single('image'), async(req, res) => {
    //res.render('users/admin_home');
    console.log("came here");
    console.log(req.file);
    //console.log(req.files);
    try {
        const event = await eventData.createEvent(req);
        if(event){
            const newEvent = await eventData.getEventById(event.insertedId);
            console.log(newEvent._id);
            res.redirect('/event/eventDetail/'+newEvent._id);
        }
        
    } catch (err) {
        messages.push(err);
    }
});

module.exports = router;