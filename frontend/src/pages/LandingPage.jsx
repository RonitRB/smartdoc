import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'RAG-Powered Chat',
    desc: 'Ask any question about your PDF — answers are grounded in your document using Retrieval-Augmented Generation.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'AI Content Generator',
    desc: 'Generate blog posts, social media content, email drafts, quiz questions, and more from any document.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
    title: 'Multi-Language',
    desc: 'Translate and generate content in 11+ languages including Hindi, Kannada, Tamil, Spanish, French, and more.',
    gradient: 'from-cyan-500 to-teal-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Secure & Private',
    desc: 'JWT authentication ensures your documents and conversations are private and isolated per user.',
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    title: 'Smart Chunking',
    desc: 'Documents are intelligently split into semantic chunks with overlap for precise retrieval and context.',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    title: 'Drag & Drop Upload',
    desc: 'Simply drag your PDF into the browser or click to upload. Processing starts automatically in the background.',
    gradient: 'from-pink-500 to-rose-600',
  },
];

const STEPS = [
  { step: '01', title: 'Upload PDF', desc: 'Drag & drop or click to upload your PDF document (up to 10MB).' },
  { step: '02', title: 'AI Processing', desc: 'SmartDoc extracts text, chunks it intelligently, and generates a summary.' },
  { step: '03', title: 'Chat or Generate', desc: 'Ask questions about your document or generate content like blog posts, emails, and quizzes.' },
];

const TECH = [
  { name: 'React.js', color: 'text-cyan-400 bg-cyan-400/10' },
  { name: 'Node.js', color: 'text-green-400 bg-green-400/10' },
  { name: 'Express.js', color: 'text-gray-300 bg-gray-300/10' },
  { name: 'MongoDB', color: 'text-emerald-400 bg-emerald-400/10' },
  { name: 'Groq AI (LLaMA)', color: 'text-orange-400 bg-orange-400/10' },
  { name: 'Tailwind CSS', color: 'text-sky-400 bg-sky-400/10' },
  { name: 'Vite', color: 'text-violet-400 bg-violet-400/10' },
  { name: 'JWT Auth', color: 'text-yellow-400 bg-yellow-400/10' },
];

const TEAM = [
  { name: 'Ronit Bongale', role: 'Full-Stack Developer' },
  { name: 'Sachin Kumar', role: 'Developer' },
  { name: 'Subhash MP', role: 'Developer' },
];

const LandingPage = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="min-h-screen bg-surface-950 overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* Navbar */}
      <nav className="nav-glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">SmartDoc</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary !py-2 !px-5 !text-sm !rounded-lg">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-brand-300 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            SuprMentr Bootcamp & Internship 2026 — Project #73
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6 text-balance">
            Chat with your PDFs{' '}
            <span className="gradient-text">using AI</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload any PDF document and instantly start a conversation with it.
            Generate blog posts, summaries, quizzes, and more — powered by RAG architecture and LLaMA AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary !py-3.5 !px-8 !text-base !rounded-xl flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start for Free
            </Link>
            <Link to="/login" className="btn-secondary !py-3.5 !px-8 !text-base !rounded-xl">
              Sign In →
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">Everything you need to extract insights from your documents</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 card-hover group animate-slide-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg">Three simple steps to get started</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl font-black gradient-text mb-4">{s.step}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Tech Stack</h2>
          <p className="text-gray-400 text-lg">Built with modern, production-ready technologies</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {TECH.map((t, i) => (
            <span key={i} className={`${t.color} text-sm font-medium px-4 py-2 rounded-full border border-white/5`}>
              {t.name}
            </span>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="relative max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Our Team</h2>
          <p className="text-gray-400 text-lg">Built by passionate developers</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TEAM.map((m, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 text-center card-hover">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-500/20">
                {m.name.split(' ').map(n => n[0]).join('')}
              </div>
              <p className="text-white font-semibold text-sm">{m.name}</p>
              <p className="text-gray-500 text-xs mt-0.5">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-4xl mx-auto px-6 py-20">
        <div className="glass-card rounded-3xl p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
            Upload your first PDF and experience the power of AI-assisted document analysis.
          </p>
          <Link to="/register" className="btn-primary !py-3.5 !px-8 !text-base !rounded-xl inline-flex items-center gap-2">
            Create Free Account
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-brand-500 to-violet-600 rounded-md flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-gray-400 text-sm">SmartDoc — SuprMentr Internship 2026</span>
          </div>
          <p className="text-gray-600 text-xs">Built with ❤️ by Team #73</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
