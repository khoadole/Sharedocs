import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileCheck, ArrowRight, Mail, Lock } from 'lucide-react';
import { loginUser, loginWithWallet } from '@/features/auth/authService';
import { saveUser } from '@/features/auth/authStorage';
import { connectWallet as getWalletAddress } from '@/lib/web3';

export function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await loginUser({
        email,
        password
      });

      if (result.success && result.user) {
        saveUser(result.user);
        toast.success('Login successful!');

        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMetaMaskLogin = async () => {
    try {
      setLoading(true);

      // Step 1: Get wallet address from MetaMask
      toast.info('Connecting MetaMask...');
      const walletAddress = await getWalletAddress();

      // Step 2: Login with wallet address
      toast.info('Authenticating...');
      const result = await loginWithWallet(walletAddress);

      if (result.success && result.user) {
        saveUser(result.user);
        toast.success('Login successful!');

        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error: any) {
      console.error('MetaMask login error:', error);
      toast.error(error.message || 'MetaMask login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Floating Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Right - Pink gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,182,193,0.7) 0%, rgba(255,105,180,0.3) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Bottom Left - Teal gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(175,238,238,0.8) 0%, rgba(0,206,209,0.3) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Center Right - Green gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
          className="absolute top-1/2 -right-20 w-[300px] h-[300px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(144,238,144,0.6) 0%, rgba(34,139,34,0.2) 50%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Back to Home */}
      <nav className="relative z-10 px-8 py-6">
        <Link to="/" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-xl text-foreground">ShareDocs</span>
        </Link>
      </nav>

      {/* Sign In Form */}
      <main className="relative z-10 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-3">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to access your documents</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors z-10" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 h-14 rounded-2xl border-input bg-background/80 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors z-10" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12 h-14 rounded-2xl border-input bg-background/80 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-input bg-background text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full h-14 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-500 hover:text-blue-600 font-semibold">
                Sign up
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground font-medium">or continue with</span>
            </div>
          </div>

          {/* MetaMask Button */}
          <button
            type="button"
            onClick={handleMetaMaskLogin}
            disabled={loading}
            className="w-full h-14 rounded-2xl border border-border bg-card hover:border-orange-400 hover:bg-orange-50/10 dark:hover:bg-orange-500/10 transition-all duration-300 flex items-center justify-center space-x-3 font-medium text-foreground shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img src="/metamask.png" alt="MetaMask" className="w-6 h-6 object-contain" />
            <span>{loading ? 'Processing...' : 'Sign in with MetaMask'}</span>
          </button>
        </motion.div>
      </main>
    </div>
  );
}
