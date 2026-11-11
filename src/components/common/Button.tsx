import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'blue' | 'danger' | 'ghost';
};

export function Button({ variant = 'primary', className = '', type = 'button', ...props }: Props) {
  return (
    <button type={type} className={`sp-button sp-button--${variant} ${className}`} {...props} />
  );
}
