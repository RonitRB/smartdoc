import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const CONTENT_TYPES = [
  { id: 'blog',     label: 'Blog Post',        icon: '✍️', desc: 'Full blog article with title and sections' },
  { id: 'social',   label: 'Social Media',     icon: '📱', desc: 'Posts for LinkedIn, Twitter, Instagram' },
  { id: 'email',    label: 'Email Draft',      icon: '📧', desc: 'Professional email with subject line' },
  { id: 'bullets',  label: 'Key Takeaways',    icon: '📌', desc: 'Bullet-point summary of main points' },
  { id: 'quiz',     label: 'Quiz Questions',   icon: '❓', desc: '5 multiple-choice questions with answers' },
  { id: 'keywords', label: 'Keywords & Topics', icon: '🏷️', desc: 'Extract key terms and themes' },
  { id: 'translate',label: 'Translate',        icon: '🌐', desc: 'Translate document to another language' },
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
    toast.success('Copied to clipboard!');
  };

  if (initializing) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-400">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <span className="text-sm">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="h-14 px-4 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-px h-5 bg-gray-800"/>
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <span className="text-white text-sm font-medium">AI Content Generator</span>
          <span className="text-gray-500 text-sm">—</span>
          <span className="text-gray-400 text-sm truncate max-w-xs">{document?.originalName}</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — Controls */}
        <div>
          <h2 className="text-white font-semibold text-lg mb-1">Choose content type</h2>
          <p className="text-gray-400 text-sm mb-6">Select what you want to generate from your document</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {CONTENT_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selectedType === type.id
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{type.icon}</span>
                  <span className={`text-sm font-medium ${selectedType === type.id ? 'text-indigo-300' : 'text-white'}`}>
                    {type.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{type.desc}</p>
              </button>
            ))}
          </div>

          {/* Language selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Output language</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Generate {CONTENT_TYPES.find(t => t.id === selectedType)?.label}
              </>
            )}
          </button>

          {/* Also chat button */}
          <button
            onClick={() => navigate(`/chat/${documentId}`)}
            className="w-full mt-3 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-medium py-3 rounded-xl text-sm transition-colors"
          >
            Switch to Chat mode
          </button>
        </div>

        {/* Right — Result */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">Generated content</h2>
            {result && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-gray-900 border border-gray-700 hover:border-gray-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                {copied ? (
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl min-h-96 p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-80 gap-4">
                <svg className="w-8 h-8 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <p className="text-gray-400 text-sm">Generating your content...</p>
                <p className="text-gray-600 text-xs">This may take 10-20 seconds</p>
              </div>
            ) : result ? (
              <div className="prose prose-invert prose-sm max-w-none text-gray-200 leading-relaxed">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 gap-3">
                <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <p className="text-gray-400 text-sm text-center">Select a content type and click Generate</p>
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
