import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const TimerHeader = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const enabledParam = searchParams.get('enabled') === 'true' ? 'true' : 'false';
  const isDark = enabledParam === 'true';

  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds

  useEffect(() => {
    if (!isDark) return;

    let startTimestamp = localStorage.getItem('tuticket_timer_start');
    if (!startTimestamp) {
      startTimestamp = Date.now().toString();
      localStorage.setItem('tuticket_timer_start', startTimestamp);
    }

    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - parseInt(startTimestamp, 10)) / 1000);
      const remaining = 120 - elapsedSeconds;

      if (remaining <= 0) {
        clearInterval(interval);
        localStorage.setItem('tuticket_expired', 'true');
        setTimeLeft(0);
        navigate(`/tuticket/payment?enabled=${enabledParam}`);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate, isDark, enabledParam]);

  if (!isDark) {
    return null;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Color dynamic changes based on remaining time
  let timerColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-950/20';
  let progressColor = 'bg-emerald-500';
  if (timeLeft < 120) {
    // Under 2 mins: yellow/orange warning
    timerColor = 'text-amber-400 border-amber-500/25 bg-amber-950/30 animate-pulse';
    progressColor = 'bg-amber-500';
  }
  if (timeLeft < 60) {
    // Under 1 min: red danger
    timerColor = 'text-red-400 border-red-500/30 bg-red-950/40 animate-pulse';
    progressColor = 'bg-red-500';
  }

  const percentage = (timeLeft / 120) * 100;

  return (
    <div className="w-full bg-neutral-950 border-b border-neutral-900 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <i className={`fa-solid fa-clock ${timeLeft < 60 ? 'text-red-500 animate-spin' : timeLeft < 120 ? 'text-amber-500' : 'text-emerald-500'}`}></i>
          <span className="text-sm font-semibold text-neutral-300">
            Tiempo restante para realizar la compra:
          </span>
        </div>
        
        <div className={`px-4 py-1.5 rounded-lg border font-mono text-lg font-bold flex items-center justify-center min-w-[90px] ${timerColor}`}>
          {formattedTime}
        </div>
      </div>
      {/* Visual Progress Bar */}
      <div className="w-full bg-neutral-900 h-1">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${progressColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
