import { useState, useEffect } from 'react'
import api from '../api/axios'

const severityColors = {
  error:   'bg-red-50 border-red-200 text-red-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  info:    'bg-blue-50 border-blue-200 text-blue-700',
}

export default function BugReports() {
  const [bugs, setBugs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [expanded, setExpanded] = useState(null)
  const [clearing, setClearing] = useState(false)
  const [search, setSearch]     = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/bugs')
      setBugs(res.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bug reports.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleClear = async () => {
    if (!window.confirm('Clear all bug reports? This cannot be undone.')) return
    setClearing(true)
    try {
      await api.delete('/bugs')
      setBugs([])
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear.')
    } finally {
      setClearing(false)
    }
  }

  const filtered = bugs.filter(b =>
    b.message?.toLowerCase().includes(search.toLowerCase()) ||
    b.page?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
              🔴 Developer Only
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Bug Reports</h2>
          <p className="text-slate-500 text-sm mt-0.5">Frontend errors captured automatically</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm w-full sm:w-60">
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search bugs..."
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 w-full outline-none"
            />
          </div>
          <button
            onClick={handleClear}
            disabled={clearing || bugs.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-colors"
          >
            {clearing ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            Clear All
          </button>
        </div>
      </div>

      {/* Summary strip */}
      {!loading && !error && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Reports', value: bugs.length, color: 'from-red-500 to-rose-600' },
            { label: 'Unique Pages', value: new Set(bugs.map(b => b.page)).size, color: 'from-orange-400 to-orange-600' },
            { label: 'Today', value: bugs.filter(b => new Date(b.createdAt).toDateString() === new Date().toDateString()).length, color: 'from-purple-500 to-purple-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-lg`}>
              <p className="text-white/75 text-xs font-medium mb-1">{label}</p>
              <p className="text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading bug reports...</p>
          </div>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6 text-sm">{error}</div>}

      {/* Bug List */}
      {!loading && !error && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Error Log</h3>
            <span className="text-xs text-slate-400">{filtered.length} of {bugs.length} reports</span>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">{bugs.length === 0 ? 'No bug reports yet! 🎉' : 'No results found'}</p>
              {bugs.length === 0 && <p className="text-sm mt-1">Errors will appear here automatically when detected</p>}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((bug) => (
                <div key={bug.id} className="p-5 hover:bg-slate-50 transition-colors">
                  <div
                    className="cursor-pointer"
                    onClick={() => setExpanded(expanded === bug.id ? null : bug.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-800 font-medium text-sm truncate">{bug.message}</p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {bug.page && (
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                {bug.page}
                              </span>
                            )}
                            <span className="text-xs text-slate-400">
                              {new Date(bug.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <svg
                        className={`w-4 h-4 text-slate-400 flex-shrink-0 mt-1 transition-transform duration-200 ${expanded === bug.id ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded stack trace */}
                  {expanded === bug.id && (
                    <div className="mt-4 space-y-3">
                      {bug.stack && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Stack Trace</p>
                          <pre className="bg-slate-900 text-emerald-400 text-xs rounded-xl p-4 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                            {bug.stack}
                          </pre>
                        </div>
                      )}
                      {bug.userAgent && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Browser</p>
                          <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 font-mono">{bug.userAgent}</p>
                        </div>
                      )}
                      {bug.userId && (
                        <p className="text-xs text-slate-400">User ID: #{bug.userId}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
