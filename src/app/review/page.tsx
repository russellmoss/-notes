'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';
import { useSupabase } from '@/hooks/useSupabase';

interface ReviewNote {
  id: string;
  title: string;
  tldr: string;
  summary: string;
  keyTakeaways: string[];
  actionItems: {
    owner: string;
    task: string;
    due: string | null;
  }[];
  date: string;
  submissionDate: string;
  notionUrl: string;
  reviewType: 'next-day' | 'week-later';
  reviewed: boolean;
  edits: string;
}

export default function ReviewDashboard() {
  const [notes, setNotes] = useState<ReviewNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const router = useRouter();
  const supabase = useSupabase();

  useEffect(() => {
    checkAuthAndFetchNotes();
  }, []);

  const checkAuthAndFetchNotes = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    await fetchNotesForReview();
  };

  const fetchNotesForReview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const base = process.env.NEXT_PUBLIC_APP_URL || '';
      const url = base ? `${base}/api/review/pending` : '/api/review/pending';
      const response = await fetch(url, { cache: 'no-store' });
      if (response && response.ok) {
        const data = await response.json();
        setNotes(data.notes);
      } else {
        // fall back to empty without failing build
        setNotes([]);
      }
    } catch (err) {
      setNotes([]);
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const toggleReviewed = (noteId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, reviewed: !note.reviewed } : note
    ));
  };

  const toggleExpanded = (noteId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  // Debounced auto-save for edits
  const debouncedSave = useCallback(
    debounce((noteId: string, edits: string) => {
      // Auto-save to localStorage
      localStorage.setItem(`review-edits-${noteId}`, edits);
    }, 1000),
    []
  );

  const updateNoteEdits = (noteId: string, edits: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, edits } : note
    ));
    debouncedSave(noteId, edits);
  };

  const submitAllReviews = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const reviewedNotes = notes.filter(n => n.reviewed);
      
      if (reviewedNotes.length === 0) {
        setError('Please mark at least one note as reviewed');
        setSaving(false);
        return;
      }
      
      const response = await fetch('/api/review/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: reviewedNotes })
      });
      
      if (!response.ok) throw new Error('Failed to submit reviews');
      
      // Clear local storage for submitted notes
      reviewedNotes.forEach(note => {
        localStorage.removeItem(`review-edits-${note.id}`);
      });
      
      // Optimistically remove submitted notes from the list
      setNotes(prev => prev.filter(n => !reviewedNotes.some(r => r.id === n.id)));
      
      // Refresh the list in background to stay in sync
      fetchNotesForReview();
      
      // Show success message
      const { reviewedCount } = await response.json();
      alert(`✅ Successfully submitted ${reviewedCount} reviews!`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit reviews');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading notes for review...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: 'var(--space-6)' }}>
      <div className="container stack">
        <div className="card stack">
          <div className="cluster">
            <div className="stack">
              <h1>📚 Notes Review</h1>
              <span className="small">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="btn btn--ghost"
            >
              Sign Out
            </button>
          </div>
        </div>

      {/* Stats Bar */}
      <div className="card">
        <div className="cluster">
          <div className="cluster">
            <div className="stack">
              <p className="small">Total to Review</p>
              <p className="text-2xl font-bold">{notes.length}</p>
            </div>
            <div className="stack">
              <p className="small">Next-Day Reviews</p>
              <p className="text-2xl font-bold text-brand">
                {notes.filter(n => n.reviewType === 'next-day').length}
              </p>
            </div>
            <div className="stack">
              <p className="small">Week-Later Reviews</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--brand-600)' }}>
                {notes.filter(n => n.reviewType === 'week-later').length}
              </p>
            </div>
          </div>
          <button
            onClick={submitAllReviews}
            disabled={saving || !notes.some(n => n.reviewed)}
            className="btn btn--success"
          >
            {saving ? 'Submitting...' : `Submit ${notes.filter(n => n.reviewed).length} Reviews`}
          </button>
        </div>
        
        {error && (
          <div className="alert alert--danger mt-4">
            {error}
          </div>
        )}
      </div>

      {/* Notes List */}
      <div className="stack">
        {notes.map((note) => (
          <div 
            key={note.id} 
            className={`card transition-all ${
              note.reviewed ? 'ring-2 ring-green-500' : ''
            }`}
          >
              {/* Note Header */}
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">{note.title}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        note.reviewType === 'next-day' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {note.reviewType === 'next-day' ? 'Next Day' : 'Week Later'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📅 Original: {new Date(note.date).toLocaleDateString()}</span>
                      <span>📝 Submitted: {new Date(note.submissionDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={note.reviewed}
                        onChange={() => toggleReviewed(note.id)}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="font-medium text-gray-700">Mark Reviewed</span>
                    </label>
                    
                    <a
                      href={note.notionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Open in Notion →
                    </a>
                  </div>
                </div>
              </div>

              {/* Note Content */}
              <div className="p-6 space-y-4">
                {/* TL;DR */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🎯 TL;DR</h3>
                  <p className="text-gray-700">{note.tldr}</p>
                </div>

                {/* Key Takeaways */}
                {note.keyTakeaways.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">💡 Key Takeaways</h3>
                    <ul className="space-y-1">
                      {note.keyTakeaways.map((takeaway, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span className="text-gray-700">{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Items */}
                {note.actionItems.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">✅ Action Items</h3>
                    <div className="space-y-2">
                      {note.actionItems.map((item, idx) => (
                        <div key={idx} className="bg-yellow-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium text-gray-900">{item.owner}:</span>
                              <span className="ml-2 text-gray-700">{item.task}</span>
                            </div>
                            {item.due && (
                              <span className="text-sm text-gray-500 whitespace-nowrap">
                                Due: {item.due}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Summary (Collapsible) */}
                {note.summary && (
                  <div>
                    <button
                      onClick={() => toggleExpanded(note.id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                    >
                      <span className={`transform transition-transform ${
                        expandedNotes.has(note.id) ? 'rotate-90' : ''
                      }`}>
                        ▶
                      </span>
                      Show Full Summary
                    </button>
                    {expandedNotes.has(note.id) && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{note.summary}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Review Notes */}
                <div className="border-t pt-4">
                  <label className="block font-semibold text-gray-900 mb-2">
                    ✏️ Add Review Notes (optional)
                  </label>
                  <textarea
                    value={note.edits || ''}
                    onChange={(e) => updateNoteEdits(note.id, e.target.value)}
                    placeholder="Add any updates, new insights, corrections, or follow-ups..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-saved locally as you type
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {notes.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              All caught up!
            </h2>
            <p className="text-gray-600">
              No notes need review right now. Check back tomorrow!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
