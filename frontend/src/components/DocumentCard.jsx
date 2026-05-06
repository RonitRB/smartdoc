import { useNavigate } from 'react-router-dom';

const statusConfig = {
  ready:      { label: 'Ready',      badgeClass: 'badge-ready' },
  processing: { label: 'Processing', badgeClass: 'badge-processing' },
  failed:     { label: 'Failed',     badgeClass: 'badge-failed' },
};

const DocumentCard = ({ doc, onDelete }) => {
  const navigate = useNavigate();
  const status = statusConfig[doc.status] || statusConfig.processing;
  const sizeKB = doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : '';
  const date = new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="glass-card rounded-2xl p-5 card-hover flex flex-col group" id={`doc-card-${doc._id}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ring-red-500/20">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{doc.originalName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{sizeKB} · {doc.totalChunks || 0} chunks · {date}</p>
          </div>
        </div>
        <span className={`badge flex-shrink-0 ${status.badgeClass}`}>
          {doc.status === 'processing' && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse mr-1.5 inline-block" />}
          {status.label}
        </span>
      </div>

      {doc.summary && (
        <p className="text-xs text-gray-400 mb-4 line-clamp-2 leading-relaxed flex-1">{doc.summary}</p>
      )}

      {doc.status === 'ready' ? (
        <div className="flex gap-2 mt-auto">
          <button onClick={() => navigate(`/chat/${doc._id}`)} className="flex-1 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-brand-500/20" id={`chat-btn-${doc._id}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Chat
          </button>
          <button onClick={() => navigate(`/generate/${doc._id}`)} className="flex-1 bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-violet-500/20" id={`generate-btn-${doc._id}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Generate
          </button>
          <button onClick={() => onDelete(doc._id)} className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-red-500/15 hover:text-red-400 text-gray-500 rounded-xl transition-all border border-white/5 hover:border-red-500/20" title="Delete document">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      ) : (
        <div className="flex gap-2 mt-auto">
          <div className="flex-1 bg-white/5 text-gray-500 text-xs font-medium py-2.5 rounded-xl text-center border border-white/5">
            {doc.status === 'processing' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                Processing...
              </span>
            ) : 'Failed to process'}
          </div>
          <button onClick={() => onDelete(doc._id)} className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-red-500/15 hover:text-red-400 text-gray-500 rounded-xl transition-all border border-white/5 hover:border-red-500/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
