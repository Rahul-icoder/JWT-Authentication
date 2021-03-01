const crypto = require("crypto");

const token  = crypto.randomBytes(16).toString('hex'); 

console.log(token);