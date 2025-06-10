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

// Auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "No token provided, authorization denied" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" })
    }
    res.status(401).json({ message: "Invalid token, authorization denied" })
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["STUDENT", "TUTOR"], required: true },
  institution: { type: String, required: true },
  studentId: { type: String },
  subjects: [{ type: String }],
  enrolledSubjects: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}

const User = mongoose.model("User", userSchema)

// Exam Schema
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ["SINGLE", "MULTIPLE"], default: "SINGLE" },
  options: [{
    text: String,
    isCorrect: Boolean,
  }],
  explanation: { type: String },
  topic: { type: String },
  difficulty: { type: String, enum: ["EASY", "MEDIUM", "HARD"], default: "MEDIUM" },
  points: { type: Number, default: 1 },
})

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String, required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  questions: [questionSchema],
  duration: { type: Number, required: true }, // in minutes
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  attemptLimit: { type: Number, default: 1 },
  passingScore: { type: Number, default: 60 },
  showResultsImmediately: { type: Boolean, default: false },
  showCorrectAnswers: { type: Boolean, default: false },
  randomizeQuestions: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
})

const Exam = mongoose.model("Exam", examSchema)

// Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], default: "MEDIUM" },
  status: { type: String, enum: ["ASSIGNED", "IN_PROGRESS", "SUBMITTED", "REVIEWED", "COMPLETED"], default: "ASSIGNED" },
  instructions: { type: String },
  maxScore: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
})

const Task = mongoose.model("Task", taskSchema)

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

// Users route - Get all users with optional role filtering
app.get("/api/users", auth, async (req, res) => {
  try {
    console.log("=== USERS REQUEST RECEIVED ===")
    console.log("Query params:", req.query)
    console.log("User making request:", req.user)

    const { role, search, page = 1, limit = 20 } = req.query

    const query = { isActive: { $ne: false } }

    // Filter by role if specified
    if (role) {
      query.role = role.toUpperCase()
      console.log("Filtering by role:", role.toUpperCase())
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } }, 
        { email: { $regex: search, $options: "i" } }
      ]
    }

    console.log("MongoDB query:", query)

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const total = await User.countDocuments(query)

    console.log(`✅ Found ${users.length} users out of ${total} total`)

    res.json({
      success: true,
      users,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("❌ Users fetch error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    })
  }
})

// Registration route
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

    // Create new user
    const user = new User(userData)
    await user.save()
    console.log("✅ User created successfully:", user._id)

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.status(201).json({
      message: "Registration successful",
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

// Login route
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
    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      console.log("❌ User not found:", email)
      return res.status(400).json({ message: "Invalid email or password" })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      console.log("❌ Invalid password for:", email)
      return res.status(400).json({ message: "Invalid email or password" })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

    console.log("✅ Login successful for:", email)

    res.json({
      message: "Login successful",
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
      token,
    })
  } catch (error) {
    console.error("❌ Login error:", error)
    res.status(500).json({ message: "Login failed", error: error.message })
  }
})

// Get current user
app.get("/api/auth/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("❌ Auth verification error:", error)
    res.status(401).json({ message: "Invalid token" })
  }
})

// Tasks routes
app.get("/api/tasks", auth, async (req, res) => {
  try {
    console.log("=== TASKS REQUEST RECEIVED ===")
    
    const query = { isActive: { $ne: false } }

    if (req.user.role === "TUTOR") {
      query.tutor = req.user.userId
    } else if (req.user.role === "STUDENT") {
      query.assignedTo = req.user.userId
    }

    const tasks = await Task.find(query)
      .populate("tutor", "fullName email")
      .populate("assignedTo", "fullName email studentId")
      .sort({ createdAt: -1 })

    console.log(`✅ Found ${tasks.length} tasks`)
    res.json(tasks)
  } catch (error) {
    console.error("❌ Tasks error:", error)
    res.status(500).json({ message: "Error fetching tasks", error: error.message })
  }
})

