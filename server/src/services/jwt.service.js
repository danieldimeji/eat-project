require("dotenv").config();
const jwt = require("jsonwebtoken");
const { AuthToken } = require("../models");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const issueAccessJWToken = async (payload, expiresIn) => {
  let accessToken;
  try {
    accessToken = jwt.sign(payload, accessTokenSecret, {
      expiresIn,
    });
  } catch (error) {
    console.error(`Error signing JWT: ${error.message}`);
    return accessToken;
  }

  try {
    await AuthToken.create({
      userUuid: payload.userUuid,
      token: accessToken,
      tokenType: "access",
      expires: new Date(Date.now() + 3600000)
    });
  } catch (error) {
    console.error(`Error storing access token: ${error.message}`);
    accessToken = undefined;
  }

  return accessToken;
};

const verifyAccessJWToken = (token) => jwt.verify(token, accessTokenSecret);

const issueRefreshJWToken = async (payload, expiresIn) => {
  let refreshToken;
  try {
    refreshToken = jwt.sign(payload, refreshTokenSecret, {
      expiresIn,
    });
  } catch (error) {
    console.error(`Error signing JWT: ${error.message}`);
    return refreshToken;
  }

  try {
    await AuthToken.create({
      userUuid: payload.userUuid,
      token: refreshToken,
      tokenType: "refresh",
      expires: new Date(Date.now() + 7776000000)
    });
  } catch (error) {
    console.error(`Error storing refresh token: ${error.message}`);
    refreshToken = undefined;
  }
  return refreshToken;
};

const verifyRefreshJWToken = (token) => jwt.verify(token, refreshTokenSecret);

module.exports = {
  issueAccessJWToken,
  verifyAccessJWToken,
  issueRefreshJWToken,
  verifyRefreshJWToken
};
