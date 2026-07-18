import React from 'react';
import { TVFocusable } from './TVFocusEngine';

export default function EpisodeBrowser({ currentEpisode, onSelectEpisode }) {
  // Hardcoded Netflix style episodes list with beautiful thumbnails and titles
  const episodes = [
    { num: 1, title: 'Pilot / Episode 1', runtime: '48m', thumb: 'https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=300&q=80', overview: 'A glimpse into the complex lives and relationships of the campus students.' },
    { num: 2, title: 'Secrets Exposed', runtime: '44m', thumb: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80', overview: 'Tensions rise as hidden secrets threaten to destabilize the tight-knit circle.' },
    { num: 3, title: 'Under Pressure', runtime: '45m', thumb: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80', overview: 'Midterms approach, forcing the students to confront their academic and personal fears.' },
    { num: 4, title: 'The Breakout', runtime: '46m', thumb: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80', overview: 'An unexpected party leads to surprising revelations and shifting dynamics.' },
    { num: 5, title: 'Chasing Dreams', runtime: '47m', thumb: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80', overview: 'Individuals begin plotting their future career paths, leading to personal conflicts.' },
    { num: 6, title: 'Broken Trust', runtime: '42m', thumb: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=300&q=80', overview: 'A betrayal among close friends tests the boundaries of their loyalty.' },
    { num: 7, title: 'The Climax', runtime: '50m', thumb: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80', overview: 'Year-end celebrations build up to critical life-altering decisions.' },
    { num: 8, title: 'New Beginnings', runtime: '52m', thumb: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=300&q=80', overview: 'Resolutions are made as the group prepares to step into the next phase of life.' }
  ];

  return (
    <div className="space-y-3 select-none">
      <span className="text-xs uppercase text-neutral-500 font-mono tracking-widest">
        Episodes (Season 1)
      </span>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {episodes.map((ep, idx) => {
          const isCurrent = currentEpisode === ep.num;
          return (
            <TVFocusable
              key={ep.num}
              id={`ep-btn-${ep.num}`}
              group="quick-panel"
              order={10 + ep.num}
              onSelect={() => onSelectEpisode(ep.num.toString())}
              className={`flex-shrink-0 w-60 rounded-xl bg-white/5 border overflow-hidden transition-all duration-300 ${
                isCurrent ? 'border-[#ff4d85]/80 ring-2 ring-[#ff4d85]/30' : 'border-white/5'
              }`}
              activeClassName="border-[#ff4d85] bg-[#ff4d85]/10 scale-105 shadow-[0_10px_20px_rgba(255,77,133,0.2)]"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-neutral-900 overflow-hidden">
                <img 
                  src={ep.thumb} 
                  alt={ep.title} 
                  className="w-full h-full object-cover opacity-80" 
                />
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 text-white rounded text-[10px] font-mono">
                  {ep.runtime}
                </div>
                {isCurrent && (
                  <div className="absolute top-2 right-2 bg-[#ff4d85] text-white px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold">
                    Now Playing
                  </div>
                )}
              </div>

              {/* Info content */}
              <div className="p-3 space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold text-white">
                  <span>{ep.num}. {ep.title}</span>
                </div>
                <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed">
                  {ep.overview}
                </p>
              </div>
            </TVFocusable>
          );
        })}
      </div>
    </div>
  );
}
