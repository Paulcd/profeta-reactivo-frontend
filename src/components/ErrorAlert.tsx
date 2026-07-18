import { AlertTriangle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="fade-in card flex items-start gap-3 border-l-2 border-l-[#c0553f] p-4"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#c0553f]" />
      <div>
        <p className="text-sm font-semibold text-text-main">No se pudo optimizar</p>
        <p className="text-sm text-text-muted">{message}</p>
      </div>
    </div>
  );
}
