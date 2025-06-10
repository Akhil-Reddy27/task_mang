"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../contexts/AuthContext"
import toast from "react-hot-toast"

const ExamList = () => {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

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

    if (user?.id) { // Only fetch when user ID is available
      fetchExams()
    }

    return () => {
      isMounted = false // Cleanup function to prevent memory leaks
    }
  }, [user?.id]) // Only depend on user ID, not the entire user object

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

  // FIXED: Proper date comparison with timezone handling
  const isExamActive = (exam) => {
    const now = new Date()
    const startDate = new Date(exam.startDate)
    const endDate = new Date(exam.endDate)
    
    console.log("Checking exam status:", {
      examTitle: exam.title,
      now: now.toISOString(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      isActive: now >= startDate && now <= endDate
    })
    
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

  // ENHANCED: Proper exam taking functionality
  const handleTakeExam = async (exam) => {
    try {
      console.log("Taking exam:", exam.title, exam._id)
      
      // Check if exam is still active
      if (!isExamActive(exam)) {
        toast.error("This exam is no longer active")
        return
      }

      // Show loading state
      toast.loading("Starting exam...", { id: 'exam-start' })

      // Fetch the full exam details
      const response = await axios.get(`/api/exams/${exam._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      const examData = response.data
      
      // Validate exam can be taken
      if (!examData.isActive) {
        toast.error("This exam is not currently active", { id: 'exam-start' })
        return
      }

      // Success - navigate to exam interface
      toast.success("Exam loaded successfully!", { id: 'exam-start' })
      
      // For now, show exam details in a modal since exam interface isn't implemented yet
      showExamModal(examData)
      
      // TODO: Navigate to actual exam taking interface when implemented
      // navigate(`/dashboard/exams/${exam._id}/take`)
      
    } catch (error) {
      console.error("Error starting exam:", error)
      toast.error("Failed to start exam. Please try again.", { id: 'exam-start' })
      
      if (error.response?.status === 403) {
        toast.error("You don't have permission to take this exam")
      } else if (error.response?.status === 404) {
        toast.error("Exam not found")
      }
    }
  }

  // Show exam details modal
  const showExamModal = (examData) => {
    const modal = document.createElement('div')
    modal.className = 'modal show d-block'
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)'
    modal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-clipboard-check me-2"></i>
              ${examData.title}
            </h5>
            <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info">
              <h6 class="alert-heading">Exam Information</h6>
              <p><strong>Subject:</strong> ${examData.subject}</p>
              <p><strong>Duration:</strong> ${examData.duration} minutes</p>
              <p><strong>Questions:</strong> ${examData.questions?.length || 0}</p>
              <p><strong>Passing Score:</strong> ${examData.passingScore}%</p>
              <p><strong>Attempts Allowed:</strong> ${examData.attemptLimit}</p>
            </div>
            
            <div class="alert alert-warning">
              <h6 class="alert-heading">Instructions</h6>
              <ul>
                <li>You have ${examData.duration} minutes to complete this exam</li>
                <li>You can only take this exam ${examData.attemptLimit} time(s)</li>
                <li>Make sure you have a stable internet connection</li>
                <li>Do not refresh the page during the exam</li>
                <li>Click "Start Exam" when you're ready to begin</li>
              </ul>
            </div>

            <div class="alert alert-success">
              <h6 class="alert-heading">Ready to Start?</h6>
              <p>Once you click "Start Exam", the timer will begin. Make sure you're ready!</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
              Cancel
            </button>
            <button type="button" class="btn btn-primary" onclick="startExamInterface('${examData._id}')">
              <i class="bi bi-play-circle me-2"></i>
              Start Exam
            </button>
          </div>
        </div>
      </div>
    `
    
    document.body.appendChild(modal)
    
    // Add global function for starting exam
    window.startExamInterface = (examId) => {
      modal.remove()
      toast.success("Exam interface will be implemented soon!")
      // TODO: Navigate to actual exam interface
      // navigate(`/dashboard/exams/${examId}/take`)
    }
  }

  const getTimeUntilStart = (exam) => {
    const now = new Date()
    const startDate = new Date(exam.startDate)
    const diffMs = startDate - now
    
    if (diffMs <= 0) return "Started"
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) {
      return `Starts in ${diffDays} day${diffDays > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      return `Starts in ${diffHours} hour${diffHours > 1 ? 's' : ''}`
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `Starts in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`
    }
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
              <div className="card h-100 shadow-sm exam-card">
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
                    <div className="mb-2">
                      <i className="bi bi-calendar-x me-1 text-danger"></i>
                      <span className="text-muted">End: </span>
                      {formatDate(exam.endDate)}
                    </div>
                    
                    {/* Show time until start for upcoming exams */}
                    {isExamUpcoming(exam) && (
                      <div className="alert alert-info py-2 px-3 small mb-0">
                        <i className="bi bi-clock me-1"></i>
                        {getTimeUntilStart(exam)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-footer bg-transparent">
                  {user?.role === "STUDENT" ? (
                    <div className="d-grid">
                      {canTakeExam(exam) ? (
                        <button 
                          className="btn btn-primary btn-lg"
                          onClick={() => handleTakeExam(exam)}
                          style={{
                            background: 'linear-gradient(135deg, #28a745, #20c997)',
                            border: 'none',
                            fontWeight: '600',
                            padding: '0.75rem 1.5rem',
                            boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)'
                            e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)'
                          }}
                          onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)'
                            e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)'
                          }}
                        >
                          <i className="bi bi-play-circle me-2"></i>
                          Take Exam Now
                        </button>
                      ) : canViewResults(exam) ? (
                        <button className="btn btn-outline-secondary">
                          <i className="bi bi-eye me-2"></i>
                          View Results
                        </button>
                      ) : isExamUpcoming(exam) ? (
                        <button className="btn btn-outline-secondary" disabled>
                          <i className="bi bi-clock me-2"></i>
                          {getTimeUntilStart(exam)}
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

      <style jsx>{`
        .exam-card {
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .exam-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        }

        .card-header {
          background: linear-gradient(135deg, #f8fafc 0%, rgba(99, 102, 241, 0.05) 100%);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .badge {
          font-size: 0.75rem;
          padding: 0.375rem 0.75rem;
        }

        .alert-info {
          background-color: rgba(13, 202, 240, 0.1);
          border-color: rgba(13, 202, 240, 0.2);
          color: #0c63e4;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .card-footer {
          padding: 1rem;
        }

        .btn-group .btn {
          flex: 1;
        }

        /* Enhanced Take Exam Button */
        .btn-primary.btn-lg {
          font-size: 1.1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @media (max-width: 768px) {
          .col-md-6 {
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

export default ExamList