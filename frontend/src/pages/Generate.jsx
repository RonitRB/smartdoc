import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const CONTENT_TYPES = [
  { id: 'blog',       label: 'Blog Post',        icon: '✍️', desc: 'Full blog article with sections' },
  { id: 'social',     label: 'Social Media',      icon: '📱', desc: 'Posts for LinkedIn, Twitter, etc.' },
  { id: 'email',      label: 'Email Draft',       icon: '📧', desc: 'Professional email with subject' },
  { id: 'bullets',    label: 'Key Takeaways',     icon: '📌', desc: 'Bullet-point summary' },
  { id: 'quiz',       label: 'Quiz Questions',    icon: '❓', desc: 'Multiple-choice questions' },
  { id: 'keywords',   label: 'Keywords & Topics', icon: '🏷️', desc: 'Extract key terms and themes' },
  { id: 'translate',  label: 'Translate',          icon: '🌐', desc: 'Translate to another language' },
  { id: 'presentation', label: 'Presentation',    icon: '📊', desc: 'Slide deck outline with notes' },
  { id: 'mindmap',    label: 'Mind Map',           icon: '🧠', desc: 'Hierarchical concept map' },
];

const LANGUAGES = ['English','Hindi','Kannada','Tamil','Telugu','Spanish','French','German','Arabic','Japanese','Chinese'];

const Generate = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [selectedType, setSelectedType] = useState('bullets');
  const [language, setLanguage] = useState('English');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/documents/${documentId}`)
      .then(res => setDocument(res.data.document))
      .catch(() => { toast.error('Document not found'); navigate('/dashboard'); })
      .finally(() => setInitializing(false));
  }, [documentId, navigate]);

  const handleGenerate = async () => {
    setLoading(true);
    setResult('');
    try {
      const res = await api.post(`/generate/${documentId}`, { type: selectedType, language });
      setResult(res.data.content);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied!');
  };

  const handleExport = () => {
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `smartdoc-${selectedType}-${document?.originalName || 'export'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported!');
  };

  const wordCount = result ? result.split(/\s+/).filter(Boolean).length : 0;

  if (initializing) return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-400 animate-fade-in">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
        <span className="text-sm font-medium">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-950 relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="bg-orb bg-orb-1 !opacity-[0.05]" />
      </div>

      {/* Navbar */}
      <nav className="nav-glass sticky top-0 z-10">
        <div className="h-14 px-4 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="w-px h-5 bg-white/10"/>
          <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <span className="text-white text-sm font-semibold">AI Content Generator</span>
          <span className="text-gray-600">—</span>
          <span className="text-gray-400 text-sm truncate max-w-xs">{document?.originalName}</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Left — Controls */}
        <div className="animate-slide-up">
          <h2 className="text-white font-bold text-xl mb-1">Choose content type</h2>
          <p className="text-gray-400 text-sm mb-6">Select what you want to generate from your document</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {CONTENT_TYPES.map(type => (
              <button key={type.id} onClick={() => setSelectedType(type.id)} className={`text-left p-4 rounded-xl border transition-all duration-200 card-hover ${selectedType === type.id ? 'border-brand-500/50 bg-brand-500/10 shadow-lg shadow-brand-500/5' : 'border-white/5 glass-card hover:border-white/15'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{type.icon}</span>
                  <span className={`text-sm font-medium ${selectedType === type.id ? 'text-brand-300' : 'text-white'}`}>{type.label}</span>
                </div>
                <p className="text-xs text-gray-500">{type.desc}</p>
              </button>
            ))}
          </div>

          {/* Language selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Output language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="input-field !bg-surface-900 cursor-pointer" id="language-select">
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full !text-sm flex items-center justify-center gap-2" id="generate-btn">
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                Generate {CONTENT_TYPES.find(t => t.id === selectedType)?.label}
              </>
            )}
          </button>

          <button onClick={() => navigate(`/chat/${documentId}`)} className="btn-secondary w-full mt-3 !text-sm">
            Switch to Chat mode
          </button>
        </div>

        {/* Right — Result */}
        <div className="animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-bold text-xl">Generated content</h2>
              {result && <p className="text-xs text-gray-500 mt-0.5">{wordCount} words</p>}
            </div>
            {result && (
              <div className="flex items-center gap-2">
                <button onClick={handleExport} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white glass-card px-3 py-1.5 rounded-lg transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Export
                </button>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white glass-card px-3 py-1.5 rounded-lg transition-colors">
                  {copied ? (
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl min-h-96 p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-80 gap-4 animate-fade-in">
                <div className="relative">
                  <svg className="w-10 h-10 animate-spin text-brand-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                </div>
                <p className="text-gray-400 text-sm font-medium">Generating your content...</p>
                <p className="text-gray-600 text-xs">This may take 10-20 seconds</p>
              </div>
            ) : result ? (
              <div className="prose-custom text-sm leading-relaxed animate-fade-in">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 gap-3 animate-fade-in">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <p className="text-gray-400 text-sm text-center font-medium">Select a content type and click Generate</p>
                <p className="text-gray-600 text-xs text-center">AI will create content based on your document</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Generate;
