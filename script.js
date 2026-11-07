/**
 * PORTFOLIO CLIENT ENGINE — SHAHNAWAZ SAIFI
 * Senior Creative Frontend Engineer & 3D Web Experience
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all interactive subsystems
  initThreeJsHero();
  initTypewriter();
  initCustomCursor();
  init3DCardTilt();
  initFilterSystems();
  initProjectModals();
  initFormspree();
  initNavigation();
  initScrollToTop();
});

/* ==========================================================================
   1. THREE.JS 3D CYBER PARTICLE GLOBE, ARCS, ORBIT RINGS & SHAPES
   ========================================================================== */
function initThreeJsHero() {
  const canvas = document.getElementById('hero-webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const isMobile = window.innerWidth < 768;
  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: !isMobile,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 7;

  // Real lighting for floating solids & specular highlights
  const ambientLight = new THREE.AmbientLight(0x6b6fa8, 1.2);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x9db8ff, 2.0);
  keyLight.position.set(-4, 5, 5);
  scene.add(keyLight);

  const violetLight = new THREE.PointLight(0x8b5cf6, 2.5, 20);
  violetLight.position.set(3.5, 2.5, 3);
  scene.add(violetLight);

  const cyanLight = new THREE.PointLight(0x22d3ee, 2.0, 20);
  cyanLight.position.set(-3.5, -2.5, 3);
  scene.add(cyanLight);

  const mouseLight = new THREE.PointLight(0xffffff, 2.2, 12);
  mouseLight.position.set(0, 0, 3.2);
  scene.add(mouseLight);

  // Globe World Container (Centered)
  const world = new THREE.Group();
  scene.add(world);

  const globe = new THREE.Group();
  world.add(globe);

  const GLOBE_R = 2.0;

  // Shaders for glowing Fibonacci particle sphere
  const globeVert = `
    uniform float uTime;
    uniform float uPixel;
    uniform vec3 uMouse;
    attribute float aSeed;
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      vec3 p = position;
      float tw = 0.5 + 0.5 * sin(uTime * 1.3 + aSeed * 6.2831);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      float d = distance(mv.xyz, uMouse);
      float near = smoothstep(1.7, 0.0, d);
      p += normalize(p) * near * 0.16;
      mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = (3.4 + tw * 1.3 + near * 4.5) * uPixel * (7.0 / -mv.z);
      float h = normalize(position).y * 0.5 + 0.5;
      vec3 c = mix(vec3(0.55, 0.36, 0.96), vec3(0.23, 0.42, 1.0), smoothstep(0.0, 0.55, h));
      c = mix(c, vec3(0.13, 0.83, 0.93), smoothstep(0.55, 1.0, h));
      vColor = c + near * 0.55;
      vAlpha = (0.35 + 0.9 * smoothstep(-9.2, -5.0, mv.z)) * (0.7 + 0.3 * tw);
    }
  `;

  const globeFrag = `
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      gl_FragColor = vec4(vColor, smoothstep(0.5, 0.02, d) * vAlpha * 1.5);
    }
  `;

  // Fibonacci sphere particle distribution
  const particleCount = isMobile ? 2600 : 5400;
  const positions = new Float32Array(particleCount * 3);
  const seeds = new Float32Array(particleCount);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < particleCount; i++) {
    const y = 1 - (2 * (i + 0.5)) / particleCount;
    const rad = Math.sqrt(1 - y * y);
    const phi = i * golden;
    positions[i * 3] = Math.cos(phi) * rad * GLOBE_R;
    positions[i * 3 + 1] = y * GLOBE_R;
    positions[i * 3 + 2] = Math.sin(phi) * rad * GLOBE_R;
    seeds[i] = Math.random();
  }

  const globeGeo = new THREE.BufferGeometry();
  globeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  globeGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

  const globeMat = new THREE.ShaderMaterial({
    vertexShader: globeVert,
    fragmentShader: globeFrag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixel: { value: dpr },
      uMouse: { value: new THREE.Vector3(99, 99, 99) }
    }
  });

  const globeParticles = new THREE.Points(globeGeo, globeMat);
  globe.add(globeParticles);

  // Dark volumetric inner core
  const coreGeo = new THREE.SphereGeometry(GLOBE_R * 0.985, 36, 24);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x07081a,
    transparent: true,
    opacity: 0.82
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  globe.add(coreMesh);

  // Animated curved data arcs
  const arcVert = `
    attribute float aT;
    attribute float aPhase;
    uniform float uTime;
    varying float vA;
    varying float vT;
    void main() {
      float head = fract(uTime * 0.16 + aPhase);
      float behind = mod(head - aT + 1.0, 1.0);
      vA = 0.1 + 0.9 * smoothstep(0.32, 0.0, behind);
      vT = aT;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const arcFrag = `
    varying float vA;
    varying float vT;
    void main() {
      vec3 c = mix(vec3(0.13, 0.83, 0.93), vec3(0.62, 0.45, 1.0), vT);
      gl_FragColor = vec4(c, vA);
    }
  `;

  const arcMats = [];
  const randSpherical = () => {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const sinPhi = Math.sin(phi);
    return new THREE.Vector3(
      sinPhi * Math.cos(theta),
      sinPhi * Math.sin(theta),
      Math.cos(phi)
    ).normalize();
  };

  const arcCount = isMobile ? 5 : 9;
  for (let i = 0; i < arcCount; i++) {
    const a = randSpherical();
    const b = randSpherical();
    const angle = a.angleTo(b);
    if (angle < 0.7) {
      i--;
      continue;
    }
    const mid = a.clone().add(b).normalize().multiplyScalar(GLOBE_R * (1 + 0.28 * angle));
    const pts = new THREE.QuadraticBezierCurve3(
      a.clone().multiplyScalar(GLOBE_R * 1.003),
      mid,
      b.clone().multiplyScalar(GLOBE_R * 1.003)
    ).getPoints(50);

    const arcGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const aT = new Float32Array(pts.length);
    const aPhase = new Float32Array(pts.length);
    const phaseVal = Math.random();
    for (let k = 0; k < pts.length; k++) {
      aT[k] = k / (pts.length - 1);
      aPhase[k] = phaseVal;
    }
    arcGeo.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
    arcGeo.setAttribute('aPhase', new THREE.BufferAttribute(aPhase, 1));

    const arcMat = new THREE.ShaderMaterial({
      vertexShader: arcVert,
      fragmentShader: arcFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } }
    });
    arcMats.push(arcMat);
    globe.add(new THREE.Line(arcGeo, arcMat));
  }

  // Orbit Rings with Satellites and Halos
  const rings = [];
  const ringConfigs = [
    [2.75, 1.15, 0.2, 0x8b5cf6],
    [3.20, 0.5, -0.5, 0x3b6cff],
    [2.45, -0.8, 0.9, 0x22d3ee]
  ];

  ringConfigs.forEach(([r, rx, ry, col], i) => {
    const tilt = new THREE.Group();
    tilt.rotation.set(rx, ry, 0);
    const spin = new THREE.Group();
    tilt.add(spin);

    const torusGeo = new THREE.TorusGeometry(r, 0.008, 6, isMobile ? 80 : 140);
    const torusMat = new THREE.MeshBasicMaterial({
      color: col,
      transparent: true,
      opacity: 0.38
    });
    spin.add(new THREE.Mesh(torusGeo, torusMat));

    const satGeo = new THREE.SphereGeometry(0.055, 12, 10);
    const satMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sat = new THREE.Mesh(satGeo, satMat);
    sat.position.set(r, 0, 0);
    spin.add(sat);

    const haloGeo = new THREE.SphereGeometry(0.14, 12, 10);
    const haloMat = new THREE.MeshBasicMaterial({
      color: col,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(sat.position);
    spin.add(halo);

    world.add(tilt);
    rings.push({ spin, speed: (i % 2 ? -1 : 1) * (0.16 + i * 0.05) });
  });

  // Floating 3D Lit Solids (Standard Material + Edges Wireframe)
  const floaters = [];
  const addSolid = (geo, color, rel, depth, spin, size = 1) => {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.55,
      roughness: 0.28,
      flatShading: true,
      emissive: new THREE.Color(color).multiplyScalar(0.15)
    });
    const mesh = new THREE.Mesh(geo, mat);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 })
    );
    g.add(mesh, edges);
    g.scale.setScalar(size);
    world.add(g);
    floaters.push({
      g,
      rel: new THREE.Vector3(...rel),
      depth,
      spin,
      phase: Math.random() * 6.28
    });
  };

  addSolid(new THREE.IcosahedronGeometry(0.5, 0), 0x7c4dff, [-2.5, 1.9, 0.9], 1.0, [0.22, 0.31, 0.05]);
  addSolid(new THREE.OctahedronGeometry(0.42, 0), 0x2f6bff, [2.7, -1.6, 1.1], 1.3, [-0.3, 0.2, 0.1]);
  addSolid(new THREE.TorusKnotGeometry(0.3, 0.09, isMobile ? 60 : 100, 10), 0x22d3ee, [2.8, 1.9, -0.4], 0.6, [0.25, -0.35, 0]);
  addSolid(new THREE.IcosahedronGeometry(0.3, 0), 0xa78bfa, [-2.4, -1.9, 0.5], 0.8, [-0.35, 0.28, 0.2]);
  if (!isMobile) {
    addSolid(new THREE.OctahedronGeometry(0.22, 0), 0x67e8f9, [0.2, 2.9, 0.5], 0.5, [0.4, 0.4, 0]);
  }

  // Ambient Starfield / Dust
  const dustN = isMobile ? 200 : 500;
  const dustPos = new Float32Array(dustN * 3);
  const dustSeed = new Float32Array(dustN);
  for (let i = 0; i < dustN; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 22;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
    dustPos[i * 3 + 2] = -Math.random() * 9 - 1;
    dustSeed[i] = Math.random();
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(dustSeed, 1));

  const dustMat = new THREE.ShaderMaterial({
    vertexShader: `
      uniform float uTime;
      uniform float uPixel;
      attribute float aSeed;
      varying float vA;
      void main() {
        vec3 p = position;
        p.y += sin(uTime * 0.2 + aSeed * 20.0) * 0.25;
        p.x += cos(uTime * 0.15 + aSeed * 12.0) * 0.2;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.0 + aSeed * 1.6) * uPixel * (6.0 / -mv.z);
        vA = 0.25 + 0.5 * aSeed;
      }
    `,
    fragmentShader: `
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(0.62, 0.68, 1.0, smoothstep(0.5, 0.1, d) * vA);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixel: { value: dpr }
    }
  });
  const dustPts = new THREE.Points(dustGeo, dustMat);
  scene.add(dustPts);

  // Responsive Layout & Centering Logic
  let halfW = 4, halfH = 2.55, aspect = 1.6, baseX = 0, baseY = 0.05, baseScale = 1;
  function updateLayout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    renderer.setSize(w, h, false);

    halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    halfW = halfH * aspect;

    // Centered layout ensures the globe, orbits, and shapes are never cut off
    if (aspect > 1.15) {
      baseScale = Math.min(0.88, halfH / 3.3);
      baseX = 0;
      baseY = 0.05;
    } else {
      baseScale = Math.min(0.68, (halfW * 0.92) / 2.6);
      baseX = 0;
      baseY = 0;
    }
  }
  updateLayout();
  window.addEventListener('resize', updateLayout);

  // Pointer Interaction
  const ptr = { x: 0, y: 0, tx: 0, ty: 0, active: false };
  window.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    if (e.clientY < r.top - 100 || e.clientY > r.bottom + 100) return;
    ptr.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    ptr.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
    ptr.active = true;
  }, { passive: true });

  // Intersection Observer to pause when scrolled away
  let isVisible = true;
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.02 });
    io.observe(heroSection);
  }

  // Render Loop
  const clock = new THREE.Clock();
  let lastTime = performance.now();

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const t = clock.getElapsedTime();

    // Damped mouse interpolation
    ptr.x += (ptr.tx - ptr.x) * Math.min(1, dt * 4 + 0.02);
    ptr.y += (ptr.ty - ptr.y) * Math.min(1, dt * 4 + 0.02);

    // Centered world position with subtle parallax
    world.position.set(baseX + ptr.x * 0.15, baseY + ptr.y * 0.1, 0);
    world.scale.setScalar(baseScale);

    // Smooth rotations
    globe.rotation.y = t * 0.12 + ptr.x * 0.45;
    globe.rotation.x = 0.25 + ptr.y * 0.22;

    // Rings spin
    rings.forEach(r => {
      r.spin.rotation.z += r.speed * dt;
    });

    // Floating lit solids bobbing and spinning
    floaters.forEach(f => {
      const bob = Math.sin(t * 0.8 + f.phase) * 0.12;
      f.g.position.set(
        f.rel.x + ptr.x * 0.35 * f.depth,
        f.rel.y + bob + ptr.y * 0.25 * f.depth,
        f.rel.z
      );
      f.g.rotation.x += f.spin[0] * dt;
      f.g.rotation.y += f.spin[1] * dt;
      f.g.rotation.z += f.spin[2] * dt;
    });

    // Ambient dust parallax
    dustPts.position.set(-ptr.x * 0.35, -ptr.y * 0.2, 0);

    // Mouse proximity light and shader uniform
    const mx = ptr.x * halfW;
    const my = ptr.y * halfH;
    mouseLight.position.set(mx, my, 2.8);
    mouseLight.intensity = ptr.active ? 2.2 : 0;
    globeMat.uniforms.uMouse.value.set(ptr.active ? mx : 99, ptr.active ? my : 99, -5.4);

    // Update time uniforms
    globeMat.uniforms.uTime.value = t;
    dustMat.uniforms.uTime.value = t;
    arcMats.forEach(m => {
      m.uniforms.uTime.value = t;
    });

    renderer.render(scene, camera);
  }

  animate();
}

