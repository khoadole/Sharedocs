import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileCheck, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { resetPassword } from '@/features/auth/authService';

export function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error('Invalid or missing reset token');
            navigate('/signin');
        }
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const result = await resetPassword({
                token,
                password,
                confirmPassword
            });

            if (result.success) {
                setSuccess(true);
                toast.success('Password reset successful!');
                setTimeout(() => {
                    navigate('/signin');
                }, 3000);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-white">
            {/* Floating Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.5, scale: 1 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(144,238,144,0.7) 0%, rgba(34,139,34,0.3) 50%, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.5, scale: 1 }}
                    transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
                    className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(255,182,193,0.7) 0%, rgba(255,105,180,0.3) 50%, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />
            </div>

            {/* Back to Home */}
            <nav className="relative z-10 px-8 py-6">
                <Link to="/" className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                        <FileCheck className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-xl text-gray-900">ShareDocs</span>
                </Link>
            </nav>

            <main className="relative z-10 flex items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="w-full max-w-md"
                >
                    {success ? (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Password reset!</h1>
                            <p className="text-gray-500 mb-8">
                                Your password has been successfully reset. Redirecting you to sign in...
                            </p>
                            <Link
                                to="/signin"
                                className="w-full h-14 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center justify-center"
                            >
                                Sign In Now
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-10">
                                <h1 className="text-4xl font-bold text-gray-900 mb-3">Set new password</h1>
                                <p className="text-gray-500">Please enter your new password below.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-gray-700 font-medium">
                                        New Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="pl-12 h-14 rounded-2xl border-gray-200 bg-white/80 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                                        Confirm New Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="pl-12 h-14 rounded-2xl border-gray-200 bg-white/80 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group w-full h-14 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>{loading ? 'Resetting password...' : 'Reset Password'}</span>
                                    {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </form>
                        </>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
