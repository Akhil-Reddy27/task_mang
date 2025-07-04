"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import axios from "axios"
import toast from "react-hot-toast"

const CreateExam = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    assignedTo: [],
    duration: 60,
    startDate: "",
    endDate: "",
    attemptLimit: 1,
    passingScore: 60,
    showResultsImmediately: false,
    showCorrectAnswers: false,
    randomizeQuestions: false,
    questions: []
  })

  const subjectOptions = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "English",
    "History",
    "Geography",
    "Economics",
    "Psychology",
  ]

  useEffect(() => {
    fetchStudents()
    
    // Set default dates - FIXED: Proper timezone handling
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0) // 9 AM tomorrow
    
    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)
    dayAfterTomorrow.setHours(17, 0, 0, 0) // 5 PM day after tomorrow
    
    // Format dates for datetime-local input (YYYY-MM-DDTHH:MM)
    const formatDateForInput = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }
    
    setFormData(prev => ({
      ...prev,
      startDate: formatDateForInput(tomorrow),
      endDate: formatDateForInput(dayAfterTomorrow)
    }))
  }, [])

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true)
      console.log("Fetching students...")
      
      // Get the token from localStorage
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Authentication required")
        navigate("/signin")
        return
      }

      const response = await axios.get("/api/users", {
        params: { role: "STUDENT" },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log("Students response:", response.data)
      
      if (response.data.success) {
        setStudents(response.data.users || [])
      } else {
        setStudents([])
        toast.error("Failed to load students")
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      setStudents([])
      
      if (error.response?.status === 401) {
        toast.error("Authentication failed. Please login again.")
        navigate("/signin")
      } else if (error.response?.status === 404) {
        toast.error("Students endpoint not found. Please check server configuration.")
      } else {
        toast.error("Failed to load students. Please try again.")
      }
    } finally {
      setStudentsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === "assignedTo") {
      if (checked) {
        setFormData(prev => ({
          ...prev,
          assignedTo: [...prev.assignedTo, value]
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          assignedTo: prev.assignedTo.filter(id => id !== value)
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value
      }))
    }
  }

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: "",
      type: "SINGLE",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
      ],
      explanation: "",
      topic: "",
      difficulty: "MEDIUM",
      points: 1
    }

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }))
  }

  const updateQuestion = (questionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }))
  }

  const updateOption = (questionId, optionIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? {
              ...q,
              options: q.options.map((opt, idx) => 
                idx === optionIndex ? { ...opt, [field]: value } : opt
              )
            }
          : q
      )
    }))
  }

  const removeQuestion = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!formData.title || !formData.subject || !formData.startDate || !formData.endDate) {
        toast.error("Please fill in all required fields")
        return
      }

      if (formData.assignedTo.length === 0) {
        toast.error("Please select at least one student")
        return
      }

      if (formData.questions.length === 0) {
        toast.error("Please add at least one question")
        return
      }

      // Validate questions
      for (let i = 0; i < formData.questions.length; i++) {
        const question = formData.questions[i]
        if (!question.question.trim()) {
          toast.error(`Question ${i + 1} is empty`)
          return
        }

        const hasCorrectAnswer = question.options.some(opt => opt.isCorrect)
        if (!hasCorrectAnswer) {
          toast.error(`Question ${i + 1} must have at least one correct answer`)
          return
        }

        const hasEmptyOption = question.options.some(opt => !opt.text.trim())
        if (hasEmptyOption) {
          toast.error(`Question ${i + 1} has empty options`)
          return
        }
      }

      // FIXED: Proper date validation with timezone handling
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      const now = new Date()

      console.log("Date validation:")
      console.log("Start date:", startDate.toISOString())
      console.log("End date:", endDate.toISOString())
      console.log("Current time:", now.toISOString())

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        toast.error("Invalid date format")
        return
      }

      // Allow exams to start within the next 5 minutes (for testing)
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)
      if (startDate < fiveMinutesFromNow) {
        toast.error("Start date must be at least 5 minutes in the future")
        return
      }

      if (endDate <= startDate) {
        toast.error("End date must be after start date")
        return
      }

      // Prepare data for submission - FIXED: Ensure proper date format
      const examData = {
        ...formData,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        questions: formData.questions.map(q => ({
          question: q.question,
          type: q.type,
          options: q.options,
          explanation: q.explanation,
          topic: q.topic,
          difficulty: q.difficulty,
          points: q.points
        }))
      }

      console.log("Submitting exam data:", {
        ...examData,
        questions: `${examData.questions.length} questions`
      })

      const response = await axios.post("/api/exams", examData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data) {
        toast.success("Exam created successfully!")
        console.log("Exam created:", response.data)
        navigate("/dashboard/exams")
      }
    } catch (error) {
      console.error("Error creating exam:", error)
      const message = error.response?.data?.message || "Failed to create exam"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (formData.assignedTo.length === students.length) {
      setFormData(prev => ({ ...prev, assignedTo: [] }))
    } else {
      setFormData(prev => ({ ...prev, assignedTo: students.map(s => s._id) }))
    }
  }

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate basic info
      if (!formData.title || !formData.subject || !formData.startDate || !formData.endDate) {
        toast.error("Please fill in all required fields")
        return
      }
      if (formData.assignedTo.length === 0) {
        toast.error("Please select at least one student")
        return
      }
      
      // Validate dates
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      const now = new Date()
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        toast.error("Please enter valid dates")
        return
      }
      
      if (endDate <= startDate) {
        toast.error("End date must be after start date")
        return
      }
    }
    setCurrentStep(prev => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  // Helper function to get minimum date for inputs
  const getMinDateTime = () => {
    const now = new Date()
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)
    return fiveMinutesFromNow.toISOString().slice(0, 16)
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-clipboard-plus me-2 text-primary"></i>
                Create New Exam
              </h2>
              <p className="text-muted mb-0">Create an online examination for your students</p>
            </div>
            <button 
              onClick={() => navigate("/dashboard/exams")} 
              className="btn btn-outline-secondary"
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Exams
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                  <div className="step-number">1</div>
                  <div className="step-label">Basic Info</div>
                </div>
                <div className="step-line"></div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                  <div className="step-number">2</div>
                  <div className="step-label">Questions</div>
                </div>
                <div className="step-line"></div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                  <div className="step-number">3</div>
                  <div className="step-label">Review</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="row">
            <div className="col-lg-8">
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Exam Details
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-8">
                      <label htmlFor="title" className="form-label">
                        Exam Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter exam title"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="subject" className="form-label">
                        Subject <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Subject</option>
                        {subjectOptions.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the exam content and objectives"
                    ></textarea>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label htmlFor="duration" className="form-label">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        min="5"
                        max="300"
                      />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="attemptLimit" className="form-label">
                        Attempt Limit
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="attemptLimit"
                        name="attemptLimit"
                        value={formData.attemptLimit}
                        onChange={handleChange}
                        min="1"
                        max="5"
                      />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="passingScore" className="form-label">
                        Passing Score (%)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="passingScore"
                        name="passingScore"
                        value={formData.passingScore}
                        onChange={handleChange}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="startDate" className="form-label">
                        Start Date & Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        min={getMinDateTime()}
                        required
                      />
                      <small className="form-text text-muted">
                        Exam must start at least 5 minutes from now
                      </small>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="endDate" className="form-label">
                        End Date & Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        min={formData.startDate || getMinDateTime()}
                        required
                      />
                      <small className="form-text text-muted">
                        Must be after start date
                      </small>
                    </div>
                  </div>

                  {/* Date Preview */}
                  {formData.startDate && formData.endDate && (
                    <div className="alert alert-info">
                      <h6 className="alert-heading">
                        <i className="bi bi-calendar-check me-2"></i>
                        Exam Schedule Preview
                      </h6>
                      <div className="row">
                        <div className="col-md-6">
                          <strong>Start:</strong> {new Date(formData.startDate).toLocaleString()}
                        </div>
                        <div className="col-md-6">
                          <strong>End:</strong> {new Date(formData.endDate).toLocaleString()}
                        </div>
                      </div>
                      <hr />
                      <div className="row">
                        <div className="col-md-6">
                          <strong>Duration:</strong> {formData.duration} minutes
                        </div>
                        <div className="col-md-6">
                          <strong>Total Window:</strong> {
                            Math.round((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))
                          } day(s)
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <h6>Exam Settings</h6>
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="showResultsImmediately"
                        name="showResultsImmediately"
                        checked={formData.showResultsImmediately}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="showResultsImmediately">
                        Show results immediately after submission
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="showCorrectAnswers"
                        name="showCorrectAnswers"
                        checked={formData.showCorrectAnswers}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="showCorrectAnswers">
                        Show correct answers to students
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="randomizeQuestions"
                        name="randomizeQuestions"
                        checked={formData.randomizeQuestions}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="randomizeQuestions">
                        Randomize question order
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm">
                <div className="card-header bg-success text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <i className="bi bi-people me-2"></i>
                      Assign to Students
                    </h5>
                    {!studentsLoading && students.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-light"
                        onClick={handleSelectAll}
                      >
                        {formData.assignedTo.length === students.length ? "Deselect All" : "Select All"}
                      </button>
                    )}
                  </div>
                </div>
                <div className="card-body" style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {studentsLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary\" role=\"status">
                        <span className="visually-hidden">Loading students...</span>
                      </div>
                      <p className="mt-2 text-muted">Loading students...</p>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      <i className="bi bi-person-x fs-1 mb-2"></i>
                      <p>No students found</p>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-primary"
                        onClick={fetchStudents}
                      >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Retry
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {students.map(student => (
                        <div key={student._id} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`student-${student._id}`}
                            name="assignedTo"
                            value={student._id}
                            checked={formData.assignedTo.includes(student._id)}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor={`student-${student._id}`}>
                            <div>
                              <div className="fw-semibold">{student.fullName}</div>
                              <small className="text-muted">{student.email}</small>
                              {student.studentId && (
                                <small className="text-muted d-block">ID: {student.studentId}</small>
                              )}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="card-footer bg-light">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    {formData.assignedTo.length} student(s) selected
                  </small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Questions */}
        {currentStep === 2 && (
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-warning text-dark">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <i className="bi bi-question-circle me-2"></i>
                      Exam Questions ({formData.questions.length})
                    </h5>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={addQuestion}
                    >
                      <i className="bi bi-plus-lg me-2"></i>
                      Add Question
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  {formData.questions.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <i className="bi bi-question-circle fs-1 mb-3"></i>
                      <h5>No questions added yet</h5>
                      <p>Click "Add Question" to start creating your exam</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.questions.map((question, index) => (
                        <div key={question.id} className="border rounded p-4 mb-4">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <h6 className="mb-0">Question {index + 1}</h6>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeQuestion(question.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>

                          <div className="mb-3">
                            <label className="form-label">Question Text</label>
                            <textarea
                              className="form-control"
                              rows="2"
                              value={question.question}
                              onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                              placeholder="Enter your question"
                            />
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-3">
                              <label className="form-label">Type</label>
                              <select
                                className="form-select"
                                value={question.type}
                                onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                              >
                                <option value="SINGLE">Single Choice</option>
                                <option value="MULTIPLE">Multiple Choice</option>
                              </select>
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Difficulty</label>
                              <select
                                className="form-select"
                                value={question.difficulty}
                                onChange={(e) => updateQuestion(question.id, 'difficulty', e.target.value)}
                              >
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                              </select>
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Points</label>
                              <input
                                type="number"
                                className="form-control"
                                value={question.points}
                                onChange={(e) => updateQuestion(question.id, 'points', Number(e.target.value))}
                                min="1"
                                max="10"
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Topic</label>
                              <input
                                type="text"
                                className="form-control"
                                value={question.topic}
                                onChange={(e) => updateQuestion(question.id, 'topic', e.target.value)}
                                placeholder="Optional"
                              />
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="form-label">Answer Options</label>
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="input-group mb-2">
                                <div className="input-group-text">
                                  <input
                                    className="form-check-input"
                                    type={question.type === "SINGLE" ? "radio" : "checkbox"}
                                    name={`question-${question.id}-correct`}
                                    checked={option.isCorrect}
                                    onChange={(e) => {
                                      if (question.type === "SINGLE") {
                                        // For single choice, uncheck all others first
                                        const newOptions = question.options.map((opt, idx) => ({
                                          ...opt,
                                          isCorrect: idx === optIndex ? e.target.checked : false
                                        }))
                                        updateQuestion(question.id, 'options', newOptions)
                                      } else {
                                        updateOption(question.id, optIndex, 'isCorrect', e.target.checked)
                                      }
                                    }}
                                  />
                                </div>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={option.text}
                                  onChange={(e) => updateOption(question.id, optIndex, 'text', e.target.value)}
                                  placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                />
                              </div>
                            ))}
                          </div>

                          <div className="mb-3">
                            <label className="form-label">Explanation (Optional)</label>
                            <textarea
                              className="form-control"
                              rows="2"
                              value={question.explanation}
                              onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                              placeholder="Explain the correct answer"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-eye me-2"></i>
                    Review Exam
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Exam Details</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>Title:</strong></td>
                            <td>{formData.title}</td>
                          </tr>
                          <tr>
                            <td><strong>Subject:</strong></td>
                            <td>{formData.subject}</td>
                          </tr>
                          <tr>
                            <td><strong>Duration:</strong></td>
                            <td>{formData.duration} minutes</td>
                          </tr>
                          <tr>
                            <td><strong>Questions:</strong></td>
                            <td>{formData.questions.length}</td>
                          </tr>
                          <tr>
                            <td><strong>Total Points:</strong></td>
                            <td>{formData.questions.reduce((sum, q) => sum + q.points, 0)}</td>
                          </tr>
                          <tr>
                            <td><strong>Passing Score:</strong></td>
                            <td>{formData.passingScore}%</td>
                          </tr>
                          <tr>
                            <td><strong>Start Date:</strong></td>
                            <td>{new Date(formData.startDate).toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td><strong>End Date:</strong></td>
                            <td>{new Date(formData.endDate).toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h6>Assigned Students ({formData.assignedTo.length})</h6>
                      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {students
                          .filter(s => formData.assignedTo.includes(s._id))
                          .map(student => (
                            <div key={student._id} className="d-flex align-items-center mb-2">
                              <i className="bi bi-person-circle me-2"></i>
                              <div>
                                <div className="fw-semibold">{student.fullName}</div>
                                <small className="text-muted">{student.email}</small>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  <hr />

                  <h6>Questions Preview</h6>
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {formData.questions.map((question, index) => (
                      <div key={question.id} className="border rounded p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0">Q{index + 1}. {question.question}</h6>
                          <span className="badge bg-primary">{question.points} pts</span>
                        </div>
                        <div className="row">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="col-md-6 mb-1">
                              <div className={`p-2 rounded ${option.isCorrect ? 'bg-success bg-opacity-10 border border-success' : 'bg-light'}`}>
                                <i className={`bi ${option.isCorrect ? 'bi-check-circle-fill text-success' : 'bi-circle'} me-2`}></i>
                                {String.fromCharCode(65 + optIndex)}. {option.text}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons - ENHANCED WITH BETTER VISIBILITY */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="d-flex justify-content-between">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-lg"
                    onClick={prevStep}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Previous
                  </button>
                )}
              </div>
              <div>
                {currentStep < 3 ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={nextStep}
                  >
                    Next
                    <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-success btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2\" role=\"status"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Create Exam
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        
        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #e9ecef;
          color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-bottom: 8px;
          transition: all 0.3s ease;
        }
        
        .step.active .step-number {
          background-color: #0d6efd;
          color: white;
        }
        
        .step-label {
          font-size: 0.9rem;
          color: #6c757d;
          font-weight: 500;
        }
        
        .step.active .step-label {
          color: #0d6efd;
          font-weight: 600;
        }
        
        .step-line {
          flex: 1;
          height: 2px;
          background-color: #e9ecef;
          margin: 0 20px;
          align-self: flex-start;
          margin-top: 20px;
        }

        .alert-info {
          background-color: rgba(13, 202, 240, 0.1);
          border-color: rgba(13, 202, 240, 0.2);
          color: #0c63e4;
        }

        .form-text {
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .card-header {
          font-weight: 600;
        }

        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }

        .input-group-text {
          background-color: #f8f9fa;
          border-color: #dee2e6;
        }

        .border {
          border-color: #dee2e6 !important;
        }

        .bg-success.bg-opacity-10 {
          background-color: rgba(25, 135, 84, 0.1) !important;
        }

        .border-success {
          border-color: #198754 !important;
        }

        /* Enhanced button styles */
        .btn-primary {
          background-color: #0d6efd;
          border-color: #0d6efd;
          color: white;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          box-shadow: 0 4px 6px rgba(13, 110, 253, 0.25);
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          background-color: #0b5ed7;
          border-color: #0a58ca;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(13, 110, 253, 0.3);
        }
        
        .btn-success {
          background-color: #198754;
          border-color: #198754;
          color: white;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          box-shadow: 0 4px 6px rgba(25, 135, 84, 0.25);
          transition: all 0.3s ease;
        }
        
        .btn-success:hover {
          background-color: #157347;
          border-color: #146c43;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(25, 135, 84, 0.3);
        }
        
        .btn-outline-dark {
          color: #212529;
          border-color: #212529;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          transition: all 0.3s ease;
        }
        
        .btn-outline-dark:hover {
          background-color: #212529;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        }
        
        .btn-lg {
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  )
}

export default CreateExam