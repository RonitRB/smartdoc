import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/documents').then(r => setDocs(r.data.documents || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalDocs = docs.length;
  const readyDocs = docs.filter(d => d.status === 'ready').length;
  const totalWords = docs.reduce((s, d) => s + (d.wordCount || 0), 0);
  const totalChunks = docs.reduce((s, d) => s + (d.totalChunks || 0), 0);
  const totalSize = docs.reduce((s, d) => s + (d.fileSize || 0), 0);
  const avgChunks = readyDocs ? Math.round(totalChunks / readyDocs) : 0;
  const readingTime = Math.ceil(totalWords / 250);

  // Top 5 largest docs
  const topDocs = [...docs].sort((a, b) => (b.fileSize || 0) - (a.fileSize || 0)).slice(0, 5);
  const maxSize = topDocs[0]?.fileSize || 1;

  // Status distribution
  const statusData = [
    { label: 'Ready', count: docs.filter(d => d.status === 'ready').length, color: '#34d399' },
    { label: 'Processing', count: docs.filter(d => d.status === 'processing').length, color: '#fbbf24' },
    { label: 'Failed', count: docs.filter(d => d.status === 'failed').length, color: '#f87171' },
  ];
  const totalForPie = statusData.reduce((s, d) => s + d.count, 0) || 1;

  // Timeline — docs per day (last 7 days)
  const now = new Date();
  const timeline = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    const count = docs.filter(doc => doc.createdAt?.startsWith(key)).length;
    return { label: d.toLocaleDateString('en', { weekday: 'short' }), count };
  });
  const maxTimeline = Math.max(...timeline.map(t => t.count), 1);

  if (loading) return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-400"><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg><span className="text-sm">Loading analytics...</span></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-950 relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden"><div className="bg-orb bg-orb-1 !opacity-[0.05]" /><div className="bg-orb bg-orb-2 !opacity-[0.03]" /></div>
      <nav className="nav-glass sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg></button>
          <div className="w-px h-5 bg-white/10"/>
          <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center"><svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg></div>
          <span className="text-white text-sm font-semibold">Document Analytics</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Documents', value: totalDocs, icon: '📄', gradient: 'from-brand-500/20 to-violet-500/20' },
            { label: 'Ready', value: readyDocs, icon: '✅', gradient: 'from-emerald-500/20 to-green-500/20' },
            { label: 'Total Words', value: totalWords.toLocaleString(), icon: '📝', gradient: 'from-cyan-500/20 to-blue-500/20' },
            { label: 'Chunks', value: totalChunks, icon: '🧩', gradient: 'from-orange-500/20 to-red-500/20' },
            { label: 'Total Size', value: `${(totalSize / 1024 / 1024).toFixed(1)} MB`, icon: '💾', gradient: 'from-pink-500/20 to-rose-500/20' },
            { label: 'Reading Time', value: `${readingTime} min`, icon: '⏱️', gradient: 'from-amber-500/20 to-yellow-500/20' },
          ].map((s, i) => (
            <div key={i} className={`glass-card rounded-xl p-4 bg-gradient-to-br ${s.gradient} animate-slide-up`} style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
              <span className="text-lg">{s.icon}</span>
              <p className="text-xl font-bold text-white mt-1">{s.value}</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Timeline */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <h3 className="text-white font-semibold mb-1">Upload Activity</h3>
            <p className="text-xs text-gray-500 mb-6">Last 7 days</p>
            <div className="flex items-end gap-2 h-40">
              {timeline.map((t, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-500 font-medium">{t.count}</span>
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-500" style={{ height: `${Math.max((t.count / maxTimeline) * 100, 4)}%`, opacity: t.count ? 1 : 0.2 }} />
                  <span className="text-[10px] text-gray-500">{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            <h3 className="text-white font-semibold mb-1">Status Distribution</h3>
            <p className="text-xs text-gray-500 mb-6">Document processing status</p>
            <div className="flex items-center gap-8">
              {/* Donut */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {(() => {
                    let offset = 0;
                    return statusData.map((s, i) => {
                      const pct = (s.count / totalForPie) * 100;
                      const el = <circle key={i} cx="18" cy="18" r="14" fill="none" stroke={s.color} strokeWidth="4" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-offset} strokeLinecap="round" className="transition-all duration-700" />;
                      offset += pct;
                      return el;
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-2xl font-bold text-white">{totalDocs}</span></div>
              </div>
              <div className="space-y-3">
                {statusData.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                    <span className="text-sm text-gray-300">{s.label}</span>
                    <span className="text-sm font-bold text-white ml-auto">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Documents */}
          <div className="glass-card rounded-2xl p-6 lg:col-span-2 animate-slide-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
            <h3 className="text-white font-semibold mb-1">Largest Documents</h3>
            <p className="text-xs text-gray-500 mb-6">Top 5 by file size</p>
            <div className="space-y-3">
              {topDocs.map((d, i) => (
                <div key={d._id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate font-medium">{d.originalName}</p>
                    <div className="mt-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-700" style={{ width: `${(d.fileSize / maxSize) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium flex-shrink-0">{(d.fileSize / 1024).toFixed(0)} KB</span>
                </div>
              ))}
              {topDocs.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No documents yet</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
