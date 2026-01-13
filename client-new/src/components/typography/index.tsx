import { cn } from '@/lib/utils';

interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export function Display({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h1 className={cn('text-6xl font-bold tracking-tight', className)}>
      {children}
    </h1>
  );
}

export function H1({ children, className }: HeadingProps) {
  return (
    <h1 className={cn('text-5xl font-semibold tracking-tight', className)}>
      {children}
    </h1>
  );
}

export function H2({ children, className }: HeadingProps) {
  return (
    <h2 className={cn('text-3xl font-semibold tracking-tight', className)}>
      {children}
    </h2>
  );
}

export function H3({ children, className }: HeadingProps) {
  return (
    <h3 className={cn('text-2xl font-semibold tracking-tight', className)}>
      {children}
    </h3>
  );
}

export function H4({ children, className }: HeadingProps) {
  return (
    <h4 className={cn('text-xl font-medium', className)}>
      {children}
    </h4>
  );
}

export function Text({ 
  children, 
  className,
  variant = 'default'
}: { 
  children: React.ReactNode; 
  className?: string;
  variant?: 'default' | 'secondary' | 'muted';
}) {
  const variants = {
    default: 'text-foreground',
    secondary: 'text-muted-foreground',
    muted: 'text-muted-foreground/70',
  };

  return (
    <p className={cn('text-base', variants[variant], className)}>
      {children}
    </p>
  );
}

export function Small({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <small className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </small>
  );
}

export function Code({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <code className={cn('font-mono text-sm bg-muted px-2 py-1 rounded', className)}>
      {children}
    </code>
  );
}
