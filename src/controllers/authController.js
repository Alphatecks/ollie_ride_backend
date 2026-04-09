const env = require("../config/env");
const authService = require("../services/authService");
const {
  sendSignupOtpEmail,
  sendPasswordResetOtpEmail,
} = require("../services/emailService");

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function isValidPhoneNumber(value) {
  return /^[0-9]{6,15}$/.test(String(value).trim());
}

function isValidOtp(value) {
  return /^[0-9]{5}$/.test(String(value).trim());
}

function normalizeCountryCode(value) {
  const raw = typeof value === "string" && value.trim() ? value.trim() : "+880";
  return raw.startsWith("+") ? raw : `+${raw}`;
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const result = await authService.login(email, password);

    if (!result.ok) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.json({
      message: "Login successful.",
      auth_token: result.authToken,
      user: authService.toMeUserShape(result.user),
    });
  } catch (error) {
    next(error);
  }
}

async function signupInitiate(req, res, next) {
  try {
    const { name, email, phoneNumber, countryCode, gender, termsAccepted } = req.body;

    if (
      !name ||
      !email ||
      !phoneNumber ||
      !gender ||
      typeof termsAccepted !== "boolean"
    ) {
      return res.status(400).json({ message: "Missing required signup fields." });
    }

    if (!termsAccepted) {
      return res
        .status(400)
        .json({ message: "termsAccepted must be true to continue." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({
        message: "Invalid phoneNumber. Use digits only (6 to 15 characters).",
      });
    }

    const accountExists = await authService.checkAccountExistsByEmail(email);
    if (accountExists) {
      return res.status(409).json({ message: "Account already exists for this email." });
    }

    const otpRecord = await authService.storeSignupOtp({
      name,
      email,
      phoneNumber,
      countryCode: normalizeCountryCode(countryCode),
      gender,
      termsAccepted,
    });

    try {
      await sendSignupOtpEmail({
        to: otpRecord.email,
        name,
        otpCode: otpRecord.otpCode,
        expiresAt: otpRecord.expiresAt,
      });
    } catch (emailError) {
      return res.status(500).json({
        message: "Failed to send verification email. Please try again.",
      });
    }

    const response = {
      message: "OTP generated. Proceed to verification step.",
      email: otpRecord.email,
      otpExpiresAt: otpRecord.expiresAt,
    };

    if (env.nodeEnv !== "production") {
      response.devOtp = otpRecord.otpCode;
    }

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

async function signupVerifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "email and otp are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    if (!isValidOtp(otp)) {
      return res.status(400).json({ message: "OTP must be a 5-digit code." });
    }

    const result = await authService.verifySignupOtp(email, otp);

    if (!result.ok) {
      if (result.code === "NOT_FOUND") {
        return res.status(404).json({ message: "Signup session not found." });
      }

      if (result.code === "OTP_EXPIRED") {
        return res.status(410).json({ message: "OTP has expired. Request a new one." });
      }

      if (result.code === "OTP_INVALID") {
        return res.status(400).json({ message: "Invalid OTP." });
      }
    }

    res.json({ message: "OTP verified. Proceed to password setup." });
  } catch (error) {
    next(error);
  }
}

async function signupComplete(req, res, next) {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "email, password and confirmPassword are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    if (password.length < env.auth.passwordMinLength) {
      return res.status(400).json({
        message: `Password must be at least ${env.auth.passwordMinLength} characters.`,
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const result = await authService.completeSignup(email, password);

    if (!result.ok) {
      if (result.code === "NOT_FOUND") {
        return res.status(404).json({ message: "Signup session not found." });
      }

      if (result.code === "OTP_NOT_VERIFIED") {
        return res
          .status(400)
          .json({ message: "OTP must be verified before setting password." });
      }

      if (result.code === "OTP_EXPIRED") {
        return res.status(410).json({ message: "OTP has expired. Request a new one." });
      }
    }

    res.status(201).json({
      message: "Signup completed successfully.",
      auth_token: result.authToken,
      user: authService.toMeUserShape(result.user),
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getCurrentUserFromTokenPayload(req.auth);
    if (!user) {
      return res.status(401).json({ message: "Invalid session." });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
}

async function forgotPasswordInitiate(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "email is required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const otpRecord = await authService.requestPasswordResetOtp(email);

    if (otpRecord.userExists) {
      try {
        await sendPasswordResetOtpEmail({
          to: otpRecord.email,
          name: otpRecord.name,
          otpCode: otpRecord.otpCode,
          expiresAt: otpRecord.expiresAt,
        });
      } catch (emailError) {
        return res.status(500).json({
          message: "Failed to send reset email. Please try again.",
        });
      }
    }

    const response = {
      message: "If an account exists, a reset code has been sent to the email.",
      email: otpRecord.email,
      otpExpiresAt: otpRecord.expiresAt,
    };

    if (env.nodeEnv !== "production") {
      response.devOtp = otpRecord.otpCode;
      response.devUserExists = otpRecord.userExists;
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

async function forgotPasswordVerifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "email and otp are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    if (!isValidOtp(otp)) {
      return res.status(400).json({ message: "OTP must be a 5-digit code." });
    }

    const result = await authService.verifyPasswordResetOtp(email, otp);

    if (!result.ok) {
      if (result.code === "NOT_FOUND") {
        return res.status(404).json({ message: "Reset session not found." });
      }
      if (result.code === "OTP_EXPIRED") {
        return res.status(410).json({ message: "OTP has expired. Request a new one." });
      }
      if (result.code === "OTP_INVALID") {
        return res.status(400).json({ message: "Invalid OTP." });
      }
    }

    res.json({ message: "OTP verified. Proceed to set a new password." });
  } catch (error) {
    next(error);
  }
}

async function forgotPasswordReset(req, res, next) {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "email, password and confirmPassword are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    if (password.length < env.auth.passwordMinLength) {
      return res.status(400).json({
        message: `Password must be at least ${env.auth.passwordMinLength} characters.`,
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const result = await authService.resetPasswordWithOtp(email, password);

    if (!result.ok) {
      if (result.code === "NOT_FOUND") {
        return res.status(404).json({ message: "Reset session not found." });
      }
      if (result.code === "OTP_NOT_VERIFIED") {
        return res.status(400).json({ message: "OTP must be verified first." });
      }
      if (result.code === "OTP_EXPIRED") {
        return res.status(410).json({ message: "OTP has expired. Request a new one." });
      }
    }

    res.json({ message: "Password reset successful." });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  me,
  signupInitiate,
  signupVerifyOtp,
  signupComplete,
  forgotPasswordInitiate,
  forgotPasswordVerifyOtp,
  forgotPasswordReset,
};
