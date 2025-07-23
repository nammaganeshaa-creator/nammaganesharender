const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./model/userModel");
const Post = require("./model/postModel");
const Request = require("./model/requestModel");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const sendEmail = require("./nodemailer");
const cron = require("node-cron");

dotenv.config();

connectDB();

const app = express();
app.use(express.json());

app.get("/api/ping", (req, res) => {
  res.status(200).send("pong");
});

cron.schedule("*/1 * * * *", async () => {
      const url = "https://japa-meev.onrender.com/api/ping"; 
      console.log(`[CRON] Self-ping at ${new Date().toLocaleTimeString()}`);
    //comment
      try {
        const response = await fetch(url);
        if (response.ok) {
          console.log("✅ Self-ping successful.");
        } else {
          console.error("⚠ Self-ping failed with status:", response.status);
        }
      } catch (error) {
        console.error("❌ Self-ping error:", error.message);
}});




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

app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid request ID" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deletedRequests = await Request.deleteMany({ userId: id }, { session });
    const deletedUser = await User.findByIdAndDelete(id, { session });

    if (!deletedUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "User not found" });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Profile Deleted Successfully",
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

app.patch("/update-profile/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  if (!name && !email && !phone) {
    return res.status(400).json({
      error: "At least one field (name, email, or phone) is required to update",
    });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    let isChanged = false;

    // Name check
    if (name && name !== user.name) {
      user.name = name;
      isChanged = true;
    }

    // Email check
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return res.status(400).json({ error: "Email is already taken" });
      }
      user.email = email;
      isChanged = true;
    }

    // Phone check
    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ phone, _id: { $ne: id } });
      if (phoneExists) {
        return res.status(400).json({ error: "Phone number is already taken" });
      }
      user.phone = phone;
      isChanged = true;
    }

    if (!isChanged) {
      return res.status(200).json({ message: "No changes detected." });
    }

    const updatedUser = await user.save();
    const { password, ...safeUser } = updatedUser.toObject();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({ error: "Server error while updating profile" });
  }
});

app.patch("/update-password/:id", async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  // Validate user ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  // Validate inputs
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both current and new passwords are required" });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Optionally prevent reuse of same password
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({ error: "New password must be different from the current one" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ error: "Server error while updating password" });
  }
});



const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));