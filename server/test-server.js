const express = require("express")
const cors = require("cors")

const app = express()

// Basic middleware
app.use(cors())
app.use(express.json())

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Server is working!", timestamp: new Date().toISOString() })
})

// Test registration route
app.post("/api/auth/register", (req, res) => {
  console.log("Test registration received:", req.body)
  res.json({
    message: "Test registration successful",
    data: req.body,
    timestamp: new Date().toISOString(),
  })
})

const PORT = 5002
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`)
  console.log(`Test URL: http://localhost:${PORT}/test`)
})
