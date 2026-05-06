import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const TypewriterMarkdown = ({ content, speed = 12, onComplete }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!content) return;
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(content.slice(0, i));
      if (i >= content.length) {
        clearInterval(timer);
        setDone(true);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [content, speed]);

  return (
    <div className="prose-custom">
      <ReactMarkdown>{displayed}</ReactMarkdown>
      {!done && <span className="inline-block w-0.5 h-4 bg-brand-400 animate-pulse ml-0.5 align-text-bottom" />}
    </div>
  );
};

export default TypewriterMarkdown;
