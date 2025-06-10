"use client"

import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const Sidebar = ({ open, setOpen }) => {
  const location = useLocation()
  const { user } = useAuth()

  const studentMenuItems = [
    { path: "/dashboard", icon: "bi-house-fill", label: "Dashboard", color: "primary" },
    { path: "/dashboard/tasks", icon: "bi-list-task", label: "My Tasks", color: "success" },
    { path: "/dashboard/exams", icon: "bi-clipboard-check-fill", label: "Exams", color: "warning" },
    { path: "/dashboard/calendar", icon: "bi-calendar-event-fill", label: "Calendar", color: "info" },
    { path: "/dashboard/chat", icon: "bi-chat-dots-fill", label: "Messages", color: "secondary" },
    { path: "/dashboard/profile", icon: "bi-person-fill", label: "Profile", color: "dark" },
  ]

  const tutorMenuItems = [
    { path: "/dashboard", icon: "bi-house-fill", label: "Dashboard", color: "primary" },
    { path: "/dashboard/tasks", icon: "bi-kanban-fill", label: "Manage Tasks", color: "success" },
    { path: "/dashboard/exams", icon: "bi-clipboard-data-fill", label: "Manage Exams", color: "warning" },
    { path: "/dashboard/calendar", icon: "bi-calendar-event-fill", label: "Calendar", color: "info" },
    { path: "/dashboard/chat", icon: "bi-chat-dots-fill", label: "Messages", color: "secondary" },
    { path: "/dashboard/profile", icon: "bi-person-fill", label: "Profile", color: "dark" },
  ]

  const menuItems = user?.role === "STUDENT" ? studentMenuItems : tutorMenuItems

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="position-fixed w-100 h-100 bg-dark opacity-50 d-lg-none fade-in"
          style={{ zIndex: 999 }}
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${!open ? "collapsed" : ""} d-lg-block slide-in`}>
        <div className="sidebar-header">
          <div className="d-flex align-items-center position-relative">
            <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3 glass">
              <i className="bi bi-mortarboard-fill text-white fs-3"></i>
            </div>
            <div>
              <h4 className="mb-0 fw-bold">EduTask</h4>
              <small className="opacity-75">Manager Pro</small>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? "active" : ""} fade-in`}
              onClick={() => setOpen(false)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <i className={`${item.icon} me-3`}></i>
              <span>{item.label}</span>
              {location.pathname === item.path && (
                <div className="ms-auto">
                  <div className="bg-white rounded-circle" style={{ width: "8px", height: "8px" }}></div>
                </div>
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-auto p-3">
          <div className="card glass border-0 text-white">
            <div className="card-body text-center p-3">
              <div className="mb-3">
                <i className="bi bi-trophy-fill fs-1 text-warning"></i>
              </div>
              <h6 className="card-title mb-2">Upgrade to Pro</h6>
              <p className="card-text small opacity-75 mb-3">Unlock premium features and advanced analytics</p>
              <button className="btn btn-light btn-sm btn-custom">
                <i className="bi bi-star-fill me-2"></i>
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
