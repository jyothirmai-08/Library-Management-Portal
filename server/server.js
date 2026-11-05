const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in .env file");
}

const usersFile = path.join(__dirname, "users.json");

function readUsers() {
  const data = fs.readFileSync(usersFile, "utf8");
  return JSON.parse(data);
}

function saveUsers(data) {
  fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
}

// Check the login token
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please login first" });
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({
        message: "Please fill all fields"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters"
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
      return res.status(400).json({
        message: "Username must be 3-20 characters (letters, numbers, underscore)"
      });
    }

    const data = readUsers();

    const existingUser = data.users.find(
      user => user.username === cleanUsername
    );

    if (existingUser) {
      return res.status(409).json({
        message: "Username already exists. Please choose another."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      username: cleanUsername,
      password: hashedPassword
    };

    data.users.push(newUser);
    saveUsers(data);

    res.status(201).json({
      message: "Account created successfully. Please login."
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Enter username and password"
      });
    }

    const data = readUsers();

    const user = data.users.find(
      item => item.username === username.trim().toLowerCase()
    );

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

// CHANGE PASSWORD
app.put(
  "/api/auth/change-password",
  authenticateToken,
  async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          message: "Enter both old and new passwords"
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          message: "New password must contain at least 8 characters"
        });
      }

      const data = readUsers();

      const user = data.users.find(
        item => item.id === req.user.id
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const passwordMatch = await bcrypt.compare(
        oldPassword,
        user.password
      );

      if (!passwordMatch) {
        return res.status(400).json({
          message: "Old password is incorrect"
        });
      }

      user.password = await bcrypt.hash(newPassword, 12);
      saveUsers(data);

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Could not change password" });
    }
  }
);

// CHECK CURRENT USER
app.get("/api/auth/me", authenticateToken, (req, res) => {
  const data = readUsers();

  const user = data.users.find(item => item.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    id: user.id,
    name: user.name,
    username: user.username
  });
});

app.listen(PORT, () => {
  console.log(`Authentication server running at http://localhost:${PORT}`);
});
app.get("/", (req, res) => {
  res.send(`
    <h1>Library Management Portal</h1>
    <h2>Authentication Server is Running!</h2>
    <p>Backend is working successfully.</p>
  `);
});