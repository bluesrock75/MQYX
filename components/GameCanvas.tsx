
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { COLORS, GAME_CONFIG, SHOOTER_CONFIG, MONEY_RAIN_CONFIG } from '../constants';
import { GameState, GameMode, Ball, Paddle, Particle, Bullet, Target } from '../types';
import { playWallBounce, playPaddleBounce, playGameOver, playShoot, playCoin } from '../services/soundService';

interface GameCanvasProps {
  gameState: GameState;
  gameMode: GameMode;
  setGameState: (state: GameState) => void;
  setScore: (score: number | ((prev: number) => number)) => void;
  score: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, gameMode, setGameState, setScore, score }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const timeLeftRef = useRef<number>(0); // Seconds for countdown
  const lastTimeRef = useRef<number>(0); // For delta time calculation
  
  // -- Shared Game Entities --
  const paddleRef = useRef<Paddle>({
    x: (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH) / 2,
    y: GAME_CONFIG.CANVAS_HEIGHT - 60,
    width: GAME_CONFIG.PADDLE_WIDTH,
    height: GAME_CONFIG.PADDLE_HEIGHT
  });

  const particlesRef = useRef<Particle[]>([]);
  const inputKeys = useRef<Set<string>>(new Set());
  const touchX = useRef<number | null>(null);

  // -- Classic Mode Entities --
  const ballRef = useRef<Ball>({
    x: GAME_CONFIG.CANVAS_WIDTH / 2,
    y: GAME_CONFIG.CANVAS_HEIGHT / 3,
    radius: GAME_CONFIG.BALL_RADIUS,
    dx: 0,
    dy: 0
  });

  // -- Shooter Mode Entities --
  const bulletsRef = useRef<Bullet[]>([]);
  
  // -- Shared Targets (Used for Shooter and Money Rain) --
  const targetsRef = useRef<Target[]>([]);

  // Initialize/Reset Game
  const resetGame = useCallback(() => {
    frameCountRef.current = 0;
    particlesRef.current = [];
    setScore(0);
    lastTimeRef.current = performance.now();

    paddleRef.current = {
      x: (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PADDLE_WIDTH) / 2,
      y: GAME_CONFIG.CANVAS_HEIGHT - 80, 
      width: GAME_CONFIG.PADDLE_WIDTH,
      height: GAME_CONFIG.PADDLE_HEIGHT
    };

    if (gameMode === GameMode.CLASSIC) {
        ballRef.current = {
            x: GAME_CONFIG.CANVAS_WIDTH / 2,
            y: 100,
            radius: GAME_CONFIG.BALL_RADIUS,
            dx: (Math.random() - 0.5) * 8, 
            dy: 0
        };
    } else if (gameMode === GameMode.MONEY_RAIN) {
        timeLeftRef.current = MONEY_RAIN_CONFIG.GAME_DURATION;
        bulletsRef.current = [];
        targetsRef.current = [];
    } else {
        bulletsRef.current = [];
        targetsRef.current = [];
    }
  }, [setScore, gameMode]);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      resetGame();
    }
  }, [gameState, resetGame]);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => inputKeys.current.add(e.key);
    const handleKeyUp = (e: KeyboardEvent) => inputKeys.current.delete(e.key);
    
    const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        const canvas = canvasRef.current;
        if(canvas) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            touchX.current = (touch.clientX - rect.left) * scaleX;
        }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            touchX.current = (e.clientX - rect.left) * scaleX;
        }
    }

    const handleTouchEnd = () => { touchX.current = null; };
    const handleMouseLeave = () => { touchX.current = null; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    
    if (matchMedia('(pointer:fine)').matches) {
       window.addEventListener('mousemove', handleMouseMove);
       window.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 10; i++) {
      particlesRef.current.push({
        x,
        y,
        dx: (Math.random() - 0.5) * 10,
        dy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color
      });
    }
  };

  const updatePaddle = () => {
    const paddle = paddleRef.current;
    if (inputKeys.current.has('ArrowLeft') || inputKeys.current.has('a')) {
      paddle.x -= GAME_CONFIG.PADDLE_SPEED;
    }
    if (inputKeys.current.has('ArrowRight') || inputKeys.current.has('d')) {
      paddle.x += GAME_CONFIG.PADDLE_SPEED;
    }
    if (touchX.current !== null) {
        const targetX = touchX.current - paddle.width / 2;
        paddle.x += (targetX - paddle.x) * 0.2;
    }
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > GAME_CONFIG.CANVAS_WIDTH) paddle.x = GAME_CONFIG.CANVAS_WIDTH - paddle.width;
  };

  const updateClassic = () => {
    const ball = ballRef.current;
    const paddle = paddleRef.current;

    ball.dy += GAME_CONFIG.GRAVITY;
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall Collisions
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.dx *= -0.8;
      playWallBounce();
    }
    if (ball.x + ball.radius > GAME_CONFIG.CANVAS_WIDTH) {
      ball.x = GAME_CONFIG.CANVAS_WIDTH - ball.radius;
      ball.dx *= -0.8;
      playWallBounce();
    }
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.dy *= -0.6; 
      playWallBounce();
    }

    // Floor Collision
    if (ball.y - ball.radius > GAME_CONFIG.CANVAS_HEIGHT) {
      playGameOver();
      setGameState(GameState.GAME_OVER);
    }

    // Paddle Collision
    if (
      ball.y + ball.radius >= paddle.y &&
      ball.y - ball.radius <= paddle.y + paddle.height &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + paddle.width
    ) {
      if (ball.dy > 0) {
        ball.y = paddle.y - ball.radius;
        ball.dy = -Math.abs(ball.dy) * 1.05;
        const hitPoint = ball.x - (paddle.x + paddle.width / 2);
        ball.dx = hitPoint * 0.15;
        if (Math.abs(ball.dy) > 20) ball.dy = -20;
        setScore(prev => prev + 1);
        playPaddleBounce();
        createExplosion(ball.x, ball.y, COLORS.RED_DOT);
      }
    }
  };

  const updateShooter = () => {
    const paddle = paddleRef.current;

    // 1. Auto Fire (Dual Wield)
    if (frameCountRef.current % SHOOTER_CONFIG.FIRE_RATE === 0) {
        // Left Gun
        bulletsRef.current.push({
            x: paddle.x + 20,
            y: paddle.y,
            radius: SHOOTER_CONFIG.BULLET_RADIUS,
            dy: SHOOTER_CONFIG.BULLET_SPEED,
            active: true
        });
        // Right Gun
        bulletsRef.current.push({
            x: paddle.x + paddle.width - 20,
            y: paddle.y,
            radius: SHOOTER_CONFIG.BULLET_RADIUS,
            dy: SHOOTER_CONFIG.BULLET_SPEED,
            active: true
        });
        playShoot();
    }

    // 2. Spawn Targets
    if (frameCountRef.current % SHOOTER_CONFIG.SPAWN_RATE === 0) {
        const type = Math.random() > 0.5 ? 'USD' : 'RMB';
        targetsRef.current.push({
            x: Math.random() * (GAME_CONFIG.CANVAS_WIDTH - SHOOTER_CONFIG.TARGET_SIZE),
            y: -SHOOTER_CONFIG.TARGET_SIZE,
            width: SHOOTER_CONFIG.TARGET_SIZE,
            height: SHOOTER_CONFIG.TARGET_SIZE,
            dy: SHOOTER_CONFIG.TARGET_SPEED_MIN + Math.random() * (SHOOTER_CONFIG.TARGET_SPEED_MAX - SHOOTER_CONFIG.TARGET_SPEED_MIN),
            type,
            value: type === 'USD' ? 10 : 20,
            active: true,
            symbol: type === 'USD' ? '💵' : '💴'
        });
    }

    // 3. Move Bullets
    bulletsRef.current.forEach(b => {
        b.y += b.dy;
        if (b.y < 0) b.active = false;
    });

    // 4. Move Targets
    targetsRef.current.forEach(t => {
        t.y += t.dy;
        if (t.y > GAME_CONFIG.CANVAS_HEIGHT) {
            playGameOver();
            setGameState(GameState.GAME_OVER);
        }
    });

    // 5. Collisions
    bulletsRef.current.forEach(b => {
        if (!b.active) return;
        targetsRef.current.forEach(t => {
            if (!t.active) return;
            // Simple Circle-Rect collision
            if (
                b.x > t.x && 
                b.x < t.x + t.width &&
                b.y > t.y &&
                b.y < t.y + t.height
            ) {
                b.active = false;
                t.active = false;
                setScore(prev => prev + t.value);
                createExplosion(t.x + t.width/2, t.y + t.height/2, COLORS.GOLD);
                playCoin();
            }
        });
    });

    // Cleanup
    bulletsRef.current = bulletsRef.current.filter(b => b.active);
    targetsRef.current = targetsRef.current.filter(t => t.active);
  };

  const updateMoneyRain = (dt: number) => {
    const paddle = paddleRef.current;

    // 1. Timer Logic
    if (timeLeftRef.current > 0) {
        timeLeftRef.current -= dt / 1000;
        if (timeLeftRef.current <= 0) {
            timeLeftRef.current = 0;
            playGameOver();
            setGameState(GameState.GAME_OVER);
            return;
        }
    }

    // 2. Spawn Money
    if (frameCountRef.current % MONEY_RAIN_CONFIG.SPAWN_RATE === 0) {
        const rand = Math.random();
        let config = MONEY_RAIN_CONFIG.VALUES.COIN;
        
        if (rand < 0.02) config = MONEY_RAIN_CONFIG.VALUES.GEM;
        else if (rand < 0.1) config = MONEY_RAIN_CONFIG.VALUES.BAG;
        else if (rand < 0.4) config = MONEY_RAIN_CONFIG.VALUES.CASH;

        targetsRef.current.push({
            x: Math.random() * (GAME_CONFIG.CANVAS_WIDTH - MONEY_RAIN_CONFIG.ITEM_SIZE),
            y: -MONEY_RAIN_CONFIG.ITEM_SIZE,
            width: MONEY_RAIN_CONFIG.ITEM_SIZE,
            height: MONEY_RAIN_CONFIG.ITEM_SIZE,
            dy: MONEY_RAIN_CONFIG.FALL_SPEED_MIN + Math.random() * (MONEY_RAIN_CONFIG.FALL_SPEED_MAX - MONEY_RAIN_CONFIG.FALL_SPEED_MIN),
            type: 'COIN', // Generic type for physics, specific logic via value
            value: config.val,
            active: true,
            symbol: config.symbol
        });
    }

    // 3. Move Money
    targetsRef.current.forEach(t => {
        t.y += t.dy;
        if (t.y > GAME_CONFIG.CANVAS_HEIGHT) {
            t.active = false; // Just disappear, no game over if missed
        }
    });

    // 4. Catch Logic (Paddle Intersects Money)
    targetsRef.current.forEach(t => {
        if (!t.active) return;
        
        // AABB Collision (Rectangle overlap)
        if (
            paddle.x < t.x + t.width &&
            paddle.x + paddle.width > t.x &&
            paddle.y < t.y + t.height &&
            paddle.y + paddle.height > t.y
        ) {
            t.active = false;
            setScore(prev => prev + t.value);
            createExplosion(t.x + t.width/2, t.y + t.height/2, COLORS.GOLD);
            playCoin();
        }
    });

    targetsRef.current = targetsRef.current.filter(t => t.active);
  };

  const update = (time: number) => {
    if (gameState !== GameState.PLAYING) return;
    
    // Calculate Delta Time
    const dt = time - lastTimeRef.current;
    lastTimeRef.current = time;
    frameCountRef.current++;

    updatePaddle();
    
    if (gameMode === GameMode.CLASSIC) {
        updateClassic();
    } else if (gameMode === GameMode.SHOOTER) {
        updateShooter();
    } else if (gameMode === GameMode.MONEY_RAIN) {
        updateMoneyRain(dt);
    }

    // Update Particles (Shared)
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life -= 0.05;
        if (p.life <= 0) particlesRef.current.splice(i, 1);
    }
  };

  const drawPaddle = (ctx: CanvasRenderingContext2D) => {
    const paddle = paddleRef.current;
    const shapeOverlap = 20;
    const shapeWidth = (paddle.width / 2) + shapeOverlap;
    
    // Draw Green Part (Left)
    ctx.fillStyle = COLORS.GREEN_SHAPE;
    ctx.beginPath();
    ctx.moveTo(paddle.x, paddle.y + paddle.height); 
    ctx.quadraticCurveTo(paddle.x + shapeWidth * 0.2, paddle.y, paddle.x + shapeWidth * 0.6, paddle.y + paddle.height * 0.6);
    ctx.quadraticCurveTo(paddle.x + shapeWidth * 0.8, paddle.y + paddle.height, paddle.x + shapeWidth, paddle.y + paddle.height);
    ctx.fill();

    // Draw Blue Part (Right)
    ctx.fillStyle = COLORS.BLUE_SHAPE;
    ctx.beginPath();
    const blueStartX = paddle.x + paddle.width - shapeWidth;
    ctx.moveTo(blueStartX, paddle.y + paddle.height);
    ctx.quadraticCurveTo(blueStartX + shapeWidth * 0.5, paddle.y - paddle.height * 0.5, blueStartX + shapeWidth, paddle.y + paddle.height);
    ctx.fill();

    // Draw Bucket effect for Money Rain
    if (gameMode === GameMode.MONEY_RAIN) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(paddle.x, paddle.y);
        ctx.lineTo(paddle.x, paddle.y - 10);
        ctx.moveTo(paddle.x + paddle.width, paddle.y);
        ctx.lineTo(paddle.x + paddle.width, paddle.y - 10);
        ctx.stroke();
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    // Particles
    particlesRef.current.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });

    drawPaddle(ctx);

    if (gameMode === GameMode.CLASSIC) {
        const ball = ballRef.current;
        ctx.fillStyle = COLORS.RED_DOT;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(ball.x - 4, ball.y - 4, ball.radius / 3, 0, Math.PI * 2);
        ctx.fill();
    } else if (gameMode === GameMode.SHOOTER) {
        // Draw Bullets
        ctx.fillStyle = COLORS.RED_DOT;
        bulletsRef.current.forEach(b => {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw Targets
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        targetsRef.current.forEach(t => {
            ctx.fillText(t.symbol, t.x + t.width / 2, t.y + t.height / 2);
        });
    } else if (gameMode === GameMode.MONEY_RAIN) {
        // Draw Timer
        ctx.font = '900 40px Outfit';
        ctx.fillStyle = COLORS.RED_DOT;
        ctx.textAlign = 'center';
        ctx.fillText(Math.ceil(timeLeftRef.current).toString(), GAME_CONFIG.CANVAS_WIDTH / 2, 60);
        ctx.font = '16px Outfit';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText("Q4 DEADLINE", GAME_CONFIG.CANVAS_WIDTH / 2, 80);

        // Draw Money
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        targetsRef.current.forEach(t => {
            ctx.fillText(t.symbol, t.x + t.width / 2, t.y + t.height / 2);
        });
    }
  };

  const loop = useCallback((time: number) => {
    update(time);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) draw(ctx);
    }
    requestRef.current = requestAnimationFrame(loop);
  }, [gameState, gameMode, setGameState, setScore]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  return (
    <div className="w-full max-w-4xl mx-auto aspect-[4/3] bg-white rounded-xl shadow-2xl overflow-hidden relative border-4 border-slate-100">
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.CANVAS_WIDTH}
        height={GAME_CONFIG.CANVAS_HEIGHT}
        className="w-full h-full block touch-none"
      />
      {/* HUD */}
      <div className="absolute top-4 left-6 pointer-events-none">
        <h2 className="text-3xl font-black text-slate-800 opacity-50 select-none">
            {gameMode === GameMode.CLASSIC ? 'SCORE' : gameMode === GameMode.MONEY_RAIN ? 'BONUS' : 'CASH'}: {gameMode === GameMode.MONEY_RAIN ? '$' : ''}{score}
        </h2>
      </div>
    </div>
  );
};

export default GameCanvas;