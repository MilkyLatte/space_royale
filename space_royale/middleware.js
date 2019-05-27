// Followed tutorial from https://itnext.io/implementing-json-web-tokens-passport-js-in-a-javascript-application-with-react-b86b1f313436

const jwt = require('jsonwebtoken');
const jwtSecret = require('./config/jwtConfig');

const withAuth = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.token;
    
    if (!token) {
        res.status(401).send('Unauthorized: No token provided');
    } else {
        jwt.verify(token, jwtSecret.secret, (err, decoded) => {
            if(err) {
                res.status(401).send('Unauthorized: Invalid token');
            } else {
                req.id = decoded.id;
                req.database = decoded.database;
                next();
            }
        });
    }
}

module.exports = withAuth;