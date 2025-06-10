"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Mock events - replace with API call in production
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        // Simulate API call
        setTimeout(() => {
          const mockEvents = [
            {
              id: 1,
              title: "Mathematics Quiz",
              date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
              type: "exam",
              subject: "Mathematics",
            },
            {
              id: 2,
              title: "Physics Assignment Due",
              date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
              type: "task",
              subject: "Physics",
            },
            {
              id: 3,
              title: "Chemistry Lab Report",
              date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 22),
              type: "task",
              subject: "Chemistry",
            },
            {
              id: 4,
              title: "English Literature Essay",
              date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
              type: "task",
              subject: "English",
            },
            {
              id: 5,
              title: "Biology Final Exam",
              date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 28),
              type: "exam",
              subject: "Biology",
            },
          ]
          setEvents(mockEvents)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching events:", error)
        setLoading(false)
      }
    }

    fetchEvents()
  }, [currentDate])

  const daysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const firstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const totalDays = daysInMonth(year, month)
    const firstDay = firstDayOfMonth(year, month)
    const today = new Date()

    const days = []
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // Add weekday headers
    const weekdayHeaders = weekdays.map((day) => (
      <div key={`header-${day}`} className="text-center fw-bold p-2">
        {day}
      </div>
    ))

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="border p-2 bg-light opacity-50" style={{ minHeight: "120px" }}></div>,
      )
    }

    // Add cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day)
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year

      // Get events for this day
      const dayEvents = events.filter(
        (event) => event.date.getDate() === day && event.date.getMonth() === month && event.date.getFullYear() === year,
      )

      days.push(
        <div
          key={`day-${day}`}
          className={`border p-2 ${isToday ? "bg-primary bg-opacity-10" : ""}`}
          style={{ minHeight: "120px" }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className={`${isToday ? "fw-bold text-primary" : ""}`}>{day}</span>
            {dayEvents.length > 0 && <span className="badge bg-primary rounded-pill">{dayEvents.length}</span>}
          </div>

          <div className="calendar-events">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className={`calendar-event p-1 mb-1 rounded small ${
                  event.type === "exam" ? "bg-danger text-white" : "bg-info text-white"
                }`}
                title={event.title}
              >
                <div className="text-truncate">
                  <i className={`bi ${event.type === "exam" ? "bi-clipboard-check" : "bi-list-task"} me-1`}></i>
                  {event.title}
                </div>
                <div className="text-truncate small opacity-75">{event.subject}</div>
              </div>
            ))}
          </div>
        </div>,
      )
    }

    return (
      <>
        <div className="calendar-header d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">
            {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
          </h2>
          <div className="btn-group">
            <button className="btn btn-outline-primary" onClick={prevMonth}>
              <i className="bi bi-chevron-left"></i>
            </button>
            <button className="btn btn-outline-primary" onClick={() => setCurrentDate(new Date())}>
              Today
            </button>
            <button className="btn btn-outline-primary" onClick={nextMonth}>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          <div className="row g-0 bg-light">{weekdayHeaders}</div>
          <div className="row g-0">{days}</div>
        </div>
      </>
    )
  }

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-calendar me-2"></i>
          Calendar
        </h2>
        {user?.role === "TUTOR" && (
          <button className="btn btn-primary">
            <i className="bi bi-plus-lg me-2"></i>
            Add Event
          </button>
        )}
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            renderCalendar()
          )}
        </div>
      </div>

      <style jsx>{`
        .calendar-grid .row > div {
          width: calc(100% / 7);
        }
        
        .calendar-event {
          font-size: 0.8rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

export default Calendar;
