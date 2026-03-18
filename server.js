const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const cron = require("node-cron");
const fs = require('fs');
const nodemailer = require("nodemailer");

const app = express();

// ===========================
// CORS & MIDDLEWARE
// ===========================
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ===========================
// IMAGE STORAGE
// ===========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
app.use("/uploads", express.static("uploads"));

// ===========================
// MONGODB CONNECTION
// ===========================
mongoose
  .connect(
    "mongodb://reicha:charm123@ac-rrphu9p-shard-00-00.vnlcxrd.mongodb.net:27017,ac-rrphu9p-shard-00-01.vnlcxrd.mongodb.net:27017,ac-rrphu9p-shard-00-02.vnlcxrd.mongodb.net:27017/?ssl=true&replicaSet=atlas-sajxzk-shard-0&authSource=admin&appName=Cluster0",
    {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    }
  )
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch((err) => {
    console.error("❌ CONNECTION FAILED:", err.message);
    process.exit(1);
  });

// ===========================
// SCHEMAS
// ===========================
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["employee", "admin"], default: "employee" },
    section: { type: String, default: "Inventory" },
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

const productSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    stock: Number,
    section: { type: String, default: "Inventory" },
    image: String,
  },
  { timestamps: true }
);
const Product = mongoose.model("Product", productSchema);

const earningsSchema = new mongoose.Schema(
  { employeeEmail: String, amount: Number, month: Number, year: Number },
  { timestamps: true }
);
const Earnings = mongoose.model("Earnings", earningsSchema);

const reportSchema = new mongoose.Schema({
  dailyEarnings: { type: Number, default: 0 },
  dailyHistory: [{ date: String, total: Number }],
});
const Report = mongoose.model("Report", reportSchema);

// ===========================
// MIDDLEWARE
// ===========================
const inventoryAccess = async (req, res, next) => {
  try {
    const userId = req.headers.userid;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "admin" || user.section === "Inventory") return next();
    return res.status(403).json({ error: "Inventory access only" });
  } catch (err) {
    res.status(500).json({ error: "Access validation failed" });
  }
};

// ===========================
// EMAIL / NODEMAILER SETUP
// ===========================
const verificationCodes = {}; // temporary store for codes

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "andresvivi143@gmail.com",
    pass: "bkvqqditbtcoqfad"
  }
});

// ===========================
// AUTH ROUTES
// ===========================