/* ==========================================================================
   2. DYNAMIC TYPEWRITER EFFECT
   ========================================================================== */
function initTypewriter() {
  const roleElement = document.querySelector('.dynamic-role');
  if (!roleElement) return;

  const roles = [
    'AI & Machine Learning Enthusiast',
    'Data Science Developer',
    'Full Stack Developer',
    'Competitive Programmer (500+ LeetCode)'
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  const typeSpeed = 75;
  const deleteSpeed = 40;
  const pauseEnd = 1600;
  const pauseStart = 400;

  function tick() {
    const current = roles[roleIdx];
    if (isDeleting) {
      roleElement.textContent = current.substring(0, charIdx - 1);
      charIdx--;
    } else {
      roleElement.textContent = current.substring(0, charIdx + 1);
      charIdx++;
    }

    let delay = isDeleting ? deleteSpeed : typeSpeed;

    if (!isDeleting && charIdx === current.length) {
      delay = pauseEnd;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      delay = pauseStart;
    }

    setTimeout(tick, delay);
  }

  tick();
}

/* ==========================================================================
   3. CUSTOM CURSOR & AMBIENT TRAIL
   ========================================================================== */
function initCustomCursor() {
  const dot = document.querySelector('.cursor-dot');
  const trail = document.querySelector('.cursor-trail');
  if (!dot || !trail) return;

  // Check if touch device
  if (window.matchMedia('(pointer: coarse)').matches) {
    dot.style.display = 'none';
    trail.style.display = 'none';
    return;
  }

  let mouseX = -100;
  let mouseY = -100;
  let trailX = -100;
  let trailY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  });

  // Spring physics for smooth trailing cursor
  function renderCursor() {
    trailX += (mouseX - trailX) * 0.18;
    trailY += (mouseY - trailY) * 0.18;
    trail.style.transform = `translate3d(${trailX}px, ${trailY}px, 0)`;
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Hover expansion triggers
  const interactives = document.querySelectorAll('a, button, .skill-card, .project-card, .filter-btn, .timeline-card');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
  });
}

