const express = require("express")
const cors = require("cors")

// Create a simple Express app
const app = express()

// Enable CORS for all routes
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Parse JSON request bodies
app.use(express.json())

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Request body:", req.body)
  }
  next()
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Test auth endpoints
app.post("/api/auth/register", (req, res) => {
  console.log("Registration endpoint hit with data:", req.body)
  res.status(201).json({
    message: "Test registration successful",
    user: {
      id: "test-user-id",
      fullName: req.body.fullName || "Test User",
      email: req.body.email || "test@example.com",
      role: req.body.role || "STUDENT",
    },
    token: "test-jwt-token",
  })
})

app.post("/api/auth/login", (req, res) => {
  console.log("Login endpoint hit with data:", req.body)

  // Extract email and password from request body
  let email, password

  if (req.body.email && typeof req.body.email === "object") {
    // Handle incorrect format: { email: { email: '...', password: '...' } }
    email = req.body.email.email
    password = req.body.email.password
  } else {
    // Handle correct format: { email: '...', password: '...' }
    email = req.body.email
    password = req.body.password
  }

  console.log(`Attempting login for email: ${email}`)

  res.status(200).json({
    message: "Test login successful",
    user: {
      id: "test-user-id",
      fullName: "Test User",
      email: email,
      role: "STUDENT",
    },
    token: "test-jwt-token",
  })
})

app.get("/api/auth/me", (req, res) => {
  console.log("Me endpoint hit")

  // Check for Authorization header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  res.status(200).json({
    id: "test-user-id",
    fullName: "Test User",
    email: "test@example.com",
    role: "STUDENT",
  })
})

// 404 handler
app.use("*", (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    availableRoutes: ["/health", "/api/auth/register", "/api/auth/login", "/api/auth/me"],
  })
})

// Start the server
const PORT = 5001
app.listen(PORT, () => {
  console.log(`
  🚀 Simple test server running!
  
  📡 Server listening on port ${PORT}
  🔗 Health check: http://localhost:${PORT}/health
  🔗 Register endpoint: http://localhost:${PORT}/api/auth/register (POST)
  🔗 Login endpoint: http://localhost:${PORT}/api/auth/login (POST)
  🔗 Me endpoint: http://localhost:${PORT}/api/auth/me (GET)
  
  This is a minimal test server to verify connectivity.
  `)
})
