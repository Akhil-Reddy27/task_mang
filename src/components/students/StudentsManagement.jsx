"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import axios from "axios"
import toast from "react-hot-toast"

const StudentsManagement = () => {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [sortBy, setSortBy] = useState("name")

  const subjects = [
    "Mathematics", "Physics", "Chemistry", "Biology", 
    "Computer Science", "English", "History", "Geography"
  ]

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/users?role=STUDENT")
      
      if (response.data.success) {
        setStudents(response.data.users || [])
      } else {
        setStudents([])
        toast.error("Failed to load students")
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Failed to load students")
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.studentId && student.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesSubject = !selectedSubject || 
                          (student.enrolledSubjects && student.enrolledSubjects.includes(selectedSubject))
    
    return matchesSearch && matchesSubject
  })

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.fullName.localeCompare(b.fullName)
      case "email":
        return a.email.localeCompare(b.email)
      case "studentId":
        return (a.studentId || "").localeCompare(b.studentId || "")
      case "joinDate":
        return new Date(b.createdAt) - new Date(a.createdAt)
      default:
        return 0
    }
  })

  if (user?.role !== "TUTOR") {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Access denied. Only tutors can manage students.
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-people me-2 text-primary"></i>
                Manage Students
              </h2>
              <p className="text-muted mb-0">View and organize your student groups</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary">
                <i className="bi bi-download me-2"></i>
                Export List
              </button>
              <button className="btn btn-primary">
                <i className="bi bi-person-plus me-2"></i>
                Add Student
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Search Students</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name, email, or student ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Filter by Subject</label>
                  <select
                    className="form-select"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="">All Subjects</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Sort by</label>
                  <select
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="studentId">Student ID</option>
                    <option value="joinDate">Join Date</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">&nbsp;</label>
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedSubject("")
                      setSortBy("name")
                    }}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-list me-2"></i>
                  Students ({sortedStudents.length})
                </h5>
                <div className="btn-group btn-group-sm">
                  <button className="btn btn-outline-secondary active">
                    <i className="bi bi-grid-3x3-gap"></i>
                  </button>
                  <button className="btn btn-outline-secondary">
                    <i className="bi bi-list-ul"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center p-5">
                  <div className="spinner-border text-primary\" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : sortedStudents.length === 0 ? (
                <div className="text-center p-5">
                  <i className="bi bi-person-x text-muted" style={{ fontSize: "3rem" }}></i>
                  <h5 className="mt-3">No Students Found</h5>
                  <p className="text-muted">
                    {searchTerm || selectedSubject 
                      ? "No students match your current filters." 
                      : "No students have been enrolled yet."
                    }
                  </p>
                  {(searchTerm || selectedSubject) && (
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => {
                        setSearchTerm("")
                        setSelectedSubject("")
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="row g-0">
                  {sortedStudents.map((student, index) => (
                    <div key={student._id} className="col-lg-4 col-md-6">
                      <div className="student-card">
                        <div className="student-card-body">
                          <div className="d-flex align-items-start">
                            <div className="student-avatar">
                              <div className="avatar-circle bg-primary">
                                {student.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div className="status-indicator bg-success"></div>
                            </div>
                            <div className="student-info flex-grow-1">
                              <h6 className="student-name">{student.fullName}</h6>
                              <p className="student-email">{student.email}</p>
                              {student.studentId && (
                                <p className="student-id">ID: {student.studentId}</p>
                              )}
                              <div className="student-meta">
                                <small className="text-muted">
                                  <i className="bi bi-calendar me-1"></i>
                                  Joined {new Date(student.createdAt).toLocaleDateString()}
                                </small>
                              </div>
                            </div>
                            <div className="student-actions">
                              <div className="dropdown">
                                <button 
                                  className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                  data-bs-toggle="dropdown"
                                >
                                  <i className="bi bi-three-dots"></i>
                                </button>
                                <ul className="dropdown-menu">
                                  <li>
                                    <a className="dropdown-item" href="#">
                                      <i className="bi bi-eye me-2"></i>View Profile
                                    </a>
                                  </li>
                                  <li>
                                    <a className="dropdown-item" href="#">
                                      <i className="bi bi-chat me-2"></i>Send Message
                                    </a>
                                  </li>
                                  <li>
                                    <a className="dropdown-item" href="#">
                                      <i className="bi bi-graph-up me-2"></i>View Progress
                                    </a>
                                  </li>
                                  <li><hr className="dropdown-divider" /></li>
                                  <li>
                                    <a className="dropdown-item text-danger" href="#">
                                      <i className="bi bi-person-dash me-2"></i>Remove Student
                                    </a>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          
                          {student.enrolledSubjects && student.enrolledSubjects.length > 0 && (
                            <div className="student-subjects">
                              <div className="subjects-label">Enrolled Subjects:</div>
                              <div className="subjects-list">
                                {student.enrolledSubjects.slice(0, 3).map((subject, idx) => (
                                  <span key={idx} className="badge bg-light text-dark me-1 mb-1">
                                    {subject}
                                  </span>
                                ))}
                                {student.enrolledSubjects.length > 3 && (
                                  <span className="badge bg-secondary">
                                    +{student.enrolledSubjects.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="student-stats">
                            <div className="stat-item">
                              <div className="stat-value">8</div>
                              <div className="stat-label">Tasks</div>
                            </div>
                            <div className="stat-item">
                              <div className="stat-value">5</div>
                              <div className="stat-label">Exams</div>
                            </div>
                            <div className="stat-item">
                              <div className="stat-value">85%</div>
                              <div className="stat-label">Avg Score</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .student-card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          margin: 1rem;
          transition: all 0.3s ease;
          background: white;
        }

        .student-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border-color: #3b82f6;
        }

        .student-card-body {
          padding: 1.5rem;
        }

        .student-avatar {
          position: relative;
          margin-right: 1rem;
        }

        .avatar-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1.2rem;
        }

        .status-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
        }

        .student-info {
          min-width: 0;
        }

        .student-name {
          margin-bottom: 0.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .student-email {
          margin-bottom: 0.25rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .student-id {
          margin-bottom: 0.5rem;
          color: #9ca3af;
          font-size: 0.8rem;
        }

        .student-meta {
          margin-bottom: 1rem;
        }

        .student-subjects {
          margin: 1rem 0;
        }

        .subjects-label {
          font-size: 0.8rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .subjects-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .student-stats {
          display: flex;
          justify-content: space-around;
          padding-top: 1rem;
          border-top: 1px solid #f3f4f6;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-weight: 700;
          font-size: 1.1rem;
          color: #1f2937;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .student-actions {
          margin-left: auto;
        }

        @media (max-width: 768px) {
          .student-card {
            margin: 0.5rem;
          }
          
          .student-card-body {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

export default StudentsManagement