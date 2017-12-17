const express = require('express');
const router = express.Router();
const userData = require("../../data/userData");
const eventData = require("../../data/eventData");
const path = require('path');
const StripeWrapper = require('stripe-wrapper-node');
const stripe = require('stripe')('sk_test_CfZl2Qbwjzu7kFCv2IG7BcsW');
const Excel = require('exceljs');

router.get('/eventdetail/:id', async(req, res) => {
    const id = req.params.id;
    try {
        const event = await eventData.getEventById(id);
        if (!event) {
            throw "There is no event created with this id";
        }
        res.app.locals.isRegistered = false;
        if (req.user !== undefined) {
            let eventsRegistered = req.user.events;
            for (let i = 0; i < eventsRegistered.length; i++) {
                if (eventsRegistered[i].eventId === id) {
                    res.app.locals.isRegistered = true;
                    break;
                }
            }
        }
        if (event.ticketPrice > 0) {
            res.app.locals.payableEvent = true;
        } else {
            res.app.locals.payableEvent = false;
        }

        if(event.restrictDeparment && req.user){
            if(event.department === req.user.department){
                res.app.locals.restrict = false;
            } else {
                res.app.locals.restrict = true;
            }

        }
        event.imageURL = event.imageURL.replace('.jpg', "");

        res.render('categories/eventDetail', { user: req.user, event: event });
    } catch (e) {
        res.send(e);
    }

});

router.post('/registerEvent/:id',  async(req, res) => {
    const id = req.params.id;
    try {
        const eventsList = await eventData.registerForEvent(id, req.user._id);
        req.user.events = eventsList;
        let userObj = req.user;
        let eventsLists = userObj.events;
        if (!eventsList) {
            throw "There is no event created with this id";
        }
        res.sendStatus(200);
    } catch (e) {
        res.send(e);
    }

});

router.post('/registerPayableEvent/:id', async(req, res) => {
    const id = req.params.id;
    try {
        const eventDetails = await eventData.getEventById(id);
        const chargeObject = {
            amount: eventDetails.ticketPrice * 100,
            currency: 'usd',
            source: req.body.stripeToken,
            description: "StevensOrg - Event Registration Charges"
        };
        const stripeCharge = await stripe.charges.create(chargeObject);
        const eventsList = await eventData.registerForEvent(id, req.user._id, stripeCharge.id);
        req.user.events = eventsList;
        res.sendStatus(200);
    } catch (e) {
        res.send(e);
    }
});

router.get('/getRegisteredUsers/:id', async(req, res) => {
    const id = req.params.id;
    try {
        const registeredUserDetails = await eventData.getRegisteredUsers(id);
        var workbook = new Excel.Workbook();
        var worksheet = workbook.addWorksheet('My Sheet');
        worksheet.columns = [
            { header: 'Id', key: 'id', width: 50 },
            { header: 'User Name', key: 'username', width: 50 },
            { header: 'First Name', key: 'fname', width: 50 },
            { header: 'Last Name', key: 'lname', width: 50 },
            { header: 'Department', key: 'department', width: 50 },
            { header: 'Event Id', key: 'eventid', width: 50 },
            { header: 'Event Name', key: 'eventname', width: 50 },
            { header: 'Location', key: 'location', width: 50 }
        ];

        const eventsObj = registeredUserDetails[0].events;
        const eventDetails = {};
        for (let i = 0; i < eventsObj.length; i++) {
            if (eventsObj[i].eventId === id) {
                eventDetails.eventName = eventsObj[i].eventName;
                eventDetails.location = eventsObj[i].location;
                break;
            }
        }
        for (let i = 0; i < registeredUserDetails.length; i++) {
            worksheet.addRow({
                id: registeredUserDetails[i]._id,
                username: registeredUserDetails[i].username,
                'fname': registeredUserDetails[i].firstname,
                'lname': registeredUserDetails[i].lastname,
                'department': registeredUserDetails[i].department,
                'eventid': id,
                'eventname': eventDetails.eventName,
                'location': eventDetails.location
            });
        }

        let tempFilePath = 'F:\\stevens\\CS 546-WS\\stevensOrgMaster\\CS546-StevensOrg-master\\public\\uploaded\\files\\some.xlsx';
        workbook.xlsx.writeFile(tempFilePath).then(function() {
            res.download(tempFilePath);
        });
    } catch (e) {
        res.send(e);
    }
});


module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}