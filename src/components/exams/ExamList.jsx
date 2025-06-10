"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../contexts/AuthContext"
import toast from "react-hot-toast"

const ExamList = () => {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    let isMounted = true // Prevent state updates if component unmounts

    const fetchExams = async () => {
      try {
        setLoading(true)
        console.log("Fetching exams for user:", user?.role, user?.id)
        
        const response = await axios.get("/api/exams", {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
        
        console.log("Exams response:", response.data)
        
        if (isMounted) {
          setExams(response.data || [])
          setError(null)
        }
      } catch (err) {
        console.error("Error fetching exams:", err)
        
        if (isMounted) {
          if (err.response?.status === 401) {
            setError("Authentication failed. Please login again.")
            toast.error("Please login again")
          } else if (err.response?.status === 404) {
            setError("Exams endpoint not found. Please check server configuration.")
          } else {
            setError("Failed to load exams. Please try again later.")
          }
          
          setExams([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (user) {
      fetchExams()
    }

    return () => {
      isMounted = false // Cleanup function to prevent memory leaks
    }
  }, [user]) // Only depend on user, not on every render

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isExamActive = (exam) => {
    const now = new Date()
    const startDate = new Date(exam.startDate)
    const endDate = new Date(exam.endDate)
    return now >= startDate && now <= endDate
  }

  const isExamUpcoming = (exam) => {
    const now = new Date()
    const startDate = new Date(exam.startDate)
    return now < startDate
  }

  const isExamCompleted = (exam) => {
    const now = new Date()
    const endDate = new Date(exam.endDate)
    return now > endDate
  }

  const getExamStatusBadge = (exam) => {
    if (isExamUpcoming(exam)) {
      return <span className="badge bg-info">Upcoming</span>
    } else if (isExamActive(exam)) {
      return <span className="badge bg-success">Active</span>
    } else if (isExamCompleted(exam)) {
      return <span className="badge bg-secondary">Completed</span>
    }
    return <span className="badge bg-light text-dark">Unknown</span>
  }

  const canTakeExam = (exam) => {
    return user?.role === "STUDENT" && isExamActive(exam)
  }

  const canViewResults = (exam) => {
    return user?.role === "STUDENT" && isExamCompleted(exam)
  }

  const handleTakeExam = (exam) => {
    // Navigate to exam taking interface
    window.location.href = `/exam/${exam._id}/take`
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid py-3">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <div className="mt-2">
            <button 
              className="btn btn-outline-danger btn-sm"
              onClick={() => window.location.reload()}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-clipboard-check me-2"></i>
          {user?.role === "STUDENT" ? "My Exams" : "Manage Exams"}
        </h2>
        {user?.role === "TUTOR" && (
          <Link to="/dashboard/exams/create" className="btn btn-primary">
            <i className="bi bi-plus-lg me-2"></i>
            Create Exam
          </Link>
        )}
      </div>

      {exams.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center p-5">
            <i className="bi bi-journal-text text-muted" style={{ fontSize: "3rem" }}></i>
            <h5 className="mt-3">No Exams Found</h5>
            <p className="text-muted">
              {user?.role === "STUDENT"
                ? "You don't have any assigned exams yet."
                : "You haven't created any exams yet."}
            </p>
            {user?.role === "TUTOR" && (
              <Link to="/dashboard/exams/create" className="btn btn-primary mt-2">
                <i className="bi bi-plus-lg me-2"></i>
                Create Your First Exam
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="row">
          {exams.map((exam) => (
            <div key={exam._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                  {getExamStatusBadge(exam)}
                  <span className="badge bg-primary">{exam.subject}</span>
                </div>
                <div className="card-body">
                  <h5 className="card-title">{exam.title}</h5>
                  <p className="card-text text-muted small">{exam.description || "No description provided."}</p>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-muted">
                        <i className="bi bi-question-circle me-1"></i>Questions:
                      </span>
                      <span className="fw-semibold">{exam.questions?.length || 0}</span>
                    </div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-muted">
                        <i className="bi bi-clock me-1"></i>Duration:
                      </span>
                      <span className="fw-semibold">{exam.duration} minutes</span>
                    </div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-muted">
                        <i className="bi bi-trophy me-1"></i>Passing Score:
                      </span>
                      <span className="fw-semibold">{exam.passingScore}%</span>
                    </div>
                    {user?.role === "TUTOR" && (
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="text-muted">
                          <i className="bi bi-people me-1"></i>Assigned:
                        </span>
                        <span className="fw-semibold">{exam.assignedTo?.length || 0} students</span>
                      </div>
                    )}
                  </div>

                  <div className="small">
                    <div className="mb-1">
                      <i className="bi bi-calendar-event me-1 text-primary"></i>
                      <span className="text-muted">Start: </span>
                      {formatDate(exam.startDate)}
                    </div>
                    <div>
                      <i className="bi bi-calendar-x me-1 text-danger"></i>
                      <span className="text-muted">End: </span>
                      {formatDate(exam.endDate)}
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-transparent">
                  {user?.role === "STUDENT" ? (
                    <div className="d-grid">
                      {canTakeExam(exam) ? (
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleTakeExam(exam)}
                        >
                          <i className="bi bi-pencil-square me-2"></i>
                          Take Exam
                        </button>
                      ) : canViewResults(exam) ? (
                        <button className="btn btn-outline-secondary">
                          <i className="bi bi-eye me-2"></i>
                          View Results
                        </button>
                      ) : isExamUpcoming(exam) ? (
                        <button className="btn btn-outline-secondary" disabled>
                          <i className="bi bi-clock me-2"></i>
                          Starts {formatDate(exam.startDate)}
                        </button>
                      ) : (
                        <button className="btn btn-outline-secondary" disabled>
                          <i className="bi bi-check-circle me-2"></i>
                          Exam Completed
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="d-flex gap-2">
                      <Link 
                        to={`/dashboard/exams/${exam._id}/edit`} 
                        className="btn btn-outline-primary flex-grow-1"
                        title="Edit Exam"
                      >
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <Link 
                        to={`/dashboard/exams/${exam._id}/analytics`} 
                        className="btn btn-outline-info flex-grow-1"
                        title="View Analytics"
                      >
                        <i className="bi bi-bar-chart"></i>
                      </Link>
                      <button 
                        className="btn btn-outline-danger flex-grow-1"
                        title="Delete Exam"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this exam?')) {
                            // Handle delete
                            toast.info('Delete functionality will be implemented')
                          }
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExamList