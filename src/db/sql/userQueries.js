module.exports = {
  CREATE_TABLE: `
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    );
  `,
  GET_ALL: `
    SELECT id, name, email, created_at, updated_at
    FROM users
    ORDER BY id DESC;
  `,
  GET_BY_ID: `
    SELECT id, name, email, created_at, updated_at
    FROM users
    WHERE id = ?;
  `,
  CREATE: `
    INSERT INTO users (name, email)
    VALUES (?, ?);
  `,
  UPDATE: `
    UPDATE users
    SET name = ?, email = ?
    WHERE id = ?;
  `,
  DELETE: `
    DELETE FROM users
    WHERE id = ?;
  `,
};
