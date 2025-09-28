import { AlertCircle } from "lucide-react";

interface FieldErrorProps {
  message: string;
  className?: string;
}

export function FieldError({ message, className = "" }: FieldErrorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`} style={{ marginTop: '4px' }}>
      <AlertCircle size={14} className="text-error flex-shrink-0" />
      <span className="input-error-text">
        {message}
      </span>
    </div>
  );
}