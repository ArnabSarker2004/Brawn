const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = function (req, res, next){
    const token = req.cookies.auth_token;

    if(!token){
        return res.status(401).json({error: 'No token'});
    }

    try{
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded.user;
        next();
    } catch(err){
        console.error(err);
        return res.status(401).json({error: 'Token is not valid'});
    }
}