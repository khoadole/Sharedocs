import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { FileCheck, Shield, Zap, ArrowRight } from 'lucide-react';

export function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Floating Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Right - Pink/Red gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,182,193,0.8) 0%, rgba(255,105,180,0.4) 50%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        
        {/* Bottom Right - Green gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
          className="absolute bottom-0 right-20 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(144,238,144,0.7) 0%, rgba(34,139,34,0.3) 50%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        
        {/* Left - Teal/Cyan gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.4, ease: 'easeOut' }}
          className="absolute top-1/3 -left-20 w-[350px] h-[350px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(175,238,238,0.8) 0%, rgba(0,206,209,0.3) 50%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Dot pattern - top left */}
        <div className="absolute top-8 left-8 grid grid-cols-5 gap-2 opacity-30">
          {[...Array(25)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-800" />
          ))}
        </div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-xl text-gray-900">ShareDocs</span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
            About
          </Link>
          <Link to="/features" className="text-gray-600 hover:text-gray-900 transition-colors">
            Features
          </Link>
          <Link 
            to="/signin" 
            className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:border-gray-400 transition-all"
          >
            Home
          </Link>
          <Link to="/verify" className="text-gray-600 hover:text-gray-900 transition-colors">
            Verify
          </Link>
          <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
            Dashboard
          </Link>
        </div>

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">∞</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-7xl md:text-8xl font-black text-gray-900 tracking-tight mb-4"
        >
          SHAREDOCS
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-2xl md:text-3xl font-light text-gray-700 mb-6"
        >
          Document Verification
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="text-gray-500 max-w-xl mb-12 leading-relaxed"
        >
          Secure your documents on the blockchain. Upload once, verify anywhere. 
          Immutable proof of existence powered by Ethereum and IPFS.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          className="flex items-center space-x-4"
        >
          <Link to="/signin">
            <button className="group flex items-center space-x-2 px-8 py-3 rounded-full border-2 border-gray-900 text-gray-900 font-medium hover:bg-gray-900 hover:text-white transition-all duration-300">
              <span>Login</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link to="/signup">
            <button className="px-8 py-3 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all duration-300">
              Signup
            </button>
          </Link>
        </motion.div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-6">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Immutable Security</h3>
            <p className="text-gray-500 leading-relaxed">
              Your documents are hashed and stored on the blockchain, making them tamper-proof forever.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6">
              <FileCheck className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Verification</h3>
            <p className="text-gray-500 leading-relaxed">
              Verify any document in seconds. Simply upload or paste the hash to check authenticity.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mb-6">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">IPFS Storage</h3>
            <p className="text-gray-500 leading-relaxed">
              Documents stored on decentralized IPFS network. Access your files from anywhere, anytime.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
