// =======================================================
// 0) Small helpers
// =======================================================
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const lerp = (a, b, t) => a + (b - a) * t;

const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

// =======================================================
// 1) Particle system (keep your original vibe)
// =======================================================
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;

  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.width = Math.random() * 3 + 1 + 'px';
    particle.style.height = particle.style.width;
    particle.style.background = ['#00F0FF', '#9D00FF', '#FF006E'][Math.floor(Math.random() * 3)];
    particle.style.borderRadius = '50%';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.opacity = Math.random() * 0.5;
    particle.style.animation = `particleFloat ${Math.random() * 10 + 10}s linear infinite`;
    particle.style.boxShadow = `0 0 10px currentColor`;

    particlesContainer.appendChild(particle);
  }
}

// Add particle animation
const particleStyle = document.createElement('style');
particleStyle.textContent = `
@keyframes particleFloat {
  0% { transform: translate(0, 0) scale(1); }
  25%{ transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1.2); }
  50%{ transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0.8); }
  75%{ transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1.1); }
  100%{ transform: translate(0, 0) scale(1); }
}`;
document.head.appendChild(particleStyle);

createParticles();

// =======================================================
// 2) Smooth scroll
// =======================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// =======================================================
// 3) Back to top
// =======================================================
const backToTopButton = document.querySelector('.back-to-top');
window.addEventListener('scroll', () => {
  if (!backToTopButton) return;
  if (window.pageYOffset > 500) backToTopButton.classList.add('visible');
  else backToTopButton.classList.remove('visible');
});
backToTopButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// =======================================================
// 4) Global cursor / scroll vars (for depth + sheen)
// =======================================================
const cursorGlowEl = document.getElementById('cursorGlow');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let mx = 0.5, my = 0.5;
let scrollY = 0;

function updateRootVars() {
  const root = document.documentElement;
  root.style.setProperty('--mx', String(mx));
  root.style.setProperty('--my', String(my));
  root.style.setProperty('--scroll', String(scrollY));

  // ✅ 추가: 히어로 3D 회전 각도(마우스 기반)
  root.style.setProperty('--ry', `${(mx - 0.5) * 14}deg`);  // 좌우
  root.style.setProperty('--rx', `${(my - 0.5) * -10}deg`); // 상하
}

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  mx = clamp(mouseX / window.innerWidth, 0, 1);
  my = clamp(mouseY / window.innerHeight, 0, 1);

  // cursor glow
  if (cursorGlowEl && !prefersReducedMotion) {
    cursorGlowEl.style.left = `${mouseX}px`;
    cursorGlowEl.style.top = `${mouseY}px`;
    cursorGlowEl.style.opacity = '1';
  }
  updateRootVars();
});

document.addEventListener('mouseleave', () => {
  if (cursorGlowEl) cursorGlowEl.style.opacity = '0';
});

window.addEventListener('scroll', () => {
  scrollY = window.pageYOffset || 0;
  updateRootVars();
});

// =======================================================
// 5) Pseudo-3D neon network + circuits (Canvas 2D, Z-depth)
//    - feels "3D" via perspective projection + parallax
// =======================================================
class NeonNetwork {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas?.getContext('2d', { alpha: true });
    this.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    this.nodes = [];
    this.nodeCount = 72;
    this.maxLinkDist = 140;
    this.fov = 520;

    this.tMouseX = 0;
    this.tMouseY = 0;
    this.tScroll = 0;

    this.running = false;

