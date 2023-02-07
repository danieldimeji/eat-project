/* eslint-disable consistent-return */
const crypto = require("node:crypto");
const { AuthToken } = require("../models");

const generateToken = async (user, tokenType) => {
  const token = crypto
    .createHash("sha256")
    .update(Math.random().toString().substring(2))
    .digest("hex");

  await AuthToken.findOne({
    where: {
      token,
    },
  }).then((authToken) => {
    if (authToken !== null) {
      return generateToken(user, tokenType);
    }
    AuthToken.destroy({
      where: {
        userUuid: user.uuid,
        tokenType
      }
    });
  });
  // catch errors
  return AuthToken.create({
    userUuid: user.uuid,
    token,
    tokenType,
  });
};

module.exports = {
  generateToken,
};
