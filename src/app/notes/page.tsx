'use client';
import { useEffect, useState, useMemo } from 'react';

interface NoteItem {
  id: string;
  url: string;
  title: string;
  date: string;
  submissionDate: string;
  reviewNextDay: boolean;
  reviewWeekLater: boolean;
  source: string;
  tldr: string;
  summary: string;
  people: string[];
  keyTakeaways: string;
  actionItems: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'submissionDate' | 'title'>('submissionDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/notes', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load notes');
        const data = await res.json();
        setNotes(data.notes as NoteItem[]);
      } catch (e: any) {
        setError(e?.message || 'Failed to load notes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Get all unique people for filter dropdown
  const allPeople = useMemo(() => {
    const peopleSet = new Set<string>();
    notes.forEach(note => {
      note.people.forEach(person => peopleSet.add(person));
    });
    return Array.from(peopleSet).sort();
  }, [notes]);

  // Filter and search logic
  const filteredAndSortedNotes = useMemo(() => {
    const filtered = notes.filter(note => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          note.title,
          note.tldr,
          note.summary,
          note.keyTakeaways,
          note.actionItems,
          ...note.people
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) {
          return false;
        }
      }

      // Date range filter
      if (dateFrom && note.date && note.date < dateFrom) {
        return false;
      }
      if (dateTo && note.date && note.date > dateTo) {
        return false;
      }

      // People filter
      if (selectedPeople.length > 0) {
        const hasSelectedPerson = selectedPeople.some(person => 
          note.people.includes(person)
        );
        if (!hasSelectedPerson) {
          return false;
        }
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = '';
      let bValue = '';
      
      switch (sortBy) {
        case 'date':
          aValue = a.date || '';
          bValue = b.date || '';
          break;
        case 'submissionDate':
          aValue = a.submissionDate || '';
          bValue = b.submissionDate || '';
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  }, [notes, searchQuery, dateFrom, dateTo, selectedPeople, sortBy, sortOrder]);

  const handlePersonToggle = (person: string) => {
    setSelectedPeople(prev => 
      prev.includes(person) 
        ? prev.filter(p => p !== person)
        : [...prev, person]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setSelectedPeople([]);
    setSortBy('submissionDate');
    setSortOrder('desc');
  };

  if (loading) {
    return (
      <div className="center" style={{ minHeight: '100vh' }}>
        <p className="text-muted">Loading notes…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="center" style={{ minHeight: '100vh' }}>
        <div className="card">
          <div className="alert alert--danger">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container stack" style={{ minHeight: '100vh', padding: 'var(--space-6)' }}>
      <div className="cluster">
        <h1>All Notes</h1>
        <div className="cluster">
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className="btn btn--ghost"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <a href="/review" className="btn btn--primary">Go to Review →</a>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="field">
          <label className="label">Search Notes</label>
          <input
            type="text"
            className="input"
            placeholder="Search by title, content, people, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card stack">
          <div className="cluster">
            <h3>Filters</h3>
            <button onClick={clearFilters} className="btn btn--secondary">Clear All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="field">
              <label className="label">Date From</label>
              <input
                type="date"
                className="input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="label">Date To</label>
              <input
                type="date"
                className="input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            
            {/* Sort Options */}
            <div className="field">
              <label className="label">Sort By</label>
              <select
                className="input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="submissionDate">Submission Date</option>
                <option value="date">Meeting Date</option>
                <option value="title">Title</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Order</label>
              <select
                className="input"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          {/* People Filter */}
          {allPeople.length > 0 && (
            <div className="field">
              <label className="label">Filter by People</label>
              <div className="cluster" style={{ flexWrap: 'wrap' }}>
                {allPeople.map(person => (
                  <button
                    key={person}
                    onClick={() => handlePersonToggle(person)}
                    className={`btn ${selectedPeople.includes(person) ? 'btn--primary' : 'btn--ghost'}`}
                  >
                    {person}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      <div className="cluster">
        <p className="text-muted">
          Showing {filteredAndSortedNotes.length} of {notes.length} notes
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedPeople.length > 0 && ` with ${selectedPeople.join(', ')}`}
        </p>
      </div>

      {/* Notes List */}
      <div className="card">
        {filteredAndSortedNotes.map((n) => {
          // Format submission date to show only date (no time)
          const formatDate = (dateStr: string) => {
            if (!dateStr) return '—';
            try {
              return new Date(dateStr).toLocaleDateString();
            } catch {
              return dateStr;
            }
          };

          // Truncate summary to give just a flavor
          const truncateText = (text: string, maxLength: number = 120) => {
            if (!text) return '';
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength).trim() + '...';
          };

          return (
            <div key={n.id} className="stack" style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border)' }}>
              <div className="stack">
                <div className="cluster">
                  <a className="font-semibold text-brand" href={n.url} target="_blank" rel="noopener noreferrer">{n.title}</a>
                  {n.reviewNextDay && <span className="badge badge--brand">Next Day ✓</span>}
                  {n.reviewWeekLater && <span className="badge badge--success">Week Later ✓</span>}
                </div>
                
                <div className="cluster" style={{ flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <span className="small text-muted">Submitted: {formatDate(n.submissionDate)}</span>
                  {n.source && <span className="small text-muted">· Source: {n.source}</span>}
                </div>

                {n.people.length > 0 && (
                  <div className="cluster" style={{ flexWrap: 'wrap' }}>
                    <span className="small text-muted">People:</span>
                    {n.people.map(person => (
                      <span key={person} className="badge badge--secondary">{person}</span>
                    ))}
                  </div>
                )}

                {(n.tldr || n.summary) && (
                  <p className="small text-muted">
                    {truncateText(n.tldr || n.summary)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {filteredAndSortedNotes.length === 0 && (
          <div className="center" style={{ padding: 'var(--space-12)' }}>
            <p className="text-muted">
              {notes.length === 0 ? 'No notes' : 'No notes match your filters'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
