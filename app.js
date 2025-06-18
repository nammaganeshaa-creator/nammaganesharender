const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./model/userModel");
const Post = require("./model/postModel");
const Request = require("./model/requestModel");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const sendEmail = require("./nodemailer");

dotenv.config();

connectDB();

const app = express();
app.use(express.json());

app.post("/register", async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!phone) {
      return res.status(400).json({ error: "Phone is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ error: "Phone number already in use" });
    }

    const newUser = new User({ name, email, phone, password });
    const savedUser = await newUser.save();

    const { password: _, ...userWithoutPassword } = savedUser.toObject();

    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { input, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: input }, { phone: input }],
    });

    if (!user) {
      return res.status(400).json({ error: "User not found,Please Register" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const { password: _, ...userData } = user.toObject();
    
    res.status(200).json(userData);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/posts", async (req, res) => {
  const { name, tower, flat, date, japaName, japaCount, userId } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(400).json({ error: "User not found" });
    }

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }
    if (!tower) {
      return res.status(400).json({ error: "tower is required" });
    }
    if (!flat) {
      return res.status(400).json({ error: "flat is required" });
    }
    if (!date) {
      return res.status(400).json({ error: "date is required" });
    }
    if (!japaName) {
      return res.status(400).json({ error: "japaName is required" });
    }
    if (!japaCount) {
      return res.status(400).json({ error: "japaCount is required" });
    }

    const newPost = new Post({
      name,
      tower,
      flat,
      date,
      japaName,
      japaCount,
      userId,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ error: `${err}` });
  }
});

app.get("/posts/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(400).json({ error: "User not found" });
    }
    const posts = await Post.find({ userId });
    if (!posts || posts.length === 0) {
      return res.status(404).json({ error: "No posts found for this user" });
    }
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/request", async (req, res) => {
  const { name, phone, flat, tower, date, poojaName,userId } = req.body;
  try {
    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!phone) return res.status(400).json({ error: "Phone is required" });
    if (!flat) return res.status(400).json({ error: "Flat is required" });
    if (!tower) return res.status(400).json({ error: "Tower is required" });
    if (!date) return res.status(400).json({ error: "Date is required" });
    if (!poojaName) return res.status(400).json({ error: "Pooja name is required" });
    const newRequest = new Request({
      name,
      phone,
      tower,
      flat,
      date,
      poojaName,
      userId
    });

    const savedRequest = await newRequest.save();

    await sendEmail(name, phone, flat, tower, poojaName, date);
    res.status(201).send(savedRequest);
  } catch (err) {
    res.status(500).send(`Server error: ${err}`);
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
