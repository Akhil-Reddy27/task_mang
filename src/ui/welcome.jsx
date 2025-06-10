import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../welcome.css';

const WelcomePage = () => {
  useEffect(() => {
    // Typing effect
    const text = "Welcome to EduTask Manager";
    const container = document.getElementById("typing-text");

    container.innerHTML = ""; // Reset

    text.split("").forEach((char, i) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.animationDelay = `${i * 0.05}s`;
      container.appendChild(span);
    });

    // Create educational elements
    const eduContainer = document.querySelector(".educational-elements");
    const elements = ['book', 'pencil', 'ruler', 'calculator', 'notebook'];
    
    for (let i = 0; i < 15; i++) {
      const element = document.createElement("div");
      const randomElement = elements[Math.floor(Math.random() * elements.length)];
      element.className = `edu-element ${randomElement}`;
      
      // Position randomly but keep within view
      element.style.left = `${Math.random() * 80 + 10}vw`;
      element.style.top = `${Math.random() * 80 + 10}vh`;
      element.style.animationDuration = `${Math.random() * 20 + 10}s`;
      element.style.animationDelay = `${Math.random() * 5}s`;
      element.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      eduContainer.appendChild(element);
    }
  }, []);

  return (
    <div className="educational-background">
      <div className="educational-elements"></div>
      <div className="page-container">
        <div className="header">
          <div className="welcome typing" id="typing-text"></div>
          <div className="subtitle">Your Personal Learning Companion</div>
        </div>
        
        <div className="main-content">
          <div className="features">
            <div className="feature-item">
              <div className="feature-icon">📚</div>
              <div className="feature-text">Organize your study materials</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📝</div>
              <div className="feature-text">Track assignments & deadlines</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <div className="feature-text">Achieve your learning goals</div>
            </div>
          </div>
          
          <div className="button-container">
            <Link to="/signin" className="btn edu-btn">
              <span className="btn-icon">👩‍🎓</span> Login
            </Link>
            <Link to="/signup" className="btn edu-btn">
              <span className="btn-icon">👨‍🏫</span>  SignUp
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
