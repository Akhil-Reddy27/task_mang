const http = require("http")

// Function to test if a server is responding
function testConnection(host, port, path) {
  return new Promise((resolve) => {
    console.log(`🔍 Testing connection to ${host}:${port}${path}...`)

    const req = http.request(
      {
        host,
        port,
        path,
        method: "GET",
        timeout: 3000, // 3 second timeout
      },
      (res) => {
        let data = ""

        res.on("data", (chunk) => {
          data += chunk
        })

        res.on("end", () => {
          console.log(`✅ Server responded with status: ${res.statusCode}`)
          try {
            const jsonData = JSON.parse(data)
            console.log("Response data:", jsonData)
            resolve(true)
          } catch (e) {
            console.log("Response (not JSON):", data.substring(0, 100) + (data.length > 100 ? "..." : ""))
            resolve(true)
          }
        })
      },
    )

    req.on("error", (error) => {
      console.log(`❌ Connection failed: ${error.message}`)
      resolve(false)
    })

    req.on("timeout", () => {
      console.log("❌ Connection timed out")
      req.destroy()
      resolve(false)
    })

    req.end()
  })
}

// Test connections
async function main() {
  console.log("🧪 Testing server connectivity...")

  // Test localhost on port 5001
  const healthCheck = await testConnection("localhost", 5001, "/health")

  if (!healthCheck) {
    console.log(`
    ⚠️ Server is not responding on http://localhost:5001/health
    
    This could mean:
    1. The server is not running
    2. The server is running on a different port
    3. The server doesn't have a /health endpoint
    4. There's a firewall blocking the connection
    
    Try these solutions:
    1. Make sure your server is running
    2. Check the console output for the correct port
    3. Try a different endpoint like /test or /
    4. Check for any error messages in your server logs
    `)
  } else {
    console.log(`
    ✅ Server is responding correctly!
    
    Now let's test the auth endpoint...
    `)

    // Test the auth endpoint
    await testConnection("localhost", 5001, "/api/auth/test")
  }
}

main()
