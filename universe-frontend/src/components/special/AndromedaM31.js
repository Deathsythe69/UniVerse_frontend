import * as THREE from 'three';

/* 
  Note: UniverseBackground.js uses vanilla THREE.js in a useEffect. 
  So AndromedaM31 should be a class or a function that returns THREE objects, 
  not a standard React component (unless I refactor everything to R3F, which I won't do now).
  Actually, I can make it a function that takes 'scene' and 'uniforms' and adds itself.
*/

const galaxyVertex = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uTime;
  uniform float uTurbulence;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Apply turbulence if active
    if (uTurbulence > 0.01) {
        float noise = sin(pos.x * 10.0 + uTime * 5.0) * cos(pos.y * 10.0 + uTime * 5.0);
        pos.z += noise * uTurbulence * 2.0;
    }

    vPosition = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const galaxyFragment = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uTime;
  uniform vec3 uCoreColor;
  uniform vec3 uOuterColor;
  uniform vec3 uDustColor;

  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv - 0.5;
    
    // 1. Core Bulge (High intensity golden-white)
    float dist = length(uv * vec2(1.0, 2.2)); // Elliptical distortion for Andromeda tilt
    float core = exp(-dist * 15.0) * 2.5;
    
    // 2. Spiral Arms
    float angle = atan(uv.y, uv.x);
    float armDist = dist * 2.0;
    
    // Logarithmic spiral math: r = a * e^(b*theta)
    // We reverse it to find the "spiralness"
    float spiral = fract(log(armDist + 0.01) * 2.0 - angle * 0.318); // 0.318 = 1/PI
    float armStrength = smoothstep(0.4, 0.6, 1.0 - abs(spiral - 0.5) * 2.0);
    armStrength *= exp(-dist * 3.0); // Fade out
    
    // Add noise for "misty" texture
    float noise = snoise(uv * 15.0 + uTime * 0.05) * 0.5 + 0.5;
    armStrength *= (0.7 + 0.3 * noise);
    
    // 3. Color Gradient
    vec3 color = mix(uCoreColor, uOuterColor, smoothstep(0.05, 0.4, dist));
    
    // 4. Dust Lanes (Physical Occlusion)
    // Dark lanes carve through the disk
    float dustNoise = snoise(uv * 25.0 - uTime * 0.02);
    float dustLane = smoothstep(0.4, 0.5, dustNoise);
    
    // Occlude based on position (lower/left as per prompt)
    float mask = smoothstep(-0.2, 0.2, uv.x - uv.y);
    float dustEffect = dustLane * (1.0 - mask) * smoothstep(0.1, 0.3, dist);
    
    // 5. Final Composition
    float finalAlpha = (core + armStrength * 0.8) * (1.0 - dustEffect * 0.9);
    vec3 finalColor = color * (core + armStrength);
    
    // Darken dust regions
    finalColor = mix(finalColor, uDustColor * 0.1, dustEffect * 0.7);
    
    gl_FragColor = vec4(finalColor, finalAlpha * 0.9);
  }
`;

/**
 * Creates the Hyper-Fidelity Andromeda M31 Galaxy system.
 * Returns an object containing the meshes and an update function.
 */
export const createAndromedaM31 = (uTurbulence) => {
  const group = new THREE.Group();

  // ── Main M31 Disk ──
  const galaxyGeo = new THREE.PlaneGeometry(120, 120, 64, 64);
  const galaxyMat = new THREE.ShaderMaterial({
    vertexShader: galaxyVertex,
    fragmentShader: galaxyFragment,
    uniforms: {
      uTime: { value: 0 },
      uTurbulence: uTurbulence, // Passed from parent
      uCoreColor: { value: new THREE.Color('#FFF4D6') }, // Golden-white
      uOuterColor: { value: new THREE.Color('#9494FF') }, // Cool bluish-purple
      uDustColor: { value: new THREE.Color('#0F0F0F') }, // Charcoal
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const m31Disk = new THREE.Mesh(galaxyGeo, galaxyMat);
  // Angle obliquely
  m31Disk.rotation.x = -Math.PI / 3;
  m31Disk.rotation.z = 0.8;
  group.add(m31Disk);

  // ── Satellite M32 ──
  const m32Geo = new THREE.SphereGeometry(2, 32, 32);
  const m32Mat = new THREE.MeshBasicMaterial({
    color: '#FFF4D6',
    transparent: true,
    opacity: 0.6,
  });
  const m32 = new THREE.Mesh(m32Geo, m32Mat);
  m32.position.set(-20, 5, 10);
  group.add(m32);

  // ── Satellite M110 ──
  const m110Geo = new THREE.SphereGeometry(3, 32, 32);
  const m110Mat = new THREE.MeshBasicMaterial({
    color: '#E0FBFC',
    transparent: true,
    opacity: 0.4,
  });
  const m110 = new THREE.Mesh(m110Geo, m110Mat);
  m110.position.set(30, -10, -5);
  group.add(m110);

  // Position the whole system
  group.position.set(20, 10, -30);

  const update = (time) => {
    galaxyMat.uniforms.uTime.value = time;
    // Add a very slight wobble to satellites
    m32.position.y = 5 + Math.sin(time * 0.5) * 2;
    m110.position.y = -10 + Math.cos(time * 0.3) * 3;
  };

  return { mesh: group, update };
};
