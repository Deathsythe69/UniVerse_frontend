import React, { useEffect, useRef } from 'react';

const UniverseBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    let animationFrameId;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', resize);
    
    class Star {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 2; // depth
        // Make stars slightly smaller on average, like a dense real photograph
        this.radius = Math.random() * 1.5 + 0.1;
        // Make them mostly static or drifting extremely slowly to match realistic space
        this.vy = (Math.random() - 0.5) * 0.05;
        this.vx = (Math.random() - 0.5) * 0.05;
        this.alpha = Math.random() * 0.9 + 0.1;
        
        // Realistic star colors (White, Warm-White, Yellow-Orange, Blue-White)
        const colors = ['#ffffff', '#fff4e6', '#ffe9c4', '#d4fbff', '#9bb0ff', '#ffb69b'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        
        // Add a realistic glow to brighter stars only
        if (this.z > 1.8 && this.radius > 1) {
             ctx.shadowBlur = 8;
             ctx.shadowColor = this.color;
             
             // Draw a subtle cross glare on very bright stars automatically
             if (this.z > 1.95) {
                ctx.fillRect(this.x - 3, this.y - 0.5, 6, 1);
                ctx.fillRect(this.x - 0.5, this.y - 3, 1, 6);
             }
        } else {
             ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    }

    function initStars() {
      stars = [];
      // Dense star field! 
      const numStars = Math.floor((width * height) / 1000);
      for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
      }
    }

    const drawGalaxy = () => {
      ctx.save();
      // Center the galaxy slightly off-center
      ctx.translate(width / 2 + 100, height / 2 - 50);
      ctx.rotate(Math.PI / 5); // tilt it
      ctx.scale(2.5, 0.7); // make it an ellipse
      
      const maxRadius = Math.min(width, height) * 0.6;
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
      // Create the warm glowing core blending into blue outer arms
      grad.addColorStop(0, 'rgba(255, 245, 230, 0.45)'); 
      grad.addColorStop(0.1, 'rgba(255, 220, 180, 0.25)'); 
      grad.addColorStop(0.3, 'rgba(150, 180, 255, 0.08)'); 
      grad.addColorStop(0.6, 'rgba(50, 60, 100, 0.02)'); 
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, maxRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      drawGalaxy();
      
      stars.forEach(s => {
        s.update();
        s.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: '#040406' // Pitch black realistic space
      }}
    />
  );
};

export default UniverseBackground;
