const express = require("express")
const { Exam, ExamResult } = require("../models/Exam")
const auth = require("../middleware/auth")

const router = express.Router()

// Create exam (Tutor only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "TUTOR") {
      return res.status(403).json({ message: "Access denied" })
    }

    const exam = new Exam({
      ...req.body,
      tutor: req.user.userId,
    })

    await exam.save()
    res.status(201).json(exam)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get exams
router.get("/", auth, async (req, res) => {
  try {
    const query = {}

    if (req.user.role === "TUTOR") {
      query.tutor = req.user.userId
    } else if (req.user.role === "STUDENT") {
      query.assignedTo = req.user.userId
      query.isActive = true
    }

    const exams = await Exam.find(query)
      .populate("tutor", "fullName")
      .populate("assignedTo", "fullName email")
      .sort({ createdAt: -1 })

    res.json(exams)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Submit exam
router.post("/:id/submit", auth, async (req, res) => {
  try {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Access denied" })
    }

    const exam = await Exam.findById(req.params.id)
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    const { answers, timeSpent, startedAt } = req.body

    // Calculate score
    let score = 0
    let totalPoints = 0
    const processedAnswers = []

    exam.questions.forEach((question, index) => {
      const answer = answers[index]
      totalPoints += question.points

      let isCorrect = false
      if (question.type === "SINGLE") {
        const correctOption = question.options.findIndex((opt) => opt.isCorrect)
        isCorrect = answer.selectedOptions[0] === correctOption
      } else {
        const correctOptions = question.options
          .map((opt, idx) => (opt.isCorrect ? idx : -1))
          .filter((idx) => idx !== -1)
        isCorrect = JSON.stringify(answer.selectedOptions.sort()) === JSON.stringify(correctOptions.sort())
      }

      if (isCorrect) {
        score += question.points
      }

      processedAnswers.push({
        questionId: question._id,
        selectedOptions: answer.selectedOptions,
        isCorrect,
        points: isCorrect ? question.points : 0,
        timeSpent: answer.timeSpent || 0,
      })
    })

    const percentage = (score / totalPoints) * 100
    const status = percentage >= exam.passingScore ? "PASS" : "FAIL"

    const result = new ExamResult({
      exam: exam._id,
      student: req.user.userId,
      answers: processedAnswers,
      score,
      totalPoints,
      percentage,
      status,
      timeSpent,
      startedAt: new Date(startedAt),
      submittedAt: new Date(),
      attemptNumber: 1,
    })

    await result.save()

    res.json({
      message: "Exam submitted successfully",
      result: {
        id: result._id,
        score,
        totalPoints,
        percentage,
        status,
        timeSpent,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get exam results
router.get("/:id/results", auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    const query = { exam: req.params.id }

    if (req.user.role === "STUDENT") {
      query.student = req.user.userId
    }

    const results = await ExamResult.find(query)
      .populate("student", "fullName email studentId")
      .populate("exam", "title subject")
      .sort({ submittedAt: -1 })

    res.json(results)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get detailed result
router.get("/:examId/results/:resultId", auth, async (req, res) => {
  try {
    const result = await ExamResult.findById(req.params.resultId)
      .populate("student", "fullName email studentId")
      .populate("exam")

    if (!result) {
      return res.status(404).json({ message: "Result not found" })
    }

    // Check access
    if (req.user.role === "STUDENT" && result.student._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get exam analytics (Tutor only)
router.get("/:id/analytics", auth, async (req, res) => {
  try {
    if (req.user.role !== "TUTOR") {
      return res.status(403).json({ message: "Access denied" })
    }

    const exam = await Exam.findById(req.params.id)
    if (!exam || exam.tutor.toString() !== req.user.userId) {
      return res.status(404).json({ message: "Exam not found" })
    }

    const results = await ExamResult.find({ exam: req.params.id }).populate("student", "fullName email")

    // Calculate analytics
    const totalAttempts = results.length
    const averageScore = results.reduce((sum, result) => sum + result.percentage, 0) / totalAttempts || 0
    const passRate = (results.filter((result) => result.status === "PASS").length / totalAttempts) * 100 || 0

    const topScorer = results.reduce(
      (top, current) => (current.percentage > (top?.percentage || 0) ? current : top),
      null,
    )

    const lowestScorer = results.reduce(
      (lowest, current) => (current.percentage < (lowest?.percentage || 100) ? current : lowest),
      null,
    )

    // Question difficulty analysis
    const questionAnalysis = exam.questions.map((question, index) => {
      const correctAnswers = results.filter((result) => result.answers[index]?.isCorrect).length

      return {
        questionNumber: index + 1,
        question: question.question,
        topic: question.topic,
        correctAnswers,
        totalAttempts,
        difficultyPercentage: (correctAnswers / totalAttempts) * 100 || 0,
      }
    })

    // Topic-wise performance
    const topicPerformance = {}
    exam.questions.forEach((question, qIndex) => {
      if (!topicPerformance[question.topic]) {
        topicPerformance[question.topic] = { correct: 0, total: 0 }
      }

      results.forEach((result) => {
        if (result.answers[qIndex]) {
          topicPerformance[question.topic].total++
          if (result.answers[qIndex].isCorrect) {
            topicPerformance[question.topic].correct++
          }
        }
      })
    })

    const topicStats = Object.entries(topicPerformance).map(([topic, stats]) => ({
      topic,
      percentage: (stats.correct / stats.total) * 100 || 0,
      correct: stats.correct,
      total: stats.total,
    }))

    res.json({
      totalAttempts,
      averageScore: Math.round(averageScore * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      topScorer,
      lowestScorer,
      questionAnalysis,
      topicStats,
      results,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
