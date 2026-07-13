import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TuTicketNavbar } from './TuTicketNavbar';

export const TuTicketQueue = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const enabledParam = searchParams.get('enabled') === 'true' ? 'true' : 'false';
  const isDark = enabledParam === 'true';

  const [virtualWaitTime, setVirtualWaitTime] = useState({ hours: 2, minutes: 14, seconds: 35 });
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Clear any previous experiment state to start fresh
    localStorage.removeItem('tuticket_session');
    localStorage.removeItem('tuticket_timer_start');
    localStorage.removeItem('tuticket_expired');

    const totalDuration = isDark ? 15000 : 3000; // Shorter wait time for white version
    const intervalTime = 100; // updates every 100ms
    const totalSteps = totalDuration / intervalTime;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const currentProgress = (step / totalSteps) * 100;
      setProgress(currentProgress);

      // Interpolate virtual time
      const fraction = 1 - step / totalSteps;
      const totalVirtualSeconds = Math.max(0, Math.floor(fraction * (2 * 3600 + 14 * 60 + 35)));

      const hours = Math.floor(totalVirtualSeconds / 3600);
      const minutes = Math.floor((totalVirtualSeconds % 3600) / 60);
      const seconds = totalVirtualSeconds % 60;

      setVirtualWaitTime({ hours, minutes, seconds });

      if (step >= totalSteps) {
        clearInterval(timer);
        setIsReady(true);
        // Start the purchase timer
        localStorage.setItem('tuticket_timer_start', Date.now().toString());
        setTimeout(() => {
          navigate(`/tuticket/purchase?enabled=${enabledParam}`);
        }, 800);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [navigate, isDark, enabledParam]);

  return (
    <div className="bg-black min-h-screen text-neutral-100 font-sans flex flex-col">
      <TuTicketNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center w-full">
        {/* Virtual Queue Status Card */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-8 w-full shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 w-full h-1 bg-neutral-900">
            <div 
              className="h-full bg-gradient-to-r from-rose-500 to-purple-600 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="text-center">
            <span className="text-xs font-semibold text-rose-500 tracking-widest uppercase bg-rose-500/10 px-3.5 py-1.5 rounded-full border border-rose-500/20">
              Fila Virtual de Compra
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-6">
              {isReady ? '¡Es tu turno!' : 'Estás en la fila de espera virtual'}
            </h2>
            <p className="text-neutral-400 mt-2 text-sm">
              Por favor, no refresques esta página. Hay miles de usuarios en línea.
            </p>
          </div>

          {/* Large Fast Ticking Timer */}
          <div className="flex flex-col items-center justify-center my-10">
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Spinner animation */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-neutral-800 fill-none"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-rose-500 fill-none transition-all duration-100 ease-linear"
                  strokeWidth="6"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * progress) / 100}
                />
              </svg>

              <div className="absolute flex flex-col items-center">
                {isReady ? (
                  <div className="text-emerald-400 flex flex-col items-center">
                    <i className="fa-solid fa-circle-check text-4xl animate-bounce"></i>
                    <span className="text-xs font-bold uppercase tracking-wider mt-1">Listo</span>
                  </div>
                ) : (
                  <div className="text-center font-mono">
                    <span className="text-2xl font-extrabold text-white">
                      {virtualWaitTime.hours.toString().padStart(2, '0')}:
                      {virtualWaitTime.minutes.toString().padStart(2, '0')}:
                      {virtualWaitTime.seconds.toString().padStart(2, '0')}
                    </span>
                    <span className="block text-[9px] uppercase tracking-widest text-neutral-500 mt-1 font-sans">
                      Espera estimada
                    </span>
                  </div>
                )}
              </div>
            </div>

            {isReady && (
              <p className="text-emerald-400 text-sm font-semibold mt-4 animate-pulse">
                Redireccionando a la página de compras...
              </p>
            )}
          </div>

          <div className="bg-black/60 border border-neutral-900/80 rounded-2xl p-4 flex items-center justify-center space-x-3 text-neutral-400 text-xs">
            <i className="fa-solid fa-users text-rose-500"></i>
            <span>Usuarios delante tuyo en la fila: <strong className="text-white font-mono">{isReady ? 0 : Math.max(0, Math.floor((1 - progress / 100) * 12847))}</strong></span>
          </div>
        </div>

        {/* Experiment Objectives Card */}
        <div className="bg-neutral-950/60 border border-neutral-900/50 rounded-3xl p-8 w-full shadow-lg backdrop-blur-sm">
          <div className="flex items-center space-x-3 border-b border-neutral-900 pb-4 mb-6">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <i className="fa-solid fa-circle-info"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Instrucciones del Experimento</h3>
              <p className="text-xs text-neutral-500">Leé atentamente tus objetivos antes de que comience tu turno.</p>
            </div>
          </div>

          <div className="space-y-4">
            {isDark ? (
              <div className="flex items-start space-x-4 bg-red-950/20 border border-red-500/20 p-4 rounded-2xl">
                <i className="fa-solid fa-clock text-red-400 text-lg mt-0.5"></i>
                <div>
                  <h4 className="text-sm font-bold text-red-300">Límite de tiempo estricto</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Al entrar solo tendrás <strong className="text-white">2 minutos</strong> para realizar la compra. ¡Muchos usuarios están esperando y no podemos perder el tiempo!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-4 bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl">
                <i className="fa-solid fa-clock text-emerald-400 text-lg mt-0.5"></i>
                <div>
                  <h4 className="text-sm font-bold text-emerald-300">Compra sin presiones</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    No tienes límite de tiempo para realizar la compra. ¡Elegí con total tranquilidad el sector!
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-4 bg-neutral-900/50 border border-neutral-900 p-4 rounded-2xl">
              <i className="fa-solid fa-ticket text-rose-400 text-lg mt-0.5"></i>
              <div>
                <h4 className="text-sm font-bold text-neutral-200">Compra de entradas</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Debes comprar la entrada para el concierto en el lugar que consideres más conveniente.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-neutral-900/50 border border-neutral-900 p-4 rounded-2xl">
              <i className="fa-solid fa-square-parking text-purple-400 text-lg mt-0.5"></i>
              <div>
                <h4 className="text-sm font-bold text-neutral-200">Estacionamiento</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Es ideal que te quede presupuesto para pagar el estacionamiento del estadio.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl">
              <i className="fa-solid fa-wallet text-emerald-400 text-lg mt-0.5"></i>
              <div>
                <h4 className="text-sm font-bold text-emerald-300">Presupuesto Limitado</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Tu presupuesto total es de <strong className="text-white">$100.000</strong>. Tu gasto final no debe superar este monto (debe alcanzar para ticket, estacionamiento e imprevistos).
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
