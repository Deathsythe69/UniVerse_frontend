import React, { useEffect, useRef, useState, useCallback } from 'react';

const CosmicCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailsRef = useRef([]);
  const posRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Detect touch device — hide custom cursor
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const TRAIL_COUNT = 6;

  const handleMouseMove = useCallback((e) => {
    targetRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    // Create trail elements
    const trailContainer = document.createElement('div');
    trailContainer.id = 'cosmic-trail-container';
    trailContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998;';
    document.body.appendChild(trailContainer);

    const trails = [];
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const el = document.createElement('div');
      el.style.cssText = `
        position: fixed;
        width: ${6 - i * 0.6}px;
        height: ${6 - i * 0.6}px;
        border-radius: 50%;
        background: rgba(61, 194, 253, ${0.4 - i * 0.06});
        pointer-events: none;
        transition: none;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 ${8 - i}px rgba(61, 194, 253, ${0.3 - i * 0.04});
      `;
      trailContainer.appendChild(el);
      trails.push({ el, x: -100, y: -100 });
    }
    trailsRef.current = trails;

    // Detect hoverable elements
    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('input') ||
        target.closest('textarea') ||
        window.getComputedStyle(target).cursor === 'pointer'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Animation loop — smooth follow
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Ease cursor position
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.15;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) translate(-50%, -50%) scale(${isHovering ? 1.8 : 1})`;
      }

      // Update trails with delayed follow
      let prevX = posRef.current.x;
      let prevY = posRef.current.y;
      for (let i = 0; i < trails.length; i++) {
        const trail = trails[i];
        trail.x += (prevX - trail.x) * (0.25 - i * 0.03);
        trail.y += (prevY - trail.y) * (0.25 - i * 0.03);
        trail.el.style.left = trail.x + 'px';
        trail.el.style.top = trail.y + 'px';
        prevX = trail.x;
        prevY = trail.y;
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (trailContainer.parentNode) trailContainer.parentNode.removeChild(trailContainer);
    };
  }, [isTouchDevice, handleMouseMove, isHovering]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Inner dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#3dc2fd',
          boxShadow: '0 0 10px rgba(61,194,253,0.8), 0 0 20px rgba(61,194,253,0.4)',
          pointerEvents: 'none',
          zIndex: 10000,
          transition: 'opacity 0.3s',
          opacity: isVisible ? 1 : 0,
          willChange: 'transform',
        }}
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: `1.5px solid rgba(61,194,253,${isHovering ? 0.8 : 0.3})`,
          boxShadow: isHovering
            ? '0 0 15px rgba(61,194,253,0.4), inset 0 0 10px rgba(61,194,253,0.1)'
            : 'none',
          pointerEvents: 'none',
          zIndex: 9999,
          transition: 'border 0.3s, box-shadow 0.3s, opacity 0.3s, transform 0.15s',
          opacity: isVisible ? 1 : 0,
          willChange: 'transform',
        }}
      />
    </>
  );
};

export default CosmicCursor;
