import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Upload, FileCheck, Menu } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { formatAddress } from '@/lib/web3';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  account?: string | null;
  onConnect?: () => void;
}

export function Navbar({ account, onConnect }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-blue flex items-center justify-center">
            <FileCheck className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-lg hidden sm:inline-block">ShareDocs</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/upload">
            <Button variant="ghost" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </Link>
          <Link to="/verify">
            <Button variant="ghost" size="sm">
              <FileCheck className="mr-2 h-4 w-4" />
              Verify
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              My Documents
            </Button>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Wallet Connection */}
          {account ? (
            <Button variant="outline" size="sm">
              {formatAddress(account)}
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={onConnect}>
              Connect Wallet
            </Button>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/upload" className="flex items-center">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/verify" className="flex items-center">
                    <FileCheck className="mr-2 h-4 w-4" />
                    Verify
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">My Documents</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
