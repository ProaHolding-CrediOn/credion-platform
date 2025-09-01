import React from 'react';

export type TimeLeft = {
  hours: number;
  minutes: number;
  seconds: number;
};

type TimerFormProps = {
  timeLeft: TimeLeft | null;
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

  const totalMinutes = timeLeft.hours * 60 + timeLeft.minutes;

  let containerClasses = "";
  let icon = "⏳";
  let message = "";

  if (expired) {
    containerClasses = "bg-red-50 border-red-200 text-destructive";
    icon = "⏰";
    message = "Ha finalizado el tiempo, en un momento será redirigido";
  } else if (totalMinutes < 1) {
    containerClasses = "bg-orange-50 border-orange-200 text-orange-600";
    icon = "⚠️";
    message = "Queda menos de 1 minuto";
  } else {
    containerClasses = "bg-blue-50 border-blue-200 text-muted-foreground";
    icon = "⏳";
    message = `Tiempo restante: ${totalMinutes} min`;
  }

  return (
    <div
      className={`
        border rounded-lg shadow-sm 
        px-3 py-2 
        flex items-center gap-3
        max-w-xs mx-auto
        font-light
        transition-all duration-200
        ${containerClasses}
      `}
    >
      <span className="text-lg" aria-hidden="true">
        {icon}
      </span>
      <span className="text-sm leading-tight">
        {message}
      </span>
    </div>
  );
}
