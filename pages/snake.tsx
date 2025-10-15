import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Leaderboard from '../components/Leaderboard';
import { submitScore } from '../utils/stellar';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

export default function SnakeGame() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [username, setUsername] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [leaderboardKey, setLeaderboardKey] = useState(0);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  
  // Game state
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const directionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check authentication
    const storedAddress = localStorage.getItem('walletAddress');
    const storedUsername = localStorage.getItem('username');
    const storedHighScore = localStorage.getItem('snakeHighScore');
    
    if (!storedAddress || !storedUsername) {
      router.push('/');
      return;
    }

    setWalletAddress(storedAddress);
    setUsername(storedUsername);
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore));
    }
  }, [router]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) {
        if (e.key === ' ') {
          e.preventDefault();
          startGame();
        }
        return;
      }

      const currentDirection = directionRef.current;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDirection !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDirection !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDirection !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDirection !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, gameOver]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(() => {
        moveSnake();
      }, INITIAL_SPEED);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, snake, direction]);

  useEffect(() => {
    drawGame();
  }, [snake, food, gameOver]);

  const generateFood = (): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  };

  const startGame = () => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood());
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
    setScoreSubmitted(false); // Reset submission flag for new game
  };

  const moveSnake = () => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const currentDirection = directionRef.current;
      let newHead: Position;

      switch (currentDirection) {
        case 'UP':
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case 'DOWN':
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case 'LEFT':
          newHead = { x: head.x - 1, y: head.y };
          break;
        case 'RIGHT':
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Check wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        endGame();
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        endGame();
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  };

  const endGame = () => {
    setGameOver(true);
    setIsPlaying(false);
    
    // Update high score
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', score.toString());
    }
  };

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#2a2a4e';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(canvas.width, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#00ff88' : '#00cc66';
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
      
      if (index === 0) {
        // Draw eyes on head
        ctx.fillStyle = '#000';
        ctx.fillRect(segment.x * CELL_SIZE + 5, segment.y * CELL_SIZE + 5, 3, 3);
        ctx.fillRect(segment.x * CELL_SIZE + 12, segment.y * CELL_SIZE + 5, 3, 3);
      }
    });

    // Draw food
    ctx.fillStyle = '#ff0066';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Game over overlay
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
      
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
      
      ctx.font = '16px Arial';
      ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 50);
    }

    if (!isPlaying && !gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Press SPACE to start', canvas.width / 2, canvas.height / 2);
      
      ctx.font = '14px Arial';
      ctx.fillText('Use Arrow Keys or WASD', canvas.width / 2, canvas.height / 2 + 30);
    }
  };

  const handleSubmitScore = async () => {
    if (!walletAddress || score === 0 || scoreSubmitted) return;

    setIsSubmitting(true);
    try {
      await submitScore(walletAddress, username, score);
      setScoreSubmitted(true);
      
      // Wait for blockchain to process, then refresh leaderboard
      setTimeout(() => {
        setLeaderboardKey(prev => prev + 1);
      }, 2000);
    } catch (error) {
      setScoreSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Snake Game - Stellarcade</title>
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
              <h1 className="text-2xl font-bold text-white">🐍 Snake Game</h1>
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
                    <p className="text-3xl font-bold text-white">{score}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">High Score</p>
                    <p className="text-3xl font-bold text-purple-400">{highScore}</p>
                  </div>
                </div>

                {/* Canvas */}
                <div className="flex justify-center">
                  <canvas
                    ref={canvasRef}
                    width={GRID_SIZE * CELL_SIZE}
                    height={GRID_SIZE * CELL_SIZE}
                    className="border-4 border-purple-500/50 rounded-lg"
                  />
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
                    <li>• Use Arrow Keys or WASD to control the snake</li>
                    <li>• Eat the red dots to grow and gain points</li>
                    <li>• Don't hit the walls or yourself</li>
                    <li>• Submit your score to the blockchain leaderboard</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Leaderboard Sidebar */}
            <div className="lg:col-span-1">
              <Leaderboard key={leaderboardKey} currentUsername={username} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
