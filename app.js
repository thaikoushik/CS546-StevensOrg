const express = require('express');
const static = express.static(__dirname + '/public');
const app = express();
const configRoutes = require('./routes');
const exhbs = require('express-handlebars');
const passport = require("passport");
const flash = require("connect-flash");
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const Handlebars = require('handlebars');
const fs = require('fs');
const multer = require('multer');
const upload = multer({dest: 'uploaded/'});

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    // If the user posts to the server with a property called _method, rewrite the request's method
    // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
    // rewritten in this middleware to a PUT route
    if (req.body && req.body._method) {
        req.method = req.body._method;
        delete req.body._method;
    }

    // let the next middleware run:
    next();
};

const handlebarsInstance = exhbs.create({
    defaultLayout: 'main',
    // Specify helpers which are only registered on this instance.
    helpers: {
        asJSON: (obj, spacing) => {
            if (typeof spacing === "number")
                return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));

            return new Handlebars.SafeString(JSON.stringify(obj));
        }
    }
});

app.engine('handlebars', exhbs({ defaultLayout: 'layout', extname: '.handlebars' }));
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

app.use(express.static('public'))

app.use("/public", static);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);
app.use(cookieParser());
app.use(session({secret:"somekeu", resave:true, saveUninitialized:true}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session()); 

app.get('/', function(req, res){
    //var sessionData = req.session;
    if(req.isAuthenticated()){
         res.locals.login = req.isAuthenticated();
        if(req.user.role === 'admin' || req.user.role === 'Admin'){
            //res.render('users/admin_home', {user: req.user});    
            res.redirect('/admin');
        } else {
            res.render('users/users_home', {user: req.user});        
        }    
    } else {
        var messages = req.flash('error');
        res.render('categories/home', { messages: messages, hasErrors: messages.length > 0 });    
    }
    
});

app.use(function(req,res,next){
    res.locals.login = req.isAuthenticated();
    if(req.isAuthenticated()){
        if((req.user.role === 'admin') || (req.user.role === 'Admin')){
            res.locals.admin = true;
        } else {
            res.locals.admin = false;
        }
    }
    res.locals.session = req.session;
    next();
});

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

configRoutes(app);

console.log("  ______    __                                                         ______                            ");
console.log(" /      \\  /  |                                                       /      \\                           ");
console.log("/$$$$$$  |_$$ |_     ______   __     __  ______   _______    _______ /$$$$$$  |  ______    ______        ");
console.log("$$ \\__$$// $$   |   /      \\ /  \\   /  |/      \\ /       \\  /       |$$ |  $$ | /      \\  /      \\       ");
console.log("$$      \\$$$$$$/   /$$$$$$  |$$  \\ /$$//$$$$$$  |$$$$$$$  |/$$$$$$$/ $$ |  $$ |/$$$$$$  |/$$$$$$  |      ");
console.log(" $$$$$$  | $$ | __ $$    $$ | $$  /$$/ $$    $$ |$$ |  $$ |$$      \\ $$ |  $$ |$$ |  $$/ $$ |  $$ |      ");
console.log("/  \\__$$ | $$ |/  |$$$$$$$$/   $$ $$/  $$$$$$$$/ $$ |  $$ | $$$$$$  |$$ \\__$$ |$$ |      $$ \\__$$ |      ");
console.log("$$    $$/  $$  $$/ $$       |   $$$/   $$       |$$ |  $$ |/     $$/ $$    $$/ $$ |      $$    $$ |      ");
console.log(" $$$$$$/    $$$$/   $$$$$$$/     $/     $$$$$$$/ $$/   $$/ $$$$$$$/   $$$$$$/  $$/        $$$$$$$ |      ");
console.log("                                                                                         /  \\__$$ |      ");
console.log("                                                                                         $$    $$/       ");
console.log("                                                                                          $$$$$$/");

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:3000");
});