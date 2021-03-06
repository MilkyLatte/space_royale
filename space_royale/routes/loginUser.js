// Followed tutorial from https://itnext.io/implementing-json-web-tokens-passport-js-in-a-javascript-application-with-react-b86b1f313436

const User = require('../sequelize/sequelize');
const jwtSecret = require('../config/jwtConfig');
const jwt = require('jsonwebtoken');
const passport = require('passport');

module.exports = app => {
    app.post('/loginUser', (req, res, next) => {
        passport.authenticate('login', (err, user, info) => {
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
                            username: user.username,
                        },
                    }).then(user => {
                        const token = jwt.sign({id: user.username, database: 'local'}, jwtSecret.secret);
                        console.log(token);
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