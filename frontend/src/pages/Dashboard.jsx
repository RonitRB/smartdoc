import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PDFUploader from '../components/PDFUploader';
import DocumentCard from '../components/DocumentCard';
import CommandPalette from '../components/CommandPalette';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPalette, setShowPalette] = useState(false);

  // Keyboard shortcut: Ctrl+K for command palette
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowPalette(true); }
      if (e.key === 'Escape') setShowPalette(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(fetchDocuments, 5000);
    return () => clearInterval(interval);
  }, [fetchDocuments]);

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      await api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 });
      toast.success('PDF uploaded! Processing started...');
      fetchDocuments();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/documents/${deleteTarget}`);
      setDocuments(prev => prev.filter(d => d._id !== deleteTarget));
      toast.success('Document deleted');
    } catch { toast.error('Failed to delete document'); }
    finally { setDeleteTarget(null); }
  };

  const filtered = documents.filter(d => d.originalName.toLowerCase().includes(search.toLowerCase()));
  const readyCount = documents.filter(d => d.status === 'ready').length;
  const processingCount = documents.filter(d => d.status === 'processing').length;
  const totalWords = documents.reduce((s, d) => s + (d.wordCount || 0), 0);
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-surface-950 relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden"><div className="bg-orb bg-orb-1 !opacity-[0.07]" /><div className="bg-orb bg-orb-2 !opacity-[0.05]" /></div>

      {/* Command Palette */}
      {showPalette && <CommandPalette documents={documents} onClose={() => setShowPalette(false)} />}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-sm w-full mx-4 animate-scale-in">
            <div className="w-12 h-12 bg-red-500/15 rounded-xl flex items-center justify-center mx-auto mb-4"><svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></div>
            <h3 className="text-white font-semibold text-lg text-center mb-2">Delete Document?</h3>
            <p className="text-gray-400 text-sm text-center mb-6">This will permanently delete the document, all chunks, and chat history.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1 !py-2.5 !text-sm">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="nav-glass sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <span className="text-white font-bold text-sm tracking-tight">SmartDoc</span>
            <span className="hidden sm:block text-xs text-brand-300 bg-brand-500/10 border border-brand-500/20 px-2.5 py-0.5 rounded-full ml-1 font-medium">v4</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Command palette trigger */}
            <button onClick={() => setShowPalette(true)} className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              Quick actions
              <kbd className="text-[10px] bg-white/5 px-1 py-0.5 rounded border border-white/10 font-mono ml-1">⌘K</kbd>
            </button>
            {/* Analytics */}
            <button onClick={() => navigate('/analytics')} className="text-gray-500 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-lg" title="Analytics">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </button>
            {/* Theme toggle */}
            <button onClick={toggleTheme} data-theme-toggle className="text-gray-500 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-lg" title="Toggle theme">
              {theme === 'dark' ? (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              ) : (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
              )}
            </button>
            <span className="text-sm text-gray-400 hidden sm:block">Hey, {user?.name?.split(' ')[0]} 👋</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">{initials}</div>
            <button onClick={logout} className="text-xs text-gray-500 hover:text-white transition-colors font-medium">Sign out</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        {/* Stats */}
        {documents.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-slide-up">
            {[
              { label: 'Documents', value: documents.length, icon: '📄', gradient: 'from-brand-500/20 to-violet-500/20' },
              { label: 'Ready', value: readyCount, icon: '✅', gradient: 'from-emerald-500/20 to-green-500/20' },
              { label: 'Processing', value: processingCount, icon: '⏳', gradient: 'from-amber-500/20 to-orange-500/20' },
              { label: 'Total Words', value: totalWords.toLocaleString(), icon: '📝', gradient: 'from-cyan-500/20 to-blue-500/20' },
            ].map((stat, i) => (
              <div key={i} className={`glass-card rounded-xl px-5 py-4 bg-gradient-to-br ${stat.gradient}`}>
                <div className="flex items-center gap-2 mb-1"><span className="text-lg">{stat.icon}</span><p className="text-2xl font-bold text-white">{stat.value}</p></div>
                <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h1 className="text-3xl font-bold text-white mb-2">AI Content Generator</h1>
          <p className="text-gray-400">Upload PDFs · Chat with RAG · Generate content · Voice input · 9 content types · Multi-language</p>
        </div>

        <div className="mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <PDFUploader onUpload={handleUpload} uploading={uploading} />
        </div>

        {documents.length > 0 && (
          <div className="mb-6 relative animate-slide-up" style={{ animationDelay: '250ms' }}>
            <svg className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="input-field !pl-11" id="search-documents" />
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (<div key={i} className="glass-card rounded-2xl p-5 h-48 animate-pulse"><div className="flex gap-3 mb-4"><div className="w-10 h-10 bg-white/5 rounded-xl" /><div className="flex-1"><div className="h-4 bg-white/5 rounded w-2/3 mb-2" /><div className="h-3 bg-white/5 rounded w-1/3" /></div></div><div className="h-3 bg-white/5 rounded w-full mb-2" /><div className="h-3 bg-white/5 rounded w-4/5" /></div>))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 glass-card rounded-2xl flex items-center justify-center mx-auto mb-5"><svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
            <p className="text-gray-400 text-sm">{search ? `No documents matching "${search}"` : 'No documents yet — upload a PDF to get started'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((doc, i) => (
              <div key={doc._id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}>
                <DocumentCard doc={doc} onDelete={(id) => setDeleteTarget(id)} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
