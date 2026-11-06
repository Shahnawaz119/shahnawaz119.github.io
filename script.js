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
   1. THREE.JS 3D CYBER PARTICLE SPHERE & ORBIT SYSTEM
   ========================================================================== */
function initThreeJsHero() {
  const canvas = document.getElementById('hero-webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 6.2;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particle Sphere Core
  const particleCount = 1800;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorPrimary = new THREE.Color('#6366f1');
  const colorCyan = new THREE.Color('#06b6d4');
  const colorPurple = new THREE.Color('#a855f7');

  const sphereRadius = 2.4;
  for (let i = 0; i < particleCount; i++) {
    // Fibonacci sphere distribution for uniform spherical coverage
    const phi = Math.acos(1 - 2 * (i + 0.5) / particleCount);
    const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

    // Add subtle procedural noise
    const r = sphereRadius + (Math.random() - 0.5) * 0.15;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Gradient vertex coloring
    const mixedColor = colorPrimary.clone();
    if (i % 3 === 0) mixedColor.lerp(colorCyan, 0.8);
    else if (i % 3 === 1) mixedColor.lerp(colorPurple, 0.75);

    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Particle Material
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });

  const particleSphere = new THREE.Points(geometry, particleMaterial);
  scene.add(particleSphere);

  // Orbital Wireframe Ring 1
  const ring1Geo = new THREE.TorusGeometry(3.0, 0.015, 16, 100);
  const ring1Mat = new THREE.MeshBasicMaterial({
    color: 0x6366f1,
    wireframe: true,
    transparent: true,
    opacity: 0.25
  });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.rotation.x = Math.PI / 3;
  scene.add(ring1);

  // Orbital Wireframe Ring 2
  const ring2Geo = new THREE.TorusGeometry(3.4, 0.012, 16, 100);
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    wireframe: true,
    transparent: true,
    opacity: 0.2
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = -Math.PI / 4;
  ring2.rotation.y = Math.PI / 6;
  scene.add(ring2);

  // Floating Icosahedron
  const icoGeo = new THREE.IcosahedronGeometry(0.55, 0);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    wireframe: true,
    transparent: true,
    opacity: 0.4
  });
  const icoMesh = new THREE.Mesh(icoGeo, icoMat);
  icoMesh.position.set(-3.2, 1.8, -1);
  scene.add(icoMesh);

  // Floating Octahedron
  const octGeo = new THREE.OctahedronGeometry(0.45, 0);
  const octMat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });
  const octMesh = new THREE.Mesh(octGeo, octMat);
  octMesh.position.set(3.4, -1.5, -1.2);
  scene.add(octMesh);

  // Ambient Starfield
  const starCount = 350;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i += 3) {
    starPos[i] = (Math.random() - 0.5) * 20;
    starPos[i + 1] = (Math.random() - 0.5) * 20;
    starPos[i + 2] = (Math.random() - 0.5) * 15 - 2;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    size: 0.035,
    color: 0xffffff,
    transparent: true,
    opacity: 0.5
  });
  const starField = new THREE.Points(starGeo, starMat);
  scene.add(starField);

  // Mouse Interaction with Smooth Interpolation
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Pause when off-screen for maximum performance
  let isVisible = true;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
    });
  }, { threshold: 0.05 });
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) observer.observe(heroSection);

  // Render Loop
  let clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const elapsedTime = clock.getElapsedTime();

    // Damped lerp mouse follow
    targetX += (mouseX - targetX) * 0.04;
    targetY += (mouseY - targetY) * 0.04;

    particleSphere.rotation.y = elapsedTime * 0.12 + targetX * 0.6;
    particleSphere.rotation.x = elapsedTime * 0.06 + targetY * 0.4;

    ring1.rotation.z = elapsedTime * 0.15;
    ring1.rotation.y = targetX * 0.3;

    ring2.rotation.z = -elapsedTime * 0.18;
    ring2.rotation.x = -Math.PI / 4 + targetY * 0.3;

    icoMesh.rotation.x = elapsedTime * 0.4;
    icoMesh.rotation.y = elapsedTime * 0.3;
    icoMesh.position.y = 1.8 + Math.sin(elapsedTime * 1.5) * 0.2;

    octMesh.rotation.x = -elapsedTime * 0.5;
    octMesh.rotation.z = elapsedTime * 0.3;
    octMesh.position.y = -1.5 + Math.cos(elapsedTime * 1.3) * 0.25;

    camera.position.x = targetX * 0.8;
    camera.position.y = -targetY * 0.6;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  // Resize Handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
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
