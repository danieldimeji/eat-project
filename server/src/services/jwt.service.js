require("dotenv").config();
const jwt = require("jsonwebtoken");

const secret = process.env.SECRET;

const issueJWToken = (payload, expiresIn) => jwt.sign(payload, secret, {
  expiresIn,
});

const verifyJWToken = (token) => jwt.verify(token, secret);

module.exports = {
  issueJWToken,
  verifyJWToken,
};
