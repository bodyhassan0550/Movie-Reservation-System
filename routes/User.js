const express = require("express");
const router = express.Router();
const UserControl = require("../controller/User");
const isAuth = require("../midddelware/isAuth");
const { check } = require("express-validator");

router.post(
  "/signup",
  [
    check("email").isEmail().withMessage("E-mail is inValid").normalizeEmail(),
    check("name").trim().not().isEmpty().withMessage("Name is required"),
    check("password")
      .trim()
      .isLength({ min: 5, max: 11 })
      .withMessage("inValid Password"),
  ],
  UserControl.signup
);
router.get(
  "/login",
  [
    check("email").isEmail().withMessage("E-mail is inValid").normalizeEmail(),
    check("password")
      .trim()
      .isLength({ min: 5, max: 11 })
      .withMessage("inValid Password"),
  ],
  UserControl.Login
);
router.get("/logout", isAuth, UserControl.Logout);

module.exports = router;
