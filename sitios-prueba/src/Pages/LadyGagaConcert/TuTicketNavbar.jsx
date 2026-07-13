import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const TuTicketNavbar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const enabledParam = searchParams.get('enabled') === 'true' ? 'true' : 'false';
  const searchQuery = searchParams.get('search') || '';

  const handleGoHome = () => {
    navigate(`/tuticket?enabled=${enabledParam}`);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    navigate(`/tuticket?enabled=${enabledParam}&search=${encodeURIComponent(value)}`);
  };

  return (
    <nav className="bg-black border-b border-neutral-800 flex items-center justify-between h-16 px-6 select-none relative z-50">
      {/* Brand Logo - DF Entertainment style (Stick figures + TT) */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={handleGoHome}>
        <svg className="w-8 h-8 text-white" viewBox="0 0 40 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Stick Figure 1 */}
          <circle cx="10" cy="5" r="2" fill="currentColor" />
          <line x1="10" y1="7" x2="10" y2="13" />
          <line x1="10" y1="8.5" x2="6" y2="11" />
          <line x1="10" y1="8.5" x2="14" y2="11" />
          <line x1="10" y1="13" x2="7" y2="18" />
          <line x1="10" y1="13" x2="13" y2="18" />

          {/* Stick Figure 2 */}
          <circle cx="22" cy="5" r="2" fill="currentColor" />
          <line x1="22" y1="7" x2="22" y2="13" />
          <line x1="22" y1="8.5" x2="18" y2="11" />
          <line x1="22" y1="8.5" x2="26" y2="12" />
          <line x1="22" y1="13" x2="19" y2="18" />
          <line x1="22" y1="13" x2="25" y2="18" />
        </svg>
        <span className="text-lg font-black tracking-widest text-white">TT</span>
      </div>

      {/* Center Search bar & links - Sleek styling */}
      <div className="flex items-center space-x-6">
        <div className="relative hidden sm:block">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Buscar shows..."
            className="bg-neutral-900 text-white placeholder-neutral-600 text-xs px-4 py-1.5 rounded-full border border-neutral-800 focus:outline-none focus:border-neutral-500 w-36 transition-all"
          />
          <i className="fa-solid fa-magnifying-glass absolute right-3 top-2 text-neutral-600 text-xs"></i>
        </div>

        {/* Currency selector indicator */}
        <div className="flex items-center space-x-1.5 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800 text-[11px] font-semibold text-neutral-400">
          <span>ARS ($)</span>
          <span>🇦🇷</span>
        </div>

        {/* Rightmost menu button divided by thin line */}
        <div className="flex items-center h-16 border-l border-neutral-800 pl-6 cursor-pointer hover:bg-neutral-900 transition-all">
          <span className="text-xs font-semibold text-white tracking-widest uppercase">Menú</span>
        </div>
      </div>
    </nav>
  );
};
