const User = require("../module/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.param, // The field that caused the error
        message: error.msg, // The error message
      })),
    });
  }

  const { name, email, password, confirmpassword } = req.body;
  console.log(name);
  console.log(email);
  console.log(password);

  // Validate required fields
  if (!name || !email || !password || !confirmpassword) {
    return res.status(422).json({
      message: "Name, email, and password are required.",
    });
  }

  User.findOne({ email: email })
    .then((existingUser) => {
      if (existingUser) {
        return res
          .status(422)
          .json({ message: "This email is already registered." });
      }
      if (password != confirmpassword) {
        return res
          .status(422)
          .json({ message: "This Confirm Password not match " });
      }
      // Hash the password
      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      if (!hashedPassword) return; // Prevent further execution if no hash is returned

      const userInstance = new User({
        name: name,
        email: email,
        password: hashedPassword,
      });

      return userInstance.save();
    })
    .then((result) => {
      if (!result) return; // Prevent further execution if no result is returned

      res.status(201).json({
        message: "Welcome " + result.name,
        userid: result._id,
      });
    })
    .catch((err) => {
      console.error("Error during signup:", err);
      res
        .status(500)
        .json({ message: "Something went wrong. Please try again later." });
    });
};

exports.Login = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.param,
        message: error.msg,
      })),
    });
  }

  const { email, password } = req.body;
  let loadedUser;

  // Check if user exists
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "Email not found." });
      }
      loadedUser = user;
      // Check if password matches
      return bcrypt.compare(password, loadedUser.password);
    })
    .then((isPasswordValid) => {
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Incorrect password." });
      }

      // Generate JWT token
      const token = jwt.sign(
        { email: loadedUser.email, userId: loadedUser._id.toString() },
        process.env.JWT_SECRET || "somesupersecretsecret", // Secret from environment variables
        { expiresIn: "1h" }
      );

      // Set the token as an HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      res.status(200).json({
        message: "Welcome back, " + loadedUser.name,
        userid: loadedUser._id,
        token: token,
      });
    })
    .catch((err) => {
      console.error("Error during login:", err);
      res
        .status(500)
        .json({ message: "Something went wrong. Please try again later." });
    });
};

exports.Logout = (req, res, next) => {
  if (!req.userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }
  console.log(req.userId);

  User.findById(req.userId).then((user) => {
    user.token = null;
    user.save();
    req.userId = null;
    console.log(req.userId);
    res.status(200).json({ message: "Successfully logged out." });
  });
};

exports.getUser = (req, res, next) => {
  console.log("User request received", req.isAuth); // Log authentication status
  if (!req.isAuth) {
    return res.status(401).json({ message: "Not authenticated." });
  }

  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      res.status(200).json({
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    })
    .catch((err) => {
      console.error("Error fetching user data:", err);
      res
        .status(500)
        .json({ message: "Something went wrong. Please try again later." });
    });
};