    if (this.canvas && this.ctx) {
      this.resize();
      this.seed();
      this.running = true;
      this.tick = this.tick.bind(this);
      requestAnimationFrame(this.tick);

      window.addEventListener('resize', () => this.resize());
    }
  }

  resize() {
    if (!this.canvas) return;
    const w = Math.floor(window.innerWidth);
    const h = Math.floor(window.innerHeight);
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx?.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  seed() {
    this.nodes = [];
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let i = 0; i < this.nodeCount; i++) {
      this.nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 700 + 40,         // depth
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        hue: Math.random() < 0.5 ? 190 : (Math.random() < 0.5 ? 280 : 330),
        r: Math.random() * 1.2 + 0.6
      });
    }
  }

  project(n) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // parallax: cursor + scroll affect x/y based on z
    const px = (mx - 0.5) * 2; // [-1..1]
    const py = (my - 0.5) * 2;

    const par = (1 / (n.z / 220)); // near nodes move more

    const x = n.x + px * 40 * par;
    const y = n.y + py * 40 * par - (scrollY * 0.06 * par);

    const scale = this.fov / (this.fov + n.z);
    return { sx: (x - w / 2) * scale + w / 2, sy: (y - h / 2) * scale + h / 2, scale };
  }

  step() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (const n of this.nodes) {
      n.x += n.vx;
      n.y += n.vy;

      // gentle drift with cursor direction
      n.vx += ((mx - 0.5) * 0.002);
      n.vy += ((my - 0.5) * 0.002);

      n.vx = clamp(n.vx, -0.6, 0.6);
      n.vy = clamp(n.vy, -0.6, 0.6);

      if (n.x < -40) n.x = w + 40;
      if (n.x > w + 40) n.x = -40;
      if (n.y < -40) n.y = h + 40;
      if (n.y > h + 40) n.y = -40;
    }
  }

  draw() {
    const ctx = this.ctx;
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    ctx.clearRect(0, 0, w, h);

    // background bloom
    const g = ctx.createRadialGradient(w * mx, h * my, 0, w * mx, h * my, Math.min(w, h) * 0.65);
    g.addColorStop(0, 'rgba(0,240,255,0.08)');
    g.addColorStop(0.25, 'rgba(157,0,255,0.06)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // links (circuits)
    for (let i = 0; i < this.nodes.length; i++) {
      const a = this.nodes[i];
      const pa = this.project(a);

      for (let j = i + 1; j < this.nodes.length; j++) {
        const b = this.nodes[j];
        const pb = this.project(b);

        const dx = pa.sx - pb.sx;
        const dy = pa.sy - pb.sy;
        const dist = Math.hypot(dx, dy);

        if (dist < this.maxLinkDist) {
          const t = 1 - dist / this.maxLinkDist;
          ctx.lineWidth = 1;
          ctx.strokeStyle = `rgba(0,240,255,${0.12 * t})`;
          ctx.beginPath();
          ctx.moveTo(pa.sx, pa.sy);
          // tiny bend for “circuit” look
          const midx = (pa.sx + pb.sx) / 2 + (my - 0.5) * 14 * t;
          const midy = (pa.sy + pb.sy) / 2 + (mx - 0.5) * 14 * t;
          ctx.quadraticCurveTo(midx, midy, pb.sx, pb.sy);
          ctx.stroke();

          // pulse dot on link (subtle)
          if (!prefersReducedMotion && t > 0.55 && Math.random() < 0.02) {
            ctx.fillStyle = `rgba(157,0,255,${0.14 * t})`;
            ctx.beginPath();
            ctx.arc(midx, midy, 1.2 + 1.8 * t, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // nodes
    for (const n of this.nodes) {
      const p = this.project(n);
      const alpha = clamp(0.08 + (1 - n.z / 800) * 0.26, 0.06, 0.32);

      ctx.fillStyle = `hsla(${n.hue}, 100%, 70%, ${alpha})`;
      ctx.shadowColor = `hsla(${n.hue}, 100%, 70%, ${alpha})`;
      ctx.shadowBlur = 14 * p.scale;

      ctx.beginPath();
      ctx.arc(p.sx, p.sy, (n.r * 2.1) * (0.9 + p.scale), 0, Math.PI * 2);
      ctx.fill();

      // tiny halo
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.35})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, (n.r * 4.0) * (0.8 + p.scale), 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  tick() {
    if (!this.running) return;
    this.step();
    this.draw();
    requestAnimationFrame(this.tick);
  }
}

if (!prefersReducedMotion) new NeonNetwork('bgNodes');

// =======================================================
// 6) Depth parallax for hero floating cards
//    (avoids overwriting transform animations by using CSS vars)
// =======================================================
const floatingCards = document.querySelectorAll('.floating-card');
function updateFloatingCardParallax() {
  const xPercent = (mx - 0.5) * 2;
  const yPercent = (my - 0.5) * 2;

  floatingCards.forEach((card, idx) => {
    const depth = parseFloat(card.getAttribute('data-depth') || '1');
    const speed = (idx + 1) * 8 * depth;
    const x = xPercent * speed;
    const y = yPercent * speed;
    card.style.setProperty('--tx', `${x}px`);
    card.style.setProperty('--ty', `${y}px`);
  });

  requestAnimationFrame(updateFloatingCardParallax);
}
requestAnimationFrame(updateFloatingCardParallax);

// =======================================================
// 7) Skill meters animation
// =======================================================
function animateSkillMeters() {
  document.querySelectorAll('.meter-fill').forEach(meter => {
    const skillLevel = meter.getAttribute('data-skill');
    if (skillLevel) meter.style.width = `${skillLevel}%`;
  });
}
function animateAIBars() {
  document.querySelectorAll('.ai-fill').forEach(bar => {
    const aiLevel = bar.getAttribute('data-ai');
    if (aiLevel) bar.style.width = `${aiLevel}%`;
  });
}

const skillsSection = document.querySelector('.skills');
let skillsAnimated = false;
const skillsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !skillsAnimated) {
      animateSkillMeters();
      animateAIBars();
      skillsAnimated = true;
    }
  });
}, { threshold: 0.3 });
if (skillsSection) skillsObserver.observe(skillsSection);

