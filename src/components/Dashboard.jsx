"use client"

import { useState } from "react"
import { Routes, Route, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import StudentDashboard from "./dashboard/StudentDashboard"
import TutorDashboard from "./dashboard/TutorDashboard"
import TaskList from "./tasks/TaskList"
import CreateTask from "./tasks/CreateTask"
import ExamList from "./exams/ExamList"
import CreateExam from "./exams/CreateExam"
import ExamResult from "./exams/ExamResult"
import ExamAnalytics from "./exams/ExamAnalytics"
import Calendar from "./calendar/Calendar"
import Chat from "./chat/Chat"
import Profile from "./profile/Profile"
import StudentsManagement from "./students/StudentsManagement"
import Analytics from "./analytics/Analytics"
import Notifications from "./notifications/Notifications"
import "../styles/dashboard.css"

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Full-width dashboard without sidebar constraints */}
      <div className="dashboard-content full-width">
        {/* Header */}
        <div className="dashboard-header">
          <div className="container-fluid">
            <div className="row align-items-center py-3">
              <div className="col-md-6">
                <div className="d-flex align-items-center">
                  <div className="user-avatar me-3">
                    <div className="avatar-circle">{user.fullName?.charAt(0).toUpperCase() || "U"}</div>
                  </div>
                  <div>
                    <h4 className="mb-0 fw-bold">{user.fullName}</h4>
                    <span className="badge bg-primary">{user.role}</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6 text-end">
                <div className="d-flex align-items-center justify-content-end gap-3">
                  <div className="search-box">
                    <input type="text" className="form-control" placeholder="Search tasks, exams, subjects..." />
                  </div>
                  <div className="dropdown">
                    <button
                      className="btn btn-outline-secondary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                    >
                      <i className="bi bi-person-circle me-2"></i>
                      Account
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <Link className="dropdown-item" to="/dashboard/profile">
                          <i className="bi bi-person me-2"></i>My Profile
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/dashboard/profile">
                          <i className="bi bi-gear me-2"></i>Settings
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/dashboard/notifications">
                          <i className="bi bi-bell me-2"></i>Notifications
                        </Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button className="dropdown-item" onClick={logout}>
                          <i className="bi bi-box-arrow-right me-2"></i>Sign Out
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          <div className="container-fluid">
            <Routes>
              <Route path="/" element={user.role === "STUDENT" ? <StudentDashboard /> : <TutorDashboard />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/tasks/create" element={<CreateTask />} />
              <Route path="/exams" element={<ExamList />} />
              <Route path="/exams/create" element={<CreateExam />} />
              <Route path="/exams/:examId/result/:resultId" element={<ExamResult />} />
              <Route path="/exams/:examId/analytics" element={<ExamAnalytics />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/students" element={<StudentsManagement />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/notifications" element={<Notifications />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard