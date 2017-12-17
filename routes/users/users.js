const express = require('express');
const router = express.Router();
const passport = require('passport');
const userData = require("../../data/userData");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt-nodejs');
const uuid = require("node-uuid");
const eventData = require('../../data/eventData');
const crypto = require('crypto');
const nodemailer = require('nodemailer')

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(async function (user, done) {
    var userDeserialize = await userData.findUserById(user._id);
    if (user) {
        done(null, user);
    }
});

// TODO: Move the new user object creation in SignUp to UserData.CreateUser Method 

/*
    All User routes User Authentication and signup. By defualt there is no registration page for admins. 
*/
passport.use('local.login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async function (req, username, password, done) {
    try {
        const user = await userData.findUserByUsername(username);
        bcrypt.compare(password, user.password, (error, isValid) => {
            if (error) {
                return done(error);
            }
            if (!isValid) {
                return done(null, false, { "message": "Incorrect Password " });
            }
            return done(null, user);
        });
    } catch (e) {
        return done(null, false, { "message": e });
    }
}));

/*
    User Signup Every user is registered as student. It can be changed in DB
*/
passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async function (req, username, password, done) {
    try {
        const user = await userData.findUserByUsername(username);
        if (!user || user === null || user === undefined) {
            if (!req.body.firstname) throw "Provide Email - It will be your user name";
            if (!req.body.lastname) throw "Provide password";
            if (!req.body.firstname) throw "Provide First Name";
            if (!req.body.lastname) throw "Provide Last Name";
            if (!req.body.address) throw "Provide address, tickets will be sent to the address";
            if (!req.body.phone) throw "Provide Phone Number to recieve the tickets";
            if (!req.body.department) throw "Provide Department to optimize the search";

            let eventsRegistered = [];
            var newUser = {
                _id: uuid.v4(),
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                username: req.body.email,
                password: encryptPassword(password),

                address: req.body.address,
                phone: req.body.phone,
                role: "Student",
                department: req.body.department,
                events: eventsRegistered
            };
            const newUserCreated = await userData.createUser(newUser);
            const insertedUser = await userData.findUserById(newUserCreated.insertedId);
            return done(null, insertedUser);
        } else {
            messages.push("Username already exists try different one.");

        }
        return done(null, false, req.flash('error', messages));
    } catch (e) {
        return done(null, false, { "messages": e });
    }

}));

router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/user/private');
    } else {
        var messages = req.flash('error');
        res.render('users/login', { messages: messages, hasErrors: messages.length > 0 });
    }
});

router.get('/signup', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/user/private');
    } else {
        var messages = req.flash('error');
        res.render('users/signup', { messages: messages, hasErrors: messages.length > 0 });
    }
});

router.post('/login', passport.authenticate('local.login', {
    failureRedirect: '/user/login',
    failureFlash: true
}), (req, res) => {
    if (req.session.oldurl) {
        var oldUrl = req.session.oldurl;
        req.session.oldurl = null;
        res.direct(oldUrl);
    } else {

        res.redirect('/user/private');
    }
});

router.post('/signup', passport.authenticate('local.signup', {
    failureRedirect: '/user/signup',
    failureFlash: true
}), (req, res) => {
    if (req.session.oldurl) {
        var oldUrl = req.session.oldurl;
        req.session.oldurl = null;
        res.direct(oldUrl);
    } else {
        res.redirect('/user/private');
    }
});


router.get('/private', isLoggedIn, async (req, res) => {
    var role = req.user.role;
    let eventsList = [];
    let events = await eventData.getAllEvents();
    let chunksize = 3;
    for (let i = 0; i < events.length; i += chunksize) {
        eventsList.push(events.slice(i, i + chunksize));
    }

    if (role === "Student") {
        res.render('users/users_home', { user: req.user, eventsList: eventsList });
    } else {
        res.redirect('/admin');
    }

});

