import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileCheck, ArrowRight, Mail, Lock, Upload, FileSearch, User } from 'lucide-react';
import { registerUser } from '@/features/auth/authService';
import { saveUser } from '@/features/auth/authStorage';

export function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'uploader' as 'uploader' | 'verifier',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser({
        email: formData.email,
        password: formData.password,
        fullName: formData.name || undefined,
        role: formData.userType === 'uploader' ? 'UPLOADER' : 'USER'
      });

      if (result.success && result.user) {
        saveUser(result.user);
        toast.success('Account created successfully!');

        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Floating Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Left - Green gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(144,238,144,0.7) 0%, rgba(34,139,34,0.3) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Bottom Right - Pink gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
          className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,182,193,0.7) 0%, rgba(255,105,180,0.3) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Center - Blue gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
          className="absolute top-1/3 right-1/4 w-[250px] h-[250px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(135,206,250,0.6) 0%, rgba(0,191,255,0.2) 50%, transparent 70%)',
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

      {/* Sign Up Form */}
      <main className="relative z-10 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-3">Create account</h1>
            <p className="text-muted-foreground">Start securing your documents today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User Type Selection */}
            <div className="space-y-3">
              <Label className="text-foreground font-medium">I want to</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'uploader' })}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 ${formData.userType === 'uploader'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                    : 'border-border hover:border-blue-500/50 bg-card'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${formData.userType === 'uploader'
                    ? 'bg-blue-500'
                    : 'bg-gray-100'
                    }`}>
                    <Upload className={`w-6 h-6 ${formData.userType === 'uploader' ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <span className={`font-semibold ${formData.userType === 'uploader' ? 'text-blue-600' : 'text-gray-700'}`}>
                    Upload Docs
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'verifier' })}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 ${formData.userType === 'verifier'
                    ? 'border-green-500 bg-green-50 dark:bg-green-500/10'
                    : 'border-border hover:border-green-500/50 bg-card'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${formData.userType === 'verifier'
                    ? 'bg-green-500'
                    : 'bg-gray-100'
                    }`}>
                    <FileSearch className={`w-6 h-6 ${formData.userType === 'verifier' ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <span className={`font-semibold ${formData.userType === 'verifier' ? 'text-green-600' : 'text-gray-700'}`}>
                    Verify Docs
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium">Full Name</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors z-10" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="pl-12 h-14 rounded-2xl border-input bg-background/80 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors z-10" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="pl-12 h-14 rounded-2xl border-input bg-background/80 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors z-10" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="pl-12 h-14 rounded-2xl border-input bg-background/80 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirm Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors z-10" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="pl-12 h-14 rounded-2xl border-input bg-background/80 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full h-14 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/signin" className="text-blue-500 hover:text-blue-600 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
