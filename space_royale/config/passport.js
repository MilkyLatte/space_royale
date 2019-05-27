// Followed tutorial from https://itnext.io/implementing-json-web-tokens-passport-js-in-a-javascript-application-with-react-b86b1f313436
// Modified for this project

const jwtSecret = require('./jwtConfig');
const bcrypt = require('bcrypt');

const saltRounds = 12;

const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('../sequelize/sequelize');
const googleUser = require('../sequelize/googleSequelize');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

passport.use(
    'register',
    new localStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
            session: false,
        },
        (username, userpassword, done) => {
            try {
                User.findOne({
                    where: {
                        username: username,
                    },
                }).then(user => {
                    if (user != null) {
                        console.log('username already taken');
                        return done(null, false, {message: 'username already taken'});
                    } else {
                        bcrypt.hash(userpassword, saltRounds).then(hashedPassword => {
                            User.create({username, password: hashedPassword})
                                .then(user => {
                                    console.log("user created");
                                    return done(null, user);
                                })
                        })
                    }
                })
            } catch (err) {
                done(err);
            }
        } 
    )
);

passport.use(
    'Googleregister',
    new localStrategy (
        {
            usernameField: 'id',
            passwordField: 'username',
            session: false,
        },
        (username, password, done) => {
            try {
                googleUser.findOne({
                    where: {
                        id: username,
                    }
                }).then(user => {
                    if (user != null) {
                        console.log('existing user');
                        return done(null, false, {message: 'user exists'});
                    } else {
                        googleUser.create({id: username, username: password}).then(user => {
                            console.log("User created");
                            return done(null, user);
                        })
                    }
                })
            } catch (err) {
                done(err);
            }
        }
    )
)

passport.use(
    'GoogleLogin',
    new localStrategy(
        {
            usernameField: 'id',
            passwordField: 'username',
            session: false,
        },
        (username, password, done) => {
            try {
                googleUser.findOne({
                    where: {
                        id: username,
                    },
                }).then(user => {
                    if (user == null) {
                        return done(null, false, {message: 'bad id'});
                    } else {
                        console.log('user found & authenticated');
                        return done(null, user);
                    }
                });
            } catch (err) {
                done(err);
            }
        }
    )
);

passport.use(
    'login',
    new localStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
            session: false,
        },
        (username, password, done) => {
            console.log('here');
            try {
                User.findOne({
                    where: {
                        username: username,
                    },
                }).then(user => {
                    if (user == null) {
                        return done(null, false, {message: 'bad username'});
                    } else {
                        bcrypt.compare(password, user.password).then(response => {
                            if (response != true) {
                                console.log("passwords do not match");
                                return done(null, false, {message: "passwords do not match"});
                            }
                            console.log('user found & authenticated');
                            return done(null, user);
                        });
                    }
                });
            } catch (err) {
                done(err);
            }
        }
    )
);

const opts = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('JWT'),
    secretOrKey: jwtSecret.secret,
};