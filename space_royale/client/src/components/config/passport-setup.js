const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys');

passport.use(
    new GoogleStrategy({
        // options for the google strat
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/api/google/redirect'
    }, () => {
        // passport callback function
    })
)