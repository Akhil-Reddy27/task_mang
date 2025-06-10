"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
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
import { Doughnut, Line, Bar } from "react-chartjs-2"
import axios from "axios"
import toast from "react-hot-toast"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement)

const TutorDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeTasks: 0,
    completedExams: 0,
    averageClassScore: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [classPerformance, setClassPerformance] = useState([])
  const [loading, setLoading] = useState(true)
  const [animationStep, setAnimationStep] = useState(0)

  useEffect(() => {
    fetchDashboardData()
    
    // Stagger animations
    const animationTimer = setInterval(() => {
      setAnimationStep(prev => prev + 1)
    }, 200)

    setTimeout(() => {
      clearInterval(animationTimer)
    }, 2000)

    return () => clearInterval(animationTimer)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch real data from API
      const [tasksResponse, examsResponse, usersResponse] = await Promise.all([
        axios.get("/api/tasks").catch(() => ({ data: [] })),
        axios.get("/api/exams").catch(() => ({ data: [] })),
        axios.get("/api/users?role=STUDENT").catch(() => ({ data: { users: [] } }))
      ])

      const tasks = tasksResponse.data || []
      const exams = examsResponse.data || []
      const students = usersResponse.data?.users || []

      // Calculate real stats
      const activeTasks = tasks.filter(task => 
        task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS'
      ).length

      const completedExams = exams.filter(exam => 
        new Date(exam.endDate) < new Date()
      ).length

      setStats({
        totalStudents: students.length,
        activeTasks: activeTasks,
        completedExams: completedExams,
        averageClassScore: 78 + Math.floor(Math.random() * 15), // Simulated for now
      })

      // Generate recent activity from real data
      const activities = []
      
      tasks.slice(0, 3).forEach(task => {
        activities.push({
          id: `task-${task._id}`,
          type: "task_created",
          title: `Created task: ${task.title}`,
          time: new Date(task.createdAt).toLocaleString(),
          icon: "bi-plus-circle",
          color: "primary",
          link: `/dashboard/tasks/${task._id}`
        })
      })

      exams.slice(0, 2).forEach(exam => {
        activities.push({
          id: `exam-${exam._id}`,
          type: "exam_created", 
          title: `Created exam: ${exam.title}`,
          time: new Date(exam.createdAt).toLocaleString(),
          icon: "bi-clipboard-check",
          color: "success",
          link: `/dashboard/exams/${exam._id}`
        })
      })

      setRecentActivity(activities.slice(0, 5))

      // Set class performance data
      setClassPerformance([
        { subject: "Mathematics", average: 85, trend: "up", students: Math.floor(students.length * 0.3) },
        { subject: "Physics", average: 78, trend: "down", students: Math.floor(students.length * 0.25) },
        { subject: "Chemistry", average: 82, trend: "up", students: Math.floor(students.length * 0.2) },
        { subject: "Biology", average: 79, trend: "stable", students: Math.floor(students.length * 0.25) },
      ])

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  // Handle navigation clicks
  const handleNavigation = (path) => {
    navigate(path)
  }

  const studentEngagementData = {
    labels: ["Highly Active", "Moderately Active", "Low Activity"],
    datasets: [
      {
        data: [35, 45, 20],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 191, 36, 0.8)", 
          "rgba(239, 68, 68, 0.8)"
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(251, 191, 36, 1)",
          "rgba(239, 68, 68, 1)"
        ],
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  }

  const performanceTrendData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
    datasets: [
      {
        label: "Class Average (%)",
        data: [72, 75, 78, 76, 80, 82],
        borderColor: "rgba(99, 102, 241, 1)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgba(99, 102, 241, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  }

  const subjectComparisonData = {
    labels: classPerformance.map(p => p.subject),
    datasets: [
      {
        label: "Average Score",
        data: classPerformance.map(p => p.average),
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgba(99, 102, 241, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(251, 191, 36, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: "500"
          }
        }
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(99, 102, 241, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading Dashboard...</h5>
        </div>
      </div>
    )
  }

  return (
    <div className="tutor-dashboard">
      {/* Enhanced Welcome Section */}
      <div className={`row mb-4 ${animationStep >= 0 ? 'animate-slide-up' : ''}`}>
        <div className="col-12">
          <div className="welcome-hero">
            <div className="welcome-content">
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <div className="welcome-text">
                    <h1 className="welcome-title">
                      Good morning, Professor! 
                      <span className="wave-emoji">👋</span>
                    </h1>
                    <p className="welcome-subtitle">
                      You have <span className="highlight">{stats.activeTasks}</span> active assignments and 
                      <span className="highlight"> {stats.totalStudents}</span> students in your classes.
                      <span className="highlight"> {stats.completedExams}</span> exams have been completed this week.
                    </p>
                    <div className="welcome-actions">
                      <Link to="/dashboard/tasks/create" className="btn btn-welcome btn-primary">
                        <i className="bi bi-plus-circle me-2"></i>
                        Create Task
                      </Link>
                      <Link to="/dashboard/exams/create" className="btn btn-welcome btn-outline-light">
                        <i className="bi bi-clipboard-check me-2"></i>
                        Create Exam
                      </Link>
                    </div>
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
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="row mb-4">
        {[
          { 
            icon: "bi-people", 
            value: stats.totalStudents, 
            label: "Total Students", 
            color: "primary",
            change: "+12%",
            changeType: "positive"
          },
          { 
            icon: "bi-list-task", 
            value: stats.activeTasks, 
            label: "Active Tasks", 
            color: "success",
            change: "+5%",
            changeType: "positive"
          },
          { 
            icon: "bi-clipboard-check", 
            value: stats.completedExams, 
            label: "Completed Exams", 
            color: "warning",
            change: "+8%",
            changeType: "positive"
          },
          { 
            icon: "bi-graph-up", 
            value: `${stats.averageClassScore}%`, 
            label: "Class Average", 
            color: "info",
            change: "+3%",
            changeType: "positive"
          }
        ].map((stat, index) => (
          <div key={index} className="col-lg-3 col-md-6 mb-3">
            <div 
              className={`enhanced-stat-card ${animationStep >= index + 1 ? 'animate-scale-in' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="stat-card-inner">
                <div className="stat-header">
                  <div className={`stat-icon bg-${stat.color}`}>
                    <i className={stat.icon}></i>
                  </div>
                  <div className={`stat-change ${stat.changeType}`}>
                    <i className={`bi ${stat.changeType === 'positive' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                    {stat.change}
                  </div>
                </div>
                <div className="stat-body">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
                <div className="stat-progress">
                  <div className={`progress-bar bg-${stat.color}`} style={{ width: "75%" }}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Charts Section */}
      <div className="row mb-4">
        <div className="col-lg-4 mb-3">
          <div className={`enhanced-chart-card ${animationStep >= 5 ? 'animate-fade-in' : ''}`}>
            <div className="chart-header">
              <h5 className="chart-title">
                <i className="bi bi-pie-chart me-2 text-primary"></i>
                Student Engagement
              </h5>
              <div className="chart-actions">
                <button className="btn btn-sm btn-outline-secondary">
                  <i className="bi bi-three-dots"></i>
                </button>
              </div>
            </div>
            <div className="chart-body">
              <div className="chart-container">
                <Doughnut data={studentEngagementData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-8 mb-3">
          <div className={`enhanced-chart-card ${animationStep >= 6 ? 'animate-fade-in' : ''}`}>
            <div className="chart-header">
              <h5 className="chart-title">
                <i className="bi bi-graph-up me-2 text-success"></i>
                Performance Trend
              </h5>
              <div className="chart-actions">
                <select className="form-select form-select-sm">
                  <option>Last 6 weeks</option>
                  <option>Last 3 months</option>
                  <option>This semester</option>
                </select>
              </div>
            </div>
            <div className="chart-body">
              <div className="chart-container">
                <Line data={performanceTrendData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Comparison Chart */}
      <div className="row mb-4">
        <div className="col-12">
          <div className={`enhanced-chart-card ${animationStep >= 7 ? 'animate-fade-in' : ''}`}>
            <div className="chart-header">
              <h5 className="chart-title">
                <i className="bi bi-bar-chart me-2 text-warning"></i>
                Subject Performance Comparison
              </h5>
              <div className="chart-actions">
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => handleNavigation('/dashboard/analytics')}
                >
                  <i className="bi bi-eye me-1"></i>
                  View Details
                </button>
              </div>
            </div>
            <div className="chart-body">
              <div className="chart-container" style={{ height: "300px" }}>
                <Bar data={subjectComparisonData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Class Performance and Recent Activity */}
      <div className="row mb-4">
        <div className="col-lg-6 mb-3">
          <div className={`enhanced-activity-card ${animationStep >= 8 ? 'animate-slide-left' : ''}`}>
            <div className="card-header">
              <h5 className="card-title">
                <i className="bi bi-bar-chart me-2 text-info"></i>
                Subject Performance
              </h5>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleNavigation('/dashboard/analytics')}
              >
                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
            <div className="card-body">
              <div className="performance-list">
                {classPerformance.map((subject, index) => (
                  <div key={index} className="performance-item">
                    <div className="performance-info">
                      <div className="subject-name">{subject.subject}</div>
                      <div className="subject-meta">
                        <span className="student-count">{subject.students} students</span>
                        <span className={`trend-indicator ${subject.trend}`}>
                          <i className={`bi ${
                            subject.trend === 'up' ? 'bi-arrow-up' : 
                            subject.trend === 'down' ? 'bi-arrow-down' : 
                            'bi-dash'
                          }`}></i>
                        </span>
                      </div>
                    </div>
                    <div className="performance-score">
                      <span className="score-value">{subject.average}%</span>
                      <div className="score-progress">
                        <div 
                          className={`progress-bar ${
                            subject.average >= 80 ? 'bg-success' : 
                            subject.average >= 70 ? 'bg-warning' : 
                            'bg-danger'
                          }`}
                          style={{ width: `${subject.average}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-6 mb-3">
          <div className={`enhanced-activity-card ${animationStep >= 9 ? 'animate-slide-right' : ''}`}>
            <div className="card-header">
              <h5 className="card-title">
                <i className="bi bi-activity me-2 text-success"></i>
                Recent Activity
              </h5>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleNavigation('/dashboard/notifications')}
              >
                <i className="bi bi-bell"></i>
              </button>
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
                    {activity.link && (
                      <button 
                        className="timeline-action"
                        onClick={() => handleNavigation(activity.link)}
                      >
                        <i className="bi bi-arrow-right"></i>
                      </button>
                    )}
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
      </div>

      {/* Enhanced Quick Actions */}
      <div className="row">
        <div className="col-12">
          <div className={`quick-actions-card ${animationStep >= 10 ? 'animate-fade-in' : ''}`}>
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
                    icon: "bi-plus-circle", 
                    title: "Create Task", 
                    description: "Assign new tasks to students",
                    link: "/dashboard/tasks/create",
                    color: "primary"
                  },
                  { 
                    icon: "bi-clipboard-plus", 
                    title: "Create Exam", 
                    description: "Design and schedule exams",
                    link: "/dashboard/exams/create",
                    color: "success"
                  },
                  { 
                    icon: "bi-people", 
                    title: "Manage Students", 
                    description: "View and organize student groups",
                    link: "/dashboard/students",
                    color: "info"
                  },
                  { 
                    icon: "bi-graph-up", 
                    title: "View Analytics", 
                    description: "Analyze performance metrics",
                    link: "/dashboard/analytics",
                    color: "warning"
                  },
                  { 
                    icon: "bi-chat-dots", 
                    title: "Messages", 
                    description: "Communicate with students",
                    link: "/dashboard/chat",
                    color: "secondary"
                  },
                  { 
                    icon: "bi-calendar-event", 
                    title: "Schedule", 
                    description: "Manage your calendar",
                    link: "/dashboard/calendar",
                    color: "danger"
                  }
                ].map((action, index) => (
                  <button 
                    key={index}
                    onClick={() => handleNavigation(action.link)}
                    className="quick-action-item"
                    style={{ animationDelay: `${index * 0.1}s` }}
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
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .tutor-dashboard {
          padding: 1rem;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          min-height: 100vh;
        }

        /* Welcome Hero Section */
        .welcome-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 24px;
          padding: 3rem;
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
        }

        .welcome-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: float 8s ease-in-out infinite;
        }

        .welcome-content {
          position: relative;
          z-index: 2;
        }

        .welcome-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .wave-emoji {
          display: inline-block;
          animation: wave 2s ease-in-out infinite;
          transform-origin: 70% 70%;
        }

        .welcome-subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .highlight {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.2rem 0.5rem;
          border-radius: 8px;
          font-weight: 600;
        }

        .welcome-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn-welcome {
          padding: 0.75rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid transparent;
        }

        .btn-welcome:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .welcome-illustration {
          position: relative;
          height: 200px;
        }

        .floating-elements {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .element {
          position: absolute;
          font-size: 2rem;
          animation: elementFloat 6s ease-in-out infinite;
          opacity: 0.8;
        }

        .element-1 { top: 20%; left: 20%; animation-delay: 0s; }
        .element-2 { top: 10%; right: 20%; animation-delay: 1.5s; }
        .element-3 { bottom: 30%; left: 30%; animation-delay: 3s; }
        .element-4 { bottom: 20%; right: 30%; animation-delay: 4.5s; }

        /* Enhanced Stat Cards */
        .enhanced-stat-card {
          background: white;
          border-radius: 20px;
          padding: 0;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          height: 100%;
        }

        .enhanced-stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .stat-card-inner {
          padding: 1.5rem;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          position: relative;
        }

        .stat-icon::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: inherit;
          opacity: 0.1;
          transform: scale(1.5);
        }

        .stat-change {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
        }

        .stat-change.positive {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .stat-body {
          flex: 1;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 0.5rem;
          line-height: 1;
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-progress {
          height: 4px;
          background: #f3f4f6;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 1rem;
        }

        .stat-progress .progress-bar {
          height: 100%;
          border-radius: 2px;
          transition: width 1s ease-in-out;
        }

        /* Enhanced Chart Cards */
        .enhanced-chart-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          height: 100%;
        }

        .enhanced-chart-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 1.5rem 0;
        }

        .chart-title {
          margin: 0;
          font-weight: 700;
          color: #1f2937;
          display: flex;
          align-items: center;
        }

        .chart-actions {
          display: flex;
          gap: 0.5rem;
        }

        .chart-body {
          padding: 1.5rem;
        }

        .chart-container {
          height: 300px;
          position: relative;
        }

        /* Enhanced Activity Cards */
        .enhanced-activity-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          height: 100%;
        }

        .enhanced-activity-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 1.5rem 0;
          border: none;
          background: none;
        }

        .card-title {
          margin: 0;
          font-weight: 700;
          color: #1f2937;
          display: flex;
          align-items: center;
        }

        .card-body {
          padding: 1.5rem;
        }

        /* Performance List */
        .performance-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .performance-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .performance-item:hover {
          background: #f1f5f9;
          transform: translateX(4px);
        }

        .performance-info {
          flex: 1;
        }

        .subject-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .subject-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .student-count {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .trend-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          font-size: 0.75rem;
        }

        .trend-indicator.up {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .trend-indicator.down {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .trend-indicator.stable {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        }

        .performance-score {
          text-align: right;
        }

        .score-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          display: block;
          margin-bottom: 0.5rem;
        }

        .score-progress {
          width: 80px;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .score-progress .progress-bar {
          height: 100%;
          border-radius: 3px;
          transition: width 1s ease-in-out;
        }

        /* Activity Timeline */
        .activity-timeline {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .timeline-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .timeline-item:hover {
          background: #f1f5f9;
          transform: translateX(4px);
        }

        .timeline-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .timeline-content {
          flex: 1;
        }

        .timeline-title {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .timeline-time {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .timeline-action {
          color: #6b7280;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .timeline-action:hover {
          color: #3b82f6;
          transform: translateX(2px);
        }

        /* Quick Actions */
        .quick-actions-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .quick-action-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 16px;
          border: 2px solid transparent;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          width: 100%;
          text-align: left;
        }

        .quick-action-item:hover {
          background: white;
          border-color: #e5e7eb;
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .action-icon-wrapper {
          position: relative;
        }

        .action-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          position: relative;
        }

        .action-icon::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: inherit;
          opacity: 0.1;
          transform: scale(1.5);
        }

        .action-content {
          flex: 1;
        }

        .action-title {
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .action-description {
          color: #6b7280;
          margin: 0;
          font-size: 0.875rem;
        }

        .action-arrow {
          color: #6b7280;
          transition: all 0.3s ease;
        }

        .quick-action-item:hover .action-arrow {
          color: #3b82f6;
          transform: translateX(4px);
        }

        /* Animations */
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-10deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes elementFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.1); }
        }

        .animate-slide-up {
          animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-slide-left {
          animation: slideLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-slide-right {
          animation: slideRight 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .tutor-dashboard {
            padding: 0.5rem;
          }

          .welcome-hero {
            padding: 2rem 1.5rem;
          }

          .welcome-title {
            font-size: 2rem;
          }

          .welcome-subtitle {
            font-size: 1rem;
          }

          .welcome-actions {
            flex-direction: column;
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }

          .chart-container {
            height: 250px;
          }
        }
      `}</style>
    </div>
  )
}

export default TutorDashboard