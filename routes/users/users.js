const express = require('express');
const router = express.Router();
const passport = require('passport');
const userData = require("../../data/userData");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt-nodejs');
const uuid = require("node-uuid");

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(async function(user, done) {
    var userDeserialize = await userData.findUserById(user._id);
    if (user) {
        done(null, user);
    }
});

passport.use('local.login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async function(req, username, password, done) {
    try {
        console.log("here");
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
passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async function(req, username, password, done) {
    try{
        const user = await userData.findUserByUsername(username);
        if(!user){
            if(!username) throw "Provide Email - It will be your user name";
            if(!password) throw "Provide password";
            if(req.body.firstName) throw "Provide First Name";
            if(req.body.lastName) throw "Provide Last Name";
            if(req.body.address) throw "Provide address, tickets will be sent to the address";
            if(req.body.phone) throw "Provide Phone Number to recieve the tickets";
            if(req.body.department) throw "Provide Department to optimize the search";
            var userSession = req.session;
            var newUser = {
                _id: uuid.v4(),
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                username: req.body.email,
                password: encryptPassword(password),
                //sessionObject: userSession,
                address: req.body.address,
                phone:req.body.phone,
                department: req.body.department
            };
            const newUserCreated = await userData.createUser(newUser);
            const insertedUser =  await userData.findUserById(newUserCreated.insertedId);
            return done(null,insertedUser);    
        } else {
            messages.push("Username already exists try different one.");
            //throw "Username already exists try different one."
        }
        return done(null, false, req.flash('error',messages));
    } catch(e){
        return done(null, false, {"messages": e});
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


router.get('/private', isLoggedIn, (req, res) => {
    res.render('users/users_home', { user: req.user });
});

router.get('/', (req, res) => {
    if(req.isAuthenticated()){
        res.render('users/users_home', {user: req.user});
    }else {
        var messages = req.flash('error');
        res.render('users/login', { messages: messages, hasErrors: messages.length > 0 });
    }
});


router.get('/logout', isLoggedIn, function(req, res) {
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

function encryptPassword(password){
  return bcrypt.hashSync(password,bcrypt.genSaltSync(40),null);
};

