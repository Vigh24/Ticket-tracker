import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const FlappyGame = ({ isOpen, onClose }) => {
  const canvasRef = useRef(null);
  const gameStateRef = useRef({});
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [muted, setMuted] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [showMenu, setShowMenu] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Load high score from localStorage
    const savedHigh = parseInt(localStorage.getItem('tickettrack-flappy-high') || '0', 10);
    setHighScore(savedHigh);

    // Game state
    let bird, pipes, frames, running, gameOver, currentScore;
    let gravity, flapPower, pipeGap, speed, pipeSpace;

    // Difficulty presets
    const DIFF = {
      easy: { gravity: 0.45, flap: -9.5, pipeGap: 190, speed: 2.0, pipeSpace: 200 },
      medium: { gravity: 0.58, flap: -10.5, pipeGap: 150, speed: 2.6, pipeSpace: 180 },
      hard: { gravity: 0.72, flap: -12.0, pipeGap: 130, speed: 3.2, pipeSpace: 160 },
    };

    function createBird() {
      return { x: W * 0.28, y: H / 2, vy: 0, radius: 16, wing: 0 };
    }

    function setGameDifficulty(name) {
      const d = DIFF[name] || DIFF.medium;
      gravity = d.gravity;
      flapPower = d.flap;
      pipeGap = d.pipeGap;
      speed = d.speed;
      pipeSpace = d.pipeSpace;
    }

    function reset() {
      bird = createBird();
      pipes = [];
      frames = 0;
      running = false;
      gameOver = false;
      currentScore = 0;
      setScore(0);
    }

    function spawnPipe() {
      const minTop = 60;
      const maxTop = H - 160 - pipeGap;
      const top = Math.max(minTop, Math.random() * (maxTop - minTop) + minTop);
      pipes.push({ x: W + 30, top, passed: false });
    }

    // Simple beep using WebAudio
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const audio = AudioCtx ? new AudioCtx() : null;
    
    function beep(freq = 440, time = 0.05, vol = 0.06) {
      if (muted || !audio) return;
      try {
        const o = audio.createOscillator();
        const g = audio.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.value = vol;
        o.connect(g);
        g.connect(audio.destination);
        o.start();
        o.stop(audio.currentTime + time);
      } catch (e) {
        // Ignore audio errors
      }
    }

    function flap() {
      if (gameOver) {
        reset();
        setShowMenu(true);
        return;
      }
      bird.vy = flapPower;
      bird.wing = 6;
      beep(880, 0.04);
      running = true;
      setShowMenu(false);
    }

    // Collision detection
    function circleRect(cx, cy, r, rx, ry, rw, rh) {
      const nearestX = Math.max(rx, Math.min(cx, rx + rw));
      const nearestY = Math.max(ry, Math.min(cy, ry + rh));
      const dx = cx - nearestX;
      const dy = cy - nearestY;
      return (dx * dx + dy * dy) <= r * r;
    }

    function collides(pipe) {
      const bx = bird.x;
      const by = bird.y;
      const br = bird.radius;
      const pw = 56;
      const upper = { x: pipe.x, y: 0, w: pw, h: pipe.top };
      const lower = { x: pipe.x, y: pipe.top + pipeGap, w: pw, h: H - (pipe.top + pipeGap) - 80 };
      return circleRect(bx, by, br, upper.x, upper.y, upper.w, upper.h) ||
             circleRect(bx, by, br, lower.x, lower.y, lower.w, lower.h);
    }

    // Drawing functions
    function drawBackground() {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      if (isDarkMode) {
        grad.addColorStop(0, '#374151');
        grad.addColorStop(1, '#1f2937');
      } else {
        grad.addColorStop(0, '#9be6ef');
        grad.addColorStop(1, '#70c5ce');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      
      // Ground
      ctx.fillStyle = isDarkMode ? '#4b5563' : '#ded895';
      ctx.fillRect(0, H - 80, W, 80);
    }

    function drawPipes() {
      ctx.fillStyle = isDarkMode ? '#059669' : '#2d8c3e';
      for (const p of pipes) {
        const pw = 56;
        // Top pipe
        ctx.fillRect(p.x, 0, pw, p.top);
        // Top cap
        ctx.fillStyle = isDarkMode ? '#047857' : '#1f6b2b';
        ctx.fillRect(p.x - 2, p.top - 12, pw + 4, 12);
        // Bottom pipe
        ctx.fillStyle = isDarkMode ? '#059669' : '#2d8c3e';
        ctx.fillRect(p.x, p.top + pipeGap, pw, H - (p.top + pipeGap) - 80);
        // Bottom cap
        ctx.fillStyle = isDarkMode ? '#047857' : '#1f6b2b';
        ctx.fillRect(p.x - 2, p.top + pipeGap, pw + 4, 12);
        ctx.fillStyle = isDarkMode ? '#059669' : '#2d8c3e';
      }
    }

    function drawBird() {
      const b = bird;
      // Shadow
      ctx.beginPath();
      ctx.ellipse(b.x, b.y + 14, b.radius * 0.9, b.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fill();
      
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.vy / 12);
      
      // Body
      ctx.fillStyle = isDarkMode ? '#fbbf24' : '#ffcb05';
      ctx.beginPath();
      ctx.ellipse(0, 0, b.radius + 4, b.radius, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Eye
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(6, -4, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Beak
      ctx.fillStyle = '#ff8a00';
      ctx.beginPath();
      ctx.moveTo(b.radius + 2, 0);
      ctx.lineTo(b.radius + 12, 4);
      ctx.lineTo(b.radius + 2, 7);
      ctx.closePath();
      ctx.fill();
      
      // Wing
      ctx.fillStyle = isDarkMode ? '#d97706' : '#e6a700';
      ctx.beginPath();
      const wingY = Math.sin(b.wing / 3 || 0) * 6;
      ctx.ellipse(-2, wingY, 12, 6, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }

    function drawGameOver() {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, W, H);
      
      ctx.fillStyle = isDarkMode ? '#f3f4f6' : '#fff';
      ctx.textAlign = 'center';
      ctx.font = '36px system-ui, Arial';
      ctx.fillText('Game Over', W / 2, H * 0.44);
      
      ctx.font = '18px system-ui, Arial';
      ctx.fillText(`Score: ${currentScore}  High: ${highScore}`, W / 2, H * 0.52);
      
      ctx.font = '14px system-ui, Arial';
      ctx.fillText('Click or press Space to restart', W / 2, H * 0.6);
      
      ctx.restore();
    }

    function update() {
      frames++;
      
      // Ground collision
      if (bird.y + bird.radius > H - 80) {
        bird.y = H - 80 - bird.radius;
        endGame();
      }
      
      if (!running) return;

      // Spawn pipes
      if (frames % Math.max(1, Math.floor(pipeSpace / speed)) === 0) {
        spawnPipe();
      }

      // Update pipes
      for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i];
        p.x -= speed;
        
        if (!p.passed && p.x + 56 < bird.x) {
          p.passed = true;
          currentScore++;
          setScore(currentScore);
          beep(600, 0.04);
          
          if (currentScore > highScore) {
            const newHigh = currentScore;
            setHighScore(newHigh);
            localStorage.setItem('tickettrack-flappy-high', newHigh.toString());
          }
        }
        
        if (p.x < -100) {
          pipes.splice(i, 1);
        }
        
        if (collides(p)) {
          endGame();
        }
      }

      // Bird physics
      bird.vy += gravity;
      bird.y += bird.vy;
      bird.wing = Math.max(0, bird.wing - 0.6);
    }

    function endGame() {
      if (!gameOver) {
        beep(180, 0.2, 0.12);
        gameOver = true;
        running = false;
      }
    }

    function render() {
      ctx.clearRect(0, 0, W, H);
      drawBackground();
      drawPipes();
      drawBird();
      
      if (gameOver) {
        drawGameOver();
      }
    }

    function gameLoop() {
      update();
      render();
      gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
    }

    // Event handlers
    function handleKeyDown(e) {
      if (e.code === 'Space') {
        e.preventDefault();
        flap();
      }
    }

    function handleCanvasClick(e) {
      e.preventDefault();
      flap();
    }

    // Initialize game
    setGameDifficulty(difficulty);
    reset();
    
    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('pointerdown', handleCanvasClick);
    
    // Start game loop
    gameLoop();

    // Store game functions for external control
    gameStateRef.current = {
      reset: () => {
        reset();
        setShowMenu(true);
      },
      setDifficulty: (diff) => {
        setGameDifficulty(diff);
        reset();
        setShowMenu(false);
        running = true;
      }
    };

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('pointerdown', handleCanvasClick);
      if (gameStateRef.current.animationId) {
        cancelAnimationFrame(gameStateRef.current.animationId);
      }
    };
  }, [isOpen, muted, difficulty, isDarkMode]);

  const handleDifficultySelect = (diff) => {
    setDifficulty(diff);
    if (gameStateRef.current.setDifficulty) {
      gameStateRef.current.setDifficulty(diff);
    }
    setShowMenu(false);
  };

  const handleRestart = () => {
    if (gameStateRef.current.reset) {
      gameStateRef.current.reset();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-white/30 dark:border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-gray-700/50">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            🎮 Flappy Easter Egg
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Game Canvas */}
        <div className="p-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={480}
              height={400}
              className="w-full h-auto border border-white/30 dark:border-gray-700/50 rounded-lg shadow-lg"
            />
            
            {/* Game Menu Overlay */}
            {showMenu && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg"
              >
                <div className="text-center p-6">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                    Choose Difficulty
                  </h3>
                  <div className="flex gap-3 justify-center mb-4">
                    <button
                      onClick={() => handleDifficultySelect('easy')}
                      className="px-4 py-2 bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-lg hover:bg-green-300 dark:hover:bg-green-800/50 transition-colors"
                    >
                      Easy
                    </button>
                    <button
                      onClick={() => handleDifficultySelect('medium')}
                      className="px-4 py-2 bg-yellow-200 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded-lg hover:bg-yellow-300 dark:hover:bg-yellow-800/50 transition-colors"
                    >
                      Medium
                    </button>
                    <button
                      onClick={() => handleDifficultySelect('hard')}
                      className="px-4 py-2 bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded-lg hover:bg-red-300 dark:hover:bg-red-800/50 transition-colors"
                    >
                      Hard
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click, tap, or press <strong>Space</strong> to flap
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Game HUD */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Score: <strong className="text-gray-800 dark:text-gray-200">{score}</strong>
              {' | '}
              High: <strong className="text-gray-800 dark:text-gray-200">{highScore}</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white/50 dark:bg-gray-700/50 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300">
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </span>
              <button
                onClick={() => setMuted(!muted)}
                className="p-2 bg-white/50 dark:bg-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-600/50 rounded-lg transition-colors"
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button
                onClick={handleRestart}
                className="p-2 bg-white/50 dark:bg-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-600/50 rounded-lg transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FlappyGame;