// =======================================================
// 8) Project modal (keep your original content/data)
// =======================================================
const modal = document.getElementById('projectModal');
const modalOverlay = modal?.querySelector('.modal-overlay');
const modalClose = modal?.querySelector('.modal-close');
const workItems = document.querySelectorAll('[data-project]');

const projectData = {
  nextlab: {
    title: '넥스트랩 웹페이지',
    category: 'WEB DESIGN • TEAM PROJECT',
    date: '2025.12 - 2026.02',
    status: '95% Complete',
    description: '건설 현장 AI 스마트 CCTV 업체 웹사이트. 팀 프로젝트에서 메인 디자이너를 담당했습니다. 반응형 웹디자인으로 모바일과 데스크톱 모두에서 최적화된 사용자 경험을 제공합니다.',
    role: '메인 디자이너',
    tools: ['Figma', 'Photoshop', 'HTML/CSS', 'JavaScript'],
    tags: ['Responsive', 'AI CCTV', 'Team Project']
  },
  badaju: {
    title: '바다주 웹페이지',
    category: 'WEB PUBLISHING',
    date: '2025.10 - 2025.11',
    status: '100% Complete',
    description: '와인 판매 사이트의 메인 및 서브페이지를 디자인하고 퍼블리싱했습니다. 우아하고 세련된 분위기를 연출하기 위해 타이포그래피와 여백 활용에 중점을 두었습니다.',
    role: '디자인 & 퍼블리싱',
    tools: ['Figma', 'HTML/CSS', 'JavaScript'],
    tags: ['Publishing', 'E-commerce']
  },
  olive: {
    title: '올리브영 리디자인',
    category: 'WEB REDESIGN',
    date: '2025.09 - 2025.10',
    status: '100% Complete',
    description: '올리브영 웹사이트 메인 페이지를 리디자인했습니다. 사용자 경험을 개선하고 더 직관적인 네비게이션을 제공하는 데 중점을 두었습니다.',
    role: '개인 프로젝트',
    tools: ['Figma', 'Photoshop'],
    tags: ['Redesign', 'UX/UI']
  },
  jeju: {
    title: '제주숨 웹페이지',
    category: 'PERSONAL PROJECT',
    date: '2025.08 - 2025.09',
    status: '100% Complete',
    description: '제주 숨결 고르기 활동을 테마로 한 랜딩페이지입니다. 제주의 자연과 문화를 모던하게 표현했습니다.',
    role: '기획 & 디자인',
    tools: ['Figma', 'HTML/CSS'],
    tags: ['Landing Page', 'Personal']
  },
  starbucks: {
    title: '스타벅스 클론코딩',
    category: 'CLONE CODING',
    date: '2025.07',
    status: '100% Complete',
    description: '스타벅스 메인페이지 클론코딩 개인 작업입니다. HTML, CSS, JavaScript를 활용한 인터랙티브 요소 구현에 집중했습니다.',
    role: '개인 학습',
    tools: ['HTML/CSS', 'JavaScript'],
    tags: ['Clone Coding', 'Interactive']
  },
  poster: {
    title: '포스터 디자인',
    category: 'EDITORIAL DESIGN',
    date: '2020 - 2025',
    status: '100% Complete',
    description: '편집디자인 경력 동안 작업한 다양한 포스터 디자인 모음입니다. 공공기관 안전 캠페인부터 브랜딩 포스터까지 다양한 주제를 다뤘습니다.',
    role: '편집디자이너',
    tools: ['InDesign', 'Photoshop', 'Illustrator'],
    tags: ['Editorial', 'Print Design']
  }
};

