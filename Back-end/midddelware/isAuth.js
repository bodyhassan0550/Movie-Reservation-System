const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    req.isAuth = false;
    return next();
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    req.isAuth = false;
    return next();
  }

  const token = parts[1];

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "somesupersecretsecret"); // Replace with your JWT secret
  } catch (err) {
    req.isAuth = false;
    return next();
  }

  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }

  req.userId = decodedToken.userId; // Store the decoded user ID in the request object

  req.isAuth = true;
  next();
};
