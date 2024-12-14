const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = function (req, res, next){
    const authHeader = req.headers.authorization;
    console.log('Authorization Header:', authHeader); // Debugging line


    if(!authHeader){
        return res.status(401).json({error: 'No token'});
    }

    const token = authHeader.split(' ')[1];
    console.log(token);

    if(!token){
        return res.status(401).json({error: 'no token'});
    }

    try{
        const decoded = jwt.verify(token, config.jwtSecret);
        console.log(decoded);
        req.user = decoded.user;
        next();
    } catch(err){
        console.error(err);
        return res.status(401).json({error: 'Token is not valid'});
    }
}