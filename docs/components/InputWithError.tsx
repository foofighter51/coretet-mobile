import React from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface InputWithErrorProps {
  label: string;
  error?: string;
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  required?: boolean;
}

export function InputWithError({
  label,
  error,
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
  required
}: InputWithErrorProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={className}>
      <Label htmlFor={inputId} className="input-label">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </Label>
      <Input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        hasError={!!error}
        className="w-full"
      />
      {error && (
        <span className="input-error-text">
          {error}
        </span>
      )}
    </div>
  );
}