import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Upload, FileCheck, Menu, LogOut, User } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { formatAddress } from '@/lib/web3';
import { getUser, removeUser } from '@/features/auth/authStorage';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  account?: string | null;
}

export function Navbar({ account }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    removeUser();
    toast.success('Logged out successfully');
    navigate('/signin');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-blue flex items-center justify-center">
            <FileCheck className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-lg hidden sm:inline-block">
            ShareDocs
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/documents">
            <Button variant="ghost" size="sm">
              Browse Documents
            </Button>
          </Link>
          {user && (
            <>
              <Link to="/upload">
                <Button variant="ghost" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  My Documents
                </Button>
              </Link>
            </>
          )}
          <Link to="/verify">
            <Button variant="ghost" size="sm">
              <FileCheck className="mr-2 h-4 w-4" />
              Verify
            </Button>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <div className="flex items-center space-x-1 p-1 rounded-full border bg-muted/50">
            <Button
              variant={theme === 'light' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-full shadow-none"
              onClick={() => setTheme('light')}
              aria-label="Light mode"
            >
              <Sun className={`h-4 w-4 ${theme === 'light' ? 'text-blue-600' : 'text-muted-foreground'}`} />
            </Button>
            <Button
              variant={theme === 'dark' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-full shadow-none"
              onClick={() => setTheme('dark')}
              aria-label="Dark mode"
            >
              <Moon className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-muted-foreground'}`} />
            </Button>
          </div>

          {/* User Info & Logout */}
          {user ? (
            <>
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg border bg-card">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{user.email}</span>
                <Badge variant={user.role === 'UPLOADER' ? 'default' : 'secondary'} className="text-xs">
                  {user.role}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="default" size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          {/* Wallet Connection */}
          {user?.walletAddress ? (
            <Button variant="outline" size="sm" onClick={() => navigate('/wallet')}>
              {formatAddress(user.walletAddress)}
            </Button>
          ) : (
            user && (
              <Button variant="default" size="sm" onClick={() => navigate('/wallet')}>
                Connect Wallet
              </Button>
            )
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
                  <Link to="/documents">Browse Documents</Link>
                </DropdownMenuItem>
                {user && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/upload" className="flex items-center">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">My Documents</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/verify" className="flex items-center">
                    <FileCheck className="mr-2 h-4 w-4" />
                    Verify
                  </Link>
                </DropdownMenuItem>
                {user && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </>
                )}
                {!user && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/signin">Sign In</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/signup">Sign Up</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
