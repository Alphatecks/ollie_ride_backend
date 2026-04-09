const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup/initiate", authController.signupInitiate);
router.post("/signup/verify-otp", authController.signupVerifyOtp);
router.post("/signup/complete", authController.signupComplete);

module.exports = router;
