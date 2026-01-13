import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { SignIn } from '@/pages/auth/SignIn';
import { SignUp } from '@/pages/auth/SignUp';
import { Dashboard } from '@/pages/dashboard/Dashboard';
import { UploadDocument } from '@/pages/dashboard/UploadDocument';
import { VerifyDocument } from '@/pages/dashboard/VerifyDocument';
import { connectWallet, getAccount } from '@/lib/web3';
import { toast } from 'sonner';
import './styles/globals.css';

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    try {
      const currentAccount = await getAccount();
      setAccount(currentAccount);
    } catch (error) {
      console.error('Connection check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
      toast.error('Wallet disconnected');
    } else {
      setAccount(accounts[0]);
      toast.success('Account changed');
    }
  };

  const handleConnect = async () => {
    try {
      const address = await connectWallet();
      setAccount(address);
      toast.success('Wallet connected!');
    } catch (error: any) {
      console.error('Connection error:', error);
      toast.error(error.message || 'Failed to connect wallet');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Routes with Layout */}
          <Route
            path="/dashboard"
            element={
              <Layout account={account} onConnect={handleConnect}>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/upload"
            element={
              <Layout account={account} onConnect={handleConnect}>
                <UploadDocument />
              </Layout>
            }
          />
          <Route
            path="/verify"
            element={
              <Layout account={account} onConnect={handleConnect}>
                <VerifyDocument />
              </Layout>
            }
          />
        </Routes>

        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;
