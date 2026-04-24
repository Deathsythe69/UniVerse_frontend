import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

/* ──── GLSL: Nebula Shader ──── */
const nebulaVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nebulaFragment = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Simplex-ish noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.04;

    // Mouse influence — subtle warp
    vec2 mouseInfluence = (uMouse - 0.5) * 0.15;
    uv += mouseInfluence * smoothstep(0.6, 0.0, length(uv - uMouse));

    // Layered noise for nebula clouds
    float n1 = snoise(vec3(uv * 2.0, t)) * 0.5 + 0.5;
    float n2 = snoise(vec3(uv * 4.0 + 10.0, t * 1.3)) * 0.5 + 0.5;
    float n3 = snoise(vec3(uv * 8.0 + 20.0, t * 0.7)) * 0.5 + 0.5;

    float nebula = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    nebula = pow(nebula, 2.5); // Concentrate into wisps

    // Color palette: deep purple → ice blue → coral
    vec3 colA = vec3(0.40, 0.05, 0.65);  // Void Purple
    vec3 colB = vec3(0.24, 0.76, 0.99);  // Ice Blue (primary)
    vec3 colC = vec3(1.0, 0.61, 0.49);   // Cosmic Coral

    vec3 nebulaColor = mix(colA, colB, n1);
    nebulaColor = mix(nebulaColor, colC, n3 * 0.3);

    // Vignette
    float vignette = 1.0 - smoothstep(0.2, 0.9, length(uv - 0.5));

    // Mouse glow
    float mouseGlow = smoothstep(0.35, 0.0, length(uv - uMouse)) * 0.15;
    vec3 glowColor = vec3(0.24, 0.76, 0.99);

    // Final compositing
    vec3 color = vec3(0.016, 0.016, 0.024); // Near-black base
    color += nebulaColor * nebula * 0.18 * vignette;
    color += glowColor * mouseGlow;

    gl_FragColor = vec4(color, 1.0);
  }
`;

/* ──── GLSL: Particle Shader ──── */
const particleVertex = `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vAlpha = aAlpha;
    vColor = aColor;
    vec3 pos = position;

    // Slow drift
    pos.x += sin(uTime * 0.1 + position.z * 2.0) * 0.3;
    pos.y += cos(uTime * 0.08 + position.x * 1.5) * 0.2;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * uPixelRatio * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particleFragment = `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    float dist = length(gl_PointCoord - 0.5);
    if (dist > 0.5) discard;
    float strength = 1.0 - (dist * 2.0);
    strength = pow(strength, 3.0);
    gl_FragColor = vec4(vColor, strength * vAlpha);
  }
`;

/* ──── Component ──── */
const PARTICLE_COUNT = 4000;
const IS_LOW_END = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 4) <= 2;

const UniverseBackground = () => {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const cleanupRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    mouseRef.current.x = e.clientX / window.innerWidth;
    mouseRef.current.y = 1.0 - e.clientY / window.innerHeight; // Flip Y for GLSL
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Scene Setup ──
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: IS_LOW_END ? 'low-power' : 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0e0e13);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    // ── Nebula Background ──
    const nebulaGeo = new THREE.PlaneGeometry(2, 2);
    const nebulaMat = new THREE.ShaderMaterial({
      vertexShader: nebulaVertex,
      fragmentShader: nebulaFragment,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
      depthWrite: false,
      depthTest: false,
    });
    const nebulaMesh = new THREE.Mesh(nebulaGeo, nebulaMat);
    nebulaMesh.frustumCulled = false;

    // Render nebula as a background pass via a separate scene + camera
    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    bgScene.add(nebulaMesh);

    // ── Particles ──
    const count = IS_LOW_END ? 1500 : PARTICLE_COUNT;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const starColors = [
      [1, 1, 1],           // White
      [0.85, 0.92, 1],     // Blue-white
      [1, 0.96, 0.9],      // Warm white
      [0.24, 0.76, 0.99],  // Primary cyan
      [0.76, 0.5, 1],      // Purple
      [1, 0.61, 0.49],     // Coral
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

      sizes[i] = Math.random() * 2.5 + 0.3;
      alphas[i] = Math.random() * 0.8 + 0.2;

      const col = starColors[Math.floor(Math.random() * starColors.length)];
      colors[i * 3] = col[0];
      colors[i * 3 + 1] = col[1];
      colors[i * 3 + 2] = col[2];
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    particleGeo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    particleGeo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.ShaderMaterial({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Cosmic Web Filaments ──
    if (!IS_LOW_END) {
      const filamentPositions = [];
      const posArr = positions;
      // Connect nearby particles (only a sparse subset)
      for (let i = 0; i < Math.min(count, 800); i++) {
        for (let j = i + 1; j < Math.min(count, 800); j++) {
          const dx = posArr[i*3] - posArr[j*3];
          const dy = posArr[i*3+1] - posArr[j*3+1];
          const dz = posArr[i*3+2] - posArr[j*3+2];
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (dist < 8 && Math.random() > 0.85) {
            filamentPositions.push(posArr[i*3], posArr[i*3+1], posArr[i*3+2]);
            filamentPositions.push(posArr[j*3], posArr[j*3+1], posArr[j*3+2]);
          }
        }
      }
      if (filamentPositions.length > 0) {
        const filGeo = new THREE.BufferGeometry();
        filGeo.setAttribute('position', new THREE.Float32BufferAttribute(filamentPositions, 3));
        const filMat = new THREE.LineBasicMaterial({
          color: 0x3dc2fd,
          transparent: true,
          opacity: 0.06,
          blending: THREE.AdditiveBlending,
        });
        const filaments = new THREE.LineSegments(filGeo, filMat);
        scene.add(filaments);
      }
    }

    // ── Post Processing — Bloom ──
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    // We'll manually render the bg scene before, so disable autoclear
    renderPass.clear = false;
    composer.addPass(renderPass);

    if (!IS_LOW_END) {
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.6,   // intensity
        0.4,   // radius
        0.85   // threshold
      );
      composer.addPass(bloomPass);
    }

    // ── Animation Loop ──
    let frameId;
    const clock = new THREE.Clock();
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Update uniforms
      nebulaMat.uniforms.uTime.value = elapsed;
      nebulaMat.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
      particleMat.uniforms.uTime.value = elapsed;

      // Subtle camera drift
      camera.position.x += (mouseRef.current.x * 4 - 2 - camera.position.x) * 0.02;
      camera.position.y += (mouseRef.current.y * 3 - 1.5 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      // Render bg → clear depth → render particles with bloom
      renderer.autoClear = false;
      renderer.clear();
      renderer.render(bgScene, bgCamera);
      renderer.clearDepth();
      composer.render();
    };
    animate();

    // ── Resize ──
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      nebulaMat.uniforms.uResolution.value.set(w, h);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    cleanupRef.current = () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      nebulaGeo.dispose();
      nebulaMat.dispose();
      composer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [handleMouseMove]);

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
      }}
    />
  );
};

export default UniverseBackground;
