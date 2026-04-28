import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const PDFUploader = ({ onUpload, uploading }) => {
  const [dragActive, setDragActive] = useState(false);

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
      className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
        ${isDragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/30'}
        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDragActive ? 'bg-indigo-500/20' : 'bg-gray-800'}`}>
          {uploading ? (
            <svg className="w-6 h-6 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-300">
            {uploading ? 'Uploading...' : isDragActive ? 'Drop your PDF here' : 'Drag & drop a PDF'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {uploading ? 'Please wait' : 'or click to browse — max 10MB'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PDFUploader;
