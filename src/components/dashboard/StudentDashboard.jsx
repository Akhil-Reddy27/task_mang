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
  LineElement,"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
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

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement)

const StudentDashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showExamModal, setShowExamModal] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)
  const [selectedResult, setSelectedResult] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [examAnswers, setExamAnswers] = useState({})
  const [examTimeLeft, setExamTimeLeft] = useState(null)

  const [stats, setStats] = useState({
    pendingTasks: 4,
    completedTasks: 12,
    upcomingExams: 3,
    averageScore: 85,
    totalSubjects: 5,
    studyHours: 24,
  })
  const [tasks, setTasks] = useState([])
  const [exams, setExams] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())

  // Mock exam questions
  const mockExamQuestions = [
    {
      id: 1,
      question: "What is the powerhouse of the cell?",
      options: ["Nucleus", "Mitochondria", "Ribosome", "Endoplasmic Reticulum"],
      correct: 1,
    },
    {
      id: 2,
      question: "Which process converts glucose into energy?",
      options: ["Photosynthesis", "Cellular Respiration", "Osmosis", "Diffusion"],
      correct: 1,
    },
    {
      id: 3,
      question: "What is DNA?",
      options: ["Protein", "Carbohydrate", "Nucleic Acid", "Lipid"],
      correct: 2,
    },
  ]

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        setTasks([
          {
            id: 1,
            title: "Chemistry Lab Report",
            subject: "Chemistry",
            description: "Organic Chemistry Analysis - Benzene Reactions",
            dueDate: "2025-06-12T23:59:00",
            status: "pending",
            priority: "high",
            progress: 60,
          },
          {
            id: 2,
            title: "Mathematics Assignment",
            subject: "Mathematics",
            description: "Calculus Problems - Integration and Differentiation",
            dueDate: "2025-06-09T23:59:00",
            status: "completed",
            priority: "medium",
            progress: 100,
            score: 92,
          },
          {
            id: 3,
            title: "Physics Problem Set",
            subject: "Physics",
            description: "Mechanics and Thermodynamics",
            dueDate: "2025-06-15T23:59:00",
            status: "in_progress",
            priority: "medium",
            progress: 30,
          },
          {
            id: 4,
            title: "English Literature Essay",
            subject: "English",
            description: "Analysis of Shakespeare's Hamlet",
            dueDate: "2025-06-18T23:59:00",
            status: "pending",
            priority: "low",
            progress: 0,
          },
        ])

        setExams([
          {
            id: 1,
            title: "Biology Final Exam",
            subject: "Biology",
            description: "Comprehensive final examination covering all topics",
            date: "2025-06-18T09:00:00",
            duration: 180,
            status: "upcoming",
            passingScore: 70,
            questions: mockExamQuestions,
          },
          {
            id: 2,
            title: "Physics Mid-term",
            subject: "Physics",
            description: "Mechanics and Thermodynamics",
            date: "2025-06-25T14:00:00",
            duration: 120,
            status: "upcoming",
            passingScore: 75,
            questions: mockExamQuestions,
          },
          {
            id: 3,
            title: "Mathematics Quiz",
            subject: "Mathematics",
            description: "Calculus and Algebra",
            date: "2025-06-09T10:00:00",
            duration: 60,
            status: "completed",
            score: 92,
            passingScore: 70,
            questions: mockExamQuestions,
          },
        ])

        setRecentActivity([
          {
            id: 1,
            type: "task",
            title: "Mathematics Assignment - Calculus",
            status: "completed",
            date: "2025-06-09T14:30:00",
            score: 92,
            subject: "Mathematics",
          },
          {
            id: 2,
            type: "exam",
            title: "Physics Mid-term Examination",
            status: "graded",
            score: 88,
            date: "2025-06-07T10:00:00",
            subject: "Physics",
          },
          {
            id: 3,
            type: "task",
            title: "History Research Paper",
            status: "submitted",
            date: "2025-06-05T09:15:00",
            subject: "History",
          },
          {
            id: 4,
            type: "task",
            title: "Chemistry Lab Report",
            status: "pending",
            dueDate: "2025-06-12T23:59:00",
            subject: "Chemistry",
          },
        ])

        setUpcomingDeadlines([
          {
            id: 1,
            title: "Chemistry Lab Report",
            subject: "Chemistry",
            type: "Assignment",
            dueDate: "2025-06-12T23:59:00",
            priority: "high",
          },
          {
            id: 2,
            title: "English Literature Essay",
            subject: "English",
            type: "Essay",
            dueDate: "2025-06-15T23:59:00",
            priority: "medium",
          },
          {
            id: 3,
            title: "Biology Final Exam",
            subject: "Biology",
            type: "Exam",
            dueDate: "2025-06-18T09:00:00",
            priority: "high",
          },
        ])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Timer for exam
  useEffect(() => {
    let timer
    if (examTimeLeft > 0) {
      timer = setInterval(() => {
        setExamTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitExam()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [examTimeLeft])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAddTask = (taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      status: "pending",
      progress: 0,
    }
    setTasks((prev) => [...prev, newTask])
    setShowTaskModal(false)
  }

  const handleAddEvent = (eventData) => {
    // Add event logic here
    console.log("Adding event:", eventData)
    setShowEventModal(false)
  }

  const handleStartExam = (exam) => {
    setSelectedExam(exam)
    setCurrentQuestion(0)
    setExamAnswers({})
    setExamTimeLeft(exam.duration * 60) // Convert minutes to seconds
    setShowExamModal(true)
  }

  const handleExamAnswer = (questionId, answerIndex) => {
    setExamAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestion < selectedExam.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleSubmitExam = () => {
    // Calculate score
    let correct = 0
    selectedExam.questions.forEach((question) => {
      if (examAnswers[question.id] === question.correct) {
        correct++
      }
    })
    const score = Math.round((correct / selectedExam.questions.length) * 100)

    // Update exam with score
    setExams((prev) =>
      prev.map((exam) => (exam.id === selectedExam.id ? { ...exam, status: "completed", score } : exam)),
    )

    setShowExamModal(false)
    setSelectedResult({ ...selectedExam, score, correct, total: selectedExam.questions.length })
    setShowResultModal(true)
  }

  const handleViewResult = (exam) => {
    setSelectedResult(exam)
    setShowResultModal(true)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTimeUntilDeadline = (dateString) => {
    const deadline = new Date(dateString)
    const now = new Date()
    const diffTime = deadline - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Overdue"
    if (diffDays === 0) return "Due today"
    if (diffDays === 1) return "Due tomorrow"
    return `${diffDays} days left`
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "danger"
      case "medium":
        return "warning"
      case "low":
        return "success"
      default:
        return "secondary"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success"
      case "in_progress":
        return "primary"
      case "pending":
        return "warning"
      case "overdue":
        return "danger"
      default:
        return "secondary"
    }
  }

  const handleTaskStatusChange = (taskId, newStatus) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
  }

  const handleTaskDelete = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
  }

  // Chart data
  const taskCompletionData = {
    labels: ["Completed", "In Progress", "Pending"],
    datasets: [
      {
        data: [
          tasks.filter((t) => t.status === "completed").length,
          tasks.filter((t) => t.status === "in_progress").length,
          tasks.filter((t) => t.status === "pending").length,
        ],
        backgroundColor: ["#10b981", "#3b82f6", "#f59e0b"],
        borderWidth: 0,
      },
    ],
  }

  const performanceData = {
    labels: ["Math", "Physics", "Chemistry", "Biology", "English"],
    datasets: [
      {
        label: "Scores (%)",
        data: [92, 88, 85, 90, 87],
        backgroundColor: "rgba(99, 102, 241, 0.8)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const studyHoursData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Study Hours",
        data: [3, 4, 2, 5, 3, 6, 4],
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
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

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: "bi-house",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: "bi-list-task",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      id: "exams",
      label: "Exams",
      icon: "bi-clipboard-check",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: "bi-graph-up",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: "bi-calendar",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
  ]

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    hover: { scale: 1.02, y: -5 },
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  }

  // Task Modal Component
  const TaskModal = () => {
    const [formData, setFormData] = useState({
      title: "",
      subject: "",
      description: "",
      dueDate: "",
      priority: "medium",
    })

    const handleSubmit = (e) => {
      e.preventDefault()
      handleAddTask(formData)
    }

    return (
      <AnimatePresence>
        {showTaskModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTaskModal(false)}
          >
            <motion.div
              className="modal-content task-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h4 className="modal-title">
                  <i className="bi bi-plus-circle me-2"></i>
                  Create New Task
                </h4>
                <button className="btn-close" onClick={() => setShowTaskModal(false)}>
                  <i className="bi bi-x"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-group">
                  <label>Task Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <select
                    className="form-control"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English">English</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    className="form-control"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-check me-2"></i>
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Event Modal Component
  const EventModal = () => {
    const [formData, setFormData] = useState({
      title: "",
      type: "assignment",
      date: "",
      description: "",
    })

    const handleSubmit = (e) => {
      e.preventDefault()
      handleAddEvent(formData)
    }

    return (
      <AnimatePresence>
        {showEventModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEventModal(false)}
          >
            <motion.div
              className="modal-content event-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h4 className="modal-title">
                  <i className="bi bi-calendar-plus me-2"></i>
                  Add Calendar Event
                </h4>
                <button className="btn-close" onClick={() => setShowEventModal(false)}>
                  <i className="bi bi-x"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-group">
                  <label>Event Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Event Type</label>
                  <select
                    className="form-control"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                    <option value="meeting">Meeting</option>
                    <option value="deadline">Deadline</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEventModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-check me-2"></i>
                    Add Event
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Exam Modal Component
  const ExamModal = () => {
    if (!selectedExam) return null

    const currentQ = selectedExam.questions[currentQuestion]
    const progress = ((currentQuestion + 1) / selectedExam.questions.length) * 100

    return (
      <AnimatePresence>
        {showExamModal && (
          <motion.div
            className="modal-overlay exam-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content exam-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="exam-header">
                <div className="exam-info">
                  <h4>{selectedExam.title}</h4>
                  <p>{selectedExam.subject}</p>
                </div>
                <div className="exam-timer">
                  <i className="bi bi-clock"></i>
                  <span>{formatTime(examTimeLeft)}</span>
                </div>
              </div>

              <div className="exam-progress">
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
                <span>
                  Question {currentQuestion + 1} of {selectedExam.questions.length}
                </span>
              </div>

              <div className="exam-question">
                <h5>{currentQ.question}</h5>
                <div className="options">
                  {currentQ.options.map((option, index) => (
                    <motion.div
                      key={index}
                      className={`option ${examAnswers[currentQ.id] === index ? "selected" : ""}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleExamAnswer(currentQ.id, index)}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                      <span className="option-text">{option}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="exam-navigation">
                <button
                  className="btn btn-outline-secondary"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestion === 0}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Previous
                </button>

                {currentQuestion === selectedExam.questions.length - 1 ? (
                  <button className="btn btn-success" onClick={handleSubmitExam}>
                    <i className="bi bi-check-circle me-2"></i>
                    Submit Exam
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={handleNextQuestion}
                    disabled={examAnswers[currentQ.id] === undefined}
                  >
                    Next
                    <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Result Modal Component
  const ResultModal = () => {
    if (!selectedResult) return null

    const passed = selectedResult.score >= selectedResult.passingScore
    const grade =
      selectedResult.score >= 90
        ? "A"
        : selectedResult.score >= 80
          ? "B"
          : selectedResult.score >= 70
            ? "C"
            : selectedResult.score >= 60
              ? "D"
              : "F"

    return (
      <AnimatePresence>
        {showResultModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResultModal(false)}
          >
            <motion.div
              className="modal-content result-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="result-header">
                <div className={`result-icon ${passed ? "success" : "danger"}`}>
                  <i className={`bi ${passed ? "bi-trophy-fill" : "bi-x-circle-fill"}`}></i>
                </div>
                <h3>{passed ? "Congratulations!" : "Keep Trying!"}</h3>
                <p>{selectedResult.title}</p>
              </div>

              <div className="result-details">
                <div className="score-circle">
                  <div className="score-value">{selectedResult.score}%</div>
                  <div className="score-grade">Grade: {grade}</div>
                </div>

                <div className="result-stats">
                  <div className="stat">
                    <i className="bi bi-check-circle text-success"></i>
                    <span>Correct: {selectedResult.correct || Math.floor((selectedResult.score / 100) * 10)}</span>
                  </div>
                  <div className="stat">
                    <i className="bi bi-x-circle text-danger"></i>
                    <span>
                      Incorrect:{" "}
                      {(selectedResult.total || 10) -
                        (selectedResult.correct || Math.floor((selectedResult.score / 100) * 10))}
                    </span>
                  </div>
                  <div className="stat">
                    <i className="bi bi-clock text-info"></i>
                    <span>Passing Score: {selectedResult.passingScore}%</span>
                  </div>
                </div>
              </div>

              <div className="result-footer">
                <button className="btn btn-secondary" onClick={() => setShowResultModal(false)}>
                  Close
                </button>
                <button className="btn btn-primary">
                  <i className="bi bi-download me-2"></i>
                  Download Certificate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const today = new Date()

    const days = []
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year

      // Get events for this day
      const dayEvents = [...tasks, ...exams].filter((item) => {
        const itemDate = new Date(item.dueDate || item.date)
        return itemDate.getDate() === day && itemDate.getMonth() === month && itemDate.getFullYear() === year
      })

      days.push(
        <motion.div
          key={`day-${day}`}
          className={`calendar-day ${isToday ? "today" : ""}`}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="day-number">{day}</div>
          {dayEvents.length > 0 && (
            <div className="day-events">
              {dayEvents.slice(0, 2).map((event, index) => (
                <div
                  key={index}
                  className={`event-dot ${event.type || (event.dueDate ? "task" : "exam")}`}
                  title={event.title}
                ></div>
              ))}
              {dayEvents.length > 2 && <div className="event-more">+{dayEvents.length - 2}</div>}
            </div>
          )}
        </motion.div>,
      )
    }

    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <button className="btn btn-outline-primary" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
            <i className="bi bi-chevron-left"></i>
          </button>
          <h4 className="mb-0">
            {currentDate.toLocaleString("default", { month: "long" })} {year}
          </h4>
          <button className="btn btn-outline-primary" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
        <div className="calendar-weekdays">
          {weekdays.map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-grid">{days}</div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <motion.div
            key="overview"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="row g-4"
          >
            {/* Welcome Banner */}
            <div className="col-12">
              <motion.div
                className="welcome-banner"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ duration: 0.3 }}
              >
                <div className="welcome-content">
                  <div className="welcome-text">
                    <motion.h2
                      className="fw-bold mb-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Welcome back, {user?.fullName || "Student"}! 👋
                    </motion.h2>
                    <motion.p
                      className="mb-4 fs-5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      You have {stats.pendingTasks} pending tasks and {stats.upcomingExams} upcoming exams. Keep up the
                      great work!
                    </motion.p>
                    <motion.div
                      className="d-flex gap-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <motion.button
                        className="btn btn-light btn-lg px-4"
                        onClick={() => setActiveTab("tasks")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        View Tasks
                      </motion.button>
                      <motion.button
                        className="btn btn-outline-light btn-lg px-4"
                        onClick={() => setActiveTab("exams")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <i className="bi bi-calendar-check me-2"></i>
                        Upcoming Exams
                      </motion.button>
                    </motion.div>
                  </div>
                  <div className="welcome-illustration">
                    <motion.i
                      className="bi bi-mortarboard"
                      animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    ></motion.i>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Stats Cards */}
            {[
              { icon: "bi-list-task", value: stats.pendingTasks, label: "Pending Tasks", color: "primary" },
              { icon: "bi-check-circle", value: stats.completedTasks, label: "Completed", color: "success" },
              { icon: "bi-clipboard-check", value: stats.upcomingExams, label: "Upcoming Exams", color: "warning" },
              { icon: "bi-graph-up", value: `${stats.averageScore}%`, label: "Average Score", color: "info" },
              { icon: "bi-book", value: stats.totalSubjects, label: "Subjects", color: "secondary" },
              { icon: "bi-clock", value: `${stats.studyHours}h`, label: "Study Hours", color: "dark" },
            ].map((stat, index) => (
              <div key={index} className="col-lg-2 col-md-4 col-sm-6">
                <motion.div
                  className="stat-card"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <motion.div
                    className={`stat-icon bg-${stat.color}`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <i className={stat.icon}></i>
                  </motion.div>
                  <motion.h3
                    className={`stat-value text-${stat.color}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                  >
                    {stat.value}
                  </motion.h3>
                  <p className="stat-label">{stat.label}</p>
                </motion.div>
              </div>
            ))}

            {/* Recent Activity & Upcoming Deadlines */}
            <div className="col-lg-8">
              <motion.div
                className="activity-card"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <div className="card-header">
                  <h5 className="card-title">
                    <i className="bi bi-activity me-2"></i>
                    Recent Activity
                  </h5>
                </div>
                <div className="card-body">
                  <div className="activity-timeline">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        className="activity-item"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 10 }}
                      >
                        <motion.div className="activity-icon" whileHover={{ scale: 1.2, rotate: 10 }}>
                          <i
                            className={`${
                              activity.type === "task"
                                ? activity.status === "completed"
                                  ? "bi-check-circle-fill text-success"
                                  : "bi-clipboard-check text-primary"
                                : activity.status === "graded"
                                  ? "bi-award-fill text-warning"
                                  : "bi-journal-text text-info"
                            }`}
                          ></i>
                        </motion.div>
                        <div className="activity-content">
                          <h6 className="activity-title">{activity.title}</h6>
                          <div className="activity-meta">
                            <span className={`badge bg-${getStatusColor(activity.status)}`}>
                              {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                            </span>
                            <span className="badge bg-light text-dark">{activity.subject}</span>
                            {activity.score && <span className="badge bg-primary">{activity.score}%</span>}
                          </div>
                          <small className="activity-time">{formatDate(activity.date)}</small>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="col-lg-4">
              <motion.div
                className="deadlines-card"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                <div className="card-header">
                  <h5 className="card-title">
                    <i className="bi bi-alarm me-2"></i>
                    Upcoming Deadlines
                  </h5>
                </div>
                <div className="card-body">
                  {upcomingDeadlines.map((deadline, index) => (
                    <motion.div
                      key={deadline.id}
                      className="deadline-item"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 10, scale: 1.02 }}
                    >
                      <div className="deadline-content">
                        <h6 className="deadline-title">{deadline.title}</h6>
                        <div className="deadline-meta">
                          <span className="badge bg-light text-dark">{deadline.subject}</span>
                          <span className="badge bg-secondary">{deadline.type}</span>
                        </div>
                        <div className="deadline-footer">
                          <small className="text-muted">{formatDate(deadline.dueDate)}</small>
                          <motion.span
                            className={`badge bg-${getPriorityColor(deadline.priority)}`}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          >
                            {getTimeUntilDeadline(deadline.dueDate)}
                          </motion.span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )

      case "tasks":
        return (
          <motion.div
            key="tasks"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="row g-4"
          >
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <motion.h3 className="fw-bold mb-0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  Task Management
                </motion.h3>
                <motion.button
                  className="btn btn-primary btn-lg"
                  onClick={() => setShowTaskModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  New Task
                </motion.button>
              </div>
            </div>

            <div className="col-lg-4">
              <motion.div
                className="chart-card"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3 }}
              >
                <div className="card-header">
                  <h5 className="mb-0">Task Completion</h5>
                </div>
                <div className="card-body">
                  <div className="chart-container">
                    <Doughnut data={taskCompletionData} options={chartOptions} />
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="col-lg-8">
              <motion.div
                className="tasks-card"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="card-header">
                  <h5 className="mb-0">All Tasks</h5>
                </div>
                <div className="card-body">
                  <div className="tasks-grid">
                    {tasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        className="task-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                      >
                        <div className="task-header">
                          <h6 className="task-title">{task.title}</h6>
                          <div className="task-actions">
                            <motion.button
                              className="btn btn-sm btn-outline-primary"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <i className="bi bi-eye"></i>
                            </motion.button>
                            <motion.button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleTaskStatusChange(task.id, "completed")}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <i className="bi bi-check"></i>
                            </motion.button>
                            <motion.button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleTaskDelete(task.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <i className="bi bi-trash"></i>
                            </motion.button>
                          </div>
                        </div>
                        <p className="task-description">{task.description}</p>
                        <div className="task-meta">
                          <span className="badge bg-light text-dark">{task.subject}</span>
                          <span className={`badge bg-${getStatusColor(task.status)}`}>
                            {task.status.replace("_", " ").charAt(0).toUpperCase() + task.status.slice(1)}
                          </span>
                          <span className={`badge bg-${getPriorityColor(task.priority)}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </div>
                        <div className="task-progress">
                          <div className="progress">
                            <motion.div
                              className="progress-bar"
                              initial={{ width: 0 }}
                              animate={{ width: `${task.progress}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              role="progressbar"
                            ></motion.div>
                          </div>
                          <small className="text-muted">{task.progress}% complete</small>
                        </div>
                        <div className="task-footer">
                          <small className="text-muted">Due: {formatDate(task.dueDate)}</small>
                          {task.score && <span className="badge bg-primary">{task.score}%</span>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )

      case "exams":
        return (
          <motion.div
            key="exams"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="row g-4"
          >
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <motion.h3 className="fw-bold mb-0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  Exams & Tests
                </motion.h3>
                <motion.button
                  className="btn btn-primary btn-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <i className="bi bi-calendar-plus me-2"></i>
                  Schedule Exam
                </motion.button>
              </div>
            </div>

            <div className="col-12">
              <div className="row g-4">
                {exams.map((exam, index) => (
                  <div key={exam.id} className="col-lg-4 col-md-6">
                    <motion.div
                      className="exam-card"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="exam-header">
                        <div className="exam-status">
                          <motion.span
                            className={`badge ${
                              exam.status === "completed"
                                ? "bg-success"
                                : exam.status === "upcoming"
                                  ? "bg-warning"
                                  : "bg-secondary"
                            }`}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          >
                            {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                          </motion.span>
                        </div>
                        <div className="exam-subject">
                          <span className="badge bg-primary">{exam.subject}</span>
                        </div>
                      </div>
                      <div className="exam-content">
                        <h5 className="exam-title">{exam.title}</h5>
                        <p className="exam-description">{exam.description}</p>
                        <div className="exam-details">
                          <motion.div className="detail-item" whileHover={{ x: 5 }}>
                            <i className="bi bi-calendar-event"></i>
                            <span>{formatDate(exam.date)}</span>
                          </motion.div>
                          <motion.div className="detail-item" whileHover={{ x: 5 }}>
                            <i className="bi bi-clock"></i>
                            <span>{exam.duration} minutes</span>
                          </motion.div>
                          {exam.score && (
                            <motion.div className="detail-item" whileHover={{ x: 5 }}>
                              <i className="bi bi-trophy"></i>
                              <span>{exam.score}%</span>
                            </motion.div>
                          )}
                        </div>
                      </div>
                      <div className="exam-footer">
                        {exam.status === "upcoming" ? (
                          <motion.button
                            className="btn btn-primary w-100"
                            onClick={() => handleStartExam(exam)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <i className="bi bi-pencil-square me-2"></i>
                            Take Exam
                          </motion.button>
                        ) : exam.status === "completed" ? (
                          <motion.button
                            className="btn btn-outline-secondary w-100"
                            onClick={() => handleViewResult(exam)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <i className="bi bi-eye me-2"></i>
                            View Results
                          </motion.button>
                        ) : (
                          <button className="btn btn-outline-secondary w-100" disabled>
                            <i className="bi bi-clock me-2"></i>
                            Not Available
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )

      case "analytics":
        return (
          <motion.div
            key="analytics"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="row g-4"
          >
            <div className="col-12">
              <motion.h3 className="fw-bold mb-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                Performance Analytics
              </motion.h3>
            </div>

            <div className="col-lg-8">
              <motion.div
                className="chart-card"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3 }}
              >
                <div className="card-header">
                  <h5 className="mb-0">Subject Performance</h5>
                </div>
                <div className="card-body">
                  <div className="chart-container">
                    <Bar data={performanceData} options={chartOptions} />
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="col-lg-4">
              <motion.div
                className="chart-card"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="card-header">
                  <h5 className="mb-0">Study Hours</h5>
                </div>
                <div className="card-body">
                  <div className="chart-container">
                    <Line data={studyHoursData} options={chartOptions} />
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="col-12">
              <motion.div
                className="summary-card"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div className="card-header">
                  <h5 className="mb-0">Performance Summary</h5>
                </div>
                <div className="card-body">
                  <div className="row g-4">
                    {[
                      { label: "Overall Grade", value: "A-", color: "success" },
                      { label: "Average Score", value: "85%", color: "primary" },
                      { label: "Assignments Done", value: "12", color: "warning" },
                      { label: "Study Time", value: "24h", color: "info" },
                    ].map((item, index) => (
                      <div key={index} className="col-md-3">
                        <motion.div
                          className="summary-item"
                          whileHover={{ scale: 1.05, y: -5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          delay={index * 0.1}
                        >
                          <motion.h4
                            className={`text-${item.color} fw-bold`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                          >
                            {item.value}
                          </motion.h4>
                          <p className="mb-0 text-muted">{item.label}</p>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )

      case "calendar":
        return (
          <motion.div
            key="calendar"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="row g-4"
          >
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <motion.h3 className="fw-bold mb-0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  Academic Calendar
                </motion.h3>
                <motion.button
                  className="btn btn-primary btn-lg"
                  onClick={() => setShowEventModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Add Event
                </motion.button>
              </div>
            </div>
            <div className="col-12">
              <motion.div
                className="calendar-card"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3 }}
              >
                <div className="card-body">{renderCalendar()}</div>
              </motion.div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="student-dashboard-container">
      {/* Tab Navigation */}
      <motion.div
        className="tabs-container"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <nav className="nav nav-pills nav-fill">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: activeTab === tab.id ? tab.gradient : "transparent",
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.i
                className={`${tab.icon} me-2`}
                animate={{ rotate: activeTab === tab.id ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              ></motion.i>
              {tab.label}
            </motion.button>
          ))}
        </nav>
      </motion.div>

      {/* Tab Content */}
      <div className="tab-content-container">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              className="loading-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="spinner-border text-primary"
                role="status"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <span className="visually-hidden">Loading...</span>
              </motion.div>
            </motion.div>
          ) : (
            renderTabContent()
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <TaskModal />
      <EventModal />
      <ExamModal />
      <ResultModal />
    </div>
  )
}

export default StudentDashboard

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