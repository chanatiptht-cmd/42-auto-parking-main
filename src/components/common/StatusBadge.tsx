import type { ReactNode } from 'react';

export function StatusBadge({
  tone = 'green',
  children,
}: {
  tone?: 'green' | 'blue' | 'red' | 'gray';
  children: ReactNode;
}) {
  return <span className={`sp-badge sp-badge--${tone}`}>{children}</span>;
}
