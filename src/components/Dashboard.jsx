"use client"

import { useState } from "react"
import { Routes, Route, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
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
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleProfileClick = () => {
    setShowAccountDropdown(false)
    navigate("/dashboard/profile")
  }

  const handleSettingsClick = () => {
    setShowAccountDropdown(false)
    navigate("/dashboard/profile")
  }

  const handleNotificationsClick = () => {
    setShowAccountDropdown(false)
    navigate("/dashboard/notifications")
  }

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
      <div className="dashboard-content full-width">
        {/* Enhanced Header */}
        <div className="enhanced-dashboard-header">
          <div className="container-fluid">
            <div className="row align-items-center py-3">
              {/* Left Section - User Info */}
              <div className="col-md-6">
                <div className="d-flex align-items-center">
                  <div className="user-avatar-section me-3">
                    <div className="avatar-circle-enhanced">
                      <span className="avatar-text">{user.fullName?.charAt(0).toUpperCase() || "U"}</span>
                      <div className="online-indicator"></div>
                    </div>
                  </div>
                  <div className="user-info">
                    <h4 className="user-name mb-0">{user.fullName}</h4>
                    <div className="user-meta">
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        <i className={`bi ${user.role === 'STUDENT' ? 'bi-mortarboard' : 'bi-person-workspace'} me-1`}></i>
                        {user.role}
                      </span>
                      <span className="institution-name">{user.institution}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Actions */}
              <div className="col-md-6">
                <div className="header-actions">
                  {/* Enhanced Search */}
                  <div className="search-container">
                    <div className="search-input-wrapper">
                      <i className="bi bi-search search-icon"></i>
                      <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Search tasks, exams, subjects..." 
                      />
                      <div className="search-shortcut">⌘K</div>
                    </div>
                  </div>

                  {/* Theme Toggle */}
                  <button 
                    className="action-btn theme-toggle" 
                    onClick={toggleTheme} 
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                  >
                    <i className={`bi ${theme === 'light' ? 'bi-moon-stars' : 'bi-sun'}`}></i>
                  </button>

                  {/* Notifications */}
                  <div className="notification-wrapper">
                    <button 
                      className="action-btn notification-btn" 
                      onClick={() => setShowNotifications(!showNotifications)}
                      title="Notifications"
                    >
                      <i className="bi bi-bell"></i>
                      <span className="notification-badge">3</span>
                    </button>
                    
                    {showNotifications && (
                      <div className="notifications-dropdown">
                        <div className="dropdown-header">
                          <h6 className="mb-0">Notifications</h6>
                          <button 
                            className="btn btn-sm btn-link"
                            onClick={() => navigate("/dashboard/notifications")}
                          >
                            View All
                          </button>
                        </div>
                        <div className="notifications-list">
                          <div className="notification-item">
                            <div className="notification-icon bg-primary">
                              <i className="bi bi-list-task"></i>
                            </div>
                            <div className="notification-content">
                              <div className="notification-title">New Task Assigned</div>
                              <div className="notification-time">2 minutes ago</div>
                            </div>
                          </div>
                          <div className="notification-item">
                            <div className="notification-icon bg-warning">
                              <i className="bi bi-clock"></i>
                            </div>
                            <div className="notification-content">
                              <div className="notification-title">Exam Reminder</div>
                              <div className="notification-time">1 hour ago</div>
                            </div>
                          </div>
                          <div className="notification-item">
                            <div className="notification-icon bg-success">
                              <i className="bi bi-check-circle"></i>
                            </div>
                            <div className="notification-content">
                              <div className="notification-title">Assignment Graded</div>
                              <div className="notification-time">3 hours ago</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Account Dropdown */}
                  <div className="account-wrapper">
                    <button 
                      className="account-btn"
                      onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                    >
                      <span className="account-text">Account</span>
                      <i className={`bi bi-chevron-${showAccountDropdown ? 'up' : 'down'} ms-2`}></i>
                    </button>

                    {showAccountDropdown && (
                      <div className="account-dropdown">
                        <div className="dropdown-header">
                          <div className="user-avatar-small">
                            <span>{user.fullName?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="user-details">
                            <div className="user-name-small">{user.fullName}</div>
                            <div className="user-email">{user.email}</div>
                          </div>
                        </div>
                        
                        <div className="dropdown-divider"></div>
                        
                        <div className="dropdown-menu-items">
                          <button className="dropdown-item" onClick={handleProfileClick}>
                            <i className="bi bi-person-circle me-3"></i>
                            <span>My Profile</span>
                          </button>
                          <button className="dropdown-item" onClick={handleSettingsClick}>
                            <i className="bi bi-gear me-3"></i>
                            <span>Settings</span>
                          </button>
                          <button className="dropdown-item" onClick={handleNotificationsClick}>
                            <i className="bi bi-bell me-3"></i>
                            <span>Notifications</span>
                            <span className="notification-count">3</span>
                          </button>
                          <button className="dropdown-item">
                            <i className="bi bi-question-circle me-3"></i>
                            <span>Help & Support</span>
                          </button>
                        </div>
                        
                        <div className="dropdown-divider"></div>
                        
                        <button className="dropdown-item logout-item" onClick={handleLogout}>
                          <i className="bi bi-box-arrow-right me-3"></i>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
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

      {/* Click outside to close dropdowns */}
      {(showAccountDropdown || showNotifications) && (
        <div 
          className="dropdown-overlay"
          onClick={() => {
            setShowAccountDropdown(false)
            setShowNotifications(false)
          }}
        ></div>
      )}

      <style jsx>{`
        .enhanced-dashboard-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        body.theme-dark .enhanced-dashboard-header {
          background: rgba(45, 55, 72, 0.95);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* User Avatar Section */
        .user-avatar-section {
          position: relative;
        }

        .avatar-circle-enhanced {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
        }

        .avatar-circle-enhanced:hover {
          transform: scale(1.05);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
        }

        .avatar-text {
          color: white;
          font-weight: 700;
          font-size: 1.5rem;
        }

        .online-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 16px;
          height: 16px;
          background: #10b981;
          border: 3px solid white;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        /* User Info */
        .user-info {
          flex: 1;
        }

        .user-name {
          font-weight: 700;
          color: #1f2937;
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
        }

        body.theme-dark .user-name {
          color: #f8fafc;
        }

        .user-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .role-badge.student {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .role-badge.tutor {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .institution-name {
          color: #6b7280;
          font-size: 0.9rem;
          font-weight: 500;
        }

        body.theme-dark .institution-name {
          color: #9ca3af;
        }

        /* Header Actions */
        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          justify-content: flex-end;
        }

        /* Enhanced Search */
        .search-container {
          position: relative;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input {
          width: 300px;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        body.theme-dark .search-input {
          background: rgba(55, 65, 81, 0.8);
          border-color: rgba(255, 255, 255, 0.1);
          color: #f8fafc;
        }

        body.theme-dark .search-input:focus {
          background: #374151;
          border-color: #667eea;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: #6b7280;
          z-index: 2;
        }

        .search-shortcut {
          position: absolute;
          right: 1rem;
          background: rgba(0, 0, 0, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        body.theme-dark .search-shortcut {
          background: rgba(255, 255, 255, 0.1);
          color: #9ca3af;
        }

        /* Action Buttons */
        .action-btn {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          border: none;
          background: rgba(255, 255, 255, 0.8);
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          position: relative;
        }

        .action-btn:hover {
          background: white;
          color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        body.theme-dark .action-btn {
          background: rgba(55, 65, 81, 0.8);
          color: #9ca3af;
        }

        body.theme-dark .action-btn:hover {
          background: #374151;
          color: #667eea;
        }

        /* Notification Button */
        .notification-wrapper {
          position: relative;
        }

        .notification-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        /* Account Button */
        .account-wrapper {
          position: relative;
        }

        .account-btn {
          display: flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.8);
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          color: #374151;
          font-weight: 600;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .account-btn:hover {
          background: white;
          border-color: #667eea;
          color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        body.theme-dark .account-btn {
          background: rgba(55, 65, 81, 0.8);
          border-color: rgba(255, 255, 255, 0.1);
          color: #f8fafc;
        }

        body.theme-dark .account-btn:hover {
          background: #374151;
          border-color: #667eea;
          color: #667eea;
        }

        /* Dropdowns */
        .account-dropdown,
        .notifications-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.1);
          min-width: 280px;
          z-index: 1000;
          animation: dropdownSlide 0.3s ease;
        }

        body.theme-dark .account-dropdown,
        body.theme-dark .notifications-dropdown {
          background: #2d3748;
          border-color: rgba(255, 255, 255, 0.1);
        }

        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        body.theme-dark .dropdown-header {
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }

        .user-avatar-small {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          margin-right: 1rem;
        }

        .user-details {
          flex: 1;
        }

        .user-name-small {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .user-email {
          font-size: 0.875rem;
          color: #6b7280;
        }

        body.theme-dark .user-name-small {
          color: #f8fafc;
        }

        body.theme-dark .user-email {
          color: #9ca3af;
        }

        .dropdown-menu-items {
          padding: 0.5rem;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 0.75rem 1rem;
          border: none;
          background: none;
          color: #374151;
          font-size: 0.9rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
          text-align: left;
        }

        .dropdown-item:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        body.theme-dark .dropdown-item {
          color: #f8fafc;
        }

        body.theme-dark .dropdown-item:hover {
          background: rgba(102, 126, 234, 0.2);
          color: #667eea;
        }

        .logout-item {
          color: #ef4444 !important;
        }

        .logout-item:hover {
          background: rgba(239, 68, 68, 0.1) !important;
          color: #ef4444 !important;
        }

        .notification-count {
          margin-left: auto;
          background: #ef4444;
          color: white;
          border-radius: 10px;
          padding: 0.125rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.1);
          margin: 0.5rem 0;
        }

        body.theme-dark .dropdown-divider {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Notifications Dropdown */
        .notifications-list {
          max-height: 300px;
          overflow-y: auto;
          padding: 0.5rem;
        }

        .notification-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .notification-item:hover {
          background: rgba(102, 126, 234, 0.05);
        }

        .notification-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.9rem;
        }

        .notification-content {
          flex: 1;
        }

        .notification-title {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .notification-time {
          font-size: 0.8rem;
          color: #6b7280;
        }

        body.theme-dark .notification-title {
          color: #f8fafc;
        }

        body.theme-dark .notification-time {
          color: #9ca3af;
        }

        /* Overlay */
        .dropdown-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 999;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .search-input {
            width: 200px;
          }

          .account-text {
            display: none;
          }

          .header-actions {
            gap: 0.5rem;
          }

          .user-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }

        @media (max-width: 576px) {
          .search-container {
            display: none;
          }

          .user-name {
            font-size: 1.25rem;
          }

          .avatar-circle-enhanced {
            width: 50px;
            height: 50px;
          }

          .avatar-text {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  )
}

export default Dashboard