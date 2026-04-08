const userService = require("../services/userService");

function parseId(rawValue) {
  const id = Number(rawValue);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validatePayload(payload) {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";

  if (!name || !email) {
    return null;
  }

  return { name, email };
}

async function listUsers(_req, res, next) {
  try {
    const users = await userService.getUsers();
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const payload = validatePayload(req.body);
    if (!payload) {
      return res.status(400).json({ message: "name and email are required." });
    }

    const user = await userService.createUser(payload);
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const payload = validatePayload(req.body);
    if (!payload) {
      return res.status(400).json({ message: "name and email are required." });
    }

    const updatedUser = await userService.updateUser(id, payload);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ data: updatedUser });
  } catch (error) {
    next(error);
  }
}

async function removeUser(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const deleted = await userService.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  removeUser,
};
