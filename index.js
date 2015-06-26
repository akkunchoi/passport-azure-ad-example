var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var wsfedsaml2 = require('passport-azure-ad').WsfedStrategy;

// create app
var app = express();

// add peer dependencies middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: false }));

// add passport middleware
app.use(passport.initialize());
app.use(passport.session());

var config = {
    realm: 'http://localhost:3002/',
    identityProviderUrl: 'https://login.windows.net/f90dee94-0ea6-4c02-9003-a09fcc0f6300/wsfed',
    identityMetadata: 'https://login.windows.net/e97a6b5b-abc5-4103-af7d-53459d0827f0/FederationMetadata/2007-06/FederationMetadata.xml',
    logoutUrl:'http://localhost:3002/'
};

var wsfedStrategy = new wsfedsaml2(config, function(profile, done) {
  console.log(profile);
    if (!profile.email) {
        done(new Error("No email found"));
        return;
    }
    // validate the user here
    done(null, profile);
});

passport.use(wsfedStrategy);

// implement your user session strategy here
// http://passportjs.org/guide/configure/
passport.serializeUser(function(user,cb){
    // TODO: save the user to a persistence layer (in-memory, redis cache, etc)
    // cb([err], [userId])
});

passport.deserializeUser(function(userId,cb){
    // TODO: load a user from the persistence layer
    // cb([err], [user])
});

// send the user to WAAD to authenticate    
app.get('/login', passport.authenticate('wsfed-saml2', { failureRedirect: '/', failureFlash: true }), function(req, res) {
    res.redirect('/');
});

// callback from WAAD with a token
app.post('/login/callback', passport.authenticate('wsfed-saml2', { failureRedirect: '/', failureFlash: true }), function(req, res) {
    res.redirect('/');
});

app.listen(process.env.PORT || 3002)
