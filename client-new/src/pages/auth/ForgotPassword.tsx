import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileCheck, ArrowRight, Mail, ArrowLeft } from 'lucide-react';
import { forgotPassword } from '@/features/auth/authService';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await forgotPassword(email);

            if (result.success) {
                setSubmitted(true);
                toast.success('Reset link sent!');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-background">
            {/* Floating Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

            {/* Form Section */}
            <main className="relative z-10 flex items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="w-full max-w-md"
                >
                    {submitted ? (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Mail className="w-10 h-10 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Check your email</h1>
                            <p className="text-gray-500 mb-8">
                                We've sent a password reset link to <span className="font-semibold text-gray-900">{email}</span>.
                                Please check your inbox and follow the instructions.
                            </p>
                            <Link
                                to="/signin"
                                className="inline-flex items-center space-x-2 text-blue-500 hover:text-blue-600 font-semibold"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Back to Sign In</span>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-10">
                                <h1 className="text-4xl font-bold text-foreground mb-3">Forgot password?</h1>
                                <p className="text-muted-foreground">No worries, we'll send you reset instructions.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-700 font-medium">
                                        Email address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group w-full h-14 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>{loading ? 'Sending link...' : 'Send Reset Link'}</span>
                                    {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </form>

                            <div className="mt-8 text-center">
                                <Link
                                    to="/signin"
                                    className="inline-flex items-center space-x-2 text-gray-500 hover:text-gray-900 font-medium transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Back to Sign In</span>
                                </Link>
                            </div>
                        </>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
