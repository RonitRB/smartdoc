import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import MessageBubble from '../components/MessageBubble';
import SummaryPanel from '../components/SummaryPanel';
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

    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await api.post(`/chat/${documentId}`, { question: q });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.answer,
        citations: res.data.citations || [],
      }]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to get answer';
      toast.error(msg);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

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

  const suggested = [
    'What is this document about?',
    'Summarize the key points',
    'What are the main conclusions?',
    'What topics are covered?',
  ];

  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <span className="text-sm">Loading document...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0">
        <div className="h-14 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-px h-5 bg-gray-800 flex-shrink-0"/>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-white text-sm font-medium truncate">{document?.originalName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowSummary(!showSummary)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${showSummary ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-gray-700 text-gray-400 hover:text-white'}`}
            >Summary</button>
            {messages.length > 0 && (
              <button onClick={handleClear} className="text-xs text-gray-500 hover:text-red-400 transition-colors px-2">Clear</button>
            )}
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 pb-10">
                <div className="text-center">
                  <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-white font-medium">Ask anything about this document</p>
                  <p className="text-gray-400 text-sm mt-1">Answers are grounded in the document content</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {suggested.map((q, i) => (
                    <button key={i} onClick={() => handleSuggestion(q)}
                      className="text-left text-sm text-gray-300 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl px-4 py-3 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-300">AI</div>
                    <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1 items-center h-5">
                        {[0,150,300].map(d => (
                          <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }}/>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          <div className="border-t border-gray-800 p-4 flex-shrink-0">
            <form onSubmit={handleAsk} className="flex gap-2">
              <input
                ref={inputRef}
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); }}}
                placeholder="Ask a question about the document..."
                disabled={loading}
                className="flex-1 bg-gray-900 border border-gray-700 focus:border-indigo-500 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
              />
              <button type="submit" disabled={loading || !question.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl transition-colors flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
            <p className="text-xs text-gray-600 text-center mt-2">Answers are grounded in your uploaded document</p>
          </div>
        </div>

        {showSummary && (
          <div className="w-72 border-l border-gray-800 bg-gray-900/30 flex-shrink-0 hidden md:block overflow-y-auto">
            <SummaryPanel document={document} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
