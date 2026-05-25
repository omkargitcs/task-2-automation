const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getCollection } = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-civic-key";

exports.signup = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "All fields required" });

  try {
    const usersCollection = getCollection("users");
    const userExists = await usersCollection.findOne({
      username: username.toLowerCase(),
    });
    if (userExists)
      return res.status(400).json({ error: "Username already taken" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      username: username.toLowerCase(),
      password: hashedPassword,
    };

    await usersCollection.insertOne(newUser);
    const token = jwt.sign({ username: newUser.username }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({ token, username: newUser.username });
  } catch (err) {
    res.status(500).json({ error: "Signup engine failure" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const usersCollection = getCollection("users");
    const user = await usersCollection.findOne({
      username: username.toLowerCase(),
    });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ username: user.username }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: "Login engine failure" });
  }
};
