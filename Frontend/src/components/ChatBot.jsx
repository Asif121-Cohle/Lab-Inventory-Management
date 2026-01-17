import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './CSS/chatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Load suggestions on mount
  useEffect(() => {
    loadSuggestions();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: '👋 Hi! I\'m LabBot, your AI assistant. Ask me anything about lab materials, equipment, or how to use the system!',
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  const loadSuggestions = async () => {
    try {
      const { data } = await chatAPI.getSuggestions();
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleSend = async (text = inputText) => {
    if (!text.trim()) return;

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Build conversation history for context
      // Last 4 user messages + last 2 assistant messages
      const userMessages = messages.filter(msg => msg.role === 'user').slice(-4);
      const assistantMessages = messages.filter(msg => msg.role === 'assistant').slice(-2);
      
      const conversationHistory = [
        ...userMessages.map(msg => ({ role: msg.role, content: msg.content })),
        ...assistantMessages.map(msg => ({ role: msg.role, content: msg.content }))
      ].sort((a, b) => messages.indexOf(messages.find(m => m.content === a.content)) - 
                       messages.indexOf(messages.find(m => m.content === b.content)));

      const { data } = await chatAPI.sendMessage(text, conversationHistory);

      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        suggestedMaterials: data.suggestedMaterials
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  const handleMaterialClick = (materialId) => {
    navigate(`/material/${materialId}`);
    setIsOpen(false);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: '👋 Hi! I\'m LabBot, your AI assistant. Ask me anything about lab materials, equipment, or how to use the system!',
      timestamp: new Date()
    }]);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        className={`chat-bot-button ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        aria-label="Toggle chat"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-bot-window">
          {/* Header */}
          <div className="chat-bot-header">
            <div className="chat-bot-title">
              <span className="bot-avatar">🤖</span>
              <div>
                <h3>LabBot</h3>
                <p>AI Assistant</p>
              </div>
            </div>
            <button className="chat-clear-btn" onClick={clearChat} title="Clear chat">
              🔄
            </button>
          </div>

          {/* Messages */}
          <div className="chat-bot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                <div className="message-bubble">
                  {msg.content}
                  
                  {/* Suggested Materials */}
                  {msg.suggestedMaterials && msg.suggestedMaterials.length > 0 && (
                    <div className="suggested-materials">
                      <p className="suggestion-label">💡 Related Materials:</p>
                      {msg.suggestedMaterials.map(material => (
                        <div 
                          key={material._id} 
                          className="material-chip"
                          onClick={() => handleMaterialClick(material._id)}
                        >
                          <span className="material-name">{material.name}</span>
                          <span className="material-lab">{material.lab?.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chat-message assistant">
                <div className="message-bubble typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && !isTyping && (
            <div className="chat-suggestions">
              <p className="suggestions-label">Quick questions:</p>
              <div className="suggestion-chips">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-chip"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="chat-bot-input">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              rows={1}
              disabled={isTyping}
            />
            <button 
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isTyping}
              className="send-btn"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
