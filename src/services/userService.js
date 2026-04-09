const { pool } = require("../config/db");
const userQueries = require("../db/sql/userQueries");
const env = require("../config/env");
const { getSupabaseClient } = require("../config/supabase");

async function createUsersTable() {
  if (env.db.client === "supabase") {
    return;
  }

  await pool.query(userQueries.CREATE_TABLE);
}

async function getUsers() {
  if (env.db.client === "supabase") {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("users")
      .select("id,name,email,created_at,updated_at")
      .order("id", { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  const [rows] = await pool.query(userQueries.GET_ALL);
  return rows;
}

async function getUserById(id) {
  if (env.db.client === "supabase") {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("users")
      .select("id,name,email,created_at,updated_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data || null;
  }

  const [rows] = await pool.query(userQueries.GET_BY_ID, [id]);
  return rows[0] || null;
}

async function createUser(payload) {
  if (env.db.client === "supabase") {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("users")
      .insert(payload)
      .select("id,name,email,created_at,updated_at")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { name, email } = payload;
  const [result] = await pool.query(userQueries.CREATE, [name, email]);
  return getUserById(result.insertId);
}

async function updateUser(id, payload) {
  if (env.db.client === "supabase") {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", id)
      .select("id,name,email,created_at,updated_at");

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  }

  const { name, email } = payload;
  const [result] = await pool.query(userQueries.UPDATE, [name, email, id]);

  if (result.affectedRows === 0) {
    return null;
  }

  return getUserById(id);
}

async function deleteUser(id) {
  if (env.db.client === "supabase") {
    const supabase = getSupabaseClient();
    const { error, count } = await supabase
      .from("users")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) {
      throw error;
    }

    return Number(count) > 0;
  }

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
