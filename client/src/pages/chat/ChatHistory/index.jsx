import React from "react";
import ReactMarkdown from "react-markdown";
import "./ChatHistory.css";

const ChatHistory = ({ chatHistory }) => {
  return (
    <>
      {chatHistory.map((message, index) => (
        <div
          key={index}
          className={`message-container ${
            message.type === "user" ? "user-message" : "bot-message"
          }`}
        >
          {message.type === "user" && (
            <span className="user-label">Bạn:</span>
          )}

          <div className="message-content">
            <div dangerouslySetInnerHTML={{ __html: message.message }} />
          </div>
        </div>
      ))}
    </>
  );
};

export default ChatHistory;
