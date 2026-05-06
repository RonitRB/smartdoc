import ReactMarkdown from 'react-markdown';

const SummaryPanel = ({ document }) => {
  if (!document) return null;

  const wordCount = document.summary ? document.summary.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="h-full flex flex-col animate-slide-down">
      {/* Doc info */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ring-red-500/20">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{document.originalName}</p>
            <p className="text-xs text-gray-500">{document.totalChunks} chunks indexed</p>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex gap-3 mt-4">
          {[
            { label: 'Chunks', value: document.totalChunks || 0 },
            { label: 'Size', value: document.fileSize ? `${(document.fileSize / 1024).toFixed(0)} KB` : '—' },
            { label: 'Words', value: document.wordCount || '—' },
          ].map((m, i) => (
            <div key={i} className="flex-1 bg-white/5 rounded-lg p-2 text-center border border-white/5">
              <p className="text-sm font-bold text-white">{m.value}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          AI Summary
        </p>
        {document.summary ? (
          <div className="prose-custom text-sm">
            <ReactMarkdown>{document.summary}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No summary available.</p>
        )}
      </div>
    </div>
  );
};

export default SummaryPanel;
