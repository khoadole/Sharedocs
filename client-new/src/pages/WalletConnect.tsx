import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Wallet, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { connectWallet, getAccount, formatAddress } from '@/lib/web3';
import { getUser, saveUser } from '@/features/auth/authStorage';
import { connectWallet as connectWalletAPI } from '@/features/auth/authService';

export function WalletConnect() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      setChecking(true);
      const account = await getAccount();
      setWalletAddress(account);
    } catch (error) {
      console.error('Error checking wallet:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleConnectWallet = async () => {
    if (!user) {
      toast.error('Please login first');
      navigate('/signin');
      return;
    }

    setLoading(true);
    try {
      // Connect MetaMask wallet
      const address = await connectWallet();
      setWalletAddress(address);

      // Update backend with wallet address
      const result = await connectWalletAPI(user.id, address);

      if (result.success && result.user) {
        saveUser(result.user);
        setUser(result.user);
        toast.success(result.message || 'Wallet connected successfully!');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeWallet = async () => {
    try {
      setLoading(true);
      
      // Request MetaMask to show account selection dialog
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
      }
      
      // Get the newly selected account
      const address = await connectWallet();
      
      if (address !== walletAddress) {
        setWalletAddress(address);
        
        // Update backend if user is logged in
        if (user) {
          const result = await connectWalletAPI(user.id, address);

          if (result.success && result.user) {
            saveUser(result.user);
            setUser(result.user);
            toast.success('Wallet changed successfully!');
          }
        }
      } else {
        toast.info('Same wallet selected');
      }
    } catch (error) {
      console.error('Change wallet error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to change wallet';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-gray-950">
      {/* Floating Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Right - Pink/Red gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.7) 0%, rgba(219,39,119,0.3) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        
        {/* Bottom Left - Blue gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
          className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.7) 0%, rgba(37,99,235,0.3) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        
        {/* Center - Purple gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.6) 0%, rgba(147,51,234,0.2) 50%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header with Back Button */}
        <div className="px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-2xl"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                Wallet Connection
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Connect your MetaMask wallet to enable blockchain features
              </p>
            </div>

            {/* Wallet Status Card */}
            <Card className="border-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Wallet Status</CardTitle>
                  {walletAddress ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Not Connected
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {walletAddress
                    ? 'Your wallet is connected and ready to use'
                    : 'Connect your wallet to upload documents to the blockchain'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {checking ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 mx-auto text-gray-400 animate-spin mb-4" />
                    <p className="text-sm text-gray-500">Checking wallet connection...</p>
                  </div>
                ) : walletAddress ? (
                  <>
                    {/* Connected Wallet Info */}
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Wallet Address
                            </p>
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border break-all">
                                {walletAddress}
                              </code>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Short: {formatAddress(walletAddress)}
                            </p>
                          </div>
                          <a
                            href={`https://etherscan.io/address/${walletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        </div>
                      </div>

                      {/* User Role Info */}
                      {user && (
                        <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Account Role
                              </p>
                              <Badge variant={user.role === 'UPLOADER' ? 'default' : 'secondary'} className="text-xs">
                                {user.role}
                              </Badge>
                            </div>
                            {user.role === 'UPLOADER' && (
                              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {user.role === 'UPLOADER'
                              ? 'You can upload and verify documents'
                              : 'Connect wallet to unlock upload features'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Change Wallet Button */}
                    <Button
                      onClick={handleChangeWallet}
                      disabled={loading}
                      variant="outline"
                      className="w-full h-12 rounded-xl"
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                      Change Wallet
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Not Connected - Connection Instructions */}
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
                        <div className="flex gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              MetaMask Required
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              You need MetaMask browser extension to connect your wallet. 
                              {' '}
                              <a
                                href="https://metamask.io/download/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline dark:text-blue-400"
                              >
                                Install MetaMask
                              </a>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Connection Steps */}
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          How to connect:
                        </p>
                        <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <li className="flex gap-2">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-medium">
                              1
                            </span>
                            <span>Make sure MetaMask extension is installed</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-medium">
                              2
                            </span>
                            <span>Click "Connect Wallet" button below</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-medium">
                              3
                            </span>
                            <span>Approve the connection request in MetaMask</span>
                          </li>
                        </ol>
                      </div>
                    </div>

                    {/* Connect Button */}
                    <Button
                      onClick={handleConnectWallet}
                      disabled={loading || !user}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Wallet className="mr-2 h-4 w-4" />
                          Connect Wallet
                        </>
                      )}
                    </Button>

                    {!user && (
                      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                        Please{' '}
                        <button
                          onClick={() => navigate('/signin')}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          login
                        </button>
                        {' '}first to connect your wallet
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your wallet address is used to sign blockchain transactions.
                <br />
                We never have access to your private keys.
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
