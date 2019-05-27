// Followed tutorial from https://itnext.io/implementing-json-web-tokens-passport-js-in-a-javascript-application-with-react-b86b1f313436
// Modified for this project

const User = require('../sequelize/googleSequelize');
const jwtSecret = require('../config/jwtConfig');
const jwt = require('jsonwebtoken');
const passport = require('passport');

module.exports = app => {
    app.post('/loginGoogleUser', (req, res, next) => {
        passport.authenticate('GoogleLogin', (err, user, info) => {
            if (err) {
                console.log(err);
            }

            if (info != undefined) {
                console.log(info.message);
                res.send(info.message);
            } else {
                req.logIn(user, err => {
                    User.findOne( {
                        where: {
                            id: user.id,
                        },
                    }).then(user => {
                        const token = jwt.sign({id: user.id, database: "google"}, jwtSecret.secret);
                        res.status(200).send({
                            auth:true,
                            token: token,
                            message: 'user found & logged in',
                        });
                    });
                });
            }
        })(req, res, next);
    });
};