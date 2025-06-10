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

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement)

const TutorDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeTasks: 0,
    completedExams: 0,
    averageClassScore: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [classPerformance, setClassPerformance] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls - replace with actual endpoints
      setStats({
        totalStudents: 45,
        activeTasks: 8,
        completedExams: 12,
        averageClassScore: 78,
      })

      setRecentActivity([
        {
          id: 1,
          type: "exam_submitted",
          title: "John Doe submitted Physics Quiz",
          time: "30 minutes ago",
          icon: "bi-clipboard-check",
          color: "success",
        },
        {
          id: 2,
          type: "task_created",
          title: "Created new Math Assignment",
          time: "2 hours ago",
          icon: "bi-plus-circle",
          color: "primary",
        },
        {
          id: 3,
          type: "student_message",
          title: "Sarah asked about Chemistry homework",
          time: "4 hours ago",
          icon: "bi-chat",
          color: "info",
        },
      ])

      setClassPerformance([
        { subject: "Mathematics", average: 85 },
        { subject: "Physics", average: 78 },
        { subject: "Chemistry", average: 82 },
        { subject: "Biology", average: 79 },
      ])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  const studentEngagementData = {
    labels: ["Active", "Moderate", "Low"],
    datasets: [
      {
        data: [25, 15, 5],
        backgroundColor: ["#198754", "#ffc107", "#dc3545"],
        borderWidth: 0,
      },
    ],
  }

  const performanceTrendData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
    datasets: [
      {
        label: "Class Average (%)",
        data: [72, 75, 78, 76, 80],
        borderColor: "rgba(13, 110, 253, 1)",
        backgroundColor: "rgba(13, 110, 253, 0.1)",
        tension: 0.4,
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

  return (
    <div className="fade-in">
      {/* Welcome Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div
            className="dashboard-card bg-gradient"
            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
          >
            <div className="text-white">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h2 className="mb-2">Good morning, Professor! 🎓</h2>
                  <p className="mb-3 opacity-75">
                    You have {stats.activeTasks} active assignments and {stats.totalStudents} students in your classes.
                    {stats.completedExams} exams have been completed this week.
                  </p>
                  <div className="d-flex gap-2">
                    <Link to="/dashboard/tasks" className="btn btn-light btn-custom">
                      <i className="bi bi-plus-circle me-2"></i>
                      Create Task
                    </Link>
                    <Link to="/dashboard/exams" className="btn btn-outline-light btn-custom">
                      <i className="bi bi-clipboard-check me-2"></i>
                      Create Exam
                    </Link>
                  </div>
                </div>
                <div className="col-md-4 text-center">
                  <i className="bi bi-person-workspace" style={{ fontSize: "4rem", opacity: 0.3 }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="dashboard-card stat-card">
            <div className="stat-icon bg-primary text-white">
              <i className="bi bi-people"></i>
            </div>
            <div className="stat-value text-primary">{stats.totalStudents}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="dashboard-card stat-card">
            <div className="stat-icon bg-success text-white">
              <i className="bi bi-list-task"></i>
            </div>
            <div className="stat-value text-success">{stats.activeTasks}</div>
            <div className="stat-label">Active Tasks</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="dashboard-card stat-card">
            <div className="stat-icon bg-warning text-white">
              <i className="bi bi-clipboard-check"></i>
            </div>
            <div className="stat-value text-warning">{stats.completedExams}</div>
            <div className="stat-label">Completed Exams</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="dashboard-card stat-card">
            <div className="stat-icon bg-info text-white">
              <i className="bi bi-graph-up"></i>
            </div>
            <div className="stat-value text-info">{stats.averageClassScore}%</div>
            <div className="stat-label">Class Average</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row mb-4">
        <div className="col-lg-4 mb-3">
          <div className="dashboard-card">
            <h5 className="mb-3">
              <i className="bi bi-pie-chart me-2"></i>
              Student Engagement
            </h5>
            <div className="chart-container">
              <Doughnut data={studentEngagementData} options={chartOptions} />
            </div>
          </div>
        </div>
        <div className="col-lg-8 mb-3">
          <div className="dashboard-card">
            <h5 className="mb-3">
              <i className="bi bi-graph-up me-2"></i>
              Performance Trend
            </h5>
            <div className="chart-container">
              <Line data={performanceTrendData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Class Performance and Recent Activity */}
      <div className="row">
        <div className="col-lg-6 mb-3">
          <div className="dashboard-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                <i className="bi bi-bar-chart me-2"></i>
                Subject Performance
              </h5>
              <Link to="/dashboard/analytics" className="btn btn-sm btn-outline-primary">
                View Details
              </Link>
            </div>
            <div className="space-y-3">
              {classPerformance.map((subject, index) => (
                <div key={index} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold">{subject.subject}</span>
                    <span className="badge bg-primary">{subject.average}%</span>
                  </div>
                  <div className="progress progress-custom">
                    <div
                      className={`progress-bar ${
                        subject.average >= 80 ? "bg-success" : subject.average >= 70 ? "bg-warning" : "bg-danger"
                      }`}
                      style={{ width: `${subject.average}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-6 mb-3">
          <div className="dashboard-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                <i className="bi bi-activity me-2"></i>
                Recent Activity
              </h5>
              <Link to="/dashboard/notifications" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </div>
            <div className="activity-feed">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className={`activity-icon bg-${activity.color} text-white`}>
                    <i className={activity.icon}></i>
                  </div>
                  <div className="activity-content">
                    <div className="fw-semibold">{activity.title}</div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-12">
          <div className="dashboard-card">
            <h5 className="mb-3">
              <i className="bi bi-lightning me-2"></i>
              Quick Actions
            </h5>
            <div className="row">
              <div className="col-md-3 col-6 mb-3">
                <Link
                  to="/dashboard/tasks/create"
                  className="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
                >
                  <i className="bi bi-plus-circle fs-1 mb-2"></i>
                  <span>Create Task</span>
                </Link>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <Link
                  to="/dashboard/exams/create"
                  className="btn btn-outline-success w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
                >
                  <i className="bi bi-clipboard-plus fs-1 mb-2"></i>
                  <span>Create Exam</span>
                </Link>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <Link
                  to="/dashboard/students"
                  className="btn btn-outline-info w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
                >
                  <i className="bi bi-people fs-1 mb-2"></i>
                  <span>Manage Students</span>
                </Link>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <Link
                  to="/dashboard/analytics"
                  className="btn btn-outline-warning w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
                >
                  <i className="bi bi-graph-up fs-1 mb-2"></i>
                  <span>View Analytics</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TutorDashboard
