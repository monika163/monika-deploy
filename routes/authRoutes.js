const express = require("express");
const {
  registerController,
  forgotpasswordController,
  updateProfileController
} = require("../controllers/authController");
const { loginController } = require("../controllers/authController");
const { testController } = require("../controllers/authController");
const { requireSignIn } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/authMiddleware");

//router object
const router = express.Router();

//routing
//register || method - post
router.post("/register", registerController);

// login
router.post("/login", loginController);

//forgot password || POST
//Forgot Password || POST
router.post("/forgot-password", forgotpasswordController);

//test routes
router.get("/test", requireSignIn, isAdmin, testController);

//protected user route auth
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

//protected admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//update profile
router.put("/profile", requireSignIn, updateProfileController);

module.exports = router;
