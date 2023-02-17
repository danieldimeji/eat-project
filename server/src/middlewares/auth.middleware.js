const { verifyAccessJWToken } = require("../services/jwt.service");
const { User } = require("../models");

const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      const verifyToken = await verifyAccessJWToken(token);
      if (verifyToken !== undefined) {
        const user = await User.findOne({ where: { uuid: verifyToken.userUuid } });
        if (!user) {
          return res.status(401).json({ message: "Access Denied" });
        }
        req.user = user;
        req.accessToken = token;
        next();
      } else {
        console.log("Token Error: token has been revoked or not access token");
        return res.sendStatus(403);
      }
    } catch (error) {
      console.log(error);
      return res.sendStatus(403);
    }
  } else {
    return res.status(401).json({ message: "Access Denied" });
  }
};

module.exports = authenticateJWT;
