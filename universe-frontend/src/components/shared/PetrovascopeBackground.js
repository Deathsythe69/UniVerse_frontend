import React, { useEffect, useRef } from 'react';

const PetrovascopeBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animationFrameId;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', resize);
    
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Varying depths: foreground (large, blurry), mid (sharp), background (small)
        this.z = Math.random(); 
        
        // Size based on depth
        this.radius = (this.z * 15) + 1; 
        
        // Movement speed based on depth (parallax)
        this.vx = (Math.random() - 0.5) * (this.z * 1.5);
        this.vy = (Math.random() - 0.5) * (this.z * 1.5);
        
        // Varying red/pink/white tones
        const colors = ['#ff003c', '#ff4d79', '#ff99b3', '#ffffff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // Opacity pulses over time
        this.baseAlpha = (Math.random() * 0.5) + 0.1;
        this.pulseRate = Math.random() * 0.02;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges
        if (this.x < -50) this.x = width + 50;
        if (this.x > width + 50) this.x = -50;
        if (this.y < -50) this.y = height + 50;
        if (this.y > height + 50) this.y = -50;

        this.pulsePhase += this.pulseRate;
      }

      draw() {
        const currentAlpha = this.baseAlpha + Math.sin(this.pulsePhase) * 0.15;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Create the glowing/blurred effect
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, currentAlpha);
        
        // Extreme foreground/background blur simulation using shadow
        if (this.z > 0.8 || this.z < 0.2) {
            ctx.shadowBlur = this.radius * 2;
            ctx.shadowColor = this.color;
        } else {
            ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.globalAlpha = 1.0; // Reset
      }
    }

    function initParticles() {
      particles = [];
      // Determine particle count based on screen size
      const particleCount = Math.floor((width * height) / 8000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    // Initialize
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
        background: 'radial-gradient(circle at center, #2e0008 0%, #050002 100%)'
      }}
    />
  );
};

export default PetrovascopeBackground;
