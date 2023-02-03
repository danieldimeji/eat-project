const { verifyJWToken } = require("../services/jwt.service");
const { User, AuthToken } = require("../models");

const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      const decode = verifyJWToken(token);
      // check if token is valid (revoked or expired)
      const user = await User.findOne({ where: { uuid: decode.userUuid } });
      if (!user) {
        return res.status(401).json({ message: "Access Denied" });
      }
      req.user = user;
      next();
    } catch (error) {
      return res.sendStatus(403);
    }
  } else {
    return res.status(401).json({ message: "Access Denied" });
  }
};

module.exports = authenticateJWT;
