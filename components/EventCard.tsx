
import React, { useState, useEffect } from 'react';
import { LifeSnippet, STAT_LABELS, StatKey } from '../types';

interface Props {
  snippet: LifeSnippet;
}

const TypewriterText: React.FC<{ text: string }> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
};

const EventCard: React.FC<Props> = ({ snippet }) => {
  const date = new Date(snippet.timestamp).toLocaleString('zh-TW', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="cyber-card p-4 mb-4 relative overflow-hidden group border border-[#00f3ff]/20">
      <div className="absolute top-0 right-0 p-1 bg-[#00f3ff] text-black text-[10px] font-bold px-2 uppercase tracking-widest z-10">
        {snippet.type} log
      </div>
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-[#39ff14] font-cyber text-lg uppercase tracking-wider truncate mr-2">
          {snippet.eventName}
        </h3>
        <span className="text-[#666] text-xs font-mono">{date}</span>
      </div>

      <div className="text-gray-300 italic text-sm mb-3 border-l-2 border-[#39ff14] pl-2 min-h-[1.5rem]">
        "<TypewriterText text={snippet.comment} />"
      </div>

      <div className="grid grid-cols-5 gap-1">
        {(Object.keys(snippet.statChanges) as StatKey[]).map((key) => {
          const val = snippet.statChanges[key];
          if (val === 0) return null;
          return (
            <div key={key} className="flex flex-col items-center">
              <span className="text-[10px] text-gray-500 uppercase">{STAT_LABELS[key]}</span>
              <span className={`text-xs font-bold ${val > 0 ? 'text-[#39ff14]' : 'text-red-500'}`}>
                {val > 0 ? `+${val}` : val}
              </span>
            </div>
          );
        })}
      </div>
      
      {snippet.mediaUrl && snippet.type === 'image' && (
        <div className="mt-3 overflow-hidden rounded border border-[#222]">
          <img src={snippet.mediaUrl} alt="Snippet" className="w-full object-cover max-h-32 grayscale hover:grayscale-0 transition-all duration-300" />
        </div>
      )}
    </div>
  );
};

export default EventCard;
