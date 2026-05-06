import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PDFUploader from '../components/PDFUploader';
import DocumentCard from '../components/DocumentCard';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(fetchDocuments, 4000);
    return () => clearInterval(interval);
  }, [fetchDocuments]);

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      toast.success('PDF uploaded! Processing started...');
      fetchDocuments();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(prev => prev.filter(d => d._id !== id));
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const filtered = documents.filter(d =>
    d.originalName.toLowerCase().includes(search.toLowerCase())
  );

  const readyCount = documents.filter(d => d.status === 'ready').length;

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-sm">SmartDoc</span>
            <span className="hidden sm:block text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full ml-1">AI Content Generator</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:block">Hey, {user?.name?.split(' ')[0]} 👋</span>
            <button onClick={logout} className="text-xs text-gray-400 hover:text-white transition-colors">Sign out</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Stats bar */}
        {documents.length > 0 && (
          <div className="flex gap-4 mb-8">
            {[
              { label: 'Total documents', value: documents.length },
              { label: 'Ready to use', value: readyCount },
              { label: 'Processing', value: documents.filter(d => d.status === 'processing').length },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">AI Content Generator</h1>
          <p className="text-gray-400 text-sm">Upload PDFs to generate content, chat with documents, and extract insights using AI</p>
        </div>

        <div className="mb-8">
          <PDFUploader onUpload={handleUpload} uploading={uploading} />
        </div>

        {/* Search bar */}
        {documents.length > 0 && (
          <div className="mb-6 relative">
            <svg className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full bg-gray-900 border border-gray-800 focus:border-gray-600 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors"
            />
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse h-44" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">
              {search ? `No documents matching "${search}"` : 'No documents yet — upload a PDF to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(doc => (
              <DocumentCard key={doc._id} doc={doc} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
