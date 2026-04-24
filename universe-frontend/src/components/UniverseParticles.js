import React, { useRef, useEffect } from 'react';

const UniverseParticles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    // Resize canvas
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const mouse = { x: canvas.width / 2, y: canvas.height / 2, radius: 150 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });

    const colors = ['#C180FF', '#3DC2FD', '#FF6E84', '#FFD700', '#00FF41'];

    class Particle {
      constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.type = type; // 'star' or 'planet'
        this.size = type === 'planet' ? Math.random() * 15 + 5 : Math.random() * 3 + 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.density = (Math.random() * 30) + 1;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.05 + 0.01;
      }

      draw() {
        ctx.beginPath();
        if (this.type === 'planet') {
          // Inner planet
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
          // Planet ring
          if (this.size > 10) {
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, this.size * 1.8, this.size * 0.5, this.angle, 0, Math.PI * 2);
            ctx.strokeStyle = this.color + '80'; // 50% opacity
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        } else {
          // Star
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
          // Star glow
          ctx.shadowBlur = 10;
          ctx.shadowColor = this.color;
        }
        ctx.closePath();
        ctx.shadowBlur = 0; // reset
      }

      update() {
        // Orbit around base slowly
        this.angle += this.speed;
        let pX = this.baseX + Math.cos(this.angle) * 20;
        let pY = this.baseY + Math.sin(this.angle) * 20;

        // Mouse interaction: pop outward
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
          this.x -= directionX * 3;
          this.y -= directionY * 3;
        } else {
          if (this.x !== pX) {
            let dx = this.x - pX;
            this.x -= dx / 10;
          }
          if (this.y !== pY) {
            let dy = this.y - pY;
            this.y -= dy / 10;
          }
        }
        this.draw();
      }
    }

    const init = () => {
      particles = [];
      let numberOfParticles = (canvas.width * canvas.height) / 9000;
      for (let i = 0; i < numberOfParticles; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let type = Math.random() > 0.9 ? 'planet' : 'star';
        particles.push(new Particle(x, y, type));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      // Connect close planets with a cosmic thread
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 80) {
            ctx.beginPath();
            ctx.strokeStyle = particles[a].color + '20'; // 12% opacity
            ctx.lineWidth = 1;
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
            ctx.closePath();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
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
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default UniverseParticles;
