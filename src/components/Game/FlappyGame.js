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
    let particles = [];
    let clouds = [];
    let stars = [];

    // Difficulty presets
    const DIFF = {
      easy: { gravity: 0.45, flap: -9.5, pipeGap: 190, speed: 2.0, pipeSpace: 200 },
      medium: { gravity: 0.58, flap: -10.5, pipeGap: 150, speed: 2.6, pipeSpace: 180 },
      hard: { gravity: 0.72, flap: -12.0, pipeGap: 130, speed: 3.2, pipeSpace: 160 },
    };

    function createBird() {
      return {
        x: W * 0.28,
        y: H / 2,
        vy: 0,
        radius: 16,
        wing: 0,
        rotation: 0,
        trail: []
      };
    }

    // Particle system
    function createParticle(x, y, type = 'flap') {
      const colors = {
        flap: ['#ffeb3b', '#ffc107', '#ff9800'],
        score: ['#4caf50', '#8bc34a', '#cddc39'],
        explosion: ['#f44336', '#ff5722', '#ff9800']
      };

      return {
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.02,
        size: 2 + Math.random() * 3,
        color: colors[type][Math.floor(Math.random() * colors[type].length)],
        type
      };
    }

    function createCloud() {
      return {
        x: W + 50,
        y: 50 + Math.random() * 100,
        size: 20 + Math.random() * 30,
        speed: 0.3 + Math.random() * 0.5,
        opacity: 0.3 + Math.random() * 0.4
      };
    }

    function createStar() {
      return {
        x: Math.random() * W,
        y: Math.random() * H * 0.6,
        size: 1 + Math.random() * 2,
        twinkle: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.02
      };
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
      particles = [];
      frames = 0;
      running = false;
      gameOver = false;
      currentScore = 0;
      setScore(0);

      // Initialize background elements
      clouds = [];
      for (let i = 0; i < 3; i++) {
        clouds.push({
          ...createCloud(),
          x: Math.random() * W
        });
      }

      if (isDarkMode) {
        stars = [];
        for (let i = 0; i < 20; i++) {
          stars.push(createStar());
        }
      }
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
      bird.rotation = -0.3;

      // Add flap particles
      for (let i = 0; i < 5; i++) {
        particles.push(createParticle(bird.x - 10, bird.y + 5, 'flap'));
      }

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
      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      if (isDarkMode) {
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(0.5, '#334155');
        grad.addColorStop(1, '#475569');
      } else {
        grad.addColorStop(0, '#87ceeb');
        grad.addColorStop(0.3, '#9be6ef');
        grad.addColorStop(1, '#70c5ce');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Draw stars in dark mode
      if (isDarkMode) {
        ctx.fillStyle = '#fbbf24';
        for (const star of stars) {
          const alpha = 0.5 + 0.5 * Math.sin(star.twinkle);
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
          star.twinkle += star.speed;
        }
        ctx.globalAlpha = 1;
      }

      // Draw clouds
      ctx.fillStyle = isDarkMode ? 'rgba(148, 163, 184, 0.3)' : 'rgba(255, 255, 255, 0.6)';
      for (const cloud of clouds) {
        ctx.globalAlpha = cloud.opacity;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.5, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
        ctx.arc(cloud.x - cloud.size * 0.5, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Enhanced ground with texture
      const groundGrad = ctx.createLinearGradient(0, H - 80, 0, H);
      if (isDarkMode) {
        groundGrad.addColorStop(0, '#4b5563');
        groundGrad.addColorStop(1, '#374151');
      } else {
        groundGrad.addColorStop(0, '#ded895');
        groundGrad.addColorStop(1, '#c4b56a');
      }
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, H - 80, W, 80);

      // Ground texture
      ctx.strokeStyle = isDarkMode ? '#6b7280' : '#b8a65c';
      ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, H - 80);
        ctx.lineTo(i, H);
        ctx.stroke();
      }
    }

    function drawPipes() {
      for (const p of pipes) {
        const pw = 56;

        // Pipe shadows
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(p.x + 3, 3, pw, p.top);
        ctx.fillRect(p.x + 3, p.top + pipeGap + 3, pw, H - (p.top + pipeGap) - 80);

        // Pipe gradient
        const pipeGrad = ctx.createLinearGradient(p.x, 0, p.x + pw, 0);
        if (isDarkMode) {
          pipeGrad.addColorStop(0, '#065f46');
          pipeGrad.addColorStop(0.5, '#059669');
          pipeGrad.addColorStop(1, '#047857');
        } else {
          pipeGrad.addColorStop(0, '#22543d');
          pipeGrad.addColorStop(0.5, '#2d8c3e');
          pipeGrad.addColorStop(1, '#1f6b2b');
        }

        // Top pipe body
        ctx.fillStyle = pipeGrad;
        ctx.fillRect(p.x, 0, pw, p.top);

        // Top pipe cap with gradient
        const capGrad = ctx.createLinearGradient(p.x - 2, p.top - 12, p.x + pw + 2, p.top);
        capGrad.addColorStop(0, isDarkMode ? '#047857' : '#1f6b2b');
        capGrad.addColorStop(0.5, isDarkMode ? '#065f46' : '#22543d');
        capGrad.addColorStop(1, isDarkMode ? '#047857' : '#1f6b2b');
        ctx.fillStyle = capGrad;
        ctx.fillRect(p.x - 2, p.top - 12, pw + 4, 12);

        // Bottom pipe body
        ctx.fillStyle = pipeGrad;
        ctx.fillRect(p.x, p.top + pipeGap, pw, H - (p.top + pipeGap) - 80);

        // Bottom pipe cap
        ctx.fillStyle = capGrad;
        ctx.fillRect(p.x - 2, p.top + pipeGap, pw + 4, 12);

        // Pipe highlights
        ctx.strokeStyle = isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(72, 187, 120, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x + 5, 0);
        ctx.lineTo(p.x + 5, p.top);
        ctx.moveTo(p.x + 5, p.top + pipeGap);
        ctx.lineTo(p.x + 5, H - 80);
        ctx.stroke();
      }
    }

    function drawBird() {
      const b = bird;

      // Update bird trail
      b.trail.push({ x: b.x, y: b.y, alpha: 1 });
      if (b.trail.length > 8) b.trail.shift();

      // Draw trail
      for (let i = 0; i < b.trail.length; i++) {
        const trail = b.trail[i];
        const alpha = (i / b.trail.length) * 0.3;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = isDarkMode ? '#fbbf24' : '#ffcb05';
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, b.radius * (0.5 + i / b.trail.length * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Enhanced shadow with blur effect
      ctx.save();
      ctx.filter = 'blur(3px)';
      ctx.beginPath();
      ctx.ellipse(b.x + 2, b.y + 16, b.radius * 0.9, b.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(b.x, b.y);

      // Smooth rotation based on velocity
      b.rotation = Math.max(-0.5, Math.min(0.5, b.vy / 15));
      ctx.rotate(b.rotation);

      // Body with gradient
      const bodyGrad = ctx.createRadialGradient(-5, -5, 0, 0, 0, b.radius + 4);
      if (isDarkMode) {
        bodyGrad.addColorStop(0, '#fde047');
        bodyGrad.addColorStop(1, '#eab308');
      } else {
        bodyGrad.addColorStop(0, '#fef08a');
        bodyGrad.addColorStop(1, '#f59e0b');
      }
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, b.radius + 4, b.radius, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body outline
      ctx.strokeStyle = isDarkMode ? '#ca8a04' : '#d97706';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Eye with highlight
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(6, -4, 4, 0, Math.PI * 2);
      ctx.fill();

      // Eye highlight
      ctx.fillStyle = '#f3f4f6';
      ctx.beginPath();
      ctx.arc(7, -5, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Enhanced beak with gradient
      const beakGrad = ctx.createLinearGradient(b.radius, -2, b.radius + 12, 6);
      beakGrad.addColorStop(0, '#fb923c');
      beakGrad.addColorStop(1, '#ea580c');
      ctx.fillStyle = beakGrad;
      ctx.beginPath();
      ctx.moveTo(b.radius + 2, 0);
      ctx.lineTo(b.radius + 12, 4);
      ctx.lineTo(b.radius + 2, 7);
      ctx.closePath();
      ctx.fill();

      // Wing with animation
      const wingGrad = ctx.createRadialGradient(-2, 0, 0, -2, 0, 12);
      if (isDarkMode) {
        wingGrad.addColorStop(0, '#f59e0b');
        wingGrad.addColorStop(1, '#d97706');
      } else {
        wingGrad.addColorStop(0, '#fbbf24');
        wingGrad.addColorStop(1, '#f59e0b');
      }
      ctx.fillStyle = wingGrad;
      ctx.beginPath();
      const wingY = Math.sin((b.wing || 0) / 3) * 8;
      const wingRotation = Math.sin((b.wing || 0) / 2) * 0.3;
      ctx.save();
      ctx.rotate(wingRotation);
      ctx.ellipse(-2, wingY, 14, 8, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }

    function drawParticles() {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect for score particles
        if (p.type === 'score') {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.fill();
        }

        ctx.restore();

        // Update particle
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        p.vy += 0.1; // gravity

        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }
    }

    function updateBackground() {
      // Update clouds
      for (const cloud of clouds) {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.size < 0) {
          cloud.x = W + cloud.size;
          cloud.y = 50 + Math.random() * 100;
        }
      }
    }

    function drawGameOver() {
      ctx.save();

      // Animated background overlay
      const overlayAlpha = 0.7 + 0.1 * Math.sin(frames * 0.05);
      ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
      ctx.fillRect(0, 0, W, H);

      // Game over text with glow
      ctx.shadowColor = isDarkMode ? '#3b82f6' : '#1d4ed8';
      ctx.shadowBlur = 20;
      ctx.fillStyle = isDarkMode ? '#f3f4f6' : '#fff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 36px system-ui, Arial';
      ctx.fillText('Game Over', W / 2, H * 0.44);

      ctx.shadowBlur = 10;
      ctx.font = '18px system-ui, Arial';
      ctx.fillText(`Score: ${currentScore}  High: ${highScore}`, W / 2, H * 0.52);

      ctx.shadowBlur = 5;
      ctx.font = '14px system-ui, Arial';
      ctx.fillText('Click or press Space to restart', W / 2, H * 0.6);

      ctx.restore();
    }

    function update() {
      frames++;

      // Update background elements
      updateBackground();

      // Ground collision
      if (bird.y + bird.radius > H - 80) {
        bird.y = H - 80 - bird.radius;
        // Add explosion particles
        for (let i = 0; i < 10; i++) {
          particles.push(createParticle(bird.x, bird.y, 'explosion'));
        }
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

          // Add score particles
          for (let j = 0; j < 8; j++) {
            particles.push(createParticle(bird.x, bird.y, 'score'));
          }

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
          // Add collision particles
          for (let j = 0; j < 15; j++) {
            particles.push(createParticle(bird.x, bird.y, 'explosion'));
          }
          endGame();
        }
      }

      // Bird physics
      bird.vy += gravity;
      bird.y += bird.vy;
      bird.wing = Math.max(0, bird.wing - 0.6);

      // Smooth rotation decay
      bird.rotation *= 0.95;
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
      drawParticles();
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
        className="relative w-full max-w-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/40 dark:border-gray-700/60 rounded-3xl shadow-2xl dark:shadow-gray-900/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(55, 65, 81, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/30 dark:border-gray-700/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-2xl"
            >
              🎮
            </motion.div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Flappy Easter Egg
            </h2>
          </div>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 hover:bg-white/20 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 group"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors" />
          </motion.button>
        </div>

        {/* Game Canvas */}
        <div className="p-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={480}
              height={400}
              className="w-full h-auto border-2 border-white/40 dark:border-gray-700/60 rounded-2xl shadow-xl dark:shadow-gray-900/30"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)'
              }}
            />

            {/* Game Menu Overlay */}
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl"
              >
                <div className="text-center p-8">
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-6">
                      Choose Your Challenge
                    </h3>
                  </motion.div>

                  <motion.div
                    className="flex gap-4 justify-center mb-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.button
                      onClick={() => handleDifficultySelect('easy')}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-green-400 to-green-500 dark:from-green-500 dark:to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      🟢 Easy
                    </motion.button>
                    <motion.button
                      onClick={() => handleDifficultySelect('medium')}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      🟡 Medium
                    </motion.button>
                    <motion.button
                      onClick={() => handleDifficultySelect('hard')}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 dark:from-red-600 dark:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      🔴 Hard
                    </motion.button>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-700/50 rounded-lg p-3"
                  >
                    <span className="font-medium">Controls:</span> Click, tap, or press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">Space</kbd> to flap
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Game HUD */}
          <motion.div
            className="flex items-center justify-between mt-6 p-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/30"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-6">
              <motion.div
                className="text-center"
                animate={{ scale: score > 0 ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Score</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{score}</div>
              </motion.div>

              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>

              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Best</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{highScore}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.div
                className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30 dark:border-purple-500/30"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
              </motion.div>

              <motion.button
                onClick={() => setMuted(!muted)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-600/80 rounded-xl transition-all duration-200 shadow-lg"
              >
                {muted ? <VolumeX size={18} className="text-gray-600 dark:text-gray-400" /> : <Volume2 size={18} className="text-blue-600 dark:text-blue-400" />}
              </motion.button>

              <motion.button
                onClick={handleRestart}
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-600/80 rounded-xl transition-all duration-200 shadow-lg"
              >
                <RotateCcw size={18} className="text-gray-600 dark:text-gray-400" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FlappyGame;