/* ==========================================================================
   4. 3D CARD TILT WITH SPECULAR CURSOR REFLECTION
   ========================================================================== */
function init3DCardTilt() {
  const tiltCards = document.querySelectorAll('.project-card, .telemetry-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -9;
      const rotateY = ((x - centerX) / centerX) * 9;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-5px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

/* ==========================================================================
   5. INTERACTIVE FILTERING SYSTEMS
   ========================================================================== */
function initFilterSystems() {
  // Projects Filter
  const projectFilterBtns = document.querySelectorAll('.project-filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  projectFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      projectFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat.includes(filter)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // Skills Filter
  const skillFilterBtns = document.querySelectorAll('.skill-filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  skillFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      skillFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.9)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

/* ==========================================================================
   6. PROJECT DETAILS MODAL ARCHITECTURE
   ========================================================================== */
const projectData = {
  movie: {
    title: 'Movie Recommendation System',
    category: 'AI / Machine Learning & NLP',
    stack: 'Python, Pandas, Scikit-learn, Streamlit, TMDB API, CountVectorizer',
    github: 'https://github.com/Shahnawaz119/Movie-Recommender-System',
    live: 'https://movie-recommender-system-9cqwcxybcmuehprqfz2q2t.streamlit.app/',
    summary: 'A production-ready content-based movie recommendation platform that evaluates cosine similarity across textual tags derived from cast, crew, genres, and overviews.',
    highlights: [
      'Engineered an NLP vectorization pipeline using CountVectorizer on over 5,000 TMDB titles.',
      'Implemented cosine similarity metric calculation to yield top-5 nearest neighbors in real-time.',
      'Integrated asynchronous calls to the TMDB REST API to render high-resolution movie posters, trailers, and cast metadata.',
      'Containerized and deployed seamlessly to Streamlit Cloud with fast caching for high-speed responsiveness.'
    ]
  },
  careerpilot: {
    title: 'CareerPilot AI',
    category: 'Generative AI & LLM Intelligence',
    stack: 'Python, Streamlit, Generative AI / LLMs, OpenAPI, Resume Analytics',
    github: 'https://github.com/Shahnawaz119/careerpilot-ai',
    live: 'https://careerpilot-ai-ldmokrzvtjreihjm7mdkya.streamlit.app/',
    summary: 'An intelligent AI career platform that analyzes candidate resumes, scores ATS compliance, spots critical skill deficiencies, and synthesizes tailored learning roadmaps.',
    highlights: [
      'Employs state-of-the-art Large Language Models to conduct semantic parsing of CV documents and job descriptions.',
      'Calculates real-time ATS scoring metrics with concrete recommendations for keyword enrichment.',
      'Generates personalized interview question sets and curated course recommendations tailored to target companies.',
      'Delivers downloadable, beautifully formatted career readiness PDF summaries.'
    ]
  },
  assistant: {
    title: 'AI Personal Assistant (Automation System)',
    category: 'Workflow Automation & Conversational AI',
    stack: 'n8n, Python, Streamlit, Groq/Ollama LLM APIs, Webhooks, REST APIs',
    github: 'https://github.com/Shahnawaz119/ai-personal-assistant-n8n',
    live: 'https://ai-personal-assistant-n8n-ii95j64ymgoa59xseeupdv.streamlit.app/',
    summary: 'An end-to-end automation workflow system connecting n8n orchestrations with local/cloud LLMs to automate everyday productivity and task scheduling.',
    highlights: [
      'Constructed modular n8n workflow pipelines integrating webhook endpoints with Streamlit chat UI.',
      'Empowered with intelligent tool-calling for calendar scheduling, email automation, and expense tracking.',
      'Integrated Groq and Ollama inference backends for ultra-low latency conversational responses.',
      'Engineered error-resilient fallback handlers ensuring high reliability in enterprise task execution.'
    ]
  },
  ev: {
    title: 'Electric Vehicle Population Analysis',
    category: 'Data Science & Statistical Modeling',
    stack: 'Python, Pandas, NumPy, Matplotlib, Seaborn, EDA, Statistical Inference',
    github: 'https://github.com/Shahnawaz119/VehiclePopulationAnalysis',
    live: null,
    summary: 'A deep exploratory data science investigation inspecting electric vehicle adoption trends, range distributions, and Clean Alternative Fuel Vehicle (CAFV) compliance.',
    highlights: [
      'Processed and cleaned extensive real-world registration datasets comprising over 150,000 EV vehicles.',
      'Constructed comparative multivariate visualizations comparing Battery Electric Vehicles (BEVs) vs. Plug-in Hybrids (PHEVs).',
      'Extracted manufacturer market share insights, identifying geographic adoption hubs and infrastructure bottlenecks.',
      'Delivered clean statistical findings informing state-level clean mobility adoption metrics.'
    ]
  },
  uidai: {
    title: 'UIDAI Aadhaar Enrollment Intelligence',
    category: 'AI & Anomaly Detection',
    stack: 'Python, Isolation Forest, Streamlit, Scikit-learn, Demographic Modeling',
    github: 'https://github.com/Shahnawaz119/uidai-aadhaar-enrollment-intelligence',
    live: 'https://uidai-aadhaar-enrollment-intelligence-sesbn9avwnuhe3bsmvhuss.streamlit.app/',
    summary: 'An AI-driven enrollment intelligence and fraud anomaly detection platform engineered for the UIDAI Data Hackathon 2026.',
    highlights: [
      'Deployed unsupervised Isolation Forest and clustering algorithms to spot demographic and geographic enrollment anomalies.',
      'Achieved high precision in flagging statistical outliers across regional enrollment centers.',
      'Developed interactive Streamlit dashboards enabling administrators to filter by state, district, and demographic age groups.',
      'Architected end-to-end reproducible training pipelines with automated data preprocessing scripts.'
    ]
  },
  blinkit: {
    title: 'Blinkit Sales Analytics Dashboard',
    category: 'Business Intelligence & Data Analytics',
    stack: 'Excel, Advanced Pivot Tables, Dynamic Slicers, KPI Visualizations',
    github: 'https://github.com/Shahnawaz119/BlinkIT-Sales-Dashboard',
    live: null,
    summary: 'A dynamic, enterprise-grade business analytics dashboard analyzing grocery sales performance, outlet tier margins, and customer consumption patterns.',
    highlights: [
      'Engineered interactive multi-parameter slicers for on-the-fly filtering by outlet size, location tier, and product category.',
      'Synthesized critical business KPIs: Total Sales, Average Order Value, Item Fat Content distribution, and Outlet Establishment timeline.',
      'Implemented automated Excel formula logic and conditional formatting matrices for executive decision-making.',
      'Designed an intuitive, visual presentation layer maximizing business intelligence readability.'
    ]
  },
  chatbot: {
    title: 'Smart ChatBot & Intelligent Assistant',
    category: 'Full Stack & Conversational UI',
    stack: 'HTML5, CSS3, JavaScript, Conversational AI API, Vercel',
    github: 'https://github.com/Shahnawaz119/Chatbot',
    live: 'https://chatbot-ten-liart.vercel.app/',
    summary: 'A sleek, modern interactive chatbot web application providing intuitive natural language conversations and real-time response streams.',
    highlights: [
      'Built with clean, vanilla web technologies ensuring zero bloat, instant first contentful paint, and high responsiveness.',
      'Seamlessly connects to an AI backend handling asynchronous user prompts with real-time feedback animations.',
      'Designed a polished, modern conversational UI with glassmorphic cards and intuitive message history.',
      'Deployed live on Vercel with automated continuous deployment.'
    ]
  }
};

function initProjectModals() {
  const modalOverlay = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const detailButtons = document.querySelectorAll('.btn-details');

  if (!modalOverlay || !closeBtn) return;

  function openModal(id) {
    const data = projectData[id];
    if (!data) return;

    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-category').textContent = data.category;
    document.getElementById('modal-stack').textContent = data.stack;
    document.getElementById('modal-summary').textContent = data.summary;

    const listContainer = document.getElementById('modal-highlights');
    listContainer.innerHTML = '';
    data.highlights.forEach(h => {
      const li = document.createElement('li');
      li.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${h}</span>`;
      listContainer.appendChild(li);
    });

    const githubLink = document.getElementById('modal-github');
    const liveLink = document.getElementById('modal-live');

    githubLink.href = data.github;
    if (data.live) {
      liveLink.href = data.live;
      liveLink.style.display = 'inline-flex';
    } else {
      liveLink.style.display = 'none';
    }

    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  detailButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projectId = btn.getAttribute('data-project');
      openModal(projectId);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   7. ASYNCHRONOUS FORMSPREE SUBMISSION PIPELINE
   ========================================================================== */
function initFormspree() {
  const form = document.getElementById('contact-form');
  const statusBox = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');

  if (!form || !statusBox || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending message...`;

    statusBox.className = 'form-status';
    statusBox.style.display = 'none';

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        statusBox.className = 'form-status success';
        statusBox.innerHTML = `<strong><i class="fa-solid fa-check-circle"></i> Message Sent Successfully!</strong><br>Thank you for reaching out, Shahnawaz will reply to your email shortly.`;
        form.reset();
      } else {
        const errorData = await response.json();
        const msg = errorData.errors ? errorData.errors.map(err => err.message).join(', ') : 'Unable to send message. Please try emailing directly.';
        statusBox.className = 'form-status error';
        statusBox.innerHTML = `<strong><i class="fa-solid fa-circle-exclamation"></i> Submission Error</strong>: ${msg}`;
      }
    } catch (err) {
      statusBox.className = 'form-status error';
      statusBox.innerHTML = `<strong><i class="fa-solid fa-circle-exclamation"></i> Network Error</strong>: Please check your internet or email directly at <a href="mailto:shahnawazsaifi2006@gmail.com" style="color: #fff; text-decoration: underline;">shahnawazsaifi2006@gmail.com</a>.`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

/* ==========================================================================
   8. NAVIGATION & MOBILE DRAWER
   ========================================================================== */
function initNavigation() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const backdrop = document.querySelector('.mobile-backdrop');
  const closeBtn = document.querySelector('.mobile-nav-close');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-links a');

  function openDrawer() {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // Scroll Spy Active Highlighter
  const sections = document.querySelectorAll('section[id], div[id].hero-section');
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 200;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.nav-links a').forEach(a => {
          if (a.getAttribute('href') === `#${id}`) {
            a.classList.add('active');
          } else {
            a.classList.remove('active');
          }
        });
      }
    });
  });
}

/* ==========================================================================
   9. SCROLL TO TOP UTILITY
   ========================================================================== */
function initScrollToTop() {
  const scrollBtn = document.querySelector('.scroll-to-top');
  if (!scrollBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
