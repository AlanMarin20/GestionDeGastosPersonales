import type { ReactNode } from 'react';

type AppCardProps = {
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function AppCard({ children, className = '', bodyClassName = '' }: AppCardProps) {
  return (
    <div className={`card border-0 shadow-sm ${className}`.trim()}>
      <div className={`card-body ${bodyClassName}`.trim()}>{children}</div>
    </div>
  );
}
