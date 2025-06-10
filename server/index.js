const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const http = require("http")
const socketIo = require("socket.io")
require("dotenv").config()

console.log("🚀 Starting EduTask Manager Server...")
console.log("📊 Environment Variables Check:")
console.log("- MONGODB_URI:", process.env.MONGODB_URI ? "✅ Set" : "❌ Not set")
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Not set")
console.log("- PORT:", process.env.PORT || 5001)

const app = express()
const server = http.createServer(app)

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  if (req.body && Object.keys(req.body).length > 0) {
    const logBody = { ...req.body }
    if (logBody.password) logBody.password = "[HIDDEN]"
    console.log("Request body:", logBody)
  }
  next()
})

// Health check endpoint (before other routes)
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

// Test endpoint
app.get("/test", (req, res) => {
  console.log("✅ Test endpoint hit")
  res.json({
    message: "Server is responding",
    timestamp: new Date().toISOString(),
    routes: "Loading...",
  })
})

// Simple auth test endpoint
app.post("/api/auth/test", (req, res) => {
  console.log("✅ Auth test endpoint hit")
  res.json({
    message: "Auth routes are working",
    receivedData: req.body,
    timestamp: new Date().toISOString(),
  })
})

// Connect to MongoDB and then load routes
const connectToDatabase = async () => {
  try {
    console.log("🔌 Connecting to MongoDB Atlas...")

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("✅ Connected to MongoDB Atlas successfully!")

    // List available collections
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log(
      "📁 Available collections:",
      collections.map((c) => c.name),
    )

    return true
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message)
    console.log("🔄 Server will continue without database...")
    return false
  }
}

// Load application routes
const loadRoutes = () => {
  try {
    console.log("📁 Loading application routes...")

    // Import and use auth routes
    const authRoutes = require("./routes/auth")
    app.use("/api/auth", authRoutes)
    console.log("✅ Auth routes loaded at /api/auth")

    // Import and use other routes
    const taskRoutes = require("./routes/tasks")
    app.use("/api/tasks", taskRoutes)
    console.log("✅ Task routes loaded at /api/tasks")

    const examRoutes = require("./routes/exams")
    app.use("/api/exams", examRoutes)
    console.log("✅ Exam routes loaded at /api/exams")

    const chatRoutes = require("./routes/chat")
    app.use("/api/chat", chatRoutes)
    console.log("✅ Chat routes loaded at /api/chat")

    const userRoutes = require("./routes/users")
    app.use("/api/users", userRoutes)
    console.log("✅ User routes loaded at /api/users")

    console.log("✅ All routes loaded successfully!")

    // List all registered routes
    console.log("📋 Registered routes:")
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        console.log(`   ${Object.keys(middleware.route.methods).join(", ").toUpperCase()} ${middleware.route.path}`)
      } else if (middleware.name === "router") {
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            console.log(
              `   ${Object.keys(handler.route.methods).join(", ").toUpperCase()} ${middleware.regexp.source.replace("\\/?(?=\\/|$)", "")}${handler.route.path}`,
            )
          }
        })
      }
    })
  } catch (error) {
    console.error("❌ Error loading routes:", error.message)
    console.error("Stack trace:", error.stack)

    // Create fallback routes
    app.post("/api/auth/register", (req, res) => {
      console.log("⚠️ Using fallback registration route")
      res.status(500).json({
        message: "Server configuration error - routes could not be loaded",
        error: error.message,
      })
    })
  }
}

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
})

io.on("connection", (socket) => {
  console.log("👤 User connected:", socket.id)

  socket.on("join_room", (roomId) => {
    socket.join(roomId)
    console.log(`👤 User ${socket.id} joined room ${roomId}`)
  })

  socket.on("send_message", (data) => {
    socket.to(data.roomId).emit("receive_message", data)
    console.log(`💬 Message sent to room ${data.roomId}`)
  })

  socket.on("disconnect", () => {
    console.log("👤 User disconnected:", socket.id)
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("❌ Server Error:", error)
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  })
})

// 404 handler - must be last
app.use("*", (req, res) => {
  console.log("❌ 404 - Route not found:", req.method, req.originalUrl)
  res.status(404).json({
    message: "Route not found",
    method: req.method,
    path: req.originalUrl,
    availableRoutes: [
      "GET /health",
      "GET /test",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/auth/me",
      "GET /api/users",
      "GET /api/tasks",
      "GET /api/exams",
    ],
  })
})

// Start server
const PORT = process.env.PORT || 5001

const startServer = async () => {
  // Connect to database first
  const dbConnected = await connectToDatabase()

  // Load routes regardless of database connection
  loadRoutes()

  // Start the server
  server.listen(PORT, () => {
    console.log("✅ Server started successfully!")
    console.log(`🌐 Server running on: http://localhost:${PORT}`)
    console.log(`🏥 Health check: http://localhost:${PORT}/health`)
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`)
    console.log(`📡 Ready to accept requests!`)

    if (!dbConnected) {
      console.log("⚠️  Database not connected - some features may not work")
    }
  })
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  server.close(() => {
    mongoose.connection.close()
    console.log("Process terminated")
  })
})

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully")
  server.close(() => {
    mongoose.connection.close()
    console.log("Process terminated")
  })
})

// Start the server
startServer().catch((error) => {
  console.error("❌ Failed to start server:", error)
  process.exit(1)
})