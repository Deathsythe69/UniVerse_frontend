import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { createAndromedaM31 } from '../special/AndromedaM31';

/* ──── GLSL: Antigravity Particle Shader ──── */
const particleVertex = `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  attribute float aRadius;
  attribute float aType; // 0 = Star, 1 = Dust

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uTurbulence;

  varying float vAlpha;
  varying vec3 vColor;
  varying float vType;

  void main() {
    vAlpha = aAlpha;
    vColor = aColor;
    vType = aType;

    vec3 pos = position;

    // ── Antigravity Physics ──
    // 1. Repulsion from core (Inverse Square Dispersion)
    // Velocity = Force / (Distance^2)
    float dist = length(pos.xz);
    float repulsionForce = 0.5; 
    float outwardDrift = (repulsionForce * uTime * 2.0) / (dist * dist + 1.0);
    
    vec3 dir = normalize(vec3(pos.x, 0.0, pos.z));
    pos += dir * outwardDrift * 10.0;

    // 2. Upward Lift
    pos.y += uTime * 2.0; 

    // 3. Unspooling Rotation (Slow & Fractured)
    float angle = uTime * (0.02 + 0.5 / (dist + 5.0));
    float s = sin(angle);
    float c = cos(angle);
    float newX = pos.x * c - pos.z * s;
    float newZ = pos.x * s + pos.z * c;
    pos.x = newX;
    pos.z = newZ;

    // 4. Haphazard Turbulence (Interaction-based)
    if (uTurbulence > 0.01) {
        float noise = sin(pos.x * 50.0 + uTime * 40.0) * cos(pos.z * 50.0 + uTime * 40.0);
        pos += noise * uTurbulence * 8.0;
        
        // Add a secondary high-frequency jitter for "hapazard" look
        pos.x += sin(uTime * 100.0 + float(gl_VertexID)) * uTurbulence * 2.0;
        pos.y += cos(uTime * 110.0 + float(gl_VertexID)) * uTurbulence * 2.0;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Scale point size based on distance and perspective
    // Dust particles (type 1) are larger
    float sizeMultiplier = (aType > 0.5) ? 4.0 : 1.0;
    gl_PointSize = aSize * sizeMultiplier * uPixelRatio * (400.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particleFragment = `
  varying float vAlpha;
  varying vec3 vColor;
  varying float vType;

  void main() {
    float dist = length(gl_PointCoord - 0.5);
    if (dist > 0.5) discard;
    
    float strength = 1.0 - (dist * 2.0);
    
    // Antigravity Look: Stars are sharp (pow 4), Dust is soft (pow 2)
    float power = (vType > 0.5) ? 2.0 : 4.0;
    strength = pow(strength, power);
    
    // Brightness Clamp: No pixel exceeds (220, 220, 200) -> approx 0.86
    vec3 clampedColor = min(vColor, vec3(0.86, 0.86, 0.78));
    
    gl_FragColor = vec4(clampedColor, strength * vAlpha);
  }
