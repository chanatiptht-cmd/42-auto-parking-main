import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
  hideLabel?: boolean;
};

export function Input({ label, icon, hideLabel = false, id, className = '', ...props }: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className={`sp-field ${className}`}>
      <label htmlFor={inputId} className={hideLabel ? 'visually-hidden' : ''}>
        {label}
      </label>
      <div className={`sp-input-wrap ${icon ? 'has-icon' : ''}`}>
        {icon && (
          <span className="sp-input-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <input id={inputId} {...props} />
      </div>
    </div>
  );
}
