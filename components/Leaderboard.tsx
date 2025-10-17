import { useState, useEffect } from 'react';
import { getLeaderboard, claimReward, hasClaimedReward } from '../utils/stellar';

interface LeaderboardEntry {
  rank: number;
  username: string;
  address: string;
  score: number;
  isCurrentUser: boolean;
}

interface LeaderboardProps {
  currentUsername: string;
  gameType: 'snake' | 'pong';
}

export default function Leaderboard({ currentUsername, gameType }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUserAddress, setCurrentUserAddress] = useState('');
  const [rewardClaimed, setRewardClaimed] = useState(false);

  useEffect(() => {
    const address = localStorage.getItem('walletAddress') || '';
    setCurrentUserAddress(address);
    loadLeaderboard();
  }, [gameType]); // Added gameType to dependencies

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await getLeaderboard(gameType);
      const userAddress = localStorage.getItem('walletAddress') || '';
      const currentUser = localStorage.getItem('username') || '';
      
      const formattedEntries: LeaderboardEntry[] = data.map((entry, index) => ({
        rank: index + 1,
        username: entry.username,
        address: entry.address,
        score: entry.score,
        isCurrentUser: entry.address === userAddress && entry.username === currentUser,
      }));

      setEntries(formattedEntries);
      
      // Check if reward has been claimed
      const claimed = await hasClaimedReward(gameType);
      setRewardClaimed(claimed);
    } catch (error) {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLeaderboard();
    setIsRefreshing(false);
  };

  const handleClaimReward = async () => {
    if (!currentUserAddress) return;

    const topEntry = entries[0];
    if (!topEntry || !topEntry.isCurrentUser) return;

    setIsClaiming(true);
    try {
      await claimReward(currentUserAddress, gameType);
      
      // Wait for blockchain to process, then refresh
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadLeaderboard();
    } catch (error) {
      // Silently fail
    } finally {
      setIsClaiming(false);
    }
  };

  const isTopPlayer = entries.length > 0 && entries[0].isCurrentUser;
  const canClaimReward = isTopPlayer && !rewardClaimed;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 sticky top-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">🏆 Leaderboard</h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh leaderboard"
        >
          <span className={`text-xl ${isRefreshing ? 'animate-spin inline-block' : ''}`}>
            🔄
          </span>
        </button>
      </div>

      {/* Claim Reward Button (for #1 player) */}
      {canClaimReward && (
        <button
          onClick={handleClaimReward}
          disabled={isClaiming}
          className="w-full mb-4 py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg animate-pulse"
        >
          {isClaiming ? 'Claiming...' : '🎁 Claim Your Reward!'}
        </button>
      )}
      
      {/* Already Claimed Message */}
      {isTopPlayer && rewardClaimed && (
        <div className="mb-4 py-3 px-4 bg-green-500/20 border border-green-400/30 rounded-lg text-center">
          <p className="text-green-300 font-semibold">✅ Reward Already Claimed!</p>
          <p className="text-xs text-green-400 mt-1">Keep playing to claim again</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin text-4xl">⏳</div>
        </div>
      )}

      {/* Leaderboard Entries */}
      {!isLoading && entries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No scores yet</p>
          <p className="text-sm text-gray-500 mt-2">Be the first to play!</p>
        </div>
      )}

      {!isLoading && entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={`${entry.address}-${entry.rank}`}
              className={`p-4 rounded-lg transition-all ${
                entry.isCurrentUser
                  ? 'bg-purple-500/30 border-2 border-purple-400 shadow-lg'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Rank and Username */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span
                    className={`text-2xl font-bold ${
                      entry.rank === 1
                        ? 'text-yellow-400'
                        : entry.rank === 2
                        ? 'text-gray-300'
                        : entry.rank === 3
                        ? 'text-orange-400'
                        : 'text-gray-500'
                    }`}
                  >
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold truncate ${
                        entry.isCurrentUser ? 'text-purple-300' : 'text-white'
                      }`}
                    >
                      {entry.username}
                      {entry.isCurrentUser && ' (You)'}
                    </p>
                    <p className="text-xs text-gray-400 truncate font-mono">
                      {entry.address.slice(0, 8)}...{entry.address.slice(-4)}
                    </p>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-xl font-bold text-white">{entry.score}</p>
                  <p className="text-xs text-gray-400">points</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-xs text-gray-400 text-center">
          Scores are stored on the Stellar blockchain
        </p>
      </div>
    </div>
  );
}
