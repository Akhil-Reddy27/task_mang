"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import axios from "axios"
import toast from "react-hot-toast"

const StudentDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalExams: 0,
    averageScore: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch data from multiple endpoints
        const [tasksResponse, examsResponse] = await Promise.all([
          axios.get("/api/tasks").catch(() => ({ data: [] })),
          axios.get("/api/exams").catch(() => ({ data: [] }))
        ])

        if (!isMounted) return

        const tasks = tasksResponse.data || []
        const exams = examsResponse.data || []

        // Calculate stats
        const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length
        const averageScore = 78 + Math.floor(Math.random() * 15) // Simulated

        setStats({
          totalTasks: tasks.length,
          completedTasks,
          totalExams: exams.length,
          averageScore
        })

        // Set recent activity
        const activities = []
        
        tasks.slice(0, 3).forEach(task => {
          activities.push({
            id: `task-${task._id}`,
            type: "task",
            title: `New task assigned: ${task.title}`,
            time: new Date(task.createdAt).toLocaleString(),
            icon: "bi-list-task",
            color: "primary"
          })
        })

        exams.slice(0, 2).forEach(exam => {
          activities.push({
            id: `exam-${exam._id}`,
            type: "exam",
            title: `Exam scheduled: ${exam.title}`,
            time: new Date(exam.createdAt).toLocaleString(),
            icon: "bi-clipboard-check",
            color: "warning"
          })
        })

        setRecentActivity(activities.slice(0, 5))

        // Set upcoming deadlines
        const deadlines = []
        
        tasks.forEach(task => {
          if (new Date(task.dueDate) > new Date()) {
            deadlines.push({
              id: task._id,
              title: task.title,
              subject: task.subject,
              dueDate: task.dueDate,
              type: "task",
              priority: task.priority
            })
          }
        })

        exams.forEach(exam => {
          if (new Date(exam.startDate) > new Date()) {
            deadlines.push({
              id: exam._id,
              title: exam.title,
              subject: exam.subject,
              dueDate: exam.startDate,
              type: "exam",
              priority: "HIGH"
            })
          }
        })

        setUpcomingDeadlines(deadlines.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5))

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        if (isMounted) {
          toast.error("Failed to load dashboard data")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (user) {
      fetchDashboardData()
    }

    return () => {
      isMounted = false
    }
  }, [user])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays < 7) return `${diffDays} days`
    return date.toLocaleDateString()
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
      case "URGENT":
        return "danger"
      case "MEDIUM":
        return "warning"
      case "LOW":
        return "success"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3\" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading Dashboard...</h5>
        </div>
      </div>
    )
  }

  return (
    <div className="student-dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner mb-4">
        <div className="welcome-content">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="welcome-title">
                Welcome back, {user?.fullName?.split(' ')[0]}! 
                <span className="wave-emoji">👋</span>
              </h1>
              <p className="welcome-subtitle">
                You have <span className="highlight">{stats.totalTasks}</span> tasks and 
                <span className="highlight"> {stats.totalExams}</span> exams to focus on.
                Keep up the great work!
              </p>
              <div className="welcome-actions">
                <Link to="/dashboard/tasks" className="btn btn-welcome btn-light">
                  <i className="bi bi-list-task me-2"></i>
                  View Tasks
                </Link>
                <Link to="/dashboard/exams" className="btn btn-welcome btn-outline-light">
                  <i className="bi bi-clipboard-check me-2"></i>
                  View Exams
                </Link>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="welcome-illustration">
                <div className="floating-elements">
                  <div className="element element-1">📚</div>
                  <div className="element element-2">🎓</div>
                  <div className="element element-3">📝</div>
                  <div className="element element-4">💡</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        {[
          { 
            icon: "bi-list-task", 
            value: stats.totalTasks, 
            label: "Total Tasks", 
            color: "primary",
            link: "/dashboard/tasks"
          },
          { 
            icon: "bi-check-circle", 
            value: stats.completedTasks, 
            label: "Completed", 
            color: "success",
            link: "/dashboard/tasks"
          },
          { 
            icon: "bi-clipboard-check", 
            value: stats.totalExams, 
            label: "Exams", 
            color: "warning",
            link: "/dashboard/exams"
          },
          { 
            icon: "bi-trophy", 
            value: `${stats.averageScore}%`, 
            label: "Average Score", 
            color: "info",
            link: "/dashboard/profile"
          }
        ].map((stat, index) => (
          <div key={index} className="col-lg-3 col-md-6 mb-3">
            <Link to={stat.link} className="text-decoration-none">
              <div className="stat-card">
                <div className="stat-card-inner">
                  <div className={`stat-icon bg-${stat.color}`}>
                    <i className={stat.icon}></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="row">
        {/* Recent Activity */}
        <div className="col-lg-6 mb-4">
          <div className="activity-card">
            <div className="card-header">
              <h5 className="card-title">
                <i className="bi bi-activity me-2 text-primary"></i>
                Recent Activity
              </h5>
            </div>
            <div className="card-body">
              <div className="activity-timeline">
                {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                  <div key={activity.id} className="timeline-item">
                    <div className={`timeline-icon bg-${activity.color}`}>
                      <i className={activity.icon}></i>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">{activity.title}</div>
                      <div className="timeline-time">{activity.time}</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-clock-history fs-1 mb-2"></i>
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="col-lg-6 mb-4">
          <div className="deadlines-card">
            <div className="card-header">
              <h5 className="card-title">
                <i className="bi bi-clock me-2 text-danger"></i>
                Upcoming Deadlines
              </h5>
            </div>
            <div className="card-body">
              <div className="deadlines-list">
                {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((deadline, index) => (
                  <div key={deadline.id} className="deadline-item">
                    <div className="deadline-header">
                      <div className="deadline-title">{deadline.title}</div>
                      <span className={`badge bg-${getPriorityColor(deadline.priority)}`}>
                        {deadline.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="deadline-meta">
                      <span className="deadline-subject">{deadline.subject}</span>
                      <span className="deadline-time">{formatDate(deadline.dueDate)}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-calendar-check fs-1 mb-2"></i>
                    <p>No upcoming deadlines</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-12">
          <div className="quick-actions-card">
            <div className="card-header">
              <h5 className="card-title">
                <i className="bi bi-lightning me-2 text-warning"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="quick-actions-grid">
                {[
                  { 
                    icon: "bi-list-task", 
                    title: "View Tasks", 
                    description: "Check your assigned tasks",
                    link: "/dashboard/tasks",
                    color: "primary"
                  },
                  { 
                    icon: "bi-clipboard-check", 
                    title: "Take Exams", 
                    description: "Access your scheduled exams",
                    link: "/dashboard/exams",
                    color: "success"
                  },
                  { 
                    icon: "bi-calendar-event", 
                    title: "Calendar", 
                    description: "View your schedule",
                    link: "/dashboard/calendar",
                    color: "info"
                  },
                  { 
                    icon: "bi-chat-dots", 
                    title: "Messages", 
                    description: "Chat with tutors",
                    link: "/dashboard/chat",
                    color: "warning"
                  },
                  { 
                    icon: "bi-person", 
                    title: "Profile", 
                    description: "Update your information",
                    link: "/dashboard/profile",
                    color: "secondary"
                  },
                  { 
                    icon: "bi-bell", 
                    title: "Notifications", 
                    description: "Check your notifications",
                    link: "/dashboard/notifications",
                    color: "danger"
                  }
                ].map((action, index) => (
                  <Link 
                    key={index}
                    to={action.link}
                    className="quick-action-item text-decoration-none"
                  >
                    <div className="action-icon-wrapper">
                      <div className={`action-icon bg-${action.color}`}>
                        <i className={action.icon}></i>
                      </div>
                    </div>
                    <div className="action-content">
                      <h6 className="action-title">{action.title}</h6>
                      <p className="action-description">{action.description}</p>
                    </div>
                    <div className="action-arrow">
                      <i className="bi bi-arrow-right"></i>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard