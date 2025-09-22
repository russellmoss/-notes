'use client'
import { useEffect, useRef, useState } from 'react'

type Preset = '30' | '60' | '90' | 'custom'
type Message = {
  id: string
  type: 'user' | 'assistant'
  content: string
  citations?: { title: string; url: string }[]
  timestamp: Date
}

type Conversation = { id: string; title: string; created_at: string; updated_at: string }

export default function ChatPage() {
  const [preset, setPreset] = useState<Preset>('30')
  const [start, setStart] = useState<string>('')
  const [end, setEnd] = useState<string>('')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)

  useEffect(() => {
    if (preset !== 'custom') {
      // clear custom dates
      setStart('')
      setEnd('')
    }
  }, [preset])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])


  // Load conversations from Supabase
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await fetch('/api/chat/conversations', { method: 'GET' })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Failed to load conversations')
        setConversations(data.conversations || [])
        if (data.conversations && data.conversations.length && !currentConversationId) {
          setCurrentConversationId(data.conversations[0].id)
        }
      } catch (e: any) {
        console.error('❌ Failed to load conversations:', e)
        setError(e.message)
      }
    }
    loadConversations()
  }, [])

  // Removed unused queryString

  const ensureConversation = async (messageContent?: string): Promise<string> => {
    // Always create a new conversation for each chat session
    const title = messageContent?.slice(0, 50) || 'New Chat'
    const res = await fetch('/api/chat/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || 'Failed to create conversation')
    setCurrentConversationId(data.conversation.id)
    setConversations(prev => [data.conversation, ...prev])
    return data.conversation.id
  }

  const loadConversation = async (conversation: Conversation) => {
    setCurrentConversationId(conversation.id)
    setQuestion('')
    try {
      const res = await fetch(`/api/chat/messages?conversation_id=${conversation.id}`, { method: 'GET' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load messages')
      const msgs: Message[] = (data.messages || []).map((m: any) => ({
        id: m.id,
        type: m.role,
        content: m.content,
        timestamp: new Date(m.created_at)
      }))
      setMessages(msgs)
    } catch (e: any) {
      setError(e?.message || 'Failed to load conversation')
    }
  }

  const startNewChat = async () => {
    setMessages([])
    setCurrentConversationId(null)
    setQuestion('')
  }

  const ask = async () => {
    if (!question.trim()) return
    setLoading(true)
    setError(null)
    
    const userMessageContent = question
    const tempUserMessageId = Date.now().toString()
    
    // Optimistically add user message
    setMessages(prev => [...prev, { id: tempUserMessageId, type: 'user', content: userMessageContent, timestamp: new Date() }])
    setQuestion('')
    
    try {
      const conversationId = await ensureConversation(userMessageContent)
      
      // Send user message to Supabase messages endpoint - this will also generate assistant reply
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId, content: userMessageContent })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to get answer')
      
      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.reply || '',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      
    } catch (e: any) {
      setError(e?.message || 'Failed to get answer')
      // Remove optimistic user message if assistant message failed
      setMessages(prev => prev.filter(m => m.id !== tempUserMessageId))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Chat History Sidebar */}
      {showHistory && (
        <div className="w-80 flex flex-col" style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
          <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="font-semibold">Chat History</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 stack">
            {conversations.length === 0 ? (
              <p className="small text-muted">No chat history yet</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => loadConversation(c)}
                  className={`btn btn--ghost justify-start text-left ${
                    currentConversationId === c.id ? 'btn--primary' : ''
                  }`}
                >
                  <div className="stack">
                    <div className="font-medium small truncate">{c.title}</div>
                    <div className="small text-muted">{new Date(c.updated_at).toLocaleDateString()}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
      
      <div className="flex-1 max-w-4xl mx-auto h-screen flex flex-col">
        <div className="p-6 cluster">
          <h1>Chat</h1>
          <div className="cluster">
            <button onClick={() => setShowHistory(v => !v)} className="btn btn--ghost">
              <span>📚</span>
              <span className="small">History</span>
            </button>
            <button onClick={() => setShowFilters(v => !v)} className="btn btn--ghost">
              <span>⚙️</span>
              <span className="small">Filters</span>
              <span className="small text-muted">{preset === 'custom' ? 'Custom' : `${preset}d`}</span>
            </button>
            <button onClick={startNewChat} className="btn btn--ghost">
              <span>➕</span>
              <span className="small">New Chat</span>
            </button>
          </div>
        </div>

        {/* Filters/Header Card (collapsible) */}
        {showFilters && (
          <div className="px-6">
            <div className="card stack">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select className="input" value={preset} onChange={(e) => setPreset(e.target.value as Preset)}>
                  <option value="30">Last 30 days</option>
                  <option value="60">Last 60 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="custom">Custom range</option>
                </select>
                <input type="date" className="input" value={start} onChange={e => setStart(e.target.value)} disabled={preset !== 'custom'} />
                <input type="date" className="input" value={end} onChange={e => setEnd(e.target.value)} disabled={preset !== 'custom'} />
                <button onClick={() => { setQuestion(''); setMessages([]); setError(null); inputRef.current?.focus() }} className="btn btn--secondary">Clear</button>
              </div>
            </div>
          </div>
        )}

        {error && <div className="px-6"><div className="alert alert--danger">{error}</div></div>}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-28 stack">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl card ${message.type === 'user' ? 'btn--primary' : ''}`}>
                {message.type === 'user' ? (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                  <div>
                    <div 
                      className="chat-response"
                      style={{
                        lineHeight: '1.6',
                        color: 'var(--text)'
                      }}
                      dangerouslySetInnerHTML={{ __html: message.content }} 
                    />
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                        <h4 className="small font-semibold mb-3">Sources</h4>
                        <ul className="list-disc pl-5 stack">
                          {message.citations.map((c, i) => (
                            <li key={i} className="small">
                              <a 
                                className="text-brand hover:underline" 
                                href={c.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                {c.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="card">
                <div className="cluster">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: 'var(--brand)' }}></div>
                  <span className="text-muted">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer pinned to bottom */}
        <div className="sticky bottom-0 backdrop-blur" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
          <div className="max-w-4xl mx-auto px-6 py-4">
            <label className="label">Ask a question</label>
            <div className="cluster">
              <textarea ref={inputRef} className="input flex-1 h-24" value={question} onChange={e => setQuestion(e.target.value)} placeholder="e.g., Summarize key RevOps themes and action items for the last 60 days" />
              <button onClick={ask} disabled={loading} className="btn btn--primary min-w-[96px]">
                {loading ? 'Thinking…' : 'Ask'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
