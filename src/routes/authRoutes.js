const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/login", authController.login);

router.post("/signup/initiate", authController.signupInitiate);
router.post("/signup/verify-otp", authController.signupVerifyOtp);
router.post("/signup/complete", authController.signupComplete);

router.post("/forgot-password/initiate", authController.forgotPasswordInitiate);
router.post("/forgot-password/verify-otp", authController.forgotPasswordVerifyOtp);
router.post("/forgot-password/reset", authController.forgotPasswordReset);

module.exports = router;
