import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { submitScore, getTopScore, getLastPlayer, claimReward } from '@/utils/stellar';

export default function Main() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [score, setScore] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Game state
  const [topScore, setTopScore] = useState<number>(0);
  const [topPlayer, setTopPlayer] = useState<string>('None');
  const [lastPlayer, setLastPlayer] = useState<string>('None');
  const [isTopPlayer, setIsTopPlayer] = useState(false);

  useEffect(() => {
    // Check if wallet is connected
    const address = localStorage.getItem('walletAddress');
    if (!address) {
      router.push('/');
      return;
    }
    setWalletAddress(address);
    
    // Load game data
    loadGameData();
  }, [router]);

  const loadGameData = async () => {
    try {
      // Get top score
      const topScoreResult = await getTopScore();
      if (topScoreResult.success && topScoreResult.data) {
        // Parse the PlayerScore structure
        if (topScoreResult.data && typeof topScoreResult.data === 'object') {
          const data = topScoreResult.data as any;
          if (data.score !== undefined) {
            setTopScore(data.score);
          }
          if (data.player) {
            // Convert address to readable format
            const playerAddr = typeof data.player === 'string' ? data.player : data.player.toString();
            setTopPlayer(playerAddr.slice(0, 8) + '...' + playerAddr.slice(-4));
            
            // Check if current user is top player
            if (playerAddr === walletAddress) {
              setIsTopPlayer(true);
            }
          }
        }
      }

      // Get last player
      const lastPlayerResult = await getLastPlayer();
      if (lastPlayerResult.success && lastPlayerResult.data) {
        const playerAddr = typeof lastPlayerResult.data === 'string' 
          ? lastPlayerResult.data 
          : lastPlayerResult.data.toString();
        setLastPlayer(playerAddr.slice(0, 8) + '...' + playerAddr.slice(-4));
      }
    } catch (error) {
      // Silently fail
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('walletAddress');
    router.push('/');
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      setMessage({ type: 'error', text: 'Please enter your player name' });
      return;
    }

    const scoreNum = parseInt(score);
    if (isNaN(scoreNum) || scoreNum < 0) {
      setMessage({ type: 'error', text: 'Please enter a valid score' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await submitScore(walletAddress, playerName, scoreNum);
      
      if (result.success) {
        setMessage({ type: 'success', text: `Score ${scoreNum} submitted successfully! Refreshing leaderboard...` });
        
        // Clear form
        setScore('');
        
        // Wait a moment for the blockchain to process, then reload game data
        setTimeout(async () => {
          await loadGameData();
          setMessage({ type: 'success', text: `Score ${scoreNum} submitted successfully!` });
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to submit score' });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to submit score' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimReward = async () => {
    setIsClaiming(true);
    setMessage(null);

    try {
      const result = await claimReward(walletAddress);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Reward claimed successfully! 🎉' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to claim reward' });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to claim reward' 
      });
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <>
      <Head>
        <title>Stellarcade - Play & Earn</title>
        <meta name="description" content="Submit your arcade scores and earn rewards" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">🎮 Stellarcade</h1>
            <div className="flex gap-2">
              <button
                onClick={loadGameData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                title="Refresh scores from blockchain"
              >
                🔄 Refresh
              </button>
              <button
                onClick={handleDisconnect}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>

          {/* Wallet Info */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6 border border-white/20">
            <p className="text-gray-300 text-sm">
              Connected: <span className="text-blue-400 font-mono">{walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Submit Score Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">Submit Your Score</h2>
              
              <form onSubmit={handleSubmitScore} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">
                    Player Name
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">
                    Score
                  </label>
                  <input
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="Enter your score"
                    min="0"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all transform ${
                    isSubmitting
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 hover:scale-105 active:scale-95'
                  } text-white`}
                >
                  {isSubmitting ? 'Submitting...' : '🚀 Submit Score'}
                </button>
              </form>
            </div>

            {/* Leaderboard Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">🏆 Leaderboard</h2>
              
              <div className="space-y-4">
                {/* Top Score */}
                <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm font-semibold mb-1">TOP SCORE</p>
                  <p className="text-white text-3xl font-bold">{topScore}</p>
                  <p className="text-gray-300 text-sm mt-1">by {topPlayer}</p>
                </div>

                {/* Last Player */}
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                  <p className="text-blue-400 text-sm font-semibold mb-1">LAST PLAYER</p>
                  <p className="text-white text-lg">{lastPlayer}</p>
                </div>

                {/* Claim Reward Button */}
                {isTopPlayer && (
                  <button
                    onClick={handleClaimReward}
                    disabled={isClaiming}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all transform ${
                      isClaiming
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 active:scale-95'
                    } text-white`}
                  >
                    {isClaiming ? 'Claiming...' : '🎁 Claim Reward'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mt-6 rounded-lg p-4 border ${
              message.type === 'success'
                ? 'bg-green-500/20 border-green-400/30'
                : 'bg-red-500/20 border-red-400/30'
            }`}>
              <p className={`text-sm ${
                message.type === 'success' ? 'text-green-200' : 'text-red-200'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h3 className="text-white font-semibold mb-2">ℹ️ How it works</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Submit your arcade game score</li>
              <li>• Scores are stored on Stellar blockchain</li>
              <li>• Top scorer can claim rewards</li>
              <li>• All transactions are secured by Stellar Soroban</li>
              <li>• 💰 Each transaction requires a small XLM fee (normal on blockchain)</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
