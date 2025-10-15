import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');
  const [freighterInstalled, setFreighterInstalled] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if Freighter is installed (with retry mechanism)
    checkFreighterInstalled();

    // Check if already connected
    const storedAddress = localStorage.getItem('walletAddress');
    const storedUsername = localStorage.getItem('username');
    if (storedAddress && storedUsername) {
      router.push('/home');
    }
  }, [router]);

  const checkFreighterInstalled = async () => {
    // Wait for Freighter to load (it injects into the page)
    let attempts = 0;
    const maxAttempts = 50; // 50 attempts * 100ms = 5 seconds
    
    setIsChecking(true);
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      if (typeof window !== 'undefined' && window.freighterApi) {
        setFreighterInstalled(true);
        setIsChecking(false);
        clearInterval(checkInterval);
      } else if (attempts >= maxAttempts) {
        setFreighterInstalled(false);
        setIsChecking(false);
        clearInterval(checkInterval);
      }
    }, 100); // Check every 100ms for 5 seconds total
  };

  const connectWallet = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      // Wait a bit for Freighter to be available
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if Freighter is installed
      if (!window.freighterApi) {
        setError('Freighter wallet is not installed. Please install it from the Chrome Web Store.');
        setIsConnecting(false);
        return;
      }

      // Request access to the wallet
      const result = await window.freighterApi.requestAccess();

      if (result.error) {
        setError(result.error);
        setIsConnecting(false);
        return;
      }

      if (result.address) {
        // Save address and username to localStorage
        localStorage.setItem('walletAddress', result.address);
        localStorage.setItem('username', username.trim());

        // Redirect to home page
        router.push('/home');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Stellarcade - Connect Wallet</title>
        <meta name="description" content="Connect your Freighter wallet to play" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            {/* Logo/Title */}
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-white mb-2">
                🎮 Stellarcade
              </h1>
              <p className="text-gray-300 text-lg">
                Arcade Rewards on Stellar
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-200">
                Connect your Freighter wallet to start playing and earning rewards on the Stellar blockchain.
              </p>
            </div>

            {/* Username Input */}
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Choose Your Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your player name"
                maxLength={20}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isConnecting || isChecking}
              />
              <p className="text-xs text-gray-400 mt-1">
                This name will appear on the leaderboard
              </p>
            </div>

            {/* Connect Button */}
            <button
              onClick={connectWallet}
              disabled={isConnecting || isChecking || !username.trim()}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all transform ${
                isConnecting || isChecking || !username.trim()
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-105 active:scale-95'
              } text-white shadow-lg`}
            >
              {isChecking ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Checking for Freighter...
                </span>
              ) : isConnecting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Connecting...
                </span>
              ) : (
                '🚀 Connect Freighter Wallet'
              )}
            </button>

            {/* Debug Info */}
            {isChecking && (
              <div className="mt-2 text-center">
                <p className="text-xs text-blue-300">
                  ⏳ Waiting for Freighter extension to load...
                </p>
              </div>
            )}
            {!isChecking && !freighterInstalled && (
              <div className="mt-2 text-center">
                <p className="text-xs text-yellow-300">
                  ⚠️ Freighter not detected. Make sure it's installed and enabled.
                </p>
              </div>
            )}
            {!isChecking && freighterInstalled && (
              <div className="mt-2 text-center">
                <p className="text-xs text-green-300">
                  ✅ Freighter detected! Ready to connect.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {/* Install Freighter Link */}
            {!freighterInstalled && (
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm mb-2">Don't have Freighter?</p>
                <a
                  href="https://www.freighter.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline text-sm"
                >
                  Install Freighter Wallet
                </a>
              </div>
            )}

            {/* Network Info */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-center text-gray-400 text-sm">
                Network: <span className="text-yellow-400 font-semibold">Stellar Testnet</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
