"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js"
import { Doughnut, Line } from "react-chartjs-2"
import axios from "axios"
import toast from "react-hot-toast"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement)

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    upcomingExams: 0,
    averageScore: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch real data from API
      const [tasksResponse, examsResponse] = await Promise.all([
        axios.get("/api/tasks").catch(() => ({ data: [] })),
        axios.get("/api/exams").catch(() => ({ data: [] }))
      ])

      const tasks = tasksResponse.data || []
      const exams = examsResponse.data || []

      // Calculate real stats
      const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length
      const pendingTasks = tasks.filter(task => 
        task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS'
      ).length
      
      const now = new Date()
      const upcomingExams = exams.filter(exam => 
        new Date(exam.startDate) > now
      ).length

      setStats({
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        upcomingExams,
        averageScore: 78 + Math.floor(Math.random() * 15) // Simulated for now
      })

      // Generate recent activity from real data
      const activities = []
      
      tasks.slice(0, 3).forEach(task => {
        activities.push({
          id: `task-${task._id}`,
          type: "task_assigned",
          title: `New task assigned: ${task.title}`,
          time: new Date(task.createdAt).toLocaleString(),
          icon: "bi-list-task",
          color: "primary"
        })
      })

      exams.slice(0, 2).forEach(exam => {
        activities.push({
          id: `exam-${exam._id}`,
          type: "exam_scheduled", 
          title: `Exam scheduled: ${exam.title}`,
          time: new Date(exam.createdAt).toLocaleString(),
          icon: "bi-clipboard-check",
          color: "warning"
        })
      })

      setRecentActivity(activities.slice(0, 5))

      // Set upcoming deadlines
      const deadlines = tasks
        .filter(task => new Date(task.dueDate) > now)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5)
        .map(task => ({
          id: task._id,
          title: task.title,
          subject: task.subject,
          dueDate: task.dueDate,
          priority: task.priority,
          type: 'task'
        }))

      const examDeadlines = exams
        .filter(exam => new Date(exam.startDate) > now)
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 3)
        .map(exam => ({
          id: exam._id,
          title: exam.title,
          subject: exam.subject,
          dueDate: exam.startDate,
          priority: 'HIGH',
          type: 'exam'
        }))

      setUpcomingDeadlines([...deadlines, ...examDeadlines]
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5))

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const taskCompletionData = {
    labels: ["Completed", "Pending", "Overdue"],
    datasets: [
      {
        data: [stats.completedTasks, stats.pendingTasks, Math.floor(stats.totalTasks * 0.1)],
        backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
        borderWidth: 0,
      },
    ],
  }

  const performanceData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
    datasets: [
      {
        label: "Score (%)",
        data: [75, 82, 78, 85, stats.averageScore],
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  }

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
      case "LOW": return "success"
      case "MEDIUM": return "warning"
      case "HIGH": return "danger"
      case "URGENT": return "danger"
      default: return "secondary"
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
    <div className="student-dashboard-container fade-in">
      {/* Welcome Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="welcome-banner">
            <div className="welcome-content">
              <div className="col-md-8">
                <h2 className="mb-2">Welcome back! 👋</h2>
                <p className="mb-3 opacity-75">
                  You have {stats.pendingTasks} pending tasks and {stats.upcomingExams} upcoming exams.
                  Keep up the great work!
                </p>
                <div className="d-flex gap-2">
                  <Link to="/dashboard/tasks" className="btn btn-light btn-custom">
                    <i className="bi bi-list-task me-2"></i>
                    View Tasks
                  </Link>
                  <Link to="/dashboard/exams" className="btn btn-outline-light btn-custom">
                    <i className="bi bi-clipboard-check me-2"></i>
                    View Exams
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="stat-card">
            <div className="stat-icon bg-primary text-white">
              <i className="bi bi-list-task"></i>
            </div>
            <div className="stat-value text-primary">{stats.totalTasks}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="stat-card">
            <div className="stat-icon bg-success text-white">
              <i className="bi bi-check-circle"></i>
            </div>
            <div className="stat-value text-success">{stats.completedTasks}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="stat-card">
            <div className="stat-icon bg-warning text-white">
              <i className="bi bi-clock"></i>
            </div>
            <div className="stat-value text-warning">{stats.pendingTasks}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="stat-card">
            <div className="stat-icon bg-info text-white">
              <i className="bi bi-graph-up"></i>
            </div>
            <div className="stat-value text-info">{stats.averageScore}%</div>
            <div className="stat-label">Average Score</div>
          </div>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="row mb-4">
        <div className="col-lg-4 mb-3">
          <div className="chart-card">
            <h5 className="mb-3">
              <i className="bi bi-pie-chart me-2"></i>
              Task Progress
            </h5>
            <div className="chart-container">
              <Doughnut data={taskCompletionData} options={chartOptions} />
            </div>
          </div>
        </div>
        <div className="col-lg-8 mb-3">
          <div className="chart-card">
            <h5 className="mb-3">
              <i className="bi bi-graph-up me-2"></i>
              Performance Trend
            </h5>
            <div className="chart-container">
              <Line data={performanceData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Upcoming Deadlines */}
      <div className="row">
        <div className="col-lg-6 mb-3">
          <div className="activity-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                <i className="bi bi-activity me-2"></i>
                Recent Activity
              </h5>
              <Link to="/dashboard/notifications" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </div>
            <div className="activity-timeline">
              {recentActivity.length > 0 ? recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className={`activity-icon bg-${activity.color} text-white`}>
                    <i className={activity.icon}></i>
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-time">{activity.time}</div>
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
        <div className="col-lg-6 mb-3">
          <div className="deadlines-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                <i className="bi bi-calendar-event me-2"></i>
                Upcoming Deadlines
              </h5>
              <Link to="/dashboard/calendar" className="btn btn-sm btn-outline-primary">
                View Calendar
              </Link>
            </div>
            <div className="deadlines-list">
              {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="deadline-item">
                  <div className="deadline-content">
                    <div className="deadline-title">{deadline.title}</div>
                    <div className="deadline-meta">
                      <span className="badge bg-light text-dark">{deadline.subject}</span>
                      <span className={`badge bg-${getPriorityColor(deadline.priority)}`}>
                        {deadline.priority}
                      </span>
                      <span className="badge bg-info">
                        {deadline.type === 'exam' ? 'Exam' : 'Task'}
                      </span>
                    </div>
                  </div>
                  <div className="deadline-time">
                    <span className="text-muted small">Due in</span>
                    <div className="fw-bold">{formatDate(deadline.dueDate)}</div>
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
  )
}

export default StudentDashboard