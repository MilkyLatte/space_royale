const User = require('../sequelize/googleSequelize');
const passport = require('passport');
const sqlite3 = require('sqlite3').verbose();

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