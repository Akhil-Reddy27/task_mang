"use client"

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import WelcomePage from "./ui/welcome"
import Signin from "./components/auth/Signin"
import Signup from "./components/auth/Signup"
import Dashboard from "./components/Dashboard"
import ExamResult from "./components/exams/ExamResult"
import ExamAnalytics from "./components/exams/ExamAnalytics"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
//import WelcomePage from "./components/WelcomePage"
import "./styles/dashboard.css"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-vh-100">
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exam/:examId/result/:resultId"
                element={
                  <ProtectedRoute>
                    <ExamResult />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exam/:examId/analytics"
                element={
                  <ProtectedRoute>
                    <ExamAnalytics />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-custom"></div>
      </div>
    )
  }

  return user ? children : <Navigate to="/signin" />
}

export default App
