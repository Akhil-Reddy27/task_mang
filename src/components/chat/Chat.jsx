"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../../contexts/AuthContext"

const Chat = () => {
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const { user } = useAuth()

  // Mock data - replace with API calls in production
  useEffect(() => {
    // Simulate API call to fetch conversations
    setTimeout(() => {
      const mockConversations = [
        {
          id: 1,
          name: "John Smith",
          role: "TUTOR",
          avatar: null,
          lastMessage: "When is the next assignment due?",
          unread: 2,
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        },
        {
          id: 2,
          name: "Mathematics Group",
          role: "GROUP",
          avatar: null,
          lastMessage: "I've shared some study materials for the upcoming exam",
          unread: 0,
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        },
        {
          id: 3,
          name: "Sarah Johnson",
          role: "STUDENT",
          avatar: null,
          lastMessage: "Thanks for your help with the project!",
          unread: 0,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        },
        {
          id: 4,
          name: "Physics Discussion",
          role: "GROUP",
          avatar: null,
          lastMessage: "Can someone explain the concept of quantum entanglement?",
          unread: 5,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        },
      ]
      setConversations(mockConversations)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    if (activeConversation) {
      // Simulate API call to fetch messages for the active conversation
      setLoading(true)
      setTimeout(() => {
        const mockMessages = [
          {
            id: 1,
            senderId: activeConversation.id,
            senderName: activeConversation.name,
            content: "Hello! How can I help you today?",
            timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          },
          {
            id: 2,
            senderId: user?.id,
            senderName: user?.fullName,
            content: "I have a question about the upcoming exam.",
            timestamp: new Date(Date.now() - 1000 * 60 * 55), // 55 minutes ago
          },
          {
            id: 3,
            senderId: activeConversation.id,
            senderName: activeConversation.name,
            content: "Sure, what would you like to know?",
            timestamp: new Date(Date.now() - 1000 * 60 * 50), // 50 minutes ago
          },
          {
            id: 4,
            senderId: user?.id,
            senderName: user?.fullName,
            content: "Will it cover the topics from chapter 5?",
            timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
          },
          {
            id: 5,
            senderId: activeConversation.id,
            senderName: activeConversation.name,
            content:
              "Yes, the exam will cover chapters 3-5. Make sure to review the practice problems we discussed in class.",
            timestamp: new Date(Date.now() - 1000 * 60 * 40), // 40 minutes ago
          },
          {
            id: 6,
            senderId: user?.id,
            senderName: user?.fullName,
            content: "Thank you! I'll focus on those chapters.",
            timestamp: new Date(Date.now() - 1000 * 60 * 35), // 35 minutes ago
          },
          {
            id: 7,
            senderId: activeConversation.id,
            senderName: activeConversation.name,
            content: "Great! Let me know if you have any other questions.",
            timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          },
        ]
        setMessages(mockMessages)
        setLoading(false)

        // Update the conversation to mark as read
        setConversations((prevConversations) =>
          prevConversations.map((conv) => (conv.id === activeConversation.id ? { ...conv, unread: 0 } : conv)),
        )
      }, 1000)
    }
  }, [activeConversation, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation) return

    // Add the new message to the conversation
    const newMsg = {
      id: messages.length + 1,
      senderId: user?.id,
      senderName: user?.fullName,
      content: newMessage,
      timestamp: new Date(),
    }

    setMessages([...messages, newMsg])
    setNewMessage("")

    // Update the conversation's last message
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === activeConversation.id
          ? {
              ...conv,
              lastMessage: newMessage,
              timestamp: new Date(),
            }
          : conv,
      ),
    )

    // In a real app, you would send the message to the server here
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-chat me-2"></i>
          Messages
        </h2>
        <button className="btn btn-primary">
          <i className="bi bi-plus-lg me-2"></i>
          New Message
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="row g-0" style={{ height: "70vh" }}>
            {/* Conversations List */}
            <div className="col-md-4 col-lg-3 border-end">
              <div className="p-3 border-bottom">
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-search"></i>
                  </span>
                  <input type="text" className="form-control bg-light border-0" placeholder="Search messages..." />
                </div>
              </div>

              <div className="conversations-list" style={{ height: "calc(70vh - 60px)", overflowY: "auto" }}>
                {loading && !activeConversation ? (
                  <div className="d-flex justify-content-center align-items-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`conversation-item p-3 border-bottom ${
                        activeConversation?.id === conversation.id ? "bg-light" : ""
                      }`}
                      onClick={() => setActiveConversation(conversation)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex">
                        <div
                          className={`avatar rounded-circle d-flex align-items-center justify-content-center me-3 ${
                            conversation.role === "TUTOR"
                              ? "bg-primary"
                              : conversation.role === "GROUP"
                                ? "bg-success"
                                : "bg-info"
                          }`}
                          style={{ width: "48px", height: "48px" }}
                        >
                          {conversation.avatar ? (
                            <img
                              src={conversation.avatar || "/placeholder.svg"}
                              alt={conversation.name}
                              className="rounded-circle"
                              width="48"
                              height="48"
                            />
                          ) : (
                            <span className="text-white fw-bold">{conversation.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-grow-1 min-width-0">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 text-truncate">{conversation.name}</h6>
                            <small className="text-muted ms-2">
                              {formatDate(conversation.timestamp) === "Today"
                                ? formatTime(conversation.timestamp)
                                : formatDate(conversation.timestamp)}
                            </small>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <p className="text-muted small mb-0 text-truncate">{conversation.lastMessage}</p>
                            {conversation.unread > 0 && (
                              <span className="badge bg-primary rounded-pill ms-2">{conversation.unread}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="col-md-8 col-lg-9 d-flex flex-column">
              {activeConversation ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-3 border-bottom">
                    <div className="d-flex align-items-center">
                      <div
                        className={`avatar rounded-circle d-flex align-items-center justify-content-center me-3 ${
                          activeConversation.role === "TUTOR"
                            ? "bg-primary"
                            : activeConversation.role === "GROUP"
                              ? "bg-success"
                              : "bg-info"
                        }`}
                        style={{ width: "48px", height: "48px" }}
                      >
                        {activeConversation.avatar ? (
                          <img
                            src={activeConversation.avatar || "/placeholder.svg"}
                            alt={activeConversation.name}
                            className="rounded-circle"
                            width="48"
                            height="48"
                          />
                        ) : (
                          <span className="text-white fw-bold">{activeConversation.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h5 className="mb-0">{activeConversation.name}</h5>
                        <small className="text-muted">
                          {activeConversation.role === "GROUP"
                            ? "Group Chat"
                            : activeConversation.role === "TUTOR"
                              ? "Tutor"
                              : "Student"}
                        </small>
                      </div>
                      <div className="ms-auto">
                        <button className="btn btn-light btn-sm me-2">
                          <i className="bi bi-telephone"></i>
                        </button>
                        <button className="btn btn-light btn-sm me-2">
                          <i className="bi bi-camera-video"></i>
                        </button>
                        <button className="btn btn-light btn-sm">
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages List */}
                  <div
                    className="messages-list p-3 flex-grow-1"
                    style={{ overflowY: "auto", height: "calc(70vh - 130px)" }}
                  >
                    {loading ? (
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`message mb-3 ${message.senderId === user?.id ? "text-end" : ""}`}
                        >
                          <div
                            className={`message-content d-inline-block p-3 rounded-3 ${
                              message.senderId === user?.id ? "bg-primary text-white" : "bg-light text-dark"
                            }`}
                            style={{ maxWidth: "75%" }}
                          >
                            <div className="message-text">{message.content}</div>
                            <div
                              className={`message-time small ${
                                message.senderId === user?.id ? "text-white-50" : "text-muted"
                              }`}
                            >
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="message-input p-3 border-top">
                    <form onSubmit={handleSendMessage}>
                      <div className="input-group">
                        <button type="button" className="btn btn-light">
                          <i className="bi bi-paperclip"></i>
                        </button>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="button" className="btn btn-light">
                          <i className="bi bi-emoji-smile"></i>
                        </button>
                        <button type="submit" className="btn btn-primary">
                          <i className="bi bi-send"></i>
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center p-4">
                  <i className="bi bi-chat-dots text-muted" style={{ fontSize: "4rem" }}></i>
                  <h4 className="mt-3">Select a conversation</h4>
                  <p className="text-muted">Choose a conversation from the list to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
