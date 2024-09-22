const { env } = require("process");


module.exports = {
    mongoURI: env.mongoURI,
    jwtSecret: 'hello'
};