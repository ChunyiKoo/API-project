// backend/routes/api/index.js
const router = require("express").Router();
// GET /api/set-token-cookie
const {
  setTokenCookie,
  restoreUser,
  requireAuth,
} = require("../../utils/auth.js");
const { User } = require("../../db/models");

const sessionRouter = require("../../routes/api/session.js");
const usersRouter = require("../../routes/api/users.js");

// Make sure to keep the restoreUser middleware connected before any other middleware or route handlers are connected to the router. This will allow all route handlers connected to this router to retrieve the current user on the Request object as req.user. If there is a valid current user session, then req.user will be set to the User in the database. If there is NO valid current user session, then req.user will be set to null.

router.use(restoreUser);
router.use("/session", sessionRouter);
router.use("/users", usersRouter);

// router.get("/set-token-cookie", async (_req, res) => {
//   const user = await User.findOne({
//     where: {
//       username: "Demo-lition",
//     },
//   });
//   setTokenCookie(res, user);
//   return res.json({ user: user });
// });

router.post("/test", function (req, res) {
  res.json({ requestBody: req.body });
});

// router.get("/restore-user", (req, res) => {
//   return res.json(req.user);
// });

// router.get("/require-auth", requireAuth, (req, res) => {
//   return res.json(req.user);
// });

module.exports = router;
