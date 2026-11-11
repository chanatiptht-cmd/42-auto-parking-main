import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PageHeader({
  title,
  backTo,
  children,
  description,
}: {
  title: string;
  backTo?: string;
  children?: ReactNode;
  description?: string;
}) {
  return (
    <header className={backTo ? 'user-page-header' : 'admin-page-header'}>
      {backTo && (
        <Link to={backTo} className="user-back" aria-label="ย้อนกลับ">
          <ArrowLeft size={21} />
        </Link>
      )}
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </header>
  );
}
