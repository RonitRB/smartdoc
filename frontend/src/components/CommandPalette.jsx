import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CommandPalette = ({ documents = [], onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const actions = [
    { id: 'dashboard', label: 'Go to Dashboard', icon: '🏠', action: () => navigate('/dashboard') },
    { id: 'upload', label: 'Upload New PDF', icon: '📤', action: () => { navigate('/dashboard'); onClose(); } },
    ...documents.filter(d => d.status === 'ready').map(d => ({
      id: `chat-${d._id}`, label: `Chat with ${d.originalName}`, icon: '💬', action: () => navigate(`/chat/${d._id}`),
    })),
    ...documents.filter(d => d.status === 'ready').map(d => ({
      id: `gen-${d._id}`, label: `Generate from ${d.originalName}`, icon: '⚡', action: () => navigate(`/generate/${d._id}`),
    })),
    { id: 'theme', label: 'Toggle Dark/Light Theme', icon: '🎨', action: () => { document.querySelector('[data-theme-toggle]')?.click(); onClose(); } },
  ];

  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    inputRef.current?.focus();
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && filtered[selectedIndex]) { filtered[selectedIndex].action(); onClose(); }
    else if (e.key === 'Escape') onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass-card rounded-2xl w-full max-w-lg mx-4 overflow-hidden animate-scale-in shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a command or search..." className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm outline-none" />
          <kbd className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-6">No results found</p>
          ) : filtered.map((a, i) => (
            <button key={a.id} onClick={() => { a.action(); onClose(); }} onMouseEnter={() => setSelectedIndex(i)} className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${i === selectedIndex ? 'bg-brand-500/10 text-white' : 'text-gray-400 hover:text-white'}`}>
              <span className="text-base">{a.icon}</span>
              <span className="flex-1 truncate">{a.label}</span>
              {i === selectedIndex && <span className="text-[10px] text-gray-500">↵</span>}
            </button>
          ))}
        </div>
        <div className="border-t border-white/5 px-4 py-2 flex items-center gap-4 text-[10px] text-gray-600">
          <span>↑↓ Navigate</span><span>↵ Select</span><span>ESC Close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