app.post("/api/send-code", async (req, res) => {
  try {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000);
    verificationCodes[email] = code;

    await transporter.sendMail({
      from: "FarmOps System",
      to: email,
      subject: "FarmOps Email Verification",
      text: `Your verification code is: ${code}`
    });
    res.json({ message: "Verification code sent" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password, section, code } = req.body;
    if (verificationCodes[email] != code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }
    delete verificationCodes[email];

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      firstName, middleName, lastName, email,
      password: hashed, section, role: "employee", status: "pending"
    });
    await user.save();
    res.json({ message: "Account created. Waiting for admin approval." });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/register-admin", async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password, code } = req.body;
    if (verificationCodes[email] != code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }
    delete verificationCodes[email];

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const admin = new User({
      firstName, middleName, lastName, email: email.trim().toLowerCase(),
      password: hashed, role: "admin", section: "Admin", status: "approved",
    });
    await admin.save();
    res.status(201).json({ message: "Admin verified and created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });
    if (user.status !== "approved") return res.status(403).json({ error: "Waiting for admin approval" });

    res.json({
      message: "Login success",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        section: user.section,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ===========================
// NEW: FORGOT PASSWORD ROUTES
// ===========================

app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ error: "Email not found" });

    const code = Math.floor(100000 + Math.random() * 900000);
    verificationCodes[email] = code;

    await transporter.sendMail({
      from: "FarmOps System",
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${code}`
    });
    res.json({ message: "Reset code sent to email" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send reset email" });
  }
});

app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (verificationCodes[email] != code) {
      return res.status(400).json({ error: "Invalid reset code" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email: email.trim().toLowerCase() }, { password: hashed });
    delete verificationCodes[email];

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update password" });
  }
});

// ===========================
// EMPLOYEE MANAGEMENT
// ===========================
app.get("/api/employees", async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

app.put("/api/employees/approve/:id", async (req, res) => {
  try {
    const emp = await User.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
    if (!emp) return res.status(404).json({ error: "Employee not found" });
    res.json({ message: "Employee approved", employee: emp });
  } catch (err) {
    res.status(500).json({ error: "Approval failed" });
  }
});

app.delete("/api/employees/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ===========================
// PRODUCTS
// ===========================
app.post("/api/products", inventoryAccess, upload.single("image"), async (req, res) => {
  try {
    const { name, price, stock, section } = req.body;
    if (!name || !price || !stock) return res.status(400).json({ error: "Missing product fields" });
    const product = new Product({
      name, price, stock, section,
      image: req.file ? `/uploads/${req.file.filename}` : ""
    });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Product creation failed" });
  }
});

app.get("/api/products", inventoryAccess, async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.put("/api/products/:id", inventoryAccess, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
});

app.delete("/api/products/:id", inventoryAccess, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
});

// ===========================
// EARNINGS
// ===========================
app.get("/api/earnings", async (req, res) => {
  const history = await Earnings.find().sort({ createdAt: -1 });
  res.json(history);
});

app.post("/api/earnings", async (req, res) => {
  try {
    const { employeeEmail, amount } = req.body;
    const now = new Date();
    const today = now.toLocaleDateString();

    await new Earnings({
      employeeEmail, amount: Number(amount),
      month: now.getMonth() + 1, year: now.getFullYear(),
    }).save();

    const report = await Report.findOneAndUpdate({}, { $inc: { dailyEarnings: Number(amount) } }, { upsert: true, new: true });

    const existingIndex = report.dailyHistory.findIndex(d => d.date === today);
    if (existingIndex >= 0) {
      report.dailyHistory[existingIndex].total += Number(amount);
    } else {
      report.dailyHistory.push({ date: today, total: Number(amount) });
    }
    await report.save();
    res.json({ message: "Income recorded" });
  } catch (err) {
    res.status(500).json({ error: "Submit failed" });
  }
});

app.delete("/api/earnings/:id", async (req, res) => {
  try {
    await Earnings.findByIdAndDelete(req.params.id);
    const today = new Date().toLocaleDateString();
    const all = await Earnings.find();
    const newDaily = all
      .filter((e) => new Date(e.createdAt).toLocaleDateString() === today)
      .reduce((sum, e) => sum + e.amount, 0);
    await Report.findOneAndUpdate({}, { dailyEarnings: newDaily });
    res.json({ message: "Deleted and recalculated" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// ===========================
// DASHBOARD / REPORTS
// ===========================
app.get("/api/reports", async (req, res) => {
  try {
    const today = new Date().toLocaleDateString();
    let report = await Report.findOne();
    if (!report) {
      report = new Report({ dailyEarnings: 0, dailyHistory: [] });
      await report.save();
    }
    const lastEntry = report.dailyHistory[report.dailyHistory.length - 1];
    if (!lastEntry || lastEntry.date !== today) {
      report.dailyHistory.push({ date: today, total: 0 });
      report.dailyEarnings = 0;
      await report.save();
    }
    res.json({ dailyEarnings: report.dailyEarnings, dailyHistory: report.dailyHistory });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// ===========================
// CRON JOB
// ===========================
cron.schedule("0 0 * * *", async () => {
  const report = await Report.findOne();
  if (report) {
    report.dailyHistory.push({ date: new Date().toLocaleDateString(), total: report.dailyEarnings });
    report.dailyEarnings = 0;
    await report.save();
    console.log("Daily earnings reset to 0");
  }
}, { timezone: "Asia/Manila" });

// ===========================
// SERVER START
// ===========================
app.get("/", (req, res) => res.send("🚀 FarmOps Server Running"));
app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));