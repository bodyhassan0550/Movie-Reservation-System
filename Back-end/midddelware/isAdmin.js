const User = require("../module/User");

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user || !user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You are not an admin" });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};