function openModal(projectId) {
  if (!modal) return;
  const project = projectData[projectId];
  if (!project) return;

  modal.querySelector('.modal-title').textContent = project.title;

  modal.querySelector('.modal-meta').innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.5rem;margin-bottom:1.5rem;font-size:0.875rem;">
      <div><strong style="color: var(--neon-blue);">카테고리:</strong><br>${project.category}</div>
      <div><strong style="color: var(--neon-blue);">기간:</strong><br>${project.date}</div>
      <div><strong style="color: var(--neon-blue);">상태:</strong><br><span style="color: var(--neon-green);">${project.status}</span></div>
      <div><strong style="color: var(--neon-blue);">역할:</strong><br>${project.role}</div>
    </div>
    <div style="margin-top:1rem;">
      <strong style="color: var(--neon-purple);">사용 툴:</strong><br>
      <span style="color: var(--lighter-gray);">${project.tools.join(', ')}</span>
    </div>
  `;

  modal.querySelector('.modal-description').textContent = project.description;

  const tagsHTML = project.tags.map(tag =>
    `<span style="padding:0.5rem 1rem;background:rgba(0,240,255,0.1);border:1px solid rgba(0,240,255,0.3);border-radius:999px;font-size:0.75rem;color:var(--neon-blue);">${tag}</span>`
  ).join('');

  modal.querySelector('.modal-details').innerHTML = `
    <h3 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 1rem; color: var(--neon-purple);">프로젝트 태그</h3>
    <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">${tagsHTML}</div>
  `;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // focus close for accessibility
  setTimeout(() => modal.querySelector('.modal-close')?.focus(), 0);
}

const closeModal = () => {
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

workItems.forEach(item => {
  item.addEventListener('click', () => {
    const projectId = item.getAttribute('data-project');
    if (projectId) openModal(projectId);
  });
});

modalClose?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal?.classList.contains('active')) closeModal();
});

// =======================================================
// 9) Reveal animations (same idea, smoother)
// =======================================================
const revealElements = document.querySelectorAll('.info-card, .work-card, .skill-card, .ai-card, .work-item.featured');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, index * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -100px 0px' });

revealElements.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(36px)';
  el.style.transition = 'opacity .8s cubic-bezier(0.4, 0, 0.2, 1), transform .8s cubic-bezier(0.4, 0, 0.2, 1)';
  revealObserver.observe(el);
});

// =======================================================
// 10) Generic tilt system (interactive 3D depth)
//     - uses inline style transform, but preserves translateY from reveal by applying after reveal ends
// =======================================================
function setupTilt() {
  const els = document.querySelectorAll('[data-tilt]');
  els.forEach(el => {
    let rx = 0, ry = 0;
    let tx = 0, ty = 0;

    const strength = parseFloat(el.getAttribute('data-tilt-strength') || '10');

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;   // 0..1
      const y = (e.clientY - rect.top) / rect.height;   // 0..1

      // map to [-1..1]
      const px = (x - 0.5) * 2;
      const py = (y - 0.5) * 2;

      // target rotations
      ry = px * strength;
      rx = -py * strength;

      // subtle translate for depth
      tx = px * 6;
      ty = py * 6;

      el.style.setProperty('--tilt-x', `${rx}deg`);
      el.style.setProperty('--tilt-y', `${ry}deg`);

      // do not overwrite hero special transforms; only apply tilt for cards/sections
      el.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translate3d(${tx}px, ${ty}px, 0)`;
    };

    const onLeave = () => {
      el.style.transform = '';
      el.style.removeProperty('--tilt-x');
      el.style.removeProperty('--tilt-y');
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  });
}