`;

const constellationVertex = `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    vColor = aColor;
    // Slow twinkle: 90% to 100% opacity over 4 seconds
    vTwinkle = 0.95 + 0.05 * sin(uTime * 1.57); // 1.57 approx PI/2 for 4s cycle
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (500.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const constellationFragment = `
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    float dist = length(gl_PointCoord - 0.5);
    if (dist > 0.5) discard;
    
    // Crisp circle with zero bloom
    float strength = smoothstep(0.5, 0.45, dist);
    gl_FragColor = vec4(vColor, strength * vTwinkle);
  }
`;
const dsoVertex = `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aRotation;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vRotation;

  void main() {
    vColor = aColor;
    vRotation = aRotation;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (600.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const dsoFragment = `
  varying vec3 vColor;
  varying float vRotation;

  void main() {
    // Galactic rotation for the point coord
    float s = sin(vRotation);
    float c = cos(vRotation);
    vec2 pt = gl_PointCoord - 0.5;
    vec2 rotatedPt = vec2(pt.x * c - pt.y * s, pt.x * s + pt.y * c);
    
    // Elliptical shape for galaxy look
    float dist = length(rotatedPt * vec2(1.0, 2.5)); 
    if (dist > 0.5) discard;
    
    float strength = exp(-dist * 6.0);
    float core = exp(-dist * 15.0) * 1.5;
    
    gl_FragColor = vec4(vColor, (strength + core) * 0.8);
  }
`;

/* ──── Component ──── */
const UniverseBackground = () => {
  const containerRef = useRef(null);
  const labelCanvasRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Scene Setup ──
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050507); // Dark space void
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.set(0, 80, 180); 
    camera.lookAt(0, 0, 0);

    // ── Antigravity Galaxy Construction ──
    const count = 200000; 
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const types = new Float32Array(count); // 0 = Star, 1 = Dust

    // Colors from Prompt
    const colorGoldDust = new THREE.Color('#D4A373'); // Muted dusty gold
    const colorCharcoal = new THREE.Color('#0F0F0F'); // Dark dust
    const colorSpaceBlue = new THREE.Color('#0B0C10'); // Deep space blue
    const colorIcyWhite = new THREE.Color('#E0FBFC'); // Cold star

    for (let i = 0; i < count; i++) {
      // Logic for spreading out the core (Antigravity Repulsion)
      // Use a distribution that favors outer regions
      const radius = 20 + Math.pow(Math.random(), 1.5) * 180;
      const angle = Math.random() * Math.PI * 2;
      
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 20;
      const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 15;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Type determination: 15% Heavy Dust, 85% Stars
      const isDust = Math.random() < 0.15;
      types[i] = isDust ? 1.0 : 0.0;

      if (isDust) {
        // Dust Aesthetic
        const dustCol = Math.random() > 0.5 ? colorCharcoal : colorSpaceBlue;
        colors[i * 3] = dustCol.r;
        colors[i * 3 + 1] = dustCol.g;
        colors[i * 3 + 2] = dustCol.b;
        alphas[i] = 0.6 + Math.random() * 0.4; // High opacity to occlude
        sizes[i] = Math.random() * 8.0 + 4.0;
      } else {
        // Star Aesthetic
        const distToCore = radius;
        if (distToCore < 50) {
            // Core stars: Muted Gold
            colors[i * 3] = colorGoldDust.r;
            colors[i * 3 + 1] = colorGoldDust.g;
            colors[i * 3 + 2] = colorGoldDust.b;
            alphas[i] = 0.05 + Math.random() * 0.1; // "Extremely low"
        } else {
            // Outer stars: Icy White
            colors[i * 3] = colorIcyWhite.r;
            colors[i * 3 + 1] = colorIcyWhite.g;
            colors[i * 3 + 2] = colorIcyWhite.b;
            alphas[i] = 0.1 + Math.random() * 0.3;
        }
        sizes[i] = Math.random() * 1.5 + 0.5;
      }
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    particleGeo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    particleGeo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    particleGeo.setAttribute('aType', new THREE.BufferAttribute(types, 1));

    const particleMat = new THREE.ShaderMaterial({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uTurbulence: { value: 0 },
      },
      transparent: true,
      blending: THREE.NormalBlending, // "Standard Alpha/Normal blending"
      depthWrite: false, // Keep false for transparency layering, but NormalBlending helps occlusion
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Background Star Field (Faint) ──
    const bgStarCount = 5000;
    const bgStarPos = new Float32Array(bgStarCount * 3);
    for(let i=0; i<bgStarCount; i++) {
        const r = 1000 + Math.random() * 500;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        bgStarPos[i*3] = r * Math.sin(theta) * Math.cos(phi);
        bgStarPos[i*3+1] = r * Math.sin(theta) * Math.sin(phi);
        bgStarPos[i*3+2] = r * Math.cos(theta);
    }
    const bgStarGeo = new THREE.BufferGeometry();
    bgStarGeo.setAttribute('position', new THREE.BufferAttribute(bgStarPos, 3));
    const bgStarMat = new THREE.PointsMaterial({ 
        color: 0x888888, 
        size: 1.0, 
        transparent: true, 
        opacity: 0.2 
    });
    const bgStars = new THREE.Points(bgStarGeo, bgStarMat);
    scene.add(bgStars);

    // ── Stellarium Constellations ──
    const constellationData = {
      andromeda: {
        stars: [
          { name: "Alpheratz", x: -300, y: 150, z: -800, color: "#C8D7FF", size: 4.5 },
          { name: "Mirach", x: -100, y: 50, z: -850, color: "#FFB46F", size: 5.0 },
          { name: "Almach", x: 200, y: -80, z: -900, color: "#FFC48F", size: 4.2 },
          { name: "Delta And", x: -200, y: 100, z: -820, color: "#FFFFFF", size: 3.5 },
          { name: "Mu And", x: 0, y: 0, z: -880, color: "#FFFFFF", size: 3.0 }
        ],
        lines: [[0, 3], [3, 1], [1, 4], [4, 2]]
      },
      cassiopeia: {
        stars: [
          { name: "Caph", x: 350, y: -250, z: -900, color: "#FFFFFF", size: 4.0 },
          { name: "Shedar", x: 420, y: -200, z: -920, color: "#FFC48F", size: 4.5 },
          { name: "Gamma Cas", x: 480, y: -280, z: -940, color: "#C8D7FF", size: 4.3 },
          { name: "Ruchbah", x: 550, y: -220, z: -960, color: "#FFFFFF", size: 4.0 },
          { name: "Segin", x: 620, y: -290, z: -980, color: "#C8D7FF", size: 3.8 }
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4]]
      },
      pegasus: {
        stars: [
          { name: "Markab", x: -500, y: 300, z: -1000, color: "#FFFFFF", size: 4.0 },
          { name: "Scheat", x: -550, y: 100, z: -1020, color: "#FFFFFF", size: 4.2 },
          { name: "Algenib", x: -300, y: 350, z: -1040, color: "#FFFFFF", size: 3.8 },
          { name: "Enif", x: -700, y: 200, z: -1060, color: "#FFC48F", size: 3.5 }
        ],
        lines: [[0, 1], [0, 2]] 
      },
      ursaMinor: {
        stars: [
          { name: "Polaris", x: 0, y: 600, z: -900, color: "#F0F0FF", size: 5.5 },
          { name: "Kochab", x: -120, y: 520, z: -920, color: "#FFD2A1", size: 4.8 },
          { name: "Pherkad", x: -160, y: 460, z: -910, color: "#FFFFFF", size: 4.2 },
          { name: "Yildun", x: -40, y: 580, z: -915, color: "#FFFFFF", size: 3.2 }
        ],
        lines: [[0, 3], [3, 1], [1, 2]]
      },
      leo: {
        stars: [
          { name: "Regulus", x: -850, y: 150, z: -850, color: "#B3CFFF", size: 5.2 },
          { name: "Denebola", x: -1100, y: 250, z: -880, color: "#FFFFFF", size: 4.5 },
          { name: "Algieba", x: -920, y: 320, z: -860, color: "#FFE4B5", size: 4.6 },
          { name: "Zosma", x: -1050, y: 300, z: -870, color: "#FFFFFF", size: 4.0 }
        ],
        lines: [[0, 2], [2, 3], [3, 1]]
      },
      virgo: {
        stars: [
          { name: "Spica", x: 850, y: -100, z: -950, color: "#C8D7FF", size: 5.5 },
          { name: "Zavijava", x: 700, y: 0, z: -940, color: "#FFFFFF", size: 4.2 },
          { name: "Porrima", x: 780, y: 50, z: -960, color: "#FDF5E6", size: 4.4 },
          { name: "Vindemiatrix", x: 950, y: 150, z: -970, color: "#FFE4B5", size: 4.0 }
        ],
        lines: [[0, 1], [1, 2], [2, 3]]
      },
      cancer: {
        stars: [
          { name: "Acubens", x: 250, y: -550, z: -880, color: "#FFFFFF", size: 4.0 },
          { name: "Altarf", x: 400, y: -650, z: -900, color: "#FFD2A1", size: 4.8 },
          { name: "Asellus Borealis", x: 320, y: -480, z: -890, color: "#FFFFFF", size: 3.8 }
        ],
        lines: [[0, 2], [1, 2]]
      }
    };

    const dsoData = [
      { name: "M104 (Sombrero Galaxy)", x: 880, y: -50, z: -960, color: "#E0FBFC", size: 25, rot: 0.2 },
      { name: "Leo Triplet", x: -950, y: 280, z: -870, color: "#FFD2A1", size: 20, rot: 1.2 },
      { name: "M44 (Beehive Cluster)", x: 330, y: -550, z: -890, color: "#C8D7FF", size: 30, rot: 0.0 }, 
      { name: "M81 (Bode's Galaxy)", x: -200, y: 550, z: -920, color: "#FFFFFF", size: 18, rot: 2.1 },
      { name: "M51 (Whirlpool Galaxy)", x: 400, y: 300, z: -750, color: "#C180FF", size: 22, rot: 0.5 },
      { name: "Horsehead Nebula", x: -600, y: -400, z: -1100, color: "#FF6E84", size: 40, rot: 3.14 }
    ];

    const constStarPositions = [];
    const constStarSizes = [];
    const constStarColors = [];
    const constLinePositions = [];
    const labelAnchors = [];

    Object.values(constellationData).forEach(group => {
      group.stars.forEach(s => {
        constStarPositions.push(s.x, s.y, s.z);
        constStarSizes.push(s.size);
        const c = new THREE.Color(s.color);
        constStarColors.push(c.r, c.g, c.b);
        labelAnchors.push({ name: s.name, pos: new THREE.Vector3(s.x, s.y, s.z) });
      });
      group.lines.forEach(([i1, i2]) => {
        const s1 = group.stars[i1];
        const s2 = group.stars[i2];
        constLinePositions.push(s1.x, s1.y, s1.z, s2.x, s2.y, s2.z);
      });
    });

    const constStarGeo = new THREE.BufferGeometry();
    constStarGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(constStarPositions), 3));
    constStarGeo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(constStarSizes), 1));
    constStarGeo.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(constStarColors), 3));

    const constStarMat = new THREE.ShaderMaterial({
      vertexShader: constellationVertex,
      fragmentShader: constellationFragment,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
      },
      transparent: true,
      depthWrite: false,
      renderOrder: -1 // Draw behind galaxy
    });

    const constStars = new THREE.Points(constStarGeo, constStarMat);
    scene.add(constStars);

    // ── Celestial Glow for Constellations ──
    const starGlowMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#3DC2FD') },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform vec3 uColor;
        void main() {
          float dist = length(vUv - 0.5);
          float glow = exp(-dist * 10.0) * (0.4 + 0.3 * sin(uTime * 1.5));
          gl_FragColor = vec4(uColor, glow * 0.3);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    Object.values(constellationData).forEach(group => {
      group.stars.forEach(star => {
        const glowPlane = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), starGlowMat.clone());
        glowPlane.position.set(star.x, star.y, star.z);
        glowPlane.lookAt(camera.position);
        scene.add(glowPlane);
      });
    });

    const constLineGeo = new THREE.BufferGeometry();
    constLineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(constLinePositions), 3));
    const constLineMat = new THREE.LineBasicMaterial({
      color: 0xb0d8ff,
      opacity: 0.15,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const constLines = new THREE.LineSegments(constLineGeo, constLineMat);
    constLines.renderOrder = -2; // Even further back
    scene.add(constLines);

    // ── Deep Sky Objects (DSOs) ──
    const dsoPositions = new Float32Array(dsoData.length * 3);
    const dsoSizes = new Float32Array(dsoData.length);
    const dsoColors = new Float32Array(dsoData.length * 3);
    const dsoRotations = new Float32Array(dsoData.length);

    dsoData.forEach((dso, i) => {
      dsoPositions[i * 3] = dso.x;
      dsoPositions[i * 3 + 1] = dso.y;
      dsoPositions[i * 3 + 2] = dso.z;
      dsoSizes[i] = dso.size;
      const c = new THREE.Color(dso.color);
      dsoColors[i * 3] = c.r;
      dsoColors[i * 3 + 1] = c.g;
      dsoColors[i * 3 + 2] = c.b;
      dsoRotations[i] = dso.rot;
      labelAnchors.push({ name: dso.name, pos: new THREE.Vector3(dso.x, dso.y, dso.z), isDSO: true });
    });

    const dsoGeo = new THREE.BufferGeometry();
    dsoGeo.setAttribute('position', new THREE.BufferAttribute(dsoPositions, 3));
    dsoGeo.setAttribute('aSize', new THREE.BufferAttribute(dsoSizes, 1));
    dsoGeo.setAttribute('aColor', new THREE.BufferAttribute(dsoColors, 3));
    dsoGeo.setAttribute('aRotation', new THREE.BufferAttribute(dsoRotations, 1));

    const dsoMat = new THREE.ShaderMaterial({
      vertexShader: dsoVertex,
      fragmentShader: dsoFragment,
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
      },
      transparent: true,
      depthWrite: false,
      renderOrder: -3 // Furthest back
    });

    const dsoPoints = new THREE.Points(dsoGeo, dsoMat);
    scene.add(dsoPoints);

    // ── High-Fidelity Andromeda (M31) ──
    const andromeda = createAndromedaM31(particleMat.uniforms.uTurbulence);
    andromeda.mesh.position.set(-50, 100, -820); // Keep original celestial position
    scene.add(andromeda.mesh);
    // Add label for the new Andromeda
    labelAnchors.push({ name: "M31 (Andromeda Galaxy)", pos: new THREE.Vector3(-50, 100, -820), isDSO: true });

    // ── Animation Loop ──
    let frameId;
    const clock = new THREE.Clock();
    const tempVec = new THREE.Vector3(); // Optimization: Reuse vector
    let turbulenceAmount = 0;
    let lastScrollY = window.scrollY;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      
      particleMat.uniforms.uTime.value = elapsedTime;
      constStarMat.uniforms.uTime.value = elapsedTime;

      // Decay turbulence
      turbulenceAmount *= 0.95;
      particleMat.uniforms.uTurbulence.value = turbulenceAmount;
      
      // Update Andromeda
      if (andromeda) andromeda.update(elapsedTime);

      // Update Star Glows (make them always face camera)
      scene.children.forEach(child => {
        if (child.material && child.material.uniforms && child.material.uniforms.uColor) {
           child.lookAt(camera.position);
           child.material.uniforms.uTime.value = elapsedTime;
        }
      });

      // Very subtle camera rotation
      camera.position.x = Math.sin(elapsedTime * 0.05) * 180;
      camera.position.z = Math.cos(elapsedTime * 0.05) * 180;
      camera.lookAt(0, 40, 0); 

      // ── Render Labels ──
      const lCanvas = labelCanvasRef.current;
      const lCtx = lCanvas?.getContext('2d');
      if (lCtx && lCanvas) {
        const dpr = window.devicePixelRatio || 1;
        const w = lCanvas.width / dpr;
        const h = lCanvas.height / dpr;
        
        lCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        lCtx.clearRect(0, 0, w, h);
        lCtx.font = '500 10px "Inter", sans-serif';
        lCtx.fillStyle = 'rgba(176, 216, 255, 0.4)';
        lCtx.textAlign = 'left';

        lCtx.textAlign = 'left';

        for (let i = 0; i < labelAnchors.length; i++) {
          const anchor = labelAnchors[i];
          tempVec.copy(anchor.pos).project(camera);
          
          // Occlusion check: Don't draw if behind camera or too close to core void
          if (tempVec.z < 1.0 && Math.abs(tempVec.x) < 0.95 && Math.abs(tempVec.y) < 0.95) { 
            const x = (tempVec.x + 1) / 2 * w;
            const y = -(tempVec.y - 1) / 2 * h;
            
            // Distance fading
            const dist = anchor.pos.distanceTo(camera.position);
            const opacity = Math.max(0.1, Math.min(0.6, 1000 / dist));
            
            lCtx.fillStyle = anchor.isDSO ? `rgba(255, 220, 180, ${opacity + 0.2})` : `rgba(176, 216, 255, ${opacity})`;
            lCtx.font = anchor.isDSO ? 'italic 500 11px "Space Grotesk", sans-serif' : '500 10px "Space Grotesk", sans-serif';
            lCtx.fillText(anchor.name, x + (anchor.isDSO ? 15 : 8), y + 3);
            
            // Add a subtle lead line for DSOs
            if (anchor.isDSO) {
              lCtx.beginPath();
              lCtx.strokeStyle = `rgba(255, 220, 180, ${opacity * 0.5})`;
              lCtx.lineWidth = 0.5;
              lCtx.moveTo(x + 2, y);
              lCtx.lineTo(x + 12, y);
              lCtx.stroke();
            }
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      
      if (labelCanvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        labelCanvasRef.current.width = w * dpr;
        labelCanvasRef.current.height = h * dpr;
      }
    };

    const handleMouseMove = () => {
      turbulenceAmount = Math.min(turbulenceAmount + 0.05, 1.5);
    };

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const delta = Math.abs(currentScroll - lastScrollY);
      turbulenceAmount = Math.min(turbulenceAmount + delta * 0.01, 2.0);
      lastScrollY = currentScroll;
    };

    // ── Initial Resize Call ──
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    cleanupRef.current = () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      constStarGeo.dispose();
      constStarMat.dispose();
      constLineGeo.dispose();
      constLineMat.dispose();
      bgStarGeo.dispose();
      bgStarMat.dispose();
      dsoGeo.dispose();
      dsoMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="universe-webgl-bg"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: '#050507',
      }}
    >
      <canvas
        ref={labelCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default UniverseBackground;
