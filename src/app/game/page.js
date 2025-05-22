"use client";

import { useEffect, useRef, useState } from 'react';

export default function SmoothMovementGame() {
  const canvasRef = useRef(null);
  const [player, setPlayer] = useState({ x: 600, y: 300, vx: 0, vy: 0, angle: 0 }); // Updated initial state to place the arrow in the middle of the canvas
  const [keys, setKeys] = useState({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false });
  const [lives, setLives] = useState(3); // Re-added life pool state
  const [invulnerable, setInvulnerable] = useState(false); // Re-added invulnerability state

  const restartGame = () => {
    setPlayer({ x: 200, y: 200, vx: 0, vy: 0, angle: 0 }); // Reset player position, velocity, and angle
    setLives(3); // Reset lives
    setInvulnerable(false); // Reset invulnerability state
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const boards = [
      { x: 300, y: 150, width: 200, height: 3 }, // Updated to 3px height
      { x: 700, y: 400, width: 150, height: 3 }, // Updated to 3px height
      { x: 500, y: 250, width: 3, height: 200 }, // Updated to 3px width
    ]; // Added some boards within the canvas

    const innerBorders = [
      { x: 50, y: 50, width: canvas.width - 100, height: 3 }, // Top border with 3px thickness
      { x: 50, y: canvas.height - 53, width: canvas.width - 100, height: 3 }, // Bottom border with 3px thickness
      { x: 50, y: 50, width: 3, height: canvas.height - 100 }, // Left border with 3px thickness
      { x: canvas.width - 53, y: 50, width: 3, height: canvas.height - 100 }, // Right border with 3px thickness
    ];

    const updatePlayer = () => {
      const acceleration = 0.3;
      const maxSpeed = 5;
      const friction = 0.3;

      let { x, y, vx, vy } = player; // Ensure vy and vx are destructured from player state
      let angle = player.angle || 0; // Default to the last angle if not moving

      if (keys.ArrowUp) vy -= acceleration;
      if (keys.ArrowDown) vy += acceleration;
      if (keys.ArrowLeft) vx -= acceleration;
      if (keys.ArrowRight) vx += acceleration;

      // Apply friction
      if (!keys.ArrowUp && !keys.ArrowDown) vy *= 1 - friction;
      if (!keys.ArrowLeft && !keys.ArrowRight) vx *= 1 - friction;

      // Clamp speed
      vx = Math.max(-maxSpeed, Math.min(maxSpeed, vx));
      vy = Math.max(-maxSpeed, Math.min(maxSpeed, vy));

      // Update position
      x = Math.max(0, Math.min(canvas.width, x + vx));
      y = Math.max(0, Math.min(canvas.height, y + vy));

      // Check collision with yellow border
      if (!invulnerable && (x <= 0 || x >= canvas.width || y <= 0 || y >= canvas.height)) {
        setInvulnerable(true); // Set invulnerability immediately
        setTimeout(() => setInvulnerable(false), 2000); // Reduced invulnerability duration to 2 seconds

        setLives((prev) => {
          if (prev - 1 <= 0) {
            return 0; // No game over logic
          }
          return prev - 1;
        });

        x = canvas.width / 2; // Reset player position to center
        y = canvas.height / 2;
        vx = 0;
        vy = 0;
      }

      // Prevent player from passing through boards
      boards.forEach((board) => {
        if (
          player.x + 10 > board.x &&
          player.x - 10 < board.x + board.width &&
          player.y + 10 > board.y &&
          player.y - 10 < board.y + board.height
        ) {
          if (!invulnerable) {
            setInvulnerable(true);
            setTimeout(() => setInvulnerable(false), 2000); // 2 seconds of invulnerability
            setLives((prev) => Math.max(0, prev - 1));

            // Push player in the reverse direction
            player.x -= Math.sign(player.vx) * 20;
            player.y -= Math.sign(player.vy) * 20;
            player.vx = 0;
            player.vy = 0;
          }
        }
      });

      // Prevent player from passing through inner borders
      innerBorders.forEach((border) => {
        if (
          player.x + 10 > border.x &&
          player.x - 10 < border.x + border.width &&
          player.y + 10 > border.y &&
          player.y - 10 < border.y + border.height
        ) {
          if (!invulnerable) {
            setInvulnerable(true);
            setTimeout(() => setInvulnerable(false), 2000); // 2 seconds of invulnerability
            setLives((prev) => Math.max(0, prev - 1));

            // Push player in the reverse direction
            player.x -= Math.sign(player.vx) * 20;
            player.y -= Math.sign(player.vy) * 20;
            player.vx = 0;
            player.vy = 0;
          }
        }
      });

      if (vx !== 0 || vy !== 0) {
        angle = Math.atan2(vy, vx); // Update angle only if moving
      }

      return { x, y, vx, vy, angle }; // Return updated player state
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw boards
      ctx.fillStyle = 'yellow'; // Set all borders to yellow
      boards.forEach((board) => {
        ctx.fillStyle = 'yellow'; // Ensure boards are also yellow
        ctx.fillRect(board.x, board.y, board.width, board.height);
      });

      // Draw inner borders
      ctx.fillStyle = 'yellow'; // Set all borders to yellow
      innerBorders.forEach((border) => {
        ctx.fillRect(border.x, border.y, border.width, border.height);
      });

      // Draw player as an arrow pointing in the direction of movement
      ctx.fillStyle = invulnerable ? 'white' : 'blue'; // Change arrow color to white during invulnerability
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.angle - Math.PI / 2); // Adjusted rotation to point the arrow at -90 degrees
      ctx.beginPath();
      ctx.moveTo(0, 20); // Arrow tip (reversed direction)
      ctx.lineTo(-10, -10); // Bottom left (reversed direction)
      ctx.lineTo(10, -10); // Bottom right (reversed direction)
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Draw lives
      ctx.fillStyle = 'red';
      ctx.font = '20px Arial';
      ctx.fillText(`Lives: ${lives}`, 10, 50);
    };

    const gameLoop = () => {
      const updatedPlayer = updatePlayer();
      setPlayer(updatedPlayer);
      draw();
      requestAnimationFrame(gameLoop);
    };

    const animationId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationId);
  }, [keys, player, lives, invulnerable]); // Added dependencies to useEffect

  const handleKeyDown = (e) => {
    setKeys((prev) => ({ ...prev, [e.key]: true }));
  };

  const handleKeyUp = (e) => {
    setKeys((prev) => ({ ...prev, [e.key]: false }));
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        restartGame();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}> {/* Added space above the canvas and game title */}
      <h1>Smooth Movement Game</h1>
      <p>Use the <strong>arrow keys</strong> on your keyboard to move the character.</p>
      <p>Avoid hitting the outer yellow border or the inner obstacles.</p>
      <canvas
        ref={canvasRef}
        width={1200} // Updated canvas width to 1200px
        height={600} // Increased canvas height to make it taller
        style={{
          backgroundColor: '#6b4c4c', // Made the background darker with a toned-down red tint
          border: 'none',
          display: 'block',
          margin: '0 auto',
          maxWidth: 'calc(100vw - 40px)',
          padding: '0 20px',
        }}
      />
    </div>
  );
}