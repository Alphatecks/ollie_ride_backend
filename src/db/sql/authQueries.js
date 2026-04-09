module.exports = {
  CREATE_AUTH_USERS_TABLE: `
    CREATE TABLE IF NOT EXISTS auth_users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      full_name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      phone_number VARCHAR(30) NOT NULL UNIQUE,
      country_code VARCHAR(8) NOT NULL DEFAULT '+880',
      gender VARCHAR(20) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      terms_accepted TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    );
  `,
  CREATE_SIGNUP_OTPS_TABLE: `
    CREATE TABLE IF NOT EXISTS signup_otps (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      email VARCHAR(160) NOT NULL UNIQUE,
      full_name VARCHAR(120) NOT NULL,
      phone_number VARCHAR(30) NOT NULL,
      country_code VARCHAR(8) NOT NULL DEFAULT '+880',
      gender VARCHAR(20) NOT NULL,
      terms_accepted TINYINT(1) NOT NULL DEFAULT 1,
      otp_code CHAR(5) NOT NULL,
      verified TINYINT(1) NOT NULL DEFAULT 0,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_signup_otps_email (email)
    );
  `,
  FIND_AUTH_USER_BY_EMAIL: `
    SELECT id, email
    FROM auth_users
    WHERE email = ?
    LIMIT 1;
  `,
  UPSERT_SIGNUP_OTP: `
    INSERT INTO signup_otps (
      email, full_name, phone_number, country_code, gender, terms_accepted, otp_code, verified, expires_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
    ON DUPLICATE KEY UPDATE
      full_name = VALUES(full_name),
      phone_number = VALUES(phone_number),
      country_code = VALUES(country_code),
      gender = VALUES(gender),
      terms_accepted = VALUES(terms_accepted),
      otp_code = VALUES(otp_code),
      verified = 0,
      expires_at = VALUES(expires_at);
  `,
  FIND_SIGNUP_OTP_BY_EMAIL: `
    SELECT id, email, full_name, phone_number, country_code, gender, terms_accepted, otp_code, verified, expires_at
    FROM signup_otps
    WHERE email = ?
    LIMIT 1;
  `,
  MARK_SIGNUP_OTP_VERIFIED: `
    UPDATE signup_otps
    SET verified = 1
    WHERE email = ?;
  `,
  CREATE_AUTH_USER: `
    INSERT INTO auth_users (
      full_name, email, phone_number, country_code, gender, password_hash, terms_accepted
    )
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `,
  FIND_AUTH_USER_BY_ID: `
    SELECT id, full_name, email, phone_number, country_code, gender, terms_accepted, created_at
    FROM auth_users
    WHERE id = ?
    LIMIT 1;
  `,
  DELETE_SIGNUP_OTP_BY_EMAIL: `
    DELETE FROM signup_otps
    WHERE email = ?;
  `,
};
