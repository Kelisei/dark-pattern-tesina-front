import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TuTicketNavbar } from './TuTicketNavbar';
import { updateDarkPatternState } from '../../utils/dark_patterns';
import ladyGagaHero from '../../assets/lady_gaga_hero.png';
import ladyGagaWide from '../../assets/lady_gaga_wide.jpg';

export const TuTicketHome = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const enabledParam = searchParams.get('enabled') === 'true' ? 'true' : 'false';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    updateDarkPatternState();
  }, [searchParams]);

  const handleSelectLadyGaga = () => {
    navigate(`/tuticket/queue?enabled=${enabledParam}`);
  };

  const handleGoHome = () => {
    navigate(`/tuticket?enabled=${enabledParam}`);
  };

  const concerts = [
    {
      id: 'ladygaga',
      artist: 'LADY GAGA',
      tour: 'THE CHROMATICA BALL',
      date: 'Viernes 15 y Sábado 16 de Noviembre',
      venue: 'Estadio River Plate',
      status: 'available',
      tag: '¡Últimos tickets!',
      color: 'from-pink-600 via-purple-600 to-indigo-700',
      textColor: 'text-pink-400',
    },
    {
      id: 'coldplay',
      artist: 'COLDPLAY',
      tour: 'MUSIC OF THE SPHERES',
      date: '25, 26, 28 y 29 de Octubre',
      venue: 'Estadio River Plate',
      status: 'soldout',
      tag: 'Agotado',
      color: 'from-slate-800 to-slate-900 opacity-60',
      textColor: 'text-slate-500',
    },
    {
      id: 'taylorswift',
      artist: 'TAYLOR SWIFT',
      tour: 'THE ERAS TOUR',
      date: '9, 10 y 11 de Noviembre',
      venue: 'Estadio River Plate',
      status: 'soldout',
      tag: 'Agotado',
      color: 'from-slate-800 to-slate-900 opacity-60',
      textColor: 'text-slate-500',
    },
    {
      id: 'theweeknd',
      artist: 'THE WEEKND',
      tour: 'AFTER HOURS TIL DAWN',
      date: 'Viernes 18 de Octubre',
      venue: 'Estadio River Plate',
      status: 'soldout',
      tag: 'Agotado',
      color: 'from-slate-800 to-slate-900 opacity-60',
      textColor: 'text-slate-500',
    },
  ];

  const filteredConcerts = searchQuery.trim() !== ''
    ? concerts.filter(c => c.id === 'ladygaga')
    : concerts;

  return (
    <div className="bg-black min-h-screen text-white font-sans">
      <TuTicketNavbar />

      {/* Centered Pills Category Toggle */}
      <div className="flex justify-center my-10">
        <div className="inline-flex p-1 bg-black border border-neutral-800 rounded-full select-none">
          <button className="px-10 py-2.5 text-[11px] font-black uppercase tracking-widest bg-white text-black rounded-full transition-all">
            Shows
          </button>
          <button className="px-10 py-2.5 text-[11px] font-black uppercase tracking-widest text-neutral-500 hover:text-neutral-300 rounded-full transition-all cursor-not-allowed" disabled>
            Artistas
          </button>
        </div>
      </div>

      {/* Massive Hero Banner Section (DF style Lollapalooza banner but for Gaga) */}
      <header className="max-w-7xl mx-auto px-6 mb-16">
        <div 
          onClick={handleSelectLadyGaga}
          className="relative rounded-[32px] overflow-hidden bg-black min-h-[420px] flex flex-col justify-between p-8 md:p-12 shadow-2xl cursor-pointer hover:shadow-rose-500/10 hover:scale-[1.005] transition-all group border border-white/5"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-[center_top] opacity-60 group-hover:scale-105 group-hover:opacity-70 transition-all duration-700 ease-out"
            style={{ backgroundImage: `url(${ladyGagaWide})` }}
          />
          {/* Dark Overlay gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/55 pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 w-full">
            <div>
              <span className="text-[10px] md:text-xs font-black tracking-[0.3em] text-white/70 uppercase">ENTRADAS EN WWW.TUTICKET.COM.AR</span>
              <p className="text-xl md:text-2xl font-black text-white/95 mt-1 tracking-wider uppercase">VIERNES 15 Y SÁBADO 16 DE NOVIEMBRE</p>
            </div>
            <span className="mt-4 md:mt-0 text-[10px] md:text-xs font-black tracking-[0.2em] text-neutral-950 bg-white px-4 py-2 rounded-full uppercase shadow-md">
              Estadio River Plate
            </span>
          </div>

          <div className="text-center py-8 relative z-10">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              LADY GAGA
            </h1>
            <p className="text-lg md:text-2xl font-light tracking-[0.3em] text-rose-300 mt-2 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              The Chromatica Ball Tour
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 border-t border-white/10 pt-6 w-full">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white/80 uppercase">Presenta</span>
              <span className="text-sm font-black tracking-widest text-rose-400">TUTICKET LIVE</span>
            </div>
            <button className="mt-4 sm:mt-0 bg-white text-black font-black text-xs uppercase tracking-widest px-8 py-3 rounded-full hover:scale-105 active:scale-95 transition-transform flex items-center space-x-2 shadow-lg">
              <span>Comprar Entradas</span>
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Shows Grid Section - Styled as vertical posters */}
      <main className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-neutral-800 pb-4 mb-10">
          <h2 className="text-2xl font-black tracking-tight uppercase">
            Cartelera de Recitales
          </h2>
          <p className="text-neutral-500 text-xs mt-1 sm:mt-0">Todos los shows oficiales producidos por TT.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {filteredConcerts.map((show) => {
            const isAvailable = show.status === 'available';

            if (show.id === 'ladygaga') {
              return (
                <div
                  key={show.id}
                  onClick={handleSelectLadyGaga}
                  className="relative aspect-[3/4] p-6 flex flex-col justify-between rounded-[28px] overflow-hidden group shadow-lg cursor-pointer hover:scale-[1.02] hover:-translate-y-1 hover:shadow-purple-500/10 transition-all border border-white/5 bg-neutral-900"
                >
                  {/* Card Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-65 group-hover:scale-105 transition-transform duration-500"
                    style={{ backgroundImage: `url(${ladyGagaHero})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50" />

                  <div className="text-center mt-4 relative z-10">
                    <p className="text-[9px] tracking-[0.2em] uppercase text-white/70">Estadio River Plate</p>
                    <h3 className="text-3xl font-extrabold tracking-tighter text-white mt-1 uppercase leading-none">LADY GAGA</h3>
                    <p className="text-xs tracking-widest text-rose-300 uppercase mt-1">Chromatica Ball</p>
                  </div>
                  <div className="bg-black/30 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-[8px] text-white/50 uppercase tracking-widest">Fecha</p>
                      <p className="text-xs font-bold text-white">15 & 16 Nov</p>
                    </div>
                    <span className="bg-white text-black text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full group-hover:scale-105 transition-transform">
                      Comprar
                    </span>
                  </div>
                </div>
              );
            }

            // Sold out shows (emulating the grayed out overlay/filters)
            return (
              <div
                key={show.id}
                className="relative aspect-[3/4] bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-between rounded-[28px] overflow-hidden opacity-40 cursor-not-allowed select-none"
              >
                <div className="text-center mt-4">
                  <p className="text-[9px] tracking-[0.2em] uppercase text-neutral-500">{show.venue}</p>
                  <h3 className="text-3xl font-extrabold tracking-tighter text-neutral-400 mt-1 uppercase leading-none">{show.artist}</h3>
                  <p className="text-xs tracking-widest text-neutral-500 uppercase mt-1">{show.tour.split(' ')[0]}</p>
                </div>
                <div className="border border-neutral-800 p-4 rounded-2xl flex items-center justify-between bg-neutral-950/50">
                  <div>
                    <p className="text-[8px] text-neutral-600 uppercase tracking-widest">Fecha</p>
                    <p className="text-xs font-bold text-neutral-500">{show.date.split(' de ')[0]}</p>
                  </div>
                  <span className="bg-neutral-850 text-neutral-600 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                    Agotado
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Premium Footer - DF Entertainment style */}
      <footer className="bg-black border-t border-neutral-800 mt-32 pt-20 pb-8 text-neutral-400 text-sm select-none">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 pb-16 border-b border-neutral-800">
          {/* Left Column: Newsletter */}
          <div className="space-y-4">
            <h4 className="text-white font-black text-lg tracking-tight">Enterate antes que nadie.</h4>
            <p className="text-neutral-500 text-xs">Suscribite a nuestro newsletter para recibir novedades y preventas.</p>
            <div className="flex items-center border-b border-neutral-850 py-2 max-w-xs">
              <input
                type="email"
                placeholder="Dejanos tu email"
                className="bg-transparent text-white placeholder-neutral-700 text-xs focus:outline-none w-full"
                disabled
              />
              <button className="text-white hover:text-rose-500 px-2 text-sm" disabled>
                &#x2197;
              </button>
            </div>
          </div>

          {/* Center Column: Site exploration Links */}
          <div className="space-y-4">
            <h4 className="text-white font-black text-xs uppercase tracking-widest">Sigue explorando</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <span className="hover:text-white cursor-pointer transition-colors" onClick={handleGoHome}>Shows</span>
              <span className="text-neutral-700 cursor-not-allowed">Nosotros</span>
              <span className="text-neutral-700 cursor-not-allowed">Sponsors</span>
              <span className="text-neutral-700 cursor-not-allowed">Lollapalooza</span>
              <span className="text-neutral-700 cursor-not-allowed">Venues</span>
              <span className="text-neutral-700 cursor-not-allowed">Prensa</span>
              <span className="text-neutral-700 cursor-not-allowed">Contacto</span>
            </div>
          </div>

          {/* Right Column: Logo details */}
          <div className="flex flex-col items-start md:items-end justify-between space-y-4">
            <div className="flex items-center space-x-3 text-white">
              <svg className="w-12 h-12 text-white" viewBox="0 0 40 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-widest leading-none">TT</span>
                <span className="text-[8px] font-bold tracking-widest text-neutral-600 uppercase">Entertainment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social media grid bar */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 text-center border-b border-neutral-800 py-6 text-xs font-semibold text-neutral-500 uppercase tracking-widest">
          <span className="py-2 border-r border-neutral-900 hover:text-white cursor-pointer">Instagram</span>
          <span className="py-2 border-r border-neutral-900 hover:text-white cursor-pointer">Twitter</span>
          <span className="py-2 border-r border-neutral-900 hover:text-white cursor-pointer">Linkedin</span>
          <span className="py-2 border-r border-neutral-900/0 md:border-r border-neutral-900 hover:text-white cursor-pointer">Facebook</span>
          <span className="py-2 border-r border-neutral-900 hover:text-white cursor-pointer">Tiktok</span>
          <span className="py-2 hover:text-white cursor-pointer">Youtube</span>
        </div>

        {/* Legal copyrights */}
        <div className="max-w-7xl mx-auto px-6 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-neutral-600 uppercase tracking-wider space-y-2 sm:space-y-0">
          <span>TT Entertainment</span>
          <span>Todos los derechos reservados</span>
        </div>
      </footer>
    </div>
  );
};
