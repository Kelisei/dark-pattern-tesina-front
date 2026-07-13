import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TuTicketNavbar } from './TuTicketNavbar';
import { TimerHeader } from './TimerHeader';
import { FinishedTask } from '../../components/FinishedTask';

export const TuTicketPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const enabledParam = searchParams.get('enabled') === 'true' ? 'true' : 'false';
  const isDark = enabledParam === 'true';

  // Experiment state
  const [session, setSession] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [insuranceCost, setInsuranceCost] = useState(null); // null = not chosen yet, 0 = no, 10000 = yes

  // Payment UI state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null); // 'min_price' | 'in_range' | 'exceeded' | 'expired'
  const [showFinishedModal, setShowFinishedModal] = useState(false);

  useEffect(() => {
    // Check if expired (only in dark mode)
    if (isDark) {
      const expiredFlag = localStorage.getItem('tuticket_expired');
      const startTimestamp = localStorage.getItem('tuticket_timer_start');
      
      if (expiredFlag === 'true' || (startTimestamp && Date.now() - parseInt(startTimestamp, 10) >= 300000)) {
        setIsExpired(true);
        setPaymentResult('expired');
        return;
      }
    }

    const currentSession = JSON.parse(localStorage.getItem('tuticket_session'));
    if (!currentSession || !currentSession.ticket || !currentSession.parking) {
      // Redirect back if they accessed payment without buying/selecting
      navigate(`/tuticket?enabled=${enabledParam}`);
      return;
    }

    setSession(currentSession);
    if (isDark) {
      setShowInsuranceModal(true);
    } else {
      setInsuranceCost(0);
      setShowInsuranceModal(false);
    }
  }, [navigate, isDark, enabledParam]);

  const handleInsuranceChoice = (accept) => {
    const cost = accept ? 10000 : 0;
    setInsuranceCost(cost);
    
    // Update local state and session
    const updatedSession = { ...session, insurance: cost };
    setSession(updatedSession);
    localStorage.setItem('tuticket_session', JSON.stringify(updatedSession));
    
    setShowInsuranceModal(false);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      alert('Por favor complete todos los datos de pago.');
      return;
    }

    setIsPaying(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsPaying(false);

      const ticketPrice = session.ticket.price;
      const tshirtPrice = session.remera || 0;
      const parkingPrice = session.parking.price;
      const insCost = insuranceCost || 0;

      const total = ticketPrice + tshirtPrice + parkingPrice + insCost;

      if (total === 50000) {
        setPaymentResult('min_price');
      } else if (total <= 100000) {
        setPaymentResult('in_range');
      } else {
        setPaymentResult('exceeded');
      }
    }, 1500);
  };

  // Compute subtotal and total
  const ticketPrice = session?.ticket?.price || 0;
  const tshirtPrice = session?.remera || 0;
  const parkingPrice = session?.parking?.price || 0;
  const insCost = insuranceCost || 0;
  const totalCost = ticketPrice + tshirtPrice + parkingPrice + insCost;

  // List dark patterns fell for
  const getTrapsFellFor = () => {
    const traps = [];
    if (session?.ticket?.id === 'sivori_alta') {
      traps.push('Entrada Sivori Alta ($60.000) influenciada por escasez falsa ("QUEDAN SOLO X LUGARES") sin scrollear a ver la Platea San Martín Alta ($50.000)');
    } else if (session?.ticket?.id !== 'platea_san_martin_alta') {
      traps.push(`Entrada más costosa del estadio (${session?.ticket?.name} a $${session?.ticket?.price.toLocaleString('es-AR')})`);
    }

    if (tshirtPrice > 0) {
      traps.push('Remera de Lady Gaga con descuento falso del 70% (Fake Scarcity/Urgency en pop-up)');
    }

    if (session?.parking?.id !== 'parking_g' && session?.parking?.id !== 'none') {
      if (session?.parking?.id === 'parking_a') {
        traps.push('Estacionamiento VIP más caro influenciado por descuento falso con temporizador corto (Fake Urgency)');
      } else {
        traps.push(`Estacionamiento más costoso (${session?.parking?.name}) influenciado por comentarios positivos sugeridos o pereza de scroll`);
      }
    }

    if (insCost > 0) {
      traps.push('Seguro de Cancelación y Clima por confirmshaming ("Sí, quiero asegurar..." vs el texto intimidante)');
    }

    return traps;
  };

  return (
    <div className="bg-black min-h-screen text-neutral-100 font-sans pb-16 relative">
      <TuTicketNavbar />
      {!isExpired && !paymentResult && <TimerHeader />}

      <main className="max-w-4xl mx-auto px-6 mt-8">
        {/* State: Expired Checkout */}
        {paymentResult === 'expired' && (
          <div className="bg-neutral-950 border border-red-500/30 rounded-3xl p-8 text-center max-w-xl mx-auto my-12 shadow-2xl">
            <div className="text-6xl mb-4 animate-pulse">⏰</div>
            <h1 className="text-3xl font-extrabold text-red-500">Sesión Expirada</h1>
            <p className="text-neutral-300 mt-4 text-sm leading-relaxed">
              Debido a la alta demanda y al tiempo límite de 5 minutos, tus entradas reservadas en el carrito han sido liberadas para otros usuarios en la fila.
            </p>
            <div className="bg-black/60 rounded-2xl p-4 border border-neutral-900 mt-6 text-xs text-neutral-400 font-medium">
              ❌ Resultado: No lograste comprar las entradas. ¡Te quedaste sin ver a Lady Gaga!
            </div>
            
            <button
              onClick={() => setShowFinishedModal(true)}
              className="mt-8 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-sm shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all"
            >
              Finalizar Experimento
            </button>
          </div>
        )}

        {/* State: Payment Form & Checkout Breakdown */}
        {session && !isExpired && !paymentResult && (
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Left: Summary Breakdown */}
            <div className="w-full md:w-1/2 bg-neutral-950 border border-neutral-900 rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-neutral-900 pb-3">Resumen de Compra</h2>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-neutral-200 font-semibold">{session.ticket.name}</p>
                    <p className="text-xs text-neutral-500">1x Ticket Estadio River Plate</p>
                  </div>
                  <span className="font-mono font-bold text-white">${ticketPrice.toLocaleString('es-AR')}</span>
                </div>

                <div className="flex justify-between items-start border-t border-neutral-900/60 pt-4">
                  <div>
                    <p className="text-neutral-200 font-semibold">Remera Oficial Lady Gaga</p>
                    <p className="text-xs text-neutral-500">{tshirtPrice > 0 ? 'Promo Preventa 70% Off' : 'No seleccionada'}</p>
                  </div>
                  <span className="font-mono font-bold text-white">${tshirtPrice.toLocaleString('es-AR')}</span>
                </div>

                <div className="flex justify-between items-start border-t border-neutral-900/60 pt-4">
                  <div>
                    <p className="text-neutral-200 font-semibold">Estacionamiento Concierto</p>
                    <p className="text-xs text-neutral-500">{session.parking.name}</p>
                  </div>
                  <span className="font-mono font-bold text-white">${parkingPrice.toLocaleString('es-AR')}</span>
                </div>

                <div className="flex justify-between items-start border-t border-neutral-900/60 pt-4">
                  <div>
                    <p className="text-neutral-200 font-semibold">Seguro de Cancelación y Clima</p>
                    <p className="text-xs text-neutral-500">{insuranceCost > 0 ? 'Protección total activa' : 'Sin seguro'}</p>
                  </div>
                  <span className="font-mono font-bold text-white">${insCost.toLocaleString('es-AR')}</span>
                </div>

                <div className="flex justify-between items-center border-t border-neutral-900 pt-6">
                  <span className="text-lg font-extrabold text-white">Total a Pagar:</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-pink-400 font-mono">${totalCost.toLocaleString('es-AR')}</span>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Impuestos incluidos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Payment Method details */}
            <div className="w-full md:w-1/2 bg-neutral-950 border border-neutral-900 rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-neutral-900 pb-3 flex justify-between items-center">
                <span>Detalles de Pago</span>
                <button
                  type="button"
                  onClick={() => {
                    setCardName('Francisco Pérez');
                    setCardNumber('4512345678901234');
                    setCardExpiry('12/28');
                    setCardCvv('123');
                  }}
                  className="text-[9px] text-neutral-800 hover:text-neutral-600 transition-colors uppercase tracking-widest font-mono select-none"
                  title="Rellenar datos de prueba"
                >
                  [autofill]
                </button>
              </h2>
              
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Nombre del Tarjetahabiente</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-black text-neutral-200 border border-neutral-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Número de Tarjeta</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="4512 3456 7890 1234"
                    className="w-full bg-black text-neutral-200 border border-neutral-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors font-mono"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Vencimiento</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val.length === 2 && !val.includes('/')) {
                          val += '/';
                        }
                        setCardExpiry(val);
                      }}
                      placeholder="MM/AA"
                      className="w-full bg-black text-neutral-200 border border-neutral-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors font-mono"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Código (CVV)</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="•••"
                      className="w-full bg-black text-neutral-200 border border-neutral-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isPaying}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full text-center shadow-lg shadow-pink-500/10 active:scale-[0.98] transition-all text-sm flex items-center justify-center space-x-2"
                  >
                    {isPaying ? (
                      <>
                        <i className="fa-solid fa-spinner animate-spin"></i>
                        <span>Procesando pago...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-lock"></i>
                        <span>CONFIRMAR Y PAGAR</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* State: Payment Results View */}
        {paymentResult && paymentResult !== 'expired' && (
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-8 shadow-2xl max-w-2xl mx-auto my-6 animate-fade-in select-none">
            {/* Header Badge */}
            <div className="text-center mb-6">
              {paymentResult === 'min_price' && (
                <div className="inline-flex flex-col items-center">
                  <span className="text-5xl animate-bounce">🏆</span>
                  <h1 className="text-3xl font-extrabold text-emerald-400 mt-4">¡Compra Perfecta!</h1>
                </div>
              )}
              {paymentResult === 'in_range' && (
                <div className="inline-flex flex-col items-center">
                  <span className="text-5xl animate-pulse">🎟️</span>
                  <h1 className="text-3xl font-extrabold text-amber-400 mt-4">Compra Completada</h1>
                </div>
              )}
              {paymentResult === 'exceeded' && (
                <div className="inline-flex flex-col items-center">
                  <span className="text-5xl animate-shake">🚫</span>
                  <h1 className="text-3xl font-extrabold text-red-500 mt-4">Transacción Rechazada</h1>
                </div>
              )}
            </div>

            {/* Results Details */}
            <div className="space-y-6">
              {/* Main message */}
              <div className="bg-black/60 border border-neutral-900 rounded-2xl p-6">
                <p className="text-neutral-300 text-sm leading-relaxed text-center font-medium">
                  {paymentResult === 'min_price' && 
                    (isDark 
                      ? '¡Felicitaciones! Lograste comprar tus entradas al precio mínimo posible de $50.000. No caíste en ningún dark pattern ni trampa comercial. ¡Gran control de tu presupuesto! Vas a ver a Lady Gaga.'
                      : '¡Felicitaciones! Compraste tus entradas al precio mínimo de $50.000. ¡Vas a ver a Lady Gaga!')}
                  
                  {paymentResult === 'in_range' && 
                    (isDark 
                      ? `¡Compraste tus entradas! Vas a ver a Lady Gaga y lograste mantenerte dentro de tu presupuesto ($${totalCost.toLocaleString('es-AR')}). Sin embargo, caíste en algunos dark patterns de la interfaz.`
                      : `¡Compraste tus entradas! Vas a ver a Lady Gaga y te mantuviste dentro de tu presupuesto (total gastado: $${totalCost.toLocaleString('es-AR')}).`)}
                  
                  {paymentResult === 'exceeded' && 
                    (isDark 
                      ? `¡Te quedaste sin ver a Lady Gaga! Gastaste un total de $${totalCost.toLocaleString('es-AR')}, lo cual supera tu presupuesto máximo de $100.000. Tu tarjeta fue rechazada por falta de fondos debido a las compras opcionales.`
                      : `¡Te quedaste sin ver a Lady Gaga! Tu gasto total de $${totalCost.toLocaleString('es-AR')} superó tu presupuesto máximo de $100.000.`)}
                </p>
              </div>

              {/* Breakdown detail of errors */}
              {isDark && paymentResult !== 'min_price' && (
                <div className="bg-black/40 border border-neutral-900 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-pink-400 mb-3 flex items-center space-x-1.5">
                    <i className="fa-solid fa-list-check"></i>
                    <span>Dark Patterns en los que caíste:</span>
                  </h3>
                  <ul className="space-y-3">
                    {getTrapsFellFor().map((trap, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs text-neutral-400">
                        <span className="text-red-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{trap}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {paymentResult === 'in_range' && (
                    <p className="text-xs text-neutral-500 mt-4 pt-3 border-t border-neutral-900/60 font-medium">
                      💡 Tip: Podrías haber gastado el mínimo de <strong className="text-white">$50.000</strong> si evitabas las ofertas de urgencia y confirmshaming.
                    </p>
                  )}
                </div>
              )}

              {paymentResult === 'min_price' && (
                <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-2xl p-5 text-center">
                  <p className="text-xs text-emerald-400 font-bold">
                    🚀 {isDark 
                      ? '¡Lograste comprar el ticket más económico ($50.000) y evitar gastos innecesarios de estacionamiento, rechazando todas las ventas cruzadas y alertas de escasez ficticias!'
                      : '¡Compraste el ticket más económico ($50.000) y decidiste no reservar estacionamiento!'}
                  </p>
                </div>
              )}

              {/* End Experiment Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setShowFinishedModal(true)}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-full text-sm shadow-lg shadow-pink-500/20 active:scale-[0.98] transition-all"
                >
                  Finalizar Experimento
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Pop-up Modal: Insurance (Pre-payment pop-up) */}
      {showInsuranceModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in select-none">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-center text-white">
              <span className="text-4xl">🛡️</span>
              <h2 className="text-xl font-bold mt-2">¡Asegurá tu inversión!</h2>
              <p className="text-emerald-100 text-[11px] mt-0.5">Seguro contra Cancelación y Clima</p>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-xs text-neutral-300 leading-relaxed">
                Por tan solo <strong className="text-white font-mono">$10.000 ARS</strong> extra, protegé tus entradas ante cualquier imprevisto de salud, suspensión del concierto por mal clima, reprogramación o imposibilidad repentina de asistir.
              </p>

              <div className="bg-black/60 border border-neutral-900 p-4 rounded-xl mt-4 text-[10px] text-neutral-400">
                🔒 El reembolso cubre el 100% de las entradas y costos de servicio asociados en menos de 48hs.
              </div>

              {/* Buttons */}
              <div className="flex flex-col space-y-3 mt-6">
                <button
                  onClick={() => handleInsuranceChoice(true)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg active:scale-[0.98] transition-all text-xs"
                >
                  Sí, quiero asegurar mis entradas y mi dinero
                </button>
                <button
                  onClick={() => handleInsuranceChoice(false)}
                  className="w-full bg-transparent border border-neutral-900 hover:bg-neutral-800/40 text-neutral-400 hover:text-neutral-300 font-medium py-2.5 px-6 rounded-xl text-[10px] transition-colors"
                >
                  No, prefiero arriesgarme a perder todo mi dinero si me enfermo o se suspende el show
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finished Task Modal handler */}
      <FinishedTask show={showFinishedModal} website="TuTicket" />
    </div>
  );
};
