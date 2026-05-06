import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import MessageBubble from '../components/MessageBubble';
import SummaryPanel from '../components/SummaryPanel';
import VoiceInput from '../components/VoiceInput';
import toast from 'react-hot-toast';

const Chat = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [streamingIndex, setStreamingIndex] = useState(-1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [docRes, historyRes] = await Promise.all([
          api.get(`/documents/${documentId}`),
          api.get(`/chat/${documentId}/history`),
        ]);
        setDocument(docRes.data.document);
        setMessages(historyRes.data.messages || []);
      } catch (err) {
        console.error('Chat init error:', err);
        toast.error('Failed to load document');
        navigate('/dashboard');
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, [documentId, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleAsk = async (e) => {
    e?.preventDefault();
    const q = question.trim();
    if (!q || loading) return;
    const userMsg = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);
    try {
      // Send last 4 messages as context for conversational follow-up
      const context = [...messages.slice(-4), userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await api.post(`/chat/${documentId}`, { question: q, context });
      const aiMsg = { role: 'assistant', content: res.data.answer, citations: res.data.citations || [], isNew: true };
      setMessages(prev => [...prev, aiMsg]);
      setStreamingIndex(messages.length + 1); // trigger typewriter on new message
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to get answer');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleVoiceResult = useCallback((transcript) => {
    setQuestion(transcript);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSuggestion = (q) => {
    setQuestion(q);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClear = async () => {
    try {
      await api.delete(`/chat/${documentId}/history`);
      setMessages([]);
      toast.success('Chat cleared');
    } catch { toast.error('Failed to clear chat'); }
  };

  const handleExport = () => {
    const text = messages.map(m => `${m.role === 'user' ? 'You' : 'SmartDoc AI'}: ${m.content}`).join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `smartdoc-chat-${document?.originalName || 'export'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat exported!');
  };

  const suggested = [
    'What is this document about?',
    'Summarize the key points',
    'What are the main conclusions?',
    'Extract all important data and figures',
  ];

  if (initializing) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400 animate-fade-in">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          <span className="text-sm font-medium">Loading document...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      <nav className="nav-glass sticky top-0 z-10 flex-shrink-0">
        <div className="h-14 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors flex-shrink-0 p-1 hover:bg-white/5 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="w-px h-5 bg-white/10 flex-shrink-0"/>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <span className="text-white text-sm font-medium truncate">{document?.originalName}</span>
              <span className="text-[10px] text-brand-300 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full font-medium hidden sm:block">RAG Chat</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setShowSummary(!showSummary)} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${showSummary ? 'border-brand-500/50 text-brand-300 bg-brand-500/10' : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'}`}>Summary</button>
            {messages.length > 0 && (
              <>
                <button onClick={handleExport} className="text-gray-500 hover:text-brand-400 transition-colors p-1.5 hover:bg-white/5 rounded-lg" title="Export chat">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </button>
                <button onClick={handleClear} className="text-xs text-gray-500 hover:text-red-400 transition-colors px-2">Clear</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 pb-10 animate-fade-in">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </div>
                  <p className="text-white font-semibold text-lg">Ask anything about this document</p>
                  <p className="text-gray-400 text-sm mt-1">Powered by RAG with TF-IDF retrieval · Supports follow-up questions</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {suggested.map((q, i) => (
                    <button key={i} onClick={() => handleSuggestion(q)} className="text-left text-sm text-gray-300 glass-card rounded-xl px-4 py-3 card-hover hover:text-white">{q}</button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <MessageBubble key={i} message={msg} index={i} isStreaming={i === streamingIndex} onStreamComplete={() => setStreamingIndex(-1)} />
                ))}
                {loading && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white shadow-lg shadow-brand-500/20">AI</div>
                    <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1.5 items-center h-5">
                        {[0,200,400].map(d => (
                          <span key={d} className="w-2 h-2 bg-brand-400 rounded-full" style={{ animation: `typing-bounce 1.4s ${d}ms infinite` }}/>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          <div className="border-t border-white/5 p-4 flex-shrink-0 bg-surface-950/80 backdrop-blur-sm">
            <form onSubmit={handleAsk} className="flex gap-2">
              <input ref={inputRef} value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); }}} placeholder="Ask a question about the document..." disabled={loading} className="input-field flex-1" id="chat-input" />
              <VoiceInput onResult={handleVoiceResult} disabled={loading} />
              <button type="submit" disabled={loading || !question.trim()} className="btn-primary !px-4 !py-3 !rounded-xl flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </form>
            <p className="text-xs text-gray-600 text-center mt-2">RAG-powered answers · Voice input supported · Enter to send</p>
          </div>
        </div>

        {showSummary && (
          <div className="w-80 border-l border-white/5 bg-surface-900/50 flex-shrink-0 hidden md:block overflow-y-auto animate-slide-down">
            <SummaryPanel document={document} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
