const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth.controller");
const {
  signUpValidator, signInValidator,
  refreshTokenValidator, emailValidator,
  passwordsValidator, changePasswordValidator
} = require("../middlewares/validation.middleware");

const authenticateJWT = require("../middlewares/auth.middleware");

// authentication
router.post("/auth/sign-up", signUpValidator, authController.signUp);
router.post("/auth/sign-in", signInValidator, authController.signIn);
router.post("/auth/activate", emailValidator, authController.getActivationLink);
router.get("/auth/activate/:token", authController.activateAccount);
router.post("/auth/reset", emailValidator, authController.resetPassword);
router.post("/auth/new-password/:token", passwordsValidator, authController.setNewPassword);
router.post("/auth/change-password", changePasswordValidator, authenticateJWT, authController.changePassword);
router.post("/auth/sign-out", refreshTokenValidator, authenticateJWT, authController.signOut);
router.get("/auth/sign-out-all", authenticateJWT, authController.signOutAll);
router.post("/auth/refresh-token", refreshTokenValidator, authController.refreshAccessToken);

module.exports = router;