router.get('/private/:dept', isLoggedIn, async (req, res) => {
    var role = req.user.role;
    var dept = req.params.dept;

    let eventsList = [];
    let events = await eventData.getDeptAllEvents(dept);
    let chunksize = 3;
    for (let i = 0; i < events.length; i += chunksize) {
        eventsList.push(events.slice(i, i + chunksize));
    }

    if (role === "Student") {
        res.render('users/users_home', { user: req.user, eventsList: eventsList });

    } else {
        res.redirect('/admin');

    }

});

router.get('/tickets', isLoggedIn, async (req, res) => {

    var role = req.user.role;
    var id = req.user._id;


    var ticketList = []
    let tickets = await userData.getAllTicketDetails(id);
    let chunksize = 3;
    for (let i = 0; i < tickets.length; i += chunksize) {
        ticketList.push(tickets.slice(i, i + chunksize));
    }

    if (role === "Student") {
        res.render('users/users_tickets', { user: req.user, ticketList: ticketList });

    } else {
        res.redirect('/admin');

    }

});

router.get('/tickets/:id', isLoggedIn, async (req, res) => {
    var role = req.user.role;
    var id = req.user._id;
    var ticketId = req.params.id;

    var ticketDetails;
    let tickets = await userData.getAllTicketDetails(id);

    for (let i = 0; i < tickets.length; i++) {
        if (ticketId == tickets[i]._id) {
            ticketDetails = tickets[i];
        }
    }

    if (role === "Student") {
        res.render('users/ticketDetail', {
            user: req.user,
            ticketDetails: ticketDetails,
            contactInfo: ticketDetails.contactInfo,
            paymentInfo: ticketDetails.paymentInfo
        });

    } else {
        res.redirect('/admin');
    }
});


router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('users/users_home', { user: req.user });
    } else {
        var messages = req.flash('error');
        res.render('users/login', { messages: messages, hasErrors: messages.length > 0 });
    }
});

router.get('/updateUser', (req, res) => {

    res.render('users/updateUser', { user: req.user });

});

router.post('/updateUser', async (req, res) => {
    try {
        let updatedUserData = req.body;

        let getUser = await userData.findUserById(req.user._id);

        editedData = await userData.updateUser(req.user._id, updatedUserData);

        res.redirect('/user/private')
    } catch (e) {
        res.status(404).json({ error: e });
    }

});

router.get('/forgot', function(req, res) {
    res.render('users/forgot', {
        user: req.body.username
    });
});

router.post('/forgot', async(req, res, next) => {
    try {
        const user = await userData.findUserByUsername(req.body.username);
        

        var token = crypto.randomBytes(64).toString('hex');

        if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('user/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        



        smtpTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {

                user: 'stevensorgsync@gmail.com',
                pass: 'stevens12345'
            }
        });
        var mailOptions = {
            to: req.body.username,
            from: 'stevensorgsync@gmail.com',
            subject: 'Stevens Org Sync Account Password Reset',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/user/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err, info) {
            if (err)
                console.log(err);
            //else
                //console.log(info);

            res.redirect('/user/login');
        });

    } catch (err) {
        if (err)
            return next(err);
        res.redirect('/user/forgot');
    }
});

/*  controller for reset route */

router.get('/reset/:token', function(req, res) {
    res.render('users/reset', {
        user: req.body.username
    });
});

router.post('/resetPassword', async(req, res) => {

    try {
        const user = await userData.findUserByUsername(req.body.username);
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
        }
        hashedPassword = encryptPassword(req.body.password);
        var updatedData = await userData.resetPassword(req.body.username, hashedPassword);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        var smtpTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'stevensorgsync@gmail.com',
                pass: 'stevens12345'
            }
        });
        var mailOptions = {
            to: req.body.username,
            from: 'stevensorgsync@gmail.com',
            subject: 'Your Stevens Org Sync Account password has been changed',
            text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + req.body.username + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err, info) {
            if (err)
                console.log(err);
            //else
               // console.log(info);
            req.flash('success', 'Success! Your password has been changed.');

            res.redirect('/user/login');

        });
    } catch (err) {
        //console.log(err);
        return err;
    }
});


/*
    Admin Pages are done in admin.js 
*/

router.get('/logout', isLoggedIn, function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function encryptPassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(40), null);
};

