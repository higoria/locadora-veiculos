import type { ReactNode } from 'react';

export interface CardProps { title: string; children: ReactNode; className?: string }

export function Card({ title, children, className = '' }: CardProps) {
  return <section className={`card shadow-sm border-0 h-100 ${className}`}>
    <div className="card-body"><h2 className="h5 card-title fw-bold mb-3">{title}</h2>{children}</div>
  </section>;
}
