"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import StudentDashboard from "./dashboard/StudentDashboard"
import TutorDashboard from "./dashboard/TutorDashboard"
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
                        <a className="dropdown-item" href="#">
                          <i className="bi bi-person me-2"></i>My Profile
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#">
                          <i className="bi bi-gear me-2"></i>Settings
                        </a>
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
          <div className="container-fluid">{user.role === "STUDENT" ? <StudentDashboard /> : <TutorDashboard />}</div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
