const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const env = require("../config/env");
const { getSupabaseClient } = require("../config/supabase");
const authQueries = require("../db/sql/authQueries");

function getOtpExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + env.auth.otpTtlMinutes);
  return expiresAt;
}

function generateOtpCode() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function getFullPhoneNumber(countryCode, phoneNumber) {
  return `${countryCode}${phoneNumber}`;
}

function isExpired(expiresAt) {
  return new Date(expiresAt).getTime() < Date.now();
}

async function initializeAuthTables() {
  if (env.db.client === "supabase") {
    return;
  }

  await pool.query(authQueries.CREATE_AUTH_USERS_TABLE);
  await pool.query(authQueries.CREATE_SIGNUP_OTPS_TABLE);
}

async function checkAccountExistsByEmail(email) {
  if (env.db.client === "supabase") {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("auth_users")
      .select("id,email")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return Boolean(data);
  }

  const [rows] = await pool.query(authQueries.FIND_AUTH_USER_BY_EMAIL, [email]);
  return rows.length > 0;
}

async function storeSignupOtp(payload) {
  const normalizedEmail = normalizeEmail(payload.email);
  const otpCode = generateOtpCode();
  const expiresAt = getOtpExpiryDate();

  const record = {
    email: normalizedEmail,
    full_name: payload.name.trim(),
    phone_number: getFullPhoneNumber(payload.countryCode, payload.phoneNumber),
    country_code: payload.countryCode,
    gender: payload.gender.trim(),
    terms_accepted: Boolean(payload.termsAccepted),
    otp_code: otpCode,
    expires_at: expiresAt.toISOString(),
  };

  if (env.db.client === "supabase") {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("signup_otps")
      .upsert(record, { onConflict: "email" });

    if (error) {
      throw error;
    }
  } else {
    await pool.query(authQueries.UPSERT_SIGNUP_OTP, [
      record.email,
      record.full_name,
      record.phone_number,
      record.country_code,
      record.gender,
      record.terms_accepted ? 1 : 0,
      record.otp_code,
      expiresAt,
    ]);
  }

  return {
    email: normalizedEmail,
    otpCode,
    expiresAt: expiresAt.toISOString(),
  };
}

async function verifySignupOtp(email, otp) {
  const normalizedEmail = normalizeEmail(email);

  if (env.db.client === "supabase") {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("signup_otps")
      .select(
        "email,full_name,phone_number,country_code,gender,terms_accepted,otp_code,verified,expires_at"
      )
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return { ok: false, code: "NOT_FOUND" };
    }

    if (isExpired(data.expires_at)) {
      return { ok: false, code: "OTP_EXPIRED" };
    }

    if (data.otp_code !== otp) {
      return { ok: false, code: "OTP_INVALID" };
    }

    if (!data.verified) {
      const { error: updateError } = await supabase
        .from("signup_otps")
        .update({ verified: true })
        .eq("email", normalizedEmail);

      if (updateError) {
        throw updateError;
      }
    }

    return { ok: true };
  }

  const [rows] = await pool.query(authQueries.FIND_SIGNUP_OTP_BY_EMAIL, [
    normalizedEmail,
  ]);

  if (rows.length === 0) {
    return { ok: false, code: "NOT_FOUND" };
  }

  const signup = rows[0];

  if (isExpired(signup.expires_at)) {
    return { ok: false, code: "OTP_EXPIRED" };
  }

  if (signup.otp_code !== otp) {
    return { ok: false, code: "OTP_INVALID" };
  }

  if (!signup.verified) {
    await pool.query(authQueries.MARK_SIGNUP_OTP_VERIFIED, [normalizedEmail]);
  }

  return { ok: true };
}

async function completeSignup(email, password) {
  const normalizedEmail = normalizeEmail(email);

  if (env.db.client === "supabase") {
    const supabase = getSupabaseClient();
    const { data: signup, error } = await supabase
      .from("signup_otps")
      .select(
        "email,full_name,phone_number,country_code,gender,terms_accepted,verified,expires_at"
      )
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!signup) {
      return { ok: false, code: "NOT_FOUND" };
    }

    if (!signup.verified) {
      return { ok: false, code: "OTP_NOT_VERIFIED" };
    }

    if (isExpired(signup.expires_at)) {
      return { ok: false, code: "OTP_EXPIRED" };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { data: user, error: insertError } = await supabase
      .from("auth_users")
      .insert({
        full_name: signup.full_name,
        email: signup.email,
        phone_number: signup.phone_number,
        country_code: signup.country_code,
        gender: signup.gender,
        password_hash: passwordHash,
        terms_accepted: signup.terms_accepted,
      })
      .select(
        "id,full_name,email,phone_number,country_code,gender,terms_accepted,created_at"
      )
      .single();

    if (insertError) {
      throw insertError;
    }

    const { error: deleteError } = await supabase
      .from("signup_otps")
      .delete()
      .eq("email", normalizedEmail);

    if (deleteError) {
      throw deleteError;
    }

    return { ok: true, user };
  }

  const [rows] = await pool.query(authQueries.FIND_SIGNUP_OTP_BY_EMAIL, [
    normalizedEmail,
  ]);

  if (rows.length === 0) {
    return { ok: false, code: "NOT_FOUND" };
  }

  const signup = rows[0];

  if (!signup.verified) {
    return { ok: false, code: "OTP_NOT_VERIFIED" };
  }

  if (isExpired(signup.expires_at)) {
    return { ok: false, code: "OTP_EXPIRED" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(authQueries.CREATE_AUTH_USER, [
    signup.full_name,
    signup.email,
    signup.phone_number,
    signup.country_code,
    signup.gender,
    passwordHash,
    signup.terms_accepted ? 1 : 0,
  ]);

  const [userRows] = await pool.query(authQueries.FIND_AUTH_USER_BY_ID, [
    result.insertId,
  ]);

  await pool.query(authQueries.DELETE_SIGNUP_OTP_BY_EMAIL, [normalizedEmail]);

  return { ok: true, user: userRows[0] || null };
}

module.exports = {
  initializeAuthTables,
  checkAccountExistsByEmail,
  storeSignupOtp,
  verifySignupOtp,
  completeSignup,
};