if (!prefersReducedMotion) setupTilt();

// =======================================================
// 11) Nav CTA scroll to contact
// =======================================================
document.querySelector('.nav-cta')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
});

// =======================================================
// 12) Initial load vibe (typing title)
// =======================================================
function createTypingEffect() {
  const titleWords = document.querySelectorAll('.title-word');
  titleWords.forEach((word, index) => {
    word.style.opacity = '0';
    word.style.transform = 'translateY(14px)';
    setTimeout(() => {
      word.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      word.style.opacity = '1';
      word.style.transform = 'translateY(0)';
    }, index * 260);
  });
}

window.addEventListener('load', () => {
  setTimeout(() => createTypingEffect(), 420);
  // initial vars
  scrollY = window.pageYOffset || 0;
  updateRootVars();
});




// =======================================================
// Mouse follower spaceship (smooth + floating)
// =======================================================
const fxFollower = document.getElementById('fxFollower');

// 현재 위치
let shipX = window.innerWidth * 0.2;
let shipY = window.innerHeight * 0.3;

// 목표 위치(마우스)
let targetX = shipX;
let targetY = shipY;

// 마우스 움직이면 목표 위치 변경
document.addEventListener('mousemove', (e) => {
  targetX = e.clientX + 20; // 마우스 살짝 뒤
  targetY = e.clientY + 20;
});

function shipTick(){
  if (!fxFollower) return;

  // ✅ 부드럽게 따라오기 (숫자 ↓ = 더 느리고 부드러움)
  shipX = lerp(shipX, targetX, 0.08);
  shipY = lerp(shipY, targetY, 0.08);

  // 이동 방향에 따라 살짝 기울기
  const dx = targetX - shipX;
  const rot = clamp(dx * 0.08, -18, 18);

  // 둥실둥실 떠다니는 효과
  const floatY = Math.sin(Date.now() * 0.004) * 6;

  fxFollower.style.transform =
    `translate3d(${shipX}px, ${shipY + floatY}px, 0) rotate(${rot}deg)`;

  requestAnimationFrame(shipTick);
}
requestAnimationFrame(shipTick);




const hero = document.querySelector('.hero');
if (hero && !prefersReducedMotion) {
  setInterval(() => {
    if (Math.random() < 0.22) {
      hero.classList.add('cyber-glitch');
      setTimeout(() => hero.classList.remove('cyber-glitch'), 120);
    }
  }, 1800);
}




// =======================================================
// Heavy + Smooth Glass Tilt (only for .hero-container)
// =======================================================
(() => {
  const glass = document.querySelector('.hero-container');
  if (!glass) return;

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const lerp = (a, b, t) => a + (b - a) * t;

  // ✅ 움직임 강도(작을수록 더 안정적)
  const MAX_RY = 10;   // 좌우 최대 각도(추천 6~12)
  const MAX_RX = 6;    // 상하 최대 각도(추천 4~8)

  // ✅ 무게감(작을수록 더 “무겁고” 느림)
  const FOLLOW = 0.06; // 추천 0.04 ~ 0.09

  // 목표 각도 / 현재 각도
  let tRx = 0, tRy = 0;
  let rx = 0, ry = 0;

  // 마우스는 목표값만 바꾼다
  window.addEventListener('mousemove', (e) => {
    const mx = e.clientX / window.innerWidth;  // 0..1
    const my = e.clientY / window.innerHeight; // 0..1

    tRy = clamp((mx - 0.5) * (MAX_RY * 2), -MAX_RY, MAX_RY);
    tRx = clamp((my - 0.5) * (MAX_RX * -2), -MAX_RX, MAX_RX);
  });

  // 마우스 나가면 천천히 원위치
  window.addEventListener('mouseleave', () => {
    tRx = 0; tRy = 0;
  });

  function tick() {
    // ✅ 무겁게 따라가기
    rx = lerp(rx, tRx, FOLLOW);
    ry = lerp(ry, tRy, FOLLOW);

    // ✅ 글래스 패널만 회전 + 살짝 Z로 띄워서 입체감
    glass.style.transform =
      `perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(18px)`;

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
