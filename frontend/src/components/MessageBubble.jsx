import ReactMarkdown from 'react-markdown';
import { useState } from 'react';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold
        ${isUser ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
        {isUser ? 'U' : 'AI'}
      </div>

      <div className={`max-w-[80%] group relative rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-gray-800 text-gray-200 rounded-tl-sm'}`}>

        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg p-1.5"
            >
              {copied ? (
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
              )}
            </button>
          </>
        )}

        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-400 font-medium mb-2">Sources</p>
            <div className="space-y-1.5">
              {message.citations.map((c, i) => (
                <div key={i} className="text-xs text-gray-400 bg-gray-900/50 rounded-lg px-3 py-2">
                  <span className="text-indigo-400 font-medium">Chunk {c.chunkIndex + 1}: </span>
                  {c.excerpt}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
