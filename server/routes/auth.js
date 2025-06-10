const express = require("express")
const jwt = require("jsonwebtoken")

const router = express.Router()

// Test route to verify auth routes are loaded
router.get("/test", (req, res) => {
  console.log("✅ Auth test route hit")
  res.json({
    message: "Auth routes are working",
    timestamp: new Date().toISOString(),
    availableRoutes: ["GET /api/auth/test", "POST /api/auth/register", "POST /api/auth/login", "GET /api/auth/me"],
  })
})

// Simple registration route (without User model first)
router.post("/register", async (req, res) => {
  try {
    console.log("=== REGISTRATION REQUEST RECEIVED ===")
    console.log("Request body:", { ...req.body, password: "[HIDDEN]" })

    const { fullName, email, password, role, institution, studentId, subjects } = req.body

    // Basic validation
    if (!fullName || !email || !password || !role || !institution) {
      console.log("❌ Missing required fields")
      return res.status(400).json({
        message: "Missing required fields",
        required: ["fullName", "email", "password", "role", "institution"],
        received: Object.keys(req.body),
      })
    }

    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET not configured")
      return res.status(500).json({
        message: "Server configuration error - JWT_SECRET missing",
      })
    }

    console.log("✅ Basic validation passed")

    // Try to load User model
    let User
    try {
      User = require("../models/User")
      console.log("✅ User model loaded successfully")
    } catch (error) {
      console.error("❌ Failed to load User model:", error.message)
      return res.status(500).json({
        message: "Database model error",
        error: error.message,
      })
    }

    // Check if user exists
    try {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        console.log("❌ User already exists with email:", email)
        return res.status(400).json({ message: "User already exists with this email" })
      }
      console.log("✅ Email is available")
    } catch (error) {
      console.error("❌ Database query error:", error.message)
      return res.status(500).json({
        message: "Database error",
        error: error.message,
      })
    }

    // Create user data
    const userData = {
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      institution: institution.trim(),
    }

    // Add conditional fields
    if (role === "STUDENT") {
      userData.studentId = studentId ? studentId.trim() : ""
      userData.enrolledSubjects = Array.isArray(subjects) ? subjects : []
    } else if (role === "TUTOR") {
      userData.subjects = Array.isArray(subjects) ? subjects : []
    }

    console.log("📝 Creating user with data:", { ...userData, password: "[HIDDEN]" })

    // Create and save user
    try {
      const user = new User(userData)
      await user.save()
      console.log("✅ User created successfully with ID:", user._id)

      // Generate token
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })
      console.log("🔑 JWT token generated")

      // Return success response
      const responseData = {
        message: "User created successfully",
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
      }

      console.log("✅ Registration successful for:", user.email)
      res.status(201).json(responseData)
    } catch (error) {
      console.error("❌ User creation error:", error)

      // Handle specific MongoDB errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0]
        return res.status(400).json({
          message: `${field} already exists`,
          error: "Duplicate key error",
        })
      }

      // Handle validation errors
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map((err) => err.message)
        return res.status(400).json({
          message: "Validation failed",
          errors: validationErrors,
        })
      }

      throw error
    }
  } catch (error) {
    console.error("❌ Registration error:", error)
    res.status(500).json({
      message: "Server error during registration",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})

// Simple login route
router.post("/login", async (req, res) => {
  try {
    console.log("=== LOGIN REQUEST RECEIVED ===")
    console.log("Login attempt for email:", req.body.email)

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    // Try to load User model
    let User
    try {
      User = require("../models/User")
    } catch (error) {
      return res.status(500).json({
        message: "Database model error",
        error: error.message,
      })
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      console.log("❌ User not found:", email)
      return res.status(400).json({ message: "Invalid email or password" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      console.log("❌ Invalid password for:", email)
      return res.status(400).json({ message: "Invalid email or password" })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

    console.log("✅ Login successful for:", user.email)

    res.json({
      message: "Login successful",
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
        lastLogin: user.lastLogin,
      },
    })
  } catch (error) {
    console.error("❌ Login error:", error)
    res.status(500).json({ message: "Server error during login", error: error.message })
  }
})

// Get current user
router.get("/me", async (req, res) => {
  try {
    // Simple response for now
    res.json({ message: "Me endpoint working", timestamp: new Date().toISOString() })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

console.log("📁 Auth routes module loaded")
module.exports = router
