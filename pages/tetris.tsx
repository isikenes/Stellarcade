import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Leaderboard from '../components/Leaderboard';
import { submitScore } from '../utils/stellar';

export default function TetrisPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [username, setUsername] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [leaderboardKey, setLeaderboardKey] = useState(0);

  // Game constants
  const COLS = 10;
  const ROWS = 20;
  const BLOCK_SIZE = 30;
  const WIDTH = COLS * BLOCK_SIZE;
  const HEIGHT = ROWS * BLOCK_SIZE;

  // Tetromino shapes
  const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]], // Z
  ];

  const COLORS = [
    '#00f0f0', // I - cyan
    '#f0f000', // O - yellow
    '#a000f0', // T - purple
    '#f0a000', // L - orange
    '#0000f0', // J - blue
    '#00f000', // S - green
    '#f00000', // Z - red
  ];

  const [board, setBoard] = useState<number[][]>([]);
  const [currentPiece, setCurrentPiece] = useState<any>(null);
  const gameLoopRef = useRef<number>();
  const dropIntervalRef = useRef<number>(1000);
  const lastDropRef = useRef<number>(0);

  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress');
    const storedUsername = localStorage.getItem('username');

    if (!storedAddress || !storedUsername) {
      router.push('/');
      return;
    }

    setWalletAddress(storedAddress);
    setUsername(storedUsername);

    const storedHigh = localStorage.getItem('tetrisHighScore');
    if (storedHigh) setHighScore(parseInt(storedHigh));

    // Initialize empty board
    const emptyBoard = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    setBoard(emptyBoard);
  }, [router]);

  const createPiece = () => {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    return {
      shape: SHAPES[shapeIndex],
      color: shapeIndex,
      x: Math.floor(COLS / 2) - Math.floor(SHAPES[shapeIndex][0].length / 2),
      y: 0,
    };
  };

  const startGame = () => {
    const emptyBoard = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    setBoard(emptyBoard);
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
    setScoreSubmitted(false);
    setCurrentPiece(createPiece());
    dropIntervalRef.current = 1000;
    lastDropRef.current = Date.now();
  };

  const checkCollision = (piece: any, boardToCheck: number[][], offsetX = 0, offsetY = 0) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x + offsetX;
          const newY = piece.y + y + offsetY;

          if (newX < 0 || newX >= COLS || newY >= ROWS) {
            return true;
          }
          if (newY >= 0 && boardToCheck[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const mergePiece = () => {
    if (!currentPiece) return board;

    const newBoard = board.map(row => [...row]);
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const boardY = currentPiece.y + y;
          const boardX = currentPiece.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.color + 1;
          }
        }
      }
    }
    return newBoard;
  };

  const clearLines = (boardToClear: number[][]) => {
    let linesCleared = 0;
    const newBoard = boardToClear.filter(row => {
      if (row.every(cell => cell !== 0)) {
        linesCleared++;
        return false;
      }
      return true;
    });

    while (newBoard.length < ROWS) {
      newBoard.unshift(Array(COLS).fill(0));
    }

    if (linesCleared > 0) {
      const points = [0, 40, 100, 300, 1200][linesCleared] * level;
      setScore(s => s + points);
      setLines(l => {
        const newLines = l + linesCleared;
        const newLevel = Math.floor(newLines / 10) + 1;
        setLevel(newLevel);
        dropIntervalRef.current = Math.max(100, 1000 - (newLevel - 1) * 100);
        return newLines;
      });
    }

    return newBoard;
  };

  const rotatePiece = () => {
    if (!currentPiece || gameOver || isPaused) return;

    const rotated = currentPiece.shape[0].map((_: any, i: number) =>
      currentPiece.shape.map((row: any) => row[i]).reverse()
    );

    const rotatedPiece = { ...currentPiece, shape: rotated };

    if (!checkCollision(rotatedPiece, board)) {
      setCurrentPiece(rotatedPiece);
    }
  };

  const movePiece = (dx: number, dy: number) => {
    if (!currentPiece || gameOver || isPaused) return;

    if (!checkCollision(currentPiece, board, dx, dy)) {
      setCurrentPiece({ ...currentPiece, x: currentPiece.x + dx, y: currentPiece.y + dy });
      if (dy > 0) {
        lastDropRef.current = Date.now();
      }
    } else if (dy > 0) {
      // Piece hit bottom
      const mergedBoard = mergePiece();
      const clearedBoard = clearLines(mergedBoard);
      setBoard(clearedBoard);

      const newPiece = createPiece();
      if (checkCollision(newPiece, clearedBoard)) {
        // Game over
        setGameOver(true);
        setIsPlaying(false);
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('tetrisHighScore', score.toString());
        }
      } else {
        setCurrentPiece(newPiece);
      }
      lastDropRef.current = Date.now();
    }
  };

  const hardDrop = () => {
    if (!currentPiece || gameOver || isPaused) return;

    let dropDistance = 0;
    while (!checkCollision(currentPiece, board, 0, dropDistance + 1)) {
      dropDistance++;
    }

    movePiece(0, dropDistance);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      // Prevent default behavior for game controls
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' ', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'p', 'P'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          rotatePiece();
          break;
        case ' ':
          hardDrop();
          break;
        case 'p':
        case 'P':
          setIsPaused(p => !p);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentPiece, board, gameOver, isPaused]);

  useEffect(() => {
    if (!isPlaying || gameOver || isPaused || !currentPiece) return;

    const gameLoop = () => {
      const now = Date.now();
      if (now - lastDropRef.current > dropIntervalRef.current) {
        movePiece(0, 1);
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, currentPiece, board, gameOver, isPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check if board is initialized
    if (!board || board.length === 0) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Draw grid
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * BLOCK_SIZE);
      ctx.lineTo(WIDTH, y * BLOCK_SIZE);
      ctx.stroke();
    }
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * BLOCK_SIZE, 0);
      ctx.lineTo(x * BLOCK_SIZE, HEIGHT);
      ctx.stroke();
    }

    // Draw board
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (board[y][x]) {
          ctx.fillStyle = COLORS[board[y][x] - 1];
          ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
          
          // Add shadow effect
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, 5);
        }
      }
    }

    // Draw current piece
    if (currentPiece) {
      ctx.fillStyle = COLORS[currentPiece.color];
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const drawX = currentPiece.x + x;
            const drawY = currentPiece.y + y;
            if (drawY >= 0) {
              ctx.fillRect(drawX * BLOCK_SIZE + 1, drawY * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
              
              // Add shadow effect
              ctx.fillStyle = 'rgba(255,255,255,0.3)';
              ctx.fillRect(drawX * BLOCK_SIZE + 1, drawY * BLOCK_SIZE + 1, BLOCK_SIZE - 2, 5);
              ctx.fillStyle = COLORS[currentPiece.color];
            }
          }
        }
      }
    }

    // Draw game over overlay
    if (gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', WIDTH / 2, HEIGHT / 2 - 20);
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, WIDTH / 2, HEIGHT / 2 + 20);
    }

    // Draw pause overlay
    if (isPaused && !gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', WIDTH / 2, HEIGHT / 2);
      ctx.font = '16px Arial';
      ctx.fillText('Press P to resume', WIDTH / 2, HEIGHT / 2 + 40);
    }
  }, [board, currentPiece, gameOver, isPaused]);

  const handleSubmitScore = async () => {
    if (!walletAddress || score === 0 || scoreSubmitted) return;

    setIsSubmitting(true);
    try {
      await submitScore(walletAddress, username, score, 'tetris');
      setScoreSubmitted(true);

      setTimeout(() => {
        setLeaderboardKey(prev => prev + 1);
      }, 2500);
    } catch (error) {
      setScoreSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Tetris - Stellarcade</title>
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
              <h1 className="text-2xl font-bold text-white">🧱 Tetris</h1>
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
                {/* Stats Display */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Score</p>
                    <p className="text-2xl font-bold text-white">{score}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Lines</p>
                    <p className="text-2xl font-bold text-blue-400">{lines}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Level</p>
                    <p className="text-2xl font-bold text-green-400">{level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">High Score</p>
                    <p className="text-2xl font-bold text-purple-400">{highScore}</p>
                  </div>
                </div>

                {/* Canvas */}
                <div className="flex justify-center">
                  <canvas
                    ref={canvasRef}
                    width={WIDTH}
                    height={HEIGHT}
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

                  {isPlaying && !gameOver && (
                    <button
                      onClick={() => setIsPaused(p => !p)}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all"
                    >
                      {isPaused ? 'Resume' : 'Pause'}
                    </button>
                  )}

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
                    <li>• Arrow Keys or WASD to move and rotate</li>
                    <li>• Space bar for hard drop</li>
                    <li>• P to pause/resume</li>
                    <li>• Clear lines to score points</li>
                    <li>• Submit your score to the blockchain leaderboard</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Leaderboard Sidebar */}
            <div className="lg:col-span-1">
              <Leaderboard key={leaderboardKey} currentUsername={username} gameType="tetris" />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
