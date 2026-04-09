const { Resend } = require("resend");
const env = require("../config/env");

function getResendClient() {
  if (!env.email.resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(env.email.resendApiKey);
}

async function sendSignupOtpEmail({ to, name, otpCode, expiresAt }) {
  if (!env.email.fromAddress) {
    throw new Error("EMAIL_FROM_ADDRESS is not configured.");
  }

  const resend = getResendClient();

  const subject = "Your Ollie Ride verification code";
  const text = [
    `Hi ${name},`,
    "",
    `Your Ollie Ride verification code is: ${otpCode}`,
    "",
    `This code will expire at: ${new Date(expiresAt).toISOString()}.`,
    "",
    "If you did not request this, you can safely ignore this email.",
  ].join("\n");

  await resend.emails.send({
    from: env.email.fromAddress,
    to,
    subject,
    text,
  });
}

async function sendPasswordResetOtpEmail({ to, name, otpCode, expiresAt }) {
  if (!env.email.fromAddress) {
    throw new Error("EMAIL_FROM_ADDRESS is not configured.");
  }

  const resend = getResendClient();

  const subject = "Reset your Ollie Ride password";
  const safeName = name && String(name).trim() ? String(name).trim() : "there";
  const text = [
    `Hi ${safeName},`,
    "",
    `Your Ollie Ride password reset code is: ${otpCode}`,
    "",
    `This code will expire at: ${new Date(expiresAt).toISOString()}.`,
    "",
    "If you did not request this, you can safely ignore this email.",
  ].join("\n");

  await resend.emails.send({
    from: env.email.fromAddress,
    to,
    subject,
    text,
  });
}

module.exports = {
  sendSignupOtpEmail,
  sendPasswordResetOtpEmail,
};
