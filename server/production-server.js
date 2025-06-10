const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const path = require("path")

// Load environment variables from the correct path
require("dotenv").config({ path: path.join(__dirname, "../.env") })

const app = express()

// Debug: Check environment variables
console.log("🔍 Environment Variables Check:")
console.log("- MONGODB_URI:", process.env.MONGODB_URI ? "✅ Set" : "❌ Not set")
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Not set")
console.log("- PORT:", process.env.PORT || "Using default 5001")

// Exit if critical env vars are missing
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is required!")
  console.error("Please check your .env file in the root directory")
  process.exit(1)
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET environment variable is required!")
  console.error("Please check your .env file in the root directory")
  process.exit(1)
}

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)
app.use(express.json())

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["STUDENT", "TUTOR"], required: true },
  institution: { type: String, required: true },
  studentId: { type: String },
  subjects: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
})

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

const User = mongoose.model("User", userSchema)

// Connect to MongoDB
console.log("🔌 Connecting to MongoDB Atlas...")
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas successfully!")
    console.log("📊 Database:", mongoose.connection.name)
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message)
    console.error("Please check your MONGODB_URI in the .env file")
  })

// Routes
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    env: {
      NODE_ENV: process.env.NODE_ENV || "development",
      PORT: process.env.PORT || "5001",
    },
  })
})

app.post("/api/auth/register", async (req, res) => {
  try {
    console.log("📝 Registration request received:", { ...req.body, password: "[HIDDEN]" })

    const { fullName, email, password, role, institution, studentId, subjects } = req.body

    // Validation
    if (!fullName || !email || !password || !role || !institution) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["fullName", "email", "password", "role", "institution"],
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log("❌ User already exists:", email)
      return res.status(400).json({ message: "User already exists with this email" })
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      password,
      role,
      institution,
      studentId,
      subjects,
    })

    await user.save()
    console.log("✅ User created successfully:", user._id)

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        institution: user.institution,
      },
      token,
    })
  } catch (error) {
    console.error("❌ Registration error:", error)
    if (error.code === 11000) {
      res.status(400).json({ message: "User already exists with this email" })
    } else {
      res.status(500).json({ message: "Registration failed", error: error.message })
    }
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("🔐 Login request received")

    // Handle both correct and incorrect request formats
    let email, password
    if (req.body.email && typeof req.body.email === "object") {
      email = req.body.email.email
      password = req.body.email.password
    } else {
      email = req.body.email
      password = req.body.password
    }

    console.log("Attempting login for:", email)

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      console.log("❌ User not found:", email)
      return res.status(400).json({ message: "Invalid email or password" })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      console.log("❌ Invalid password for:", email)
      return res.status(400).json({ message: "Invalid email or password" })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    console.log("✅ Login successful for:", email)

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        institution: user.institution,
      },
      token,
    })
  } catch (error) {
    console.error("❌ Login error:", error)
    res.status(500).json({ message: "Login failed", error: error.message })
  }
})

app.get("/api/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - No token provided" })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("❌ Auth verification error:", error)
    res.status(401).json({ message: "Invalid token" })
  }
})

// 404 handler
app.use("*", (req, res) => {
  console.log("❌ 404 - Route not found:", req.originalUrl)
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  })
})

// Start server
const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`
  🚀 Production server running!
  
  📡 Server listening on port ${PORT}
  🔗 Health check: http://localhost:${PORT}/health
  🔗 Register endpoint: http://localhost:${PORT}/api/auth/register (POST)
  🔗 Login endpoint: http://localhost:${PORT}/api/auth/login (POST)
  🔗 Me endpoint: http://localhost:${PORT}/api/auth/me (GET)
  
  This is the production server with MongoDB integration.
  `)
})
