"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    institution: user?.institution || "",
    subjects: user?.subjects || user?.enrolledSubjects || [],
    theme: user?.preferences?.theme || "light",
    emailNotifications: user?.preferences?.notifications?.email || true,
    pushNotifications: user?.preferences?.notifications?.push || true,
  })
  const [loading, setLoading] = useState(false)

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === "subjects") {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          subjects: [...prev.subjects, value],
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          subjects: prev.subjects.filter((subject) => subject !== value),
        }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const profileData = {
        fullName: formData.fullName,
        institution: formData.institution,
        subjects: formData.subjects,
        preferences: {
          theme: formData.theme,
          notifications: {
            email: formData.emailNotifications,
            push: formData.pushNotifications,
          },
        },
      }

      await updateProfile(profileData)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid py-3">
      <div className="row">
        <div className="col-lg-3 mb-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <div
                className="bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: "100px", height: "100px" }}
              >
                <span className="text-white fw-bold" style={{ fontSize: "2.5rem" }}>
                  {user?.fullName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h5 className="mb-1">{user?.fullName}</h5>
              <p className="text-muted mb-3">{user?.role}</p>
              <button className="btn btn-outline-primary btn-sm">Change Photo</button>
            </div>
            <div className="list-group list-group-flush">
              <button
                className={`list-group-item list-group-item-action ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <i className="bi bi-person me-2"></i>
                Profile Information
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === "account" ? "active" : ""}`}
                onClick={() => setActiveTab("account")}
              >
                <i className="bi bi-shield-lock me-2"></i>
                Account Security
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === "preferences" ? "active" : ""}`}
                onClick={() => setActiveTab("preferences")}
              >
                <i className="bi bi-gear me-2"></i>
                Preferences
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === "notifications" ? "active" : ""}`}
                onClick={() => setActiveTab("notifications")}
              >
                <i className="bi bi-bell me-2"></i>
                Notifications
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-9">
          <div className="card shadow-sm">
            <div className="card-body">
              {activeTab === "profile" && (
                <>
                  <h4 className="card-title mb-4">Profile Information</h4>
                  <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="fullName" className="form-label">
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={formData.email}
                          disabled
                        />
                        <small className="text-muted">Email cannot be changed</small>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="institution" className="form-label">
                        Institution
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="institution"
                        name="institution"
                        value={formData.institution}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label">
                        {user?.role === "STUDENT" ? "Enrolled Subjects" : "Teaching Subjects"}
                      </label>
                      <div className="row">
                        {subjectOptions.map((subject) => (
                          <div key={subject} className="col-md-4 mb-2">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={subject}
                                name="subjects"
                                value={subject}
                                checked={formData.subjects.includes(subject)}
                                onChange={handleChange}
                              />
                              <label className="form-check-label" htmlFor={subject}>
                                {subject}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </form>
                </>
              )}

              {activeTab === "account" && (
                <>
                  <h4 className="card-title mb-4">Account Security</h4>
                  <form>
                    <div className="mb-4">
                      <label htmlFor="currentPassword" className="form-label">
                        Current Password
                      </label>
                      <input type="password" className="form-control" id="currentPassword" />
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="newPassword" className="form-label">
                          New Password
                        </label>
                        <input type="password" className="form-control" id="newPassword" />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="confirmPassword" className="form-label">
                          Confirm New Password
                        </label>
                        <input type="password" className="form-control" id="confirmPassword" />
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="mb-3">Two-Factor Authentication</h5>
                      <div className="form-check form-switch mb-2">
                        <input className="form-check-input" type="checkbox" id="enableTwoFactor" />
                        <label className="form-check-label" htmlFor="enableTwoFactor">
                          Enable Two-Factor Authentication
                        </label>
                      </div>
                      <small className="text-muted">
                        Two-factor authentication adds an extra layer of security to your account by requiring more than
                        just a password to sign in.
                      </small>
                    </div>

                    <button type="submit" className="btn btn-primary">
                      Update Security Settings
                    </button>
                  </form>
                </>
              )}

              {activeTab === "preferences" && (
                <>
                  <h4 className="card-title mb-4">Preferences</h4>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <h5 className="mb-3">Theme</h5>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="theme"
                          id="lightTheme"
                          value="light"
                          checked={formData.theme === "light"}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="lightTheme">
                          Light Theme
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="theme"
                          id="darkTheme"
                          value="dark"
                          checked={formData.theme === "dark"}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="darkTheme">
                          Dark Theme
                        </label>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="mb-3">Language</h5>
                      <select className="form-select">
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <h5 className="mb-3">Time Zone</h5>
                      <select className="form-select">
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                        <option value="EST">EST (Eastern Standard Time)</option>
                        <option value="CST">CST (Central Standard Time)</option>
                        <option value="MST">MST (Mountain Standard Time)</option>
                        <option value="PST">PST (Pacific Standard Time)</option>
                      </select>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Saving...
                        </>
                      ) : (
                        "Save Preferences"
                      )}
                    </button>
                  </form>
                </>
              )}

              {activeTab === "notifications" && (
                <>
                  <h4 className="card-title mb-4">Notification Settings</h4>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <h5 className="mb-3">Email Notifications</h5>
                      <div className="form-check form-switch mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="emailNotifications"
                          name="emailNotifications"
                          checked={formData.emailNotifications}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="emailNotifications">
                          Enable Email Notifications
                        </label>
                      </div>
                      <div className="ms-4">
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="emailTasks"
                            checked={formData.emailNotifications}
                            disabled={!formData.emailNotifications}
                          />
                          <label className="form-check-label" htmlFor="emailTasks">
                            Task Updates
                          </label>
                        </div>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="emailExams"
                            checked={formData.emailNotifications}
                            disabled={!formData.emailNotifications}
                          />
                          <label className="form-check-label" htmlFor="emailExams">
                            Exam Notifications
                          </label>
                        </div>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="emailMessages"
                            checked={formData.emailNotifications}
                            disabled={!formData.emailNotifications}
                          />
                          <label className="form-check-label" htmlFor="emailMessages">
                            New Messages
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="mb-3">Push Notifications</h5>
                      <div className="form-check form-switch mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="pushNotifications"
                          name="pushNotifications"
                          checked={formData.pushNotifications}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="pushNotifications">
                          Enable Push Notifications
                        </label>
                      </div>
                      <div className="ms-4">
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="pushTasks"
                            checked={formData.pushNotifications}
                            disabled={!formData.pushNotifications}
                          />
                          <label className="form-check-label" htmlFor="pushTasks">
                            Task Updates
                          </label>
                        </div>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="pushExams"
                            checked={formData.pushNotifications}
                            disabled={!formData.pushNotifications}
                          />
                          <label className="form-check-label" htmlFor="pushExams">
                            Exam Notifications
                          </label>
                        </div>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="pushMessages"
                            checked={formData.pushNotifications}
                            disabled={!formData.pushNotifications}
                          />
                          <label className="form-check-label" htmlFor="pushMessages">
                            New Messages
                          </label>
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Saving...
                        </>
                      ) : (
                        "Save Notification Settings"
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
