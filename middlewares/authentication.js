const { validateToken } = require("../service/authentication");
const { User } = require("../models/user");

function checkForAuthenicationCookie(cookieName) {
  return async function (req, res, next) {
    const token = req.cookies[cookieName];

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const userPayload = validateToken(token);
      const user = await User.findById(userPayload._id);  // 🔥 fetch full user

      req.user = user; // 💥 this is the actual user (not just payload)
      res.locals.user = user; // 💥 now accessible in all EJS views
    } catch (err) {
      req.user = null;
      res.locals.user = null;
    }

    next();
  };
}

module.exports = { checkForAuthenicationCookie };
