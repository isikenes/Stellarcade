import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    // Check if user is connected
    const storedAddress = localStorage.getItem('walletAddress');
    const storedUsername = localStorage.getItem('username');
    
    if (!storedAddress || !storedUsername) {
      router.push('/');
      return;
    }

    setWalletAddress(storedAddress);
    setUsername(storedUsername);
  }, [router]);

  const handleDisconnect = () => {
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('username');
    router.push('/');
  };

  const games = [
    {
      id: 'snake',
      name: 'Snake',
      icon: '🐍',
      description: 'Classic snake game',
      available: true,
    },
    {
      id: 'pong',
      name: 'Pong',
      icon: '🏓',
      description: 'Classic pong — play against the AI',
      available: true,
    },
    {
      id: 'tetris',
      name: 'Tetris',
      icon: '🧱',
      description: 'Stack and clear lines',
      available: true,
    },
  ];

  return (
    <>
      <Head>
        <title>Stellarcade - Select Game</title>
        <meta name="description" content="Choose your game" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-3xl font-bold text-white">🎮 Stellarcade</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Welcome, <span className="text-purple-400 font-semibold">{username}</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Wallet</p>
                  <p className="text-sm text-gray-300 font-mono">
                    {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
                  </p>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors border border-red-400/30"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Choose Your Game</h2>
            <p className="text-gray-300 text-lg">
              Play arcade games and compete for rewards on the blockchain
            </p>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => game.available && router.push(`/${game.id}`)}
                disabled={!game.available}
                className={`group relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border transition-all transform ${
                  game.available
                    ? 'border-white/20 hover:border-purple-400/50 hover:scale-105 hover:bg-white/15 cursor-pointer'
                    : 'border-white/10 opacity-50 cursor-not-allowed'
                }`}
              >
                {/* Game Icon */}
                <div className="text-7xl mb-4 transition-transform group-hover:scale-110">
                  {game.icon}
                </div>

                {/* Game Name */}
                <h3 className="text-2xl font-bold text-white mb-2">{game.name}</h3>

                {/* Description */}
                <p className={`text-sm ${game.available ? 'text-gray-300' : 'text-gray-500'}`}>
                  {game.description}
                </p>

                {/* Play Button (for available games) */}
                {game.available && (
                  <div className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold text-sm">
                    Play Now
                  </div>
                )}

                {/* Coming Soon Badge */}
                {!game.available && (
                  <div className="mt-4 px-4 py-2 bg-gray-600/50 rounded-lg text-gray-400 font-semibold text-sm">
                    Coming Soon
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-blue-500/10 backdrop-blur-lg rounded-xl p-6 border border-blue-400/20">
              <h3 className="text-xl font-bold text-white mb-3">🏆 How It Works</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">1.</span>
                  <span>Choose a game and play to get your high score</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">2.</span>
                  <span>Your score is recorded on the Stellar blockchain</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">3.</span>
                  <span>Compete on the leaderboard for the #1 spot</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">4.</span>
                  <span>If you're #1, claim your rewards!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
