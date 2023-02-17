/* eslint-disable consistent-return */
const bcrypt = require("bcryptjs");
const { User, AuthToken } = require("../models");
const {
  issueAccessJWToken,
  issueRefreshJWToken,
  verifyRefreshJWToken
} = require("../services/jwt.service");
const { generateToken } = require("../services/auth.service");
const { toTitleCase } = require("../helpers");

const signUp = async (req, res) => {
  const {
    firstName, lastName, email, password
  } = req.body;

  User.findOne({
    where: {
      email,
    },
  }).then((user) => {
    if (user) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    User.create({
      firstName: toTitleCase(firstName),
      lastName: toTitleCase(lastName),
      email,
      password: hashedPassword,
    })
      .then(async (savedUser) => {
        const token = await generateToken(savedUser, "activate");
        // send activation email
        res.status(201).json({
          message: "User created successfully",
          activationToken: token.token,
        });
      })
      .catch((err) => res.status(500).json({
        error: `Error creating user: ${err}`,
      }));
  });
};

const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Incorrect email." });
    }
    if (user.isActive === false) {
      return res.status(400).json({ message: "Activate your account." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    const payload = {
      userUuid: user.uuid,
      email: user.email,
    };

    const accessToken = await issueAccessJWToken(payload, "1h");
    const refreshToken = await issueRefreshJWToken(payload, "90d");

    if (!accessToken || !refreshToken) {
      throw Error("Internal Server Error");
    }

    res.status(200).json({ message: "Success", accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const activateAccount = async (req, res) => {
  const { token } = req.params;
  try {
    const authToken = await AuthToken.findOne({ where: { token } });
    if (
      !authToken
      || authToken.tokenType !== "activate"
      || authToken.expires < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired activation link." });
    }
    const user = await User.findOne({ where: { uuid: authToken.userUuid } });
    await user.update({ isActive: true });
    await authToken.destroy();
    res.status(200).json({ message: "Account activated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getActivationLink = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    if (user.isActive === true) {
      return res.status(200).json({ message: "User is already active" });
    }
    const token = await generateToken(user, "activate");
    res.status(200).json({ message: "Success", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    if (user.isActive === false) {
      return res.status(200).json({ message: "Activate your account" });
    }
    const token = await generateToken(user, "reset");
    res.status(200).json({ message: "Success", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const setNewPassword = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    const authToken = await AuthToken.findOne({ where: { token } });
    if (
      !authToken
      || authToken.tokenType !== "reset"
      || authToken.expires < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired activation link." });
    }
    const user = await User.findOne({ where: { uuid: authToken.userUuid } });
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    await user.update(
      { password: hashedPassword }
    );
    await authToken.destroy();
    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const changePassword = async (req, res) => {
  const { old_password, password } = req.body;
  try {
    const { user } = req;

    if (user.isActive === false) {
      return res.status(400).json({ message: "Activate your account." });
    }

    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    await user.update({ password: hashedPassword });

    await AuthToken.destroy({
      where: {
        userUuid: user.uuid,
        tokenType: ["access", "refresh", "reset"]
      }
    });
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const signOut = async (req, res) => {
  const { user, accessToken } = req;
  const { refreshToken } = req.body;
  try {
    const verifyToken = await verifyRefreshJWToken(refreshToken);
    if (verifyToken === undefined) {
      return res.sendStatus(403);
    }
    const tokenUser = await User.findOne({ where: { uuid: verifyToken.userUuid } });
    if (!tokenUser || user.uuid !== tokenUser.uuid) {
      return res.status(401).json({ message: "Access Denied" });
    }
    await Promise.all([
      AuthToken.destroy({ where: { userUuid: user.uuid, token: accessToken, tokenType: "access" } }),
      AuthToken.destroy({ where: { userUuid: user.uuid, token: refreshToken, tokenType: "refresh" } })
    ]);

    return res.status(200).json({ message: "Successfully signed out" });
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const signOutAll = async (req, res) => {
  const { user } = req;

  try {
    await AuthToken.destroy({ where: { userUuid: user.uuid } });

    return res.status(200).json({ message: "Successfully signed out of all devices" });
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const verifyToken = await verifyRefreshJWToken(refreshToken);

    if (verifyToken === undefined) {
      return res.sendStatus(403);
    }

    const tokenUser = await User.findOne({ where: { uuid: verifyToken.userUuid } });

    if (!tokenUser) {
      return res.status(401).json({ message: "Access Denied" });
    }
    const payload = {
      userUuid: tokenUser.uuid,
      email: tokenUser.email,
    };
    const accessToken = await issueAccessJWToken(payload, "1h");

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

module.exports = {
  signUp,
  signIn,
  activateAccount,
  getActivationLink,
  resetPassword,
  setNewPassword,
  changePassword,
  signOut,
  signOutAll,
  refreshAccessToken,
};
