import ReactMarkdown from 'react-markdown';

const SummaryPanel = ({ document }) => {
  if (!document) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Doc info */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{document.originalName}</p>
            <p className="text-xs text-gray-500">{document.totalChunks} chunks indexed</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">AI Summary</p>
        {document.summary ? (
          <div className="prose prose-invert prose-sm max-w-none text-gray-300">
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
