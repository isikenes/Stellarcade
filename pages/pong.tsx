import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Leaderboard from '../components/Leaderboard';
import { submitScore } from '../utils/stellar';

const WIDTH = 700;
const HEIGHT = 480;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 12;
const BALL_SIZE = 10;
const PADDLE_SPEED = 8;

export default function Pong() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [username, setUsername] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [leaderboardKey, setLeaderboardKey] = useState(0);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  const [playerX, setPlayerX] = useState(WIDTH / 2 - PADDLE_WIDTH / 2);
  const [aiX, setAiX] = useState(WIDTH / 2 - PADDLE_WIDTH / 2);
  const [ball, setBall] = useState({ x: WIDTH / 2, y: HEIGHT / 2, vx: 4, vy: 4 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const keys = useRef({ left: false, right: false });
  const loopRef = useRef<number | null>(null);

  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress');
    const storedUsername = localStorage.getItem('username');
    const storedHigh = localStorage.getItem('pongHighScore');
    if (!storedAddress || !storedUsername) {
      router.push('/');
      return;
    }
    setWalletAddress(storedAddress);
    setUsername(storedUsername);
    if (storedHigh) setHighScore(parseInt(storedHigh));
  }, [router]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.current.right = true;
      if (e.key === ' ' && !isPlaying) startGame();
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.current.right = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      loopRef.current = window.setInterval(gameLoop, 16);
    }
    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, [isPlaying, gameOver, playerX, aiX, ball]);

  useEffect(() => {
    draw();
  }, [playerX, aiX, ball, score, gameOver]);

  const startGame = () => {
    setPlayerX(WIDTH / 2 - PADDLE_WIDTH / 2);
    setAiX(WIDTH / 2 - PADDLE_WIDTH / 2);
    setBall({ x: WIDTH / 2, y: HEIGHT / 2, vx: 6, vy: -6 });
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setScoreSubmitted(false);
  };

  const gameLoop = () => {
    // player movement
    let px = playerX;
    if (keys.current.left) px = Math.max(0, px - PADDLE_SPEED);
    if (keys.current.right) px = Math.min(WIDTH - PADDLE_WIDTH, px + PADDLE_SPEED);
    setPlayerX(px);

    // AI movement: fast follow ball - catches every time
    let ax = aiX;
    const aiCenter = ax + PADDLE_WIDTH / 2;
    const ballCenter = ball.x + BALL_SIZE / 2;
    
    if (ballCenter < aiCenter) {
      ax = Math.max(0, ax - 8); // Increased from 3 to 8
    }
    if (ballCenter > aiCenter) {
      ax = Math.min(WIDTH - PADDLE_WIDTH, ax + 8); // Increased from 3 to 8
    }
    setAiX(ax);

    // ball physics
    let nb = { ...ball };
    nb.x += nb.vx;
    nb.y += nb.vy;

    // wall collisions
    if (nb.x <= 0 || nb.x >= WIDTH - BALL_SIZE) nb.vx *= -1;

    // paddle collisions with scoring
    // AI paddle at top y = 0..PADDLE_HEIGHT
    if (nb.y <= PADDLE_HEIGHT + 6 && nb.x >= ax && nb.x <= ax + PADDLE_WIDTH) {
      nb.vy *= -1;
      nb.y = PADDLE_HEIGHT + 6;
      // tweak vx based on where hit
      const offset = (nb.x - ax) - PADDLE_WIDTH / 2;
      nb.vx += offset * 0.05;
    }
    
    // player paddle at bottom - SCORE HERE!
    const playerPaddleY = HEIGHT - PADDLE_HEIGHT - 4;
    if (nb.y + BALL_SIZE >= playerPaddleY && nb.x >= px && nb.x <= px + PADDLE_WIDTH) {
      nb.vy *= -1;
      nb.y = playerPaddleY - BALL_SIZE;
      // Score point on successful deflection
      setScore(s => s + 1);
      // Slightly increase ball speed
      nb.vx *= 1.02;
      nb.vy *= 1.02;
      // tweak vx based on where hit
      const offset = (nb.x - px) - PADDLE_WIDTH / 2;
      nb.vx += offset * 0.05;
    }

    // top collision (ball goes past AI - just bounce)
    if (nb.y <= 0) {
      nb.vy *= -1;
      nb.y = 0;
    }

    // bottom collision (game over if ball goes past player)
    if (nb.y >= HEIGHT - BALL_SIZE) {
      setIsPlaying(false);
      setGameOver(true);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('pongHighScore', score.toString());
      }
      setBall(nb);
      return;
    }

    setBall(nb);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Center line
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // AI paddle (top) with glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ef4444';
    ctx.fillStyle = '#f87171';
    ctx.fillRect(aiX, 4, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Player paddle (bottom) with glow
    ctx.shadowColor = '#8b5cf6';
    ctx.fillStyle = '#a78bfa';
    ctx.fillRect(playerX, HEIGHT - PADDLE_HEIGHT - 4, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Ball with glow
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#10b981';
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(ball.x + BALL_SIZE/2, ball.y + BALL_SIZE/2, BALL_SIZE/2, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow for text
    ctx.shadowBlur = 0;

    // HUD
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${score * 10}`, 12, 20);
    ctx.fillText(`High: ${highScore * 10}`, WIDTH - 120, 20);

    if (gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', WIDTH / 2, HEIGHT / 2 - 20);
      ctx.font = '18px Arial';
      ctx.fillText(`Score: ${score * 10}`, WIDTH / 2, HEIGHT / 2 + 10);
      ctx.fillText('Press SPACE to play', WIDTH / 2, HEIGHT / 2 + 40);
      ctx.textAlign = 'start';
    }
  };

  const handleSubmitScore = async () => {
    if (!walletAddress || score === 0 || scoreSubmitted) return;
    setIsSubmitting(true);
    try {
      await submitScore(walletAddress, username, score * 10, 'pong');
      setScoreSubmitted(true);
      setTimeout(() => setLeaderboardKey(prev => prev + 1), 2000);
    } catch (error) {
      setScoreSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Pong - Stellarcade</title>
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <button
                onClick={() => router.push('/home')}
                className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
              >
                <span className="text-2xl">←</span>
                <span className="font-semibold">Back to Games</span>
              </button>
              <h1 className="text-2xl font-bold text-white">🏓 Pong</h1>
              <div className="text-right">
                <p className="text-xs text-gray-400">Playing as</p>
                <p className="text-sm text-purple-400 font-semibold">{username}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Game Area */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                {/* Score Display */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Current Score</p>
                    <p className="text-3xl font-bold text-white">{score * 10}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">High Score</p>
                    <p className="text-3xl font-bold text-purple-400">{highScore * 10}</p>
                  </div>
                </div>

                {/* Canvas */}
                <div className="flex justify-center">
                  <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="border-4 border-purple-500/50 rounded-lg" />
                </div>

                {/* Controls */}
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={startGame}
                    disabled={isPlaying && !gameOver}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                  >
                    {isPlaying ? 'Playing...' : gameOver ? 'Play Again' : 'Start Game'}
                  </button>
                  
                  {gameOver && score > 0 && (
                    <button
                      onClick={handleSubmitScore}
                      disabled={isSubmitting || scoreSubmitted}
                      className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                        scoreSubmitted
                          ? 'bg-green-600 cursor-not-allowed opacity-75'
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                      } text-white`}
                    >
                      {scoreSubmitted ? '✅ Score Submitted!' : isSubmitting ? 'Submitting...' : 'Submit to Blockchain'}
                    </button>
                  )}
                </div>

                {/* Instructions */}
                <div className="mt-6 bg-blue-500/10 rounded-lg p-4 border border-blue-400/20">
                  <h3 className="font-semibold text-white mb-2">How to Play</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Use Arrow Keys or A/D to control the snake</li>
                    <li>• Bounce the ball past the AI to score</li>
                    <li>• Don't let the ball pass your paddle</li>
                    <li>• Submit your score to the blockchain leaderboard</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Leaderboard Sidebar */}
            <div className="lg:col-span-1">
              <Leaderboard key={leaderboardKey} currentUsername={username} gameType="pong" />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
