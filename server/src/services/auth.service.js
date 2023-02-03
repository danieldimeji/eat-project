/* eslint-disable consistent-return */
const crypto = require("node:crypto");
const { AuthToken } = require("../models");

const generateToken = async (user, tokenType) => {
  const token = crypto
    .createHash("md5")
    .update(Math.random().toString().substring(2))
    .digest("hex");

  AuthToken.findOne({
    where: {
      token,
    },
  }).then((authToken) => {
    if (authToken === null) {
      return generateToken(user, tokenType);
    }
  });
  return AuthToken.create({
    userId: user.id,
    token,
    tokenType,
  });
};

module.exports = {
  generateToken,
};
