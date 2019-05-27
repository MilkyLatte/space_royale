// Followed tutorial from https://itnext.io/implementing-json-web-tokens-passport-js-in-a-javascript-application-with-react-b86b1f313436
// Modified for this project

const User = require('../sequelize/googleSequelize');
const passport = require('passport');

module.exports = app => {
    app.post('/registerGoogleUser', (req, res, next) => {
        passport.authenticate('Googleregister', (err, user, info) => {
            if (err) {
                console.log(err);
            }
            if (info != undefined) {
                console.log(info.message);
                res.send(info.message);
            } else {
                req.logIn(user, err => {
                    const data = {
                        id: req.body.id,
                        username: req.body.username,
                        email: req.body.email,
                    }
                    
                    User.findOne({
                        where:{
                            id: data.id
                        }
                    }).then(user => {
                        user.update({
                            username: data.username,
                            email: data.email,
                        })
                    }).then(() => {
                        console.log('user created in db');
                        res.status(200).send({message: 'user created'});
                    })
                    .catch((err) => {
                        console.error(err)
                    })                        
                })
            }
        }) (req, res, next)
    })
}