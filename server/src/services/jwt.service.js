require("dotenv").config();
const jwt = require("jsonwebtoken");
const { AuthToken } = require("../models");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const issueAccessJWToken = (payload, expiresIn) => {
  const accessToken = jwt.sign(payload, accessTokenSecret, {
    expiresIn,
  });
  // catch errors
  // set expiration date
  AuthToken.create({
    userUuid: payload.userUuid,
    token: accessToken,
    tokenType: "access",
  });
  return accessToken;
};

const verifyAccessJWToken = (token) => jwt.verify(token, accessTokenSecret);

const issueRefreshJWToken = (payload, expiresIn) => {
  const refreshToken = jwt.sign(payload, refreshTokenSecret, {
    expiresIn,
  });
  // catch errors
  // set expiration date
  AuthToken.create({
    userUuid: payload.userUuid,
    token: refreshToken,
    tokenType: "refresh",
  });
  return refreshToken;
};

const verifyRefreshJWToken = (token) => jwt.verify(token, refreshTokenSecret);

module.exports = {
  issueAccessJWToken,
  verifyAccessJWToken,
  issueRefreshJWToken,
  verifyRefreshJWToken
};
