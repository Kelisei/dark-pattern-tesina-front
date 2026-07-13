import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TuTicketNavbar } from './TuTicketNavbar';
import { TimerHeader } from './TimerHeader';

export const TuTicketParking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const enabledParam = searchParams.get('enabled') === 'true' ? 'true' : 'false';
  const isDark = enabledParam === 'true';

  const [selectedParkingId, setSelectedParkingId] = useState(null);
  const [showShamingModal, setShowShamingModal] = useState(false);

  // Fake urgency timer for the first parking option
  const [discountTimeLeft, setDiscountTimeLeft] = useState(45);
  const [isDiscountExpired, setIsDiscountExpired] = useState(false);

  useEffect(() => {
    if (!isDark) return;

    // If timer is already running
    const timer = setInterval(() => {
      setDiscountTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsDiscountExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isDark]);

  const discountFormattedTime = `00:${discountTimeLeft.toString().padStart(2, '0')}`;

  const parkingOptions = [
    {
      id: 'parking_a',
      name: 'Estacionamiento VIP - Hipódromo de Palermo',
      originalPrice: 35000,
      discountPrice: 25000,
      hasDiscount: isDark,
      review: isDark ? 'Acceso directo y exclusivo. ¡El descuento expira pronto!' : 'Acceso directo y exclusivo.',
      hasTimer: isDark,
      price: 25000,
    },
    {
      id: 'parking_b',
      name: 'Estacionamiento Premium - Club Belgrano',
      price: 30000,
      review: isDark ? '“Excelente servicio, cuidan súper bien el auto y la entrada es techada.”' : 'Estacionamiento techado.',
    },
    {
      id: 'parking_c',
      name: 'Estacionamiento Libertad - Paseo Alcorta',
      price: 28000,
      review: isDark ? '“Atención muy buena y rápida para salir después del recital.”' : 'Estacionamiento subterráneo.',
    },
    {
      id: 'parking_d',
      name: 'Estacionamiento Privado - Av. del Libertador 5800',
      price: 26500,
      review: isDark ? '“Súper seguro, personal amable y de fácil acceso.”' : 'Estacionamiento privado.',
    },
    {
      id: 'parking_e',
      name: 'Estacionamiento Monroe - Garage Subterráneo',
      price: 22000,
      review: isDark ? '“Buena iluminación y vigilancia las 24 horas.”' : 'Garage vigilado las 24hs.',
    },
    {
      id: 'parking_f',
      name: 'Garage Congreso - Estacionamiento Abierto',
      price: 19000,
      review: isDark ? '“Espacio bastante amplio y cámaras de seguridad funcionando.”' : 'Estacionamiento abierto.',
    },
    {
      id: 'parking_g',
      name: 'Estacionamiento Municipal - Bajo Viaducto (Alcorta)',
      price: 15000,
      review: isDark ? 'Estacionamiento municipal básico y al aire libre. Sin comentarios destacados.' : 'Estacionamiento municipal al aire libre.',
    },
  ];

  const handleConfirmParking = () => {
    if (!selectedParkingId) return;

    const chosenOption = parkingOptions.find((p) => p.id === selectedParkingId);
    let finalPrice = chosenOption.price;

    if (chosenOption.hasDiscount) {
      finalPrice = isDiscountExpired ? chosenOption.originalPrice : chosenOption.discountPrice;
    }

    const currentSession = JSON.parse(localStorage.getItem('tuticket_session')) || {};
    currentSession.parking = {
      id: chosenOption.id,
      name: chosenOption.name,
      price: finalPrice,
    };

    localStorage.setItem('tuticket_session', JSON.stringify(currentSession));
    navigate(`/tuticket/payment?enabled=${enabledParam}`);
  };

  const handleConfirmNoParking = () => {
    const currentSession = JSON.parse(localStorage.getItem('tuticket_session')) || {};
    currentSession.parking = {
      id: 'none',
      name: 'Sin Estacionamiento',
      price: 0,
    };

    localStorage.setItem('tuticket_session', JSON.stringify(currentSession));
    navigate(`/tuticket/payment?enabled=${enabledParam}`);
  };

  const handleNoParkingClick = () => {
    if (isDark) {
      setShowShamingModal(true);
    } else {
      handleConfirmNoParking();
    }
  };

  return (
    <div className="bg-black min-h-screen text-neutral-100 font-sans pb-16">
      <TuTicketNavbar />
      <TimerHeader />

      <main className="max-w-4xl mx-auto px-6 mt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">Reservar Estacionamiento</h1>
          <p className="text-neutral-400 mt-2 text-sm max-w-xl mx-auto">
            Asegurá el lugar para tu vehículo durante el evento.
          </p>
          
          {/* Neutrality disclaimer */}
          <div className="mt-4 bg-neutral-950 border border-neutral-900 px-4 py-3 rounded-2xl inline-flex items-center space-x-2 text-xs text-neutral-400">
            <i className="fa-solid fa-circle-info text-rose-500"></i>
            <span>
              Nota: Todos los estacionamientos se encuentran a una distancia de <strong className="text-white">10-15 minutos a pie</strong> de los accesos principales del estadio.
            </span>
          </div>
        </div>

        {/* Parking list */}
        <div className="space-y-6 mb-8 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
          {parkingOptions.map((opt) => {
            const isSelected = selectedParkingId === opt.id;
            
            // Calculate dynamic price for parking A
            let displayPrice = opt.price;
            if (opt.hasDiscount) {
              displayPrice = isDiscountExpired ? opt.originalPrice : opt.discountPrice;
            }

            return (
              <div
                key={opt.id}
                onClick={() => setSelectedParkingId(opt.id)}
                className={`bg-neutral-950 rounded-2xl border p-6 flex flex-col md:flex-row md:items-center justify-between transition-all duration-300 min-h-[120px] select-none cursor-pointer ${
                  isSelected
                    ? 'border-pink-500 ring-1 ring-pink-500/50 bg-neutral-950 shadow-md shadow-pink-500/5'
                    : 'border-neutral-900 hover:border-neutral-800 hover:bg-neutral-900/80'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-white">{opt.name}</h3>
                    {opt.hasDiscount && !isDiscountExpired && (
                      <span className="bg-red-950/60 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                        ¡Oferta Express!
                      </span>
                    )}
                  </div>
                  
                  {/* Reviews / Comments */}
                  <p className="text-xs text-neutral-400 mt-2 italic font-medium">
                    {opt.review}
                  </p>

                  {/* Urgency countdown bar */}
                  {opt.hasTimer && (
                    <div className="mt-3 flex items-center space-x-2 text-xs">
                      {isDiscountExpired ? (
                        <span className="text-red-500 font-bold flex items-center space-x-1">
                          <i className="fa-solid fa-clock-rotate-left"></i>
                          <span>Descuento expirado. Se aplica tarifa regular.</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold flex items-center space-x-1.5 animate-pulse bg-amber-950/20 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          <i className="fa-solid fa-hourglass-start animate-spin"></i>
                          <span>El descuento del 30% expira en: {discountFormattedTime}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 md:mt-0 flex flex-col items-end shrink-0 pl-0 md:pl-6">
                  {opt.hasDiscount && !isDiscountExpired ? (
                    <div className="flex flex-col items-end">
                      <span className="text-neutral-500 line-through text-xs font-mono">
                        ${opt.originalPrice.toLocaleString('es-AR')}
                      </span>
                      <span className="text-2xl font-black text-pink-400 font-mono">
                        ${opt.discountPrice.toLocaleString('es-AR')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-black text-white font-mono">
                      ${displayPrice.toLocaleString('es-AR')}
                    </span>
                  )}
                  <span className="text-[10px] text-neutral-500 mt-0.5">Precio final reserva</span>
                </div>
              </div>
            );
          })}

          {/* No comprar estacionamiento (at the end of full scroll list) */}
          <div className="text-center pt-6 border-t border-neutral-900/40 select-none">
            {isDark ? (
              <button
                type="button"
                onClick={handleNoParkingClick}
                className="text-[9.5px] text-neutral-600 hover:text-neutral-500 underline transition-colors"
              >
                No comprar estacionamiento (continuar a pie sin reserva)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmNoParking}
                className="text-xs text-neutral-400 hover:text-white transition-colors"
              >
                No deseo reservar estacionamiento (continuar sin reserva)
              </button>
            )}
          </div>
        </div>

        {/* Confirmation Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleConfirmParking}
            disabled={!selectedParkingId}
            className={`w-full max-w-sm py-4 px-8 rounded-full font-bold text-sm text-center shadow-lg transition-all ${
              selectedParkingId
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-105 shadow-pink-500/20'
                : 'bg-neutral-900 text-neutral-600 cursor-not-allowed border border-neutral-900'
            }`}
          >
            Confirmar y Continuar al Pago
          </button>
        </div>
      </main>

      {/* Confirm Shaming Modal for No Parking (Dark Pattern) */}
      {showShamingModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in select-none">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-950 to-amber-950 p-6 text-center text-white">
              <span className="text-4xl">⚠️</span>
              <h2 className="text-xl font-bold mt-2">¡Peligro de Congestión e Inseguridad!</h2>
              <p className="text-amber-100 text-[11px] mt-0.5">Reporte oficial de tránsito de River Plate</p>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-xs text-neutral-300 leading-relaxed">
                El estadio River Plate se encuentra en una zona de alta demanda y congestión vehicular. Si decides no reservar estacionamiento oficial vigilado, te arriesgas a:
              </p>
              <ul className="list-disc pl-5 mt-2 text-[11px] text-neutral-500 space-y-1">
                <li>Caminar más de 30 cuadras de noche por calles mal iluminadas y poco transitadas.</li>
                <li>Pagar tarifas extorsivas a cuidadores informales ilegales de hasta $30.000 sin garantía de seguridad.</li>
                <li>Posibles multas municipales, grúas o vandalismo a tu vehículo estacionado en la calle.</li>
              </ul>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowShamingModal(false)}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all text-xs"
                >
                  SÍ, QUIERO VOLVER Y ELEGIR UN ESTACIONAMIENTO SEGURO
                </button>
                <button
                  type="button"
                  onClick={handleConfirmNoParking}
                  className="w-full bg-transparent border border-neutral-900 hover:bg-neutral-900 text-neutral-600 hover:text-red-400 font-medium py-2 px-6 rounded-xl text-[10px] transition-colors"
                >
                  No, me encanta sufrir y arriesgarme a caminar en el frío de la noche
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
