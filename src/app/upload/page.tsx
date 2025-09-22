'use client'
import { useState, useEffect } from 'react'

type LocalFile = { id: string; file?: File; name: string; type: 'transcript' | 'written' }

export default function UploadPage() {
  const [items, setItems] = useState<LocalFile[]>([])
  const [preview, setPreview] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Local text state for Action Items to allow free typing
  const [actionItemsText, setActionItemsText] = useState<string>('')

  useEffect(() => {
    // whenever preview loads/reloads, seed the text area once
    if (preview) {
      const seeded = (preview.action_items || [])
        .map((ai: any) => `${ai.owner}: ${ai.task}${ai.due ? ` (due ${ai.due})` : ''}`)
        .join('\n')
      setActionItemsText(seeded)
    } else {
      setActionItemsText('')
    }
  }, [preview])

  const addItem = () => {
    setItems(prev => [...prev, { id: Math.random().toString(36).slice(2), name: '', type: 'written' }])
  }
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  const onFileChange = (id: string, file?: File) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, file, name: file?.name || i.name } : i))
  }
  const onTypeChange = (id: string, type: 'transcript' | 'written') => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, type } : i))
  }

  const doPreview = async () => {
    setLoading(true); setError(null); setSuccess(null); setPreview(null); setProgress('')
    
    // Simulate progress updates
    const progressSteps = [
      'Reading files...',
      'Processing content...',
      'Analyzing with AI...',
      'Generating summary...',
      'Extracting action items...',
      'Formatting output...'
    ]
    
    let stepIndex = 0
    const progressInterval = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        setProgress(progressSteps[stepIndex])
        stepIndex++
      }
    }, 2000)
    
    try {
      const form = new FormData()
      items.forEach((it, idx) => {
        if (it.file) form.append(`file_${idx}`, it.file)
        form.append(`type_${idx}`, it.type)
      })
      const res = await fetch('/api/upload/preview', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Preview failed')
      setPreview(data.preview)
      setProgress('Complete!')
    } catch (e: any) {
      setError(e?.message || 'Preview failed')
      setProgress('')
    } finally {
      clearInterval(progressInterval)
      setLoading(false)
    }
  }

  const submitToNotion = async () => {
    if (!preview) return
    setLoading(true); setError(null); setSuccess(null)
    try {
      const res = await fetch('/api/upload/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preview })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Submit failed')
      setSuccess('Pushed to Notion successfully')
      setItems([])
      setPreview(null)
    } catch (e: any) {
      setError(e?.message || 'Submit failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container stack" style={{ minHeight: '100vh', padding: 'var(--space-6)' }}>
      <h1>Upload Notes</h1>

      <div className="card stack">
        <div className="cluster">
          <div className="font-semibold">Files</div>
          <button onClick={addItem} className="btn btn--primary">+ Add file</button>
        </div>

        <div className="stack">
          {items.map((it) => (
            <div key={it.id} className="cluster" style={{ padding: 'var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <input type="file" accept=".txt" onChange={(e) => onFileChange(it.id, e.target.files?.[0])} className="input flex-1" />
              <select value={it.type} onChange={(e) => onTypeChange(it.id, e.target.value as any)} className="input">
                <option value="transcript">Transcript</option>
                <option value="written">Written</option>
              </select>
              <button onClick={() => removeItem(it.id)} className="btn btn--ghost text-danger">Remove</button>
            </div>
          ))}
          {items.length === 0 && (
            <div className="small text-muted">No files added yet.</div>
          )}
        </div>

        <div>
          <button onClick={doPreview} disabled={loading || items.length === 0} className="btn btn--secondary">{loading ? 'Processing…' : 'Generate Preview'}</button>
        </div>
      </div>

      {error && <div className="alert alert--danger">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      {loading && progress && (
        <div className="alert alert--info">
          <div className="cluster">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: 'var(--brand)' }}></div>
            <span className="font-medium">{progress}</span>
          </div>
        </div>
      )}


      {preview && (
        <div className="card stack">
          <div className="field">
            <label className="label">Title</label>
            <input className="input" value={preview.title} onChange={e => setPreview({ ...preview, title: e.target.value })} />
          </div>
          <div className="field">
            <label className="label">TL;DR</label>
            <textarea className="input" value={preview.tldr} onChange={e => setPreview({ ...preview, tldr: e.target.value })} />
          </div>
          <div className="field">
            <label className="label">Summary</label>
            <textarea className="input" style={{ height: '160px' }} value={preview.summary} onChange={e => setPreview({ ...preview, summary: e.target.value })} />
          </div>
          <div className="field">
            <label className="label">Key Takeaways (one per line)</label>
            <textarea className="input" value={(preview.key_takeaways || []).join('\n')} onChange={e => setPreview({ ...preview, key_takeaways: e.target.value.split('\n') })} />
          </div>
          <div className="field">
            <label className="label">Action Items (owner: task [due ...])</label>
            <textarea
              className="input"
              value={actionItemsText}
              onChange={e => {
                const text = e.target.value
                setActionItemsText(text)
                const lines = text.split('\n')
                const parsed = lines.map(line => {
                  const m = line.match(/^([^:]+):\s*(.+?)(?:\s*\(due\s*(.+)\))?$/)
                  return { owner: m?.[1]?.trim() || '', task: m?.[2]?.trim() || '', due: (m?.[3]?.trim() || null) }
                })
                setPreview({ ...preview, action_items: parsed })
              }}
            />
          </div>
          <div className="field">
            <label className="label">Full Written (verbatim)</label>
            <textarea className="input" style={{ height: '160px' }} value={preview.full_text?.body || ''} onChange={e => setPreview({ ...preview, full_text: { body: e.target.value } })} />
          </div>

          <div>
            <button onClick={submitToNotion} disabled={loading} className="btn btn--success">{loading ? 'Submitting…' : 'Submit to Notion'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
