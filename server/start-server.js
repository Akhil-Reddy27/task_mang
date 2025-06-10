// Simple server startup script with better error handling
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

console.log("🚀 Starting EduTask Manager Server...")
console.log("📊 Environment Variables Check:")
console.log("- MONGODB_URI:", process.env.MONGODB_URI ? "✅ Set" : "❌ Missing")
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Missing")
console.log("- PORT:", process.env.PORT || "5001 (default)")

const app = express()

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    env: {
      NODE_ENV: process.env.NODE_ENV || "development",
      PORT: process.env.PORT || 5001,
    },
  })
})

// Test MongoDB connection first
async function connectToDatabase() {
  try {
    console.log("🔌 Connecting to MongoDB Atlas...")

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("✅ Connected to MongoDB Atlas successfully!")

    // Test the connection
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log(
      "📁 Available collections:",
      collections.map((c) => c.name),
    )

    return true
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message)
    return false
  }
}

// Load routes after DB connection
function loadRoutes() {
  try {
    console.log("📁 Loading application routes...")

    // Import User model first
    const User = require("./models/User")
    console.log("✅ User model loaded")

    // Simple registration route for testing
    app.post("/api/auth/register", async (req, res) => {
      try {
        console.log("=== REGISTRATION REQUEST ===")
        console.log("Request body:", { ...req.body, password: "[HIDDEN]" })

        const { fullName, email, password, role, institution, studentId, subjects } = req.body

        // Validate required fields
        if (!fullName || !email || !password || !role || !institution) {
          console.log("❌ Missing required fields")
          return res.status(400).json({
            message: "Missing required fields",
            required: ["fullName", "email", "password", "role", "institution"],
            received: Object.keys(req.body),
          })
        }

        // Check if user exists
        console.log("🔍 Checking if user exists...")
        const existingUser = await User.findOne({ email })
        if (existingUser) {
          console.log("❌ User already exists")
          return res.status(400).json({ message: "User already exists with this email" })
        }

        // Create user data
        const userData = {
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          password,
          role,
          institution: institution.trim(),
        }

        // Add role-specific fields
        if (role === "STUDENT") {
          userData.studentId = studentId || ""
          userData.enrolledSubjects = Array.isArray(subjects) ? subjects : []
        } else if (role === "TUTOR") {
          userData.subjects = Array.isArray(subjects) ? subjects : []
        }

        console.log("📝 Creating user with data:", { ...userData, password: "[HIDDEN]" })

        // Create and save user
        const user = new User(userData)
        await user.save()

        console.log("✅ User created successfully:", user._id)

        // Generate JWT token
        const jwt = require("jsonwebtoken")
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

        console.log("🔑 JWT token generated")

        // Success response
        res.status(201).json({
          message: "User registered successfully",
          token,
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            institution: user.institution,
            studentId: user.studentId,
            subjects: user.subjects,
            enrolledSubjects: user.enrolledSubjects,
          },
        })
      } catch (error) {
        console.error("❌ Registration error:", error)

        if (error.code === 11000) {
          return res.status(400).json({ message: "Email already exists" })
        }

        if (error.name === "ValidationError") {
          const errors = Object.values(error.errors).map((e) => e.message)
          return res.status(400).json({ message: "Validation failed", errors })
        }

        res.status(500).json({
          message: "Server error during registration",
          error: error.message,
        })
      }
    })

    // Simple login route
    app.post("/api/auth/login", async (req, res) => {
      try {
        console.log("=== LOGIN REQUEST ===")
        const { email, password } = req.body

        if (!email || !password) {
          return res.status(400).json({ message: "Email and password required" })
        }

        const User = require("./models/User")
        const user = await User.findOne({ email: email.toLowerCase() })

        if (!user) {
          return res.status(400).json({ message: "Invalid credentials" })
        }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
          return res.status(400).json({ message: "Invalid credentials" })
        }

        const jwt = require("jsonwebtoken")
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

        res.json({
          message: "Login successful",
          token,
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            institution: user.institution,
          },
        })
      } catch (error) {
        console.error("❌ Login error:", error)
        res.status(500).json({ message: "Server error", error: error.message })
      }
    })

    console.log("✅ Routes loaded successfully")
  } catch (error) {
    console.error("❌ Error loading routes:", error)
  }
}

// Error handling
app.use((error, req, res, next) => {
  console.error("❌ Unhandled error:", error)
  res.status(500).json({ message: "Internal server error", error: error.message })
})

// 404 handler
app.use("*", (req, res) => {
  console.log("❌ 404:", req.originalUrl)
  res.status(404).json({ message: "Route not found" })
})

// Start server
async function startServer() {
  const PORT = process.env.PORT || 5001

  // Connect to database first
  const dbConnected = await connectToDatabase()

  if (dbConnected) {
    loadRoutes()
  } else {
    console.log("⚠️ Starting server without database connection")
  }

  app.listen(PORT, () => {
    console.log("✅ Server started successfully!")
    console.log(`🌐 Server running on: http://localhost:${PORT}`)
    console.log(`🏥 Health check: http://localhost:${PORT}/health`)
    console.log("📡 Ready to accept requests!")
  })
}

startServer().catch((error) => {
  console.error("❌ Failed to start server:", error)
  process.exit(1)
})
