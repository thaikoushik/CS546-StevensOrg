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
app.use(session({
    cookie: { maxAge: 30000000 },
    secret: 'woot',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session()); 
app.get('/', function(req, res){
    if(req.isAuthenticated()){
        res.render('users/users_home', {user: req.user});
    }else {
        var messages = req.flash('error');
        res.render('categories/home', { messages: messages, hasErrors: messages.length > 0 });
    }
    ///res.render('categories/home');
});

app.use(function(req,res,next){
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
});

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