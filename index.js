require('dotenv').config();

const authMiddleware = require("./authMiddleware");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const app = express();
const SECRET_KEY = "blair";


app.use(cors({
  origin: "https://huamemofe.vercel.app"
}));

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));


app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created!" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1d" });
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

const Entry = require("./models/Entry");


//creating entyr
app.post("/entries", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  try {
    const newEntry = new Entry({ userId: req.userId, title, content });
    await newEntry.save();
    res.status(201).json({ message: "Entry created", entry: newEntry });
  } catch (err) {
    res.status(500).json({ error: "Failed to create entry" });
  }
});


app.get("/entries", authMiddleware, async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.userId }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});


//this deletes entries lol
app.delete("/entries/:id", authMiddleware, async (req, res) => {
  try {
    await Entry.deleteOne({ _id: req.params.id, userId: req.userId });
    res.json({ message: "Entry deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete entry" });
  }
});



app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
