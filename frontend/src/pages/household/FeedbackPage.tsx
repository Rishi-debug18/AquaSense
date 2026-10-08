import { useState, useEffect, useRef } from 'react'
import { submitFeedback, createTicket } from '../../api/household'
import { Bot, Send, Ticket, AlertCircle, Database, Lightbulb, User } from 'lucide-react'

interface Message {
  role: 'user' | 'ai'
  content: string
  timestamp: string
  offer_ticket?: boolean
}

function MessageBubble({ msg, onCreateTicket }: { msg: Message; onCreateTicket?: () => void }) {
  const isUser = msg.role === 'user'

  const renderContent = (content: string) => {
    return content.split('\n\n').map((para, i) => {
      const isDbFact = para.includes('[DATABASE FACT]')
      const isGuidance = para.includes('[GENERAL GUIDANCE]')
      return (
        <p key={i} className={`mb-2 last:mb-0 text-sm leading-relaxed ${isDbFact ? 'border-l-2 border-sky-400 pl-2' : isGuidance ? 'border-l-2 border-amber-400 pl-2' : ''}`}>
          {isDbFact && <span className="text-xs font-bold text-sky-500 block mb-0.5 flex items-center gap-1"><Database className="w-3 h-3" /> DATABASE FACT</span>}
          {isGuidance && <span className="text-xs font-bold text-amber-600 block mb-0.5 flex items-center gap-1"><Lightbulb className="w-3 h-3" /> GENERAL GUIDANCE</span>}
          {para.replace('[DATABASE FACT]', '').replace('[GENERAL GUIDANCE]', '').trim()}
        </p>
      )
    })
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${isUser ? 'bg-sky-500' : 'bg-[#0C1F3F]'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-sky-400" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 ${isUser ? 'bg-sky-500 text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm'}`}>
          {isUser ? (
            <p className="text-sm">{msg.content}</p>
          ) : (
            <div>{renderContent(msg.content)}</div>
          )}
        </div>

        {msg.offer_ticket && !isUser && onCreateTicket && (
          <button
            onClick={onCreateTicket}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm font-medium hover:bg-amber-100 transition"
          >
            <Ticket className="w-4 h-4" /> Create Support Ticket
          </button>
        )}

        <span className="text-xs text-slate-400 px-1">
          {new Date(msg.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}

export default function FeedbackPage() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'ai',
    content: "Hello! I'm the AquaSense Support Assistant.\n\nI can help you with:\n- Billing queries and bill explanations\n- High usage questions\n- Meter and device issues\n- Water supply concerns\n- Leakage reporting\n\n[DATABASE FACT] I can only share information from your actual meter records. I will never guess or invent data.\n\n[GENERAL GUIDANCE] How can I help you today?",
    timestamp: new Date().toISOString(),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedbackId, setFeedbackId] = useState<string | undefined>()
  const [ticketCreated, setTicketCreated] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')

    const userMessage: Message = {
      role: 'user', content: userMsg, timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      const convHistory = messages.map(m => ({ role: m.role, content: m.content }))
      const result = await submitFeedback({
        message: userMsg,
        conversation_history: convHistory,
        feedback_id: feedbackId,
      })

      setFeedbackId(result.feedback_id)
      const aiMsg: Message = {
        role: 'ai',
        content: result.response,
        timestamp: new Date().toISOString(),
        offer_ticket: result.offer_ticket,
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTicket = async () => {
    if (!feedbackId) return
    try {
      const result = await createTicket(feedbackId)
      setTicketCreated(result.ticket_number)
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `[DATABASE FACT] Support ticket **${result.ticket_number}** has been created and assigned to the water authority. Status: OPEN.\n\n[GENERAL GUIDANCE] You will be notified when an administrator responds.`,
        timestamp: new Date().toISOString(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Failed to create support ticket. Please try again.',
        timestamp: new Date().toISOString(),
      }])
    }
  }

  const quickPrompts = [
    'My water bill seems very high this month',
    'My meter is not updating',
    'I think there is a leakage',
    'Explain my latest bill',
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[720px]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white border-b border-slate-100 rounded-t-xl">
        <div className="w-10 h-10 bg-[#0C1F3F] rounded-xl flex items-center justify-center">
          <Bot className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <div className="font-semibold text-slate-800">AquaSense AI Assistant</div>
          <div className="text-xs text-green-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online — Grounded in your meter data
          </div>
        </div>
        {ticketCreated && (
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-medium">
            <Ticket className="w-3 h-3" /> Ticket: {ticketCreated}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
        <div className="flex items-start gap-2 text-xs text-amber-700">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>Responses marked <strong>[DATABASE FACT]</strong> are from your actual meter records. <strong>[GENERAL GUIDANCE]</strong> is general information.</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            msg={msg}
            onCreateTicket={i === messages.length - 1 && msg.offer_ticket ? handleCreateTicket : undefined}
          />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0C1F3F] flex items-center justify-center">
              <Bot className="w-4 h-4 text-sky-400" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 bg-white border-t border-slate-50 flex gap-2 overflow-x-auto">
          {quickPrompts.map(prompt => (
            <button
              key={prompt}
              onClick={() => { setInput(prompt); }}
              className="flex-shrink-0 px-3 py-1.5 text-xs bg-sky-50 text-sky-700 border border-sky-100 rounded-full hover:bg-sky-100 transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100 rounded-b-xl">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about your bill, consumption, meter..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-slate-800 placeholder:text-slate-300 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
