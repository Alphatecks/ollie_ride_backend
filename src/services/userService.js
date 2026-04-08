const { pool } = require("../config/db");
const userQueries = require("../db/sql/userQueries");

async function createUsersTable() {
  await pool.query(userQueries.CREATE_TABLE);
}

async function getUsers() {
  const [rows] = await pool.query(userQueries.GET_ALL);
  return rows;
}

async function getUserById(id) {
  const [rows] = await pool.query(userQueries.GET_BY_ID, [id]);
  return rows[0] || null;
}

async function createUser(payload) {
  const { name, email } = payload;
  const [result] = await pool.query(userQueries.CREATE, [name, email]);
  return getUserById(result.insertId);
}

async function updateUser(id, payload) {
  const { name, email } = payload;
  const [result] = await pool.query(userQueries.UPDATE, [name, email, id]);

  if (result.affectedRows === 0) {
    return null;
  }

  return getUserById(id);
}

async function deleteUser(id) {
  const [result] = await pool.query(userQueries.DELETE, [id]);
  return result.affectedRows > 0;
}

module.exports = {
  createUsersTable,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
