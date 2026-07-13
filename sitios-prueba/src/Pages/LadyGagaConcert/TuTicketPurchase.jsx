import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TuTicketNavbar } from './TuTicketNavbar';
import { TimerHeader } from './TimerHeader';
import { StadiumMap } from './StadiumMap';

export const TuTicketPurchase = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const enabledParam = searchParams.get('enabled') === 'true' ? 'true' : 'false';
  const isDark = enabledParam === 'true';

  // Scarcity state
  const [sivoriSpots, setSivoriSpots] = useState(3);
  const [hasSeenSivori, setHasSeenSivori] = useState(false);
  const [prefBajaStatus, setPrefBajaStatus] = useState('available'); // will become 'soldout'
  const [prefBajaSpots, setPrefBajaSpots] = useState(1);

  // Selection state
  const [selectedId, setSelectedId] = useState(isDark ? 'platea_preferencial_baja' : 'platea_san_martin_alta');
  const [hoveredId, setHoveredId] = useState(null);
  const [showTshirtModal, setShowTshirtModal] = useState(false);
  const [selectedTicketInfo, setSelectedTicketInfo] = useState(null);

  // Ticking Sivori Alta spots (Dynamic Scarcity)
  useEffect(() => {
    if (!isDark) return;

    if ((hoveredId === 'sivori_alta' || selectedId === 'sivori_alta') && !hasSeenSivori) {
      setHasSeenSivori(true);

      setTimeout(() => {
        setSivoriSpots(2);
      }, 1500);

      setTimeout(() => {
        setSivoriSpots(1);
      }, 3500);
    }
  }, [isDark, hoveredId, selectedId, hasSeenSivori]);

  // Ticking Platea Preferencial Baja status (sell out in real-time)
  useEffect(() => {
    if (!isDark) return;

    const timer = setTimeout(() => {
      setPrefBajaSpots(0);
      setPrefBajaStatus('soldout');
      // If user had it selected and it sold out, reset selection
      if (selectedId === 'platea_preferencial_baja') {
        setSelectedId(null);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [selectedId, isDark]);

  const sections = [
    { id: 'campo_delantero', name: 'Campo Delantero', price: 150000, status: 'soldout', color: 'bg-emerald-500' },
    {
      id: 'sivori_alta',
      name: 'Sivori Alta',
      price: 60000,
      status: 'available',
      spots: sivoriSpots,
      color: 'bg-rose-600',
    },
    { id: 'campo_trasero', name: 'Campo Trasero', price: 70000, status: 'soldout', color: 'bg-green-600' },
    {
      id: 'platea_preferencial_baja',
      name: 'Platea Preferencial Baja',
      price: 100000,
      status: prefBajaStatus,
      spots: prefBajaSpots,
      color: 'bg-sky-400',
    },
    { id: 'platea_preferencial_media', name: 'Platea Preferencial Media', price: 95000, status: 'available', color: 'bg-sky-400' },
    { id: 'platea_preferencial_alta', name: 'Platea Preferencial Alta', price: 90000, status: 'available', color: 'bg-sky-400' },
    { id: 'platea_pref_vision_lateral', name: 'Platea Pref. Visión lateral', price: 97000, status: 'available', color: 'bg-blue-600' },
    { id: 'sivori_media', name: 'Sivori Media', price: 80000, status: 'available', color: 'bg-pink-400' },
    {
      id: 'centenario_media_vision_restringida',
      name: 'Centenario Media Visión Restringida',
      price: 30000,
      status: 'soldout',
      color: 'bg-purple-400',
    },
    {
      id: 'centenario_alta_vision_restringida',
      name: 'Centenario Alta Visión Restringida',
      price: 30000,
      status: 'soldout',
      color: 'bg-purple-600',
    },
    { id: 'platea_belgrano_alta', name: 'Platea Belgrano Alta', price: 50000, status: 'soldout', color: 'bg-amber-400' },
    { id: 'platea_san_martin_alta', name: 'Platea San Martin Alta', price: 50000, status: 'available', color: 'bg-amber-400' },
  ];

  const sortedSections = isDark
    ? [...sections].sort((a, b) => {
        if (a.id === 'sivori_alta') return -1;
        if (b.id === 'sivori_alta') return 1;
        return b.price - a.price;
      })
    : [...sections].sort((a, b) => a.price - b.price);

  const handleSelectSection = (id) => {
    setSelectedId(id);
    const element = document.getElementById(`card-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleConfirmTicket = (section) => {
    setSelectedTicketInfo(section);
    if (isDark) {
      setShowTshirtModal(true);
    } else {
      const ticketData = {
        id: section.id,
        name: section.name,
        price: section.price,
      };
      const sessionData = {
        ticket: ticketData,
        remera: 0,
      };
      localStorage.setItem('tuticket_session', JSON.stringify(sessionData));
      navigate(`/tuticket/parking?enabled=${enabledParam}`);
    }
  };

  const handleTshirtChoice = (buyTshirt) => {
    const ticketData = {
      id: selectedTicketInfo.id,
      name: selectedTicketInfo.name,
      price: selectedTicketInfo.price,
    };
    const tshirtPrice = buyTshirt ? 9000 : 0;
    
    // Save to localStorage
    const sessionData = {
      ticket: ticketData,
      remera: tshirtPrice,
    };
    localStorage.setItem('tuticket_session', JSON.stringify(sessionData));
    
    setShowTshirtModal(false);
    navigate(`/tuticket/parking?enabled=${enabledParam}`);
  };

  return (
    <div className="bg-black min-h-screen text-neutral-100 font-sans pb-16 relative">
      <TuTicketNavbar />
      <TimerHeader />

      <main className="max-w-7xl mx-auto px-6 mt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">Seleccioná tu Ubicación</h1>
          <p className="text-neutral-400 mt-2 text-sm">
            Elegí el sector que desees comprar en el listado o directamente en el mapa interactivo.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Tickets List */}
          <div className="w-full lg:w-3/5 space-y-10 max-h-[80vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
            {sortedSections.map((sec) => {
              const isSelected = selectedId === sec.id;
              const isHovered = hoveredId === sec.id;
              const isSoldOut = sec.status === 'soldout';

              return (
                <div
                  key={sec.id}
                  id={`card-${sec.id}`}
                  onMouseEnter={() => !isSoldOut && setHoveredId(sec.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`bg-neutral-950 rounded-3xl border p-8 flex flex-col sm:flex-row sm:items-center justify-between transition-all duration-300 min-h-[220px] select-none ${
                    isSoldOut
                      ? 'border-neutral-900 opacity-40 cursor-not-allowed'
                      : isSelected
                      ? 'border-pink-500 ring-2 ring-pink-500/30 bg-neutral-950 shadow-xl shadow-pink-500/5'
                      : isHovered
                      ? 'border-neutral-800 bg-neutral-900/80 shadow-lg'
                      : 'border-neutral-900'
                  }`}
                  onClick={() => !isSoldOut && setSelectedId(sec.id)}
                >
                  <div className="flex items-start space-x-6">
                    {/* Sector Color tag */}
                    <div className={`w-4 h-28 rounded-full shrink-0 ${isSoldOut ? 'bg-neutral-800' : sec.color.replace('bg-', 'bg-')}`} />
                    
                    <div className="space-y-2">
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-black">Estadio River Plate</span>
                      <h3 className="text-2xl font-black text-white leading-tight">{sec.name}</h3>
                      
                      {/* Mock access features to increase card height */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="inline-flex items-center text-[9px] font-semibold text-neutral-400 bg-black/40 px-2 py-0.5 rounded border border-neutral-900">
                          <i className="fa-solid fa-check text-emerald-500 mr-1"></i> Ubicación numerada
                        </span>
                        <span className="inline-flex items-center text-[9px] font-semibold text-neutral-400 bg-black/40 px-2 py-0.5 rounded border border-neutral-900">
                          <i className="fa-solid fa-check text-emerald-500 mr-1"></i> Acceso por rampa norte
                        </span>
                      </div>

                      {/* Real time scarcity warning */}
                      {isDark && sec.id === 'sivori_alta' && (
                        <div className="inline-flex items-center space-x-2 text-xs text-amber-500 font-extrabold bg-amber-950/40 border border-amber-500/20 px-3.5 py-1.5 rounded-xl mt-3 animate-pulse shadow-lg shadow-amber-500/5">
                          <i className="fa-solid fa-triangle-exclamation animate-bounce"></i>
                          <span>QUEDAN SOLO {sivoriSpots} LUGARES EN ESTA UBICACIÓN</span>
                        </div>
                      )}

                      {isDark && sec.id === 'platea_preferencial_baja' && sec.status === 'available' && (
                        <div className="inline-flex items-center space-x-2 text-xs text-pink-500 font-extrabold bg-pink-950/40 border border-pink-500/20 px-3.5 py-1.5 rounded-xl mt-3 animate-pulse shadow-lg shadow-pink-500/5">
                          <i className="fa-solid fa-fire animate-bounce"></i>
                          <span>¡QUEDA SOLO 1 LUGAR DISPONIBLE!</span>
                        </div>
                      )}

                      {isDark && sec.id === 'platea_pref_vision_lateral' && (
                        <div className="inline-flex items-center space-x-2 text-xs text-amber-500 font-extrabold bg-amber-950/40 border border-amber-500/20 px-3.5 py-1.5 rounded-xl mt-3 animate-pulse shadow-lg shadow-amber-500/5">
                          <i className="fa-solid fa-triangle-exclamation animate-bounce"></i>
                          <span>QUEDAN SOLO 2 LUGARES EN ESTA UBICACIÓN</span>
                        </div>
                      )}

                      {isDark && sec.id === 'platea_preferencial_media' && (
                        <div className="inline-flex items-center space-x-2 text-xs text-amber-500 font-extrabold bg-amber-950/40 border border-amber-500/20 px-3.5 py-1.5 rounded-xl mt-3 animate-pulse shadow-lg shadow-amber-500/5">
                          <i className="fa-solid fa-triangle-exclamation animate-bounce"></i>
                          <span>QUEDAN SOLO 3 LUGARES EN ESTA UBICACIÓN</span>
                        </div>
                      )}

                      {isSoldOut && (
                        <div className="inline-flex items-center space-x-1.5 text-xs text-neutral-500 font-bold bg-black/50 border border-neutral-900 px-3 py-1 rounded-xl mt-3">
                          <span>AGOTADO</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-0 flex flex-col items-end shrink-0 pl-10 sm:pl-0 space-y-2">
                    <div className="text-right">
                      <span className="text-3xl font-black text-white font-mono tracking-tight">
                        ${sec.price.toLocaleString('es-AR')}
                      </span>
                      <span className="block text-[9px] text-neutral-500 mt-0.5">+ Costo de Servicio</span>
                    </div>
                    
                    {!isSoldOut && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmTicket(sec);
                        }}
                        className={`px-8 py-3 rounded-full text-xs font-bold transition-all shadow-md ${
                          isSelected
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-105 shadow-pink-500/25 ring-2 ring-white/10'
                            : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                        }`}
                      >
                        Comprar Entrada
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Stadium Map */}
          <div className="w-full lg:w-2/5 lg:block flex justify-center">
            <StadiumMap
              sections={sections}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onSelectSection={handleSelectSection}
              onHoverSection={setHoveredId}
            />
          </div>
        </div>
      </main>

      {/* Pop-up Modal: T-shirt Promotion */}
      {showTshirtModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in select-none">
            {/* Promo Header */}
            <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700 p-8 text-center relative">
              <div className="absolute top-4 right-4 bg-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full animate-bounce shadow-md">
                70% OFF
              </div>
              <div className="text-5xl mb-2">👕</div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">¡OFERTA EXCLUSIVA DE COMPRA!</h2>
              <p className="text-pink-100 text-xs mt-1 max-w-sm mx-auto">
                Llevate la Remera Oficial de Lady Gaga "Chromatica Ball Tour"
              </p>
            </div>

            <div className="p-8">
              {/* Pricing section */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <span className="text-neutral-500 line-through text-lg font-semibold font-mono">$30.000</span>
                <span className="text-3xl font-black text-pink-400 font-mono animate-pulse">$9.000</span>
                <span className="text-[10px] text-pink-500 font-bold border border-pink-500/30 px-2 py-0.5 rounded uppercase">Solo por hoy</span>
              </div>

              {/* Social Proof Comments */}
              <div className="bg-black/40 border border-neutral-900 rounded-2xl p-4 space-y-4 mb-8">
                <p className="text-xs text-neutral-500 border-b border-neutral-900 pb-2 font-medium">Opiniones de compradores anteriores:</p>
                
                <div className="flex items-start space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-indigo-900/50 flex items-center justify-center text-xs font-bold text-indigo-400">SR</div>
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-bold text-white">Sofía R.</span>
                      <span className="text-[9px] text-emerald-400 font-semibold flex items-center">⭐ Compra Verificada</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      "Yo la pedí en preventa y es de re buena calidad. El algodón es súper grueso y el estampado de Gaga brilla re lindo!"
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-pink-900/50 flex items-center justify-center text-xs font-bold text-pink-400">LG</div>
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-bold text-white">Lucas G.</span>
                      <span className="text-[9px] text-emerald-400 font-semibold flex items-center">⭐ Compra Verificada</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      "Todos los que conozco la van a llevar al recital, el que no la tenga se va a querer matar jaja. ¡Comprala sin dudar!"
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => handleTshirtChoice(true)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all text-sm"
                >
                  SÍ, COMPRAR Y AGREGAR AL PEDIDO
                </button>
                <button
                  onClick={() => handleTshirtChoice(false)}
                  className="w-full bg-transparent hover:bg-neutral-900/50 text-neutral-400 hover:text-neutral-300 font-medium py-2 px-6 rounded-xl text-xs transition-colors"
                >
                  No gracias, no me gusta tanto Lady Gaga
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
