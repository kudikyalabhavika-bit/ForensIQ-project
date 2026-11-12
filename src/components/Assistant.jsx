import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  X,
  PenTool,
  Database,
  FolderOpen,
  ScanFace,
  FolderPlus,
  Send,
} from 'lucide-react'
import '../styles/assistant.css'

const QUICK_ACTIONS = [
  { label: 'Create Sketch', path: '/sketch-generation', icon: PenTool },
  { label: 'Search Criminal Database', path: '/criminal-database', icon: Database },
  { label: 'Open Saved Cases', path: '/saved-cases', icon: FolderOpen },
  { label: 'Run AI Match', path: '/ai-analysis', icon: ScanFace },
  { label: 'Analyze Latest Case', path: '/case-details/CASE-2026-014', icon: FolderPlus },
]

const SUGGESTIONS = [
  { label: 'Recently Generated Sketch', path: '/saved-cases' },
  { label: 'Open Active Investigation', path: '/case-details/CASE-2026-014' },
  { label: 'Continue AI Analysis', path: '/ai-analysis' },
  { label: 'Review Database Record', path: '/criminal-database' },
]

// Map user commands to routes
const COMMAND_MAP = [
  { keywords: ['dashboard', 'home'], path: '/dashboard', reply: 'Opening Dashboard...' },
  { keywords: ['sketch', 'generator', 'draw'], path: '/sketch-generation', reply: 'Opening Sketch Generation...' },
  { keywords: ['database', 'criminal', 'search'], path: '/criminal-database', reply: 'Opening Criminal Database...' },
  { keywords: ['saved', 'cases', 'history'], path: '/saved-cases', reply: 'Opening Saved Cases...' },
  { keywords: ['ai', 'analysis', 'match', 'compare'], path: '/ai-analysis', reply: 'Opening AI Match & Analysis...' },
  { keywords: ['settings', 'config'], path: '/settings', reply: 'Opening Settings...' },
]

function Assistant() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const chatEndRef = useRef(null)

  // Load chat history from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('forensiq_assistant_chat') || '[]')
    if (saved.length > 0) {
      setMessages(saved)
    } else {
      // Greeting message
      const greeting = {
        id: 'greeting',
        sender: 'assistant',
        text: 'Hello Investigator. How can I assist you today?',
      }
      setMessages([greeting])
    }
  }, [])

  // Save chat to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('forensiq_assistant_chat', JSON.stringify(messages.slice(-20)))
    }
  }, [messages])

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleQuickAction(path) {
    navigate(path)
    setIsOpen(false)
  }

  function handleSend() {
    if (!input.trim()) return

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: input.trim(),
    }

    // Find matching command
    const lowerInput = input.toLowerCase()
    const match = COMMAND_MAP.find((c) => c.keywords.some((k) => lowerInput.includes(k)))

    let replyMsg
    if (match) {
      replyMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: match.reply,
      }
      setMessages((prev) => [...prev, userMsg, replyMsg])
      setInput('')
      setTimeout(() => {
        navigate(match.path)
        setIsOpen(false)
      }, 800)
    } else {
      replyMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: 'I can help you with: dashboard, sketch, database, saved cases, AI analysis, or settings. Try typing one of those!',
      }
      setMessages((prev) => [...prev, userMsg, replyMsg])
      setInput('')
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        className={`assistant-fab ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open ForensIQ Assistant"
      >
        <Sparkles />
        <span className="assistant-fab-label">ForensIQ Assistant</span>
      </button>

      {/* Assistant panel */}
      {isOpen && (
        <div className="assistant-panel fi-fade-in">
          {/* Header */}
          <div className="assistant-header">
            <div className="assistant-header-info">
              <div className="assistant-header-icon">
                <Sparkles />
              </div>
              <div>
                <span className="assistant-header-title">ForensIQ Assistant</span>
                <span className="assistant-header-subtitle">AI Investigation Assistant</span>
              </div>
            </div>
            <button className="assistant-close" onClick={() => setIsOpen(false)} aria-label="Close assistant">
              <X />
            </button>
          </div>

          {/* Chat messages */}
          <div className="assistant-chat">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-msg ${msg.sender}`}>
                {msg.sender === 'assistant' && <div className="chat-msg-avatar"><Sparkles /></div>}
                <span className="chat-msg-text">{msg.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick actions */}
          <div className="assistant-quick-actions">
            {QUICK_ACTIONS.map((qa) => {
              const Icon = qa.icon
              return (
                <button
                  key={qa.label}
                  className="assistant-quick-btn"
                  onClick={() => handleQuickAction(qa.path)}
                >
                  <Icon />
                  <span>{qa.label}</span>
                </button>
              )
            })}
          </div>

          {/* Smart suggestions */}
          <div className="assistant-suggestions">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                className="assistant-suggestion-chip"
                onClick={() => handleQuickAction(s.path)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="assistant-input-row">
            <input
              type="text"
              placeholder="Type a command (e.g. 'open sketch')..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="assistant-send-btn" onClick={handleSend} aria-label="Send">
              <Send />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Assistant
