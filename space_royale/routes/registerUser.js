const User = require('../sequelize/sequelize');
const passport = require('passport');

module.exports = app => {
    app.post('/registerUser', (req, res, next) => {
        passport.authenticate('register', (err, user, info) => {
            if (err) {
                console.log(err);
            }
            if (info != undefined) {
                console.log(info.message);
                res.send(info.message);
            } else {
                req.logIn(user, err => {
                    const data = {
                        username: req.body.username,
                        email: req.body.email,
                    }

                    User.findOne({
                        where:{
                            username: data.username,
                        }
                    }).then(user => {
                        user.update({
                            email: data.email,
                        })
                    }). then(() => {
                        console.log('user created in db');
                        res.status(200).send({message: 'user created'});
                    })
                })
            }
        }) (req, res, next);
    })
}