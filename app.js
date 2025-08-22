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
const Otp = require("./model/OtpModel");
const crypto= require("crypto");


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
  const { name, phone, flat, tower, date, poojaName, userId, nakshatra, gotra, rasi } = req.body;

  try {
    // Validate required fields
    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!phone) return res.status(400).json({ error: "Phone is required" });
    if (!flat) return res.status(400).json({ error: "Flat is required" });
    if (!tower) return res.status(400).json({ error: "Tower is required" });
    if (!date) return res.status(400).json({ error: "Date is required" });
    if (!poojaName) return res.status(400).json({ error: "Pooja name is required" });
    if (!nakshatra) return res.status(400).json({ error: "Nakshatra is required" });
    if (!gotra) return res.status(400).json({ error: "Gotra is required" });
    if (!rasi) return res.status(400).json({ error: "Rasi is required" });  // Validate Rasi

    // Create new request document including Rasi
    const newRequest = new Request({
      name,
      phone,
      tower,
      flat,
      date,
      poojaName,
      userId,
      nakshatra,
      gotra,
      rasi,  // Include Rasi
    });

    // Save the request
    const savedRequest = await newRequest.save();

    // Optionally send an email
    await sendEmail(name, phone, flat, tower, poojaName, date, nakshatra, rasi, gotra);

    // Return the saved request
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
  const { name, email, phone, tower, flat, nakshatra, gotra, rasi } = req.body;  // Include 'rasi' in the destructuring

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  // Ensure at least one field is provided for update
  if (!name && !email && !phone && !tower && !flat && !nakshatra && !gotra && !rasi) {
    return res.status(400).json({
      error: "At least one field (name, email, phone, tower, flat, nakshatra, gotra, rasi) is required to update",
    });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    let isChanged = false;

    // Name
    if (name && name !== user.name) {
      user.name = name;
      isChanged = true;
    }

    // Email
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return res.status(400).json({ error: "Email is already taken" });
      }
      user.email = email;
      isChanged = true;
    }

    // Phone
    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ phone, _id: { $ne: id } });
      if (phoneExists) {
        return res.status(400).json({ error: "Phone number is already taken" });
      }
      user.phone = phone;
      isChanged = true;
    }

    // Tower
    if (tower && tower !== user.tower) {
      user.tower = tower;
      isChanged = true;
    }

    // Flat
    if (flat && flat !== user.flat) {
      user.flat = flat;
      isChanged = true;
    }

    // Nakshatra
    if (nakshatra && nakshatra !== user.nakshatra) {
      user.nakshatra = nakshatra;
      isChanged = true;
    }

    // Gotra
    if (gotra && gotra !== user.gotra) {
      user.gotra = gotra;
      isChanged = true;
    }

    // Rasi (Zodiac Sign)
    if (rasi && rasi !== user.rasi) {
      user.rasi = rasi;  // Update the rasi
      isChanged = true;
    }

    if (!isChanged) {
      return res.status(200).json({ message: "No changes detected." });
    }

    const updatedUser = await user.save();
    const { password, ...safeUser } = updatedUser.toObject();

    // Include nakshatra, gotra, and rasi in the response as part of safeUser
    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        ...safeUser,  // Spread the other user fields
        nakshatra: updatedUser.nakshatra,  // Include Nakshatra
        gotra: updatedUser.gotra,           // Include Gotra
        rasi: updatedUser.rasi              // Include Rasi
      },
    });
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({ error: "Server error while updating profile" });
  }
});

app.get("/user-profile/:id", async (req, res) => {
  const { id } = req.params;

  // Check if the provided ID is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    // Fetch the user by ID
    const user = await User.findById(id);  // Don't use select here for better control

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user profile with Nakshatra, Gotra, and Rasi
    res.status(200).json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      tower: user.tower,
      flat: user.flat,
      nakshatra: user.nakshatra,  
      gotra: user.gotra,          
      rasi: user.rasi             
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Server error while fetching user profile" });
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

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ error: "Server error while updating password" });
  }
});

function generateOtp() {
  const otp = crypto.randomBytes(2).readUInt16BE(0) % 10000; 
  return otp.toString().padStart(4, "0");  
}

app.post("/forgot-password", async (req, res) => {
  try {
    let { email } = req.body;
    email = email.trim().toLowerCase(); 
    if (!email) {
      return res.status(400).json({ ok: false, message: "Email is required" });
    }
     const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ error: "User not found" });
    }
    const otp = generateOtp();

    const exitingOtp=await Otp.findOne({email})
    if(exitingOtp){
      await Otp.findByIdAndUpdate(exitingOtp._id,{otp})
    }else{
       await Otp.create({ email, otp });
    }

    console.log("OTP saved:", otp);
    await sendEmail.sendOtpEmail(email, otp);
    return res.json({
      ok: true,
      message: "OTP has been sent to your email", 
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ ok: false, message: "Failed to process request" });
  }
});

// OTP Validation and Password Update endpoint
async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// OTP Validation and Password Update
app.patch("/otp-update-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ ok: false, message: "All fields are required" });
    }

    // Fetch the latest OTP record for the given email
    const otpRecord = await Otp.findOne({ email }); 
    if (!otpRecord) {
      return res.status(400).json({ ok: false, message: "Invalid OTP" });
    }

    const isExpired = (Date.now() - otpRecord.updatedAt.getTime()) > 5 * 60 * 1000;
    if (isExpired) {
      return res.status(400).json({ ok: false, message: "OTP has expired. Please request a new one." });
    }
    if(otpRecord.otp !== otp){
      return res.status(400).json({ ok: false, message: "Invalid OTP" });
    }

    await otpRecord.deleteOne();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword; // Set the new hashed password
    await user.save(); // Save the updated user

    return res.json({ ok: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    return res.status(500).json({ ok: false, message: "Failed to update password" });
  }
});


const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));