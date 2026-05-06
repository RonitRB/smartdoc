import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const PDFUploader = ({ onUpload, uploading }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) onUpload(acceptedFiles[0]);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
        ${isDragActive ? 'border-brand-500 bg-brand-500/5 shadow-lg shadow-brand-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}
        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      id="pdf-upload-zone"
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragActive ? 'bg-brand-500/20 scale-110' : 'bg-white/5'}`}>
          {uploading ? (
            <svg className="w-7 h-7 text-brand-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : (
            <svg className={`w-7 h-7 transition-colors ${isDragActive ? 'text-brand-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-300">
            {uploading ? 'Uploading & processing...' : isDragActive ? 'Drop your PDF here' : 'Drag & drop a PDF file'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {uploading ? 'This may take a few seconds' : 'or click to browse · max 10MB · PDF only'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PDFUploader;
