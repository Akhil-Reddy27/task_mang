"use client"

import { Link } from "react-router-dom"

const WelcomePage = () => {
  return (
    <div
      className="min-vh-100"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container">
          <Link className="navbar-brand fw-bold fs-3" to="/">
            <i className="bi bi-mortarboard me-2"></i>
            EduTask Manager
          </Link>
          <div className="navbar-nav ms-auto">
            <Link className="nav-link me-3" to="/signin">
              Sign In
            </Link>
            <Link className="btn btn-light btn-sm" to="/signup">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container">
        <div className="row min-vh-100 align-items-center">
          <div className="col-lg-6">
            <div className="text-white">
              <h1 className="display-4 fw-bold mb-4">Transform Your Educational Experience</h1>
              <p className="lead mb-4">
                Streamline task management, conduct seamless exams, and track student progress with our comprehensive
                educational platform designed for modern learning.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-5">
                <Link to="/signup" className="btn btn-light btn-lg px-4 py-3">
                  <i className="bi bi-rocket-takeoff me-2"></i>
                  Start Free Trial
                </Link>
                <Link to="/signin" className="btn btn-outline-light btn-lg px-4 py-3">
                  <i className="bi bi-play-circle me-2"></i>
                  Watch Demo
                </Link>
              </div>

              {/* Features List */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-warning me-3 fs-5"></i>
                    <span>Task Management</span>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-warning me-3 fs-5"></i>
                    <span>Online Examinations</span>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-warning me-3 fs-5"></i>
                    <span>Real-time Analytics</span>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-warning me-3 fs-5"></i>
                    <span>Progress Tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="text-center">
              {/* Dashboard Preview */}
              <div className="card shadow-lg border-0" style={{ borderRadius: "20px", transform: "rotate(5deg)" }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary rounded-circle me-3" style={{ width: "40px", height: "40px" }}></div>
                    <div className="flex-grow-1">
                      <div className="bg-light rounded" style={{ height: "10px", width: "60%" }}></div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-6">
                      <div className="bg-success rounded p-3 text-center">
                        <div className="text-white fw-bold">85%</div>
                        <small className="text-white-50">Completion</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="bg-info rounded p-3 text-center">
                        <div className="text-white fw-bold">12</div>
                        <small className="text-white-50">Tasks</small>
                      </div>
                    </div>
                  </div>

                  <div className="bg-light rounded p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="bg-secondary rounded" style={{ width: "40%", height: "8px" }}></div>
                      <small className="text-muted">Math Quiz</small>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="bg-warning rounded" style={{ width: "70%", height: "8px" }}></div>
                      <small className="text-muted">Science Project</small>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="bg-danger rounded" style={{ width: "30%", height: "8px" }}></div>
                      <small className="text-muted">History Essay</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Everything You Need for Modern Education</h2>
            <p className="text-muted">Powerful tools designed to enhance learning and teaching experiences</p>
          </div>

          <div className="row">
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div
                    className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="bi bi-list-task text-primary fs-1"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Task Management</h5>
                  <p className="text-muted">
                    Create, assign, and track tasks with deadlines, priorities, and progress monitoring.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div
                    className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="bi bi-clipboard-check text-success fs-1"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Online Exams</h5>
                  <p className="text-muted">
                    Conduct secure online examinations with multiple question types and automatic grading.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div
                    className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="bi bi-graph-up text-info fs-1"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Analytics & Reports</h5>
                  <p className="text-muted">
                    Comprehensive analytics and detailed reports to track student performance and progress.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div
                    className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="bi bi-chat-dots text-warning fs-1"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Real-time Communication</h5>
                  <p className="text-muted">
                    Instant messaging and notifications to keep everyone connected and informed.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div
                    className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="bi bi-calendar-event text-danger fs-1"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Calendar Integration</h5>
                  <p className="text-muted">
                    Integrated calendar system for scheduling classes, exams, and important deadlines.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div
                    className="bg-secondary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i className="bi bi-shield-check text-secondary fs-1"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Secure & Reliable</h5>
                  <p className="text-muted">
                    Enterprise-grade security with data encryption and reliable cloud infrastructure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-dark text-white py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-3">Ready to Transform Your Educational Experience?</h2>
          <p className="lead mb-4">Join thousands of educators and students already using EduTask Manager</p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/signup" className="btn btn-primary btn-lg px-5 py-3">
              <i className="bi bi-rocket-takeoff me-2"></i>
              Get Started Free
            </Link>
            <Link to="/contact" className="btn btn-outline-light btn-lg px-5 py-3">
              <i className="bi bi-telephone me-2"></i>
              Contact Sales
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-light py-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="text-muted mb-0">&copy; 2024 EduTask Manager. All rights reserved.</p>
            </div>
            <div className="col-md-6 text-md-end">
              <Link to="/privacy" className="text-muted text-decoration-none me-3">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-muted text-decoration-none me-3">
                Terms of Service
              </Link>
              <Link to="/support" className="text-muted text-decoration-none">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default WelcomePage