app.post("/api/tasks", auth, async (req, res) => {
  try {
    console.log("=== CREATE TASK REQUEST ===")
    
    if (req.user.role !== "TUTOR") {
      return res.status(403).json({ message: "Only tutors can create tasks" })
    }

    const task = new Task({
      ...req.body,
      tutor: req.user.userId,
    })

    await task.save()
    await task.populate("tutor", "fullName email")
    await task.populate("assignedTo", "fullName email studentId")

    console.log("✅ Task created successfully:", task._id)
    res.status(201).json({
      message: "Task created successfully",
      task,
    })
  } catch (error) {
    console.error("❌ Create task error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Exams routes
app.get("/api/exams", auth, async (req, res) => {
  try {
    console.log("=== EXAMS REQUEST RECEIVED ===")
    console.log("User role:", req.user.role)
    console.log("User ID:", req.user.userId)
    
    const query = { isActive: { $ne: false } }

    if (req.user.role === "TUTOR") {
      query.tutor = req.user.userId
      console.log("Fetching exams for tutor:", req.user.userId)
    } else if (req.user.role === "STUDENT") {
      query.assignedTo = req.user.userId
      console.log("Fetching exams assigned to student:", req.user.userId)
    }

    console.log("Query:", query)

    const exams = await Exam.find(query)
      .populate("tutor", "fullName")
      .populate("assignedTo", "fullName email")
      .sort({ createdAt: -1 })

    console.log(`✅ Found ${exams.length} exams`)
    
    // Log exam details for debugging
    exams.forEach(exam => {
      console.log(`Exam: ${exam.title}, Assigned to: ${exam.assignedTo.length} students`)
    })
    
    res.json(exams)
  } catch (error) {
    console.error("❌ Exams error:", error)
    res.status(500).json({ message: "Error fetching exams", error: error.message })
  }
})

app.post("/api/exams", auth, async (req, res) => {
  try {
    console.log("=== CREATE EXAM REQUEST ===")
    console.log("Request body:", { ...req.body, questions: `${req.body.questions?.length || 0} questions` })
    
    if (req.user.role !== "TUTOR") {
      return res.status(403).json({ message: "Only tutors can create exams" })
    }

    // Validate required fields
    const { title, subject, startDate, endDate, assignedTo, questions } = req.body

    if (!title || !subject || !startDate || !endDate) {
      return res.status(400).json({ 
        message: "Missing required fields",
        required: ["title", "subject", "startDate", "endDate"]
      })
    }

    if (!assignedTo || assignedTo.length === 0) {
      return res.status(400).json({ message: "Please assign the exam to at least one student" })
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: "Please add at least one question" })
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()

    if (start <= now) {
      return res.status(400).json({ message: "Start date must be in the future" })
    }

    if (end <= start) {
      return res.status(400).json({ message: "End date must be after start date" })
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      if (!question.question || !question.question.trim()) {
        return res.status(400).json({ message: `Question ${i + 1} is empty` })
      }

      const hasCorrectAnswer = question.options && question.options.some(opt => opt.isCorrect)
      if (!hasCorrectAnswer) {
        return res.status(400).json({ message: `Question ${i + 1} must have at least one correct answer` })
      }

      const hasEmptyOption = question.options && question.options.some(opt => !opt.text || !opt.text.trim())
      if (hasEmptyOption) {
        return res.status(400).json({ message: `Question ${i + 1} has empty options` })
      }
    }

    console.log("Creating exam with assigned students:", assignedTo)

    const exam = new Exam({
      ...req.body,
      tutor: req.user.userId,
    })

    await exam.save()
    await exam.populate("tutor", "fullName")
    await exam.populate("assignedTo", "fullName email")

    console.log("✅ Exam created successfully:", exam._id)
    console.log("Assigned to students:", exam.assignedTo.map(s => s.fullName))
    
    res.status(201).json({
      message: "Exam created successfully",
      exam,
    })
  } catch (error) {
    console.error("❌ Create exam error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// 404 handler
app.use("*", (req, res) => {
  console.log("❌ 404 - Route not found:", req.method, req.originalUrl)
  res.status(404).json({
    message: "Route not found",
    method: req.method,
    path: req.originalUrl,
    availableRoutes: [
      "GET /health",
      "POST /api/auth/register",
      "POST /api/auth/login", 
      "GET /api/auth/me",
      "GET /api/users",
      "GET /api/tasks",
      "POST /api/tasks",
      "GET /api/exams",
      "POST /api/exams",
    ],
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
  🔗 Users endpoint: http://localhost:${PORT}/api/users (GET)
  🔗 Tasks endpoint: http://localhost:${PORT}/api/tasks (GET/POST)
  🔗 Exams endpoint: http://localhost:${PORT}/api/exams (GET/POST)
  
  This is the production server with MongoDB integration.
  `)
})