import ReactMarkdown from 'react-markdown';
import TypewriterMarkdown from './TypewriterMarkdown';
import { useState } from 'react';

const MessageBubble = ({ message, index, isStreaming, onStreamComplete }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [rating, setRating] = useState(null); // 'up' | 'down' | null

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-slide-up`} style={{ animationDelay: `${(index || 0) * 30}ms`, animationFillMode: 'both' }}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-lg ${isUser ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-brand-500/20' : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-500/20'}`}>
        {isUser ? 'U' : 'AI'}
      </div>

      <div className={`max-w-[80%] group relative rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-tr-sm shadow-lg shadow-brand-500/10' : 'glass-card text-gray-200 rounded-tl-sm'}`}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <>
            {/* Typewriter for new messages, normal render for history */}
            {isStreaming ? (
              <TypewriterMarkdown content={message.content} speed={10} onComplete={onStreamComplete} />
            ) : (
              <div className="prose-custom">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            )}

            {/* Action bar */}
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={handleCopy} className="text-gray-500 hover:text-white p-1 rounded transition-colors" title="Copy">
                {copied ? <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg> : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>}
              </button>
              <button onClick={() => setRating(rating === 'up' ? null : 'up')} className={`p-1 rounded transition-colors ${rating === 'up' ? 'text-emerald-400' : 'text-gray-500 hover:text-emerald-400'}`} title="Good response">
                <svg className="w-3.5 h-3.5" fill={rating === 'up' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z M4 15h.01"/></svg>
              </button>
              <button onClick={() => setRating(rating === 'down' ? null : 'down')} className={`p-1 rounded transition-colors ${rating === 'down' ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}`} title="Poor response">
                <svg className="w-3.5 h-3.5" fill={rating === 'down' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z M20 9h.01"/></svg>
              </button>
            </div>
          </>
        )}

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <button onClick={() => setShowCitations(!showCitations)} className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors">
              <svg className={`w-3 h-3 transition-transform ${showCitations ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              {message.citations.length} source{message.citations.length > 1 ? 's' : ''} referenced
            </button>
            {showCitations && (
              <div className="space-y-1.5 mt-2 animate-slide-down">
                {message.citations.map((c, i) => (
                  <div key={i} className="text-xs text-gray-400 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                    <span className="text-brand-400 font-semibold">Chunk {c.chunkIndex + 1}: </span>{c.excerpt}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
