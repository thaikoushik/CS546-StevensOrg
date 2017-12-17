/* Admin routes*/
const express = require('express');
const router = express.Router();
const eventData = require("../../data/eventData");
const multer = require('multer');
const path = require('path');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploaded/files/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.jpg'); //Appending .jpg
    }
});

router.get('/', async (req, res) => {

    if (!req.isAuthenticated()) {
        res.redirect('/user/login');

    }
    const createdEvents = await eventData.getAllCreatedEvents(req.user._id);
    var eventsList = [];
    var chunkSize = 3;
    for (var i = 0; i < createdEvents.length; i += chunkSize) {
        eventsList.push(createdEvents.slice(i, i + chunkSize));
    }
    res.render('users/admin_home', { user: req.user, createdEvents: eventsList });

});

router.post('/createEvent', multer({ storage: storage }).single('image'), async (req, res) => {
    try {
        const event = await eventData.createEvent(req);
        if (event) {
            const newEvent = await eventData.getEventById(event.insertedId);
            res.redirect('/event/eventDetail/' + newEvent._id);
        }

    } catch (err) {
        messages.push(err);
    }
});

module.exports = router;



let isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}