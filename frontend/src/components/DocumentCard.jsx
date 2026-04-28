import { useNavigate } from 'react-router-dom';

const statusConfig = {
  ready:      { label: 'Ready',      color: 'text-emerald-400 bg-emerald-400/10' },
  processing: { label: 'Processing', color: 'text-amber-400 bg-amber-400/10' },
  failed:     { label: 'Failed',     color: 'text-red-400 bg-red-400/10' },
};

const DocumentCard = ({ doc, onDelete }) => {
  const navigate = useNavigate();
  const status = statusConfig[doc.status] || statusConfig.processing;
  const sizeKB = doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : '';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{doc.originalName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{sizeKB} · {doc.totalChunks} chunks</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${status.color}`}>
          {status.label}
        </span>
      </div>

      {doc.summary && (
        <p className="text-xs text-gray-400 mt-3 line-clamp-2 leading-relaxed">{doc.summary}</p>
      )}

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => navigate(`/chat/${doc._id}`)}
          disabled={doc.status !== 'ready'}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium py-2 rounded-xl transition-colors"
        >
          Chat with document
        </button>
        <button
          onClick={() => onDelete(doc._id)}
          className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;
