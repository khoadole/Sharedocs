import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: ReactNode;
  account?: string | null;
  onConnect?: () => void;
}

export function Layout({ children, account, onConnect }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar account={account} onConnect={onConnect} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
