const { check, validationResult } = require("express-validator");

const validationErrorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const emailValidator = [
  check("email").isEmail().withMessage("Invalid email address"),
  validationErrorMiddleware
];

const passwordValidator = [
  check("password").not().isEmpty().withMessage("Password is required"),
  check("password")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must contain between 8 and 128 characters"),
  check("password")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, one number and one special character"
    ),
];

const passwordConfirmValidator = [
  check("confirmPassword")
    .not()
    .isEmpty()
    .withMessage("Confirm Password is required"),
  check("password").custom((value, { req }) => {
    if (value !== req.body.confirmPassword) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),
];

const signUpValidator = [
  check("firstName").not().isEmpty().withMessage("First name is required"),
  check("lastName").not().isEmpty().withMessage("Last name is required"),
  ...emailValidator,
  ...passwordValidator,
  ...passwordConfirmValidator,
  validationErrorMiddleware
];

const signInValidator = [...emailValidator, ...passwordValidator, validationErrorMiddleware];

const passwordsValidator = [
  ...passwordValidator,
  ...passwordConfirmValidator,
  validationErrorMiddleware
];

const changePasswordValidator = [
  check("old_password").not().isEmpty().withMessage("Current password is required"),
  ...passwordValidator,
  ...passwordConfirmValidator,
  validationErrorMiddleware
];

const refreshTokenValidator = [
  check("refreshToken").not().isEmpty().withMessage("Refresh token is required"),
  validationErrorMiddleware
];

module.exports = {
  signUpValidator,
  signInValidator,
  emailValidator,
  passwordsValidator,
  changePasswordValidator,
  refreshTokenValidator
};
