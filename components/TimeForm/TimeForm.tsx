import React from 'react';

export type TimeLeft = {
  hours: number;
  minutes: number;
  seconds: number;
};

type TimerFormProps = {
  timeLeft: TimeLeft | null; // null = cargando
  expired: boolean;
};

export function TimerForm({ timeLeft, expired }: TimerFormProps) {
  if (!timeLeft) {
    return (
      <p className="text-muted-foreground text-sm font-light">
        Calculando tiempo restante...
      </p>
    );
  }

  return (
  <div 
    className={`
      bg-white border border-gray-200 rounded-lg shadow-sm 
      px-3 py-2 
      flex items-center gap-3
      max-w-xs mx-auto
      font-light
      transition-all duration-200
      ${expired 
        ? 'bg-red-50 border-red-200 text-destructive' 
        : 'bg-blue-50 border-blue-200 text-muted-foreground'}
      }
    `}
  >
    <span className="text-lg" aria-hidden="true">
      {expired ? '⏰' : '⏳'}
    </span>

    <span className="text-sm leading-tight">
      {expired ? (
        <>Ha finalizado el tiempo, en un momento será redirigido</>
      ) : (
        <>
          Tiempo restante:{' '}
          <strong className="font-semibold">
            {timeLeft.hours > 0 ? `${timeLeft.hours}h ` : ''}
            {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
          </strong>
        </>
      )}
    </span>
  </div>
);
}