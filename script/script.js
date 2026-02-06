// helpers
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const lerp = (a, b, t) => a + (b - a) * t;

const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

// =======================
// 1) cursor glow + vars
// =======================
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
}

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  mx = clamp(mouseX / window.innerWidth, 0, 1);
  my = clamp(mouseY / window.innerHeight, 0, 1);

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

// =======================
// 2) mouse follower ship
// =======================
const fxFollower = document.getElementById('fxFollower');
let shipX = window.innerWidth * 0.2;
let shipY = window.innerHeight * 0.3;
let targetX = shipX;
let targetY = shipY;

document.addEventListener('mousemove', (e) => {
  targetX = e.clientX + 20;
  targetY = e.clientY + 20;
});

function shipTick(){
  if (!fxFollower) return;
  shipX = lerp(shipX, targetX, 0.08);
  shipY = lerp(shipY, targetY, 0.08);

  const dx = targetX - shipX;
  const rot = clamp(dx * 0.08, -18, 18);
  const floatY = Math.sin(Date.now() * 0.004) * 6;

  fxFollower.style.transform = `translate3d(${shipX}px, ${shipY + floatY}px, 0) rotate(${rot}deg)`;
  requestAnimationFrame(shipTick);
}
requestAnimationFrame(shipTick);

// =======================
// 3) Press Start
// =======================
const pressBtn = document.getElementById('pressStartBtn');
pressBtn?.addEventListener('click', () => {
  pressBtn.classList.add('is-pressed');
  const hero = document.querySelector('.hero');
  hero?.classList.add('cyber-glitch');
  setTimeout(() => hero?.classList.remove('cyber-glitch'), 260);

  setTimeout(() => {
    document.getElementById('stage1')?.scrollIntoView({ behavior:'smooth', block:'start' });
    pressBtn.classList.remove('is-pressed');
  }, 220);
});

// nav cta
document.getElementById('navCta')?.addEventListener('click', () => {
  document.getElementById('stage3')?.scrollIntoView({ behavior:'smooth', block:'start' });
});

// =======================
// 4) Back to top
// =======================
const backToTopButton = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (!backToTopButton) return;
  if (window.pageYOffset > 500) backToTopButton.classList.add('visible');
  else backToTopButton.classList.remove('visible');
});
backToTopButton?.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

// =======================
// 5) Title auto glitch
// =======================
(() => {
  if (prefersReducedMotion) return;
  const titlePixels = document.querySelectorAll('.title-pixel');
  if (!titlePixels.length) return;

  const GLITCH_ON_MS = 900;

  function triggerTitleGlitch() {
    titlePixels.forEach(el => {
      el.classList.add('glitch-on');
      clearTimeout(el._autoGlitchTimer);
      el._autoGlitchTimer = setTimeout(() => el.classList.remove('glitch-on'), GLITCH_ON_MS);
    });
  }

  function loop() {
    const delay = Math.random() * 2200 + 2600;
    setTimeout(() => {
      triggerTitleGlitch();
      if (Math.random() < 0.22) {
        const hero = document.querySelector('.hero');
        hero?.classList.add('cyber-glitch');
        setTimeout(() => hero?.classList.remove('cyber-glitch'), 220);
      }
      loop();
    }, delay);
  }

  setTimeout(() => { triggerTitleGlitch(); loop(); }, 1200);
})();

// =======================
// 6) Skill + AI bars animate when visible
// =======================
function animateBars() {
  document.querySelectorAll('.fill[data-skill]').forEach(bar => {
    const v = bar.getAttribute('data-skill');
    if (v) bar.style.width = `${v}%`;
  });
  document.querySelectorAll('.fill.ai[data-ai]').forEach(bar => {
    const v = bar.getAttribute('data-ai');
    if (v) bar.style.width = `${v}%`;
  });
}
let barsAnimated = false;
const stage2 = document.getElementById('stage2');
const barsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !barsAnimated) {
      animateBars();
      barsAnimated = true;
    }
  });
}, { threshold:0.25 });

if (stage2) barsObserver.observe(stage2);

// =======================
// 7) Tilt system
// =======================
function setupTilt() {
  if (prefersReducedMotion) return;
  const els = document.querySelectorAll('[data-tilt]');
  els.forEach(el => {
    const strength = parseFloat(el.getAttribute('data-tilt-strength') || '10');

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const px = (x - 0.5) * 2;
      const py = (y - 0.5) * 2;

      const ry = px * strength;
      const rx = -py * strength;

      const tx = px * 6;
      const ty = py * 6;

      el.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translate3d(${tx}px, ${ty}px, 0)`;
    };

    const onLeave = () => { el.style.transform = ''; };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  });
}
setupTilt();

// =======================
// 8) QUEST MODAL (same data, game flavor)
// =======================
const modal = document.getElementById('projectModal');
const modalOverlay = modal?.querySelector('.modal-overlay');
const modalClose = modal?.querySelector('.modal-close');
const workItems = document.querySelectorAll('[data-project]');

const projectData = {
  nextlab: {
    title: '넥스트랩 웹페이지',
    category: 'MAIN QUEST • TEAM PROJECT',
    date: '2025.12 - 2026.02',
    status: '95% Complete',
    description: '건설 현장 AI 스마트 CCTV 업체 웹사이트. 팀 프로젝트에서 메인 디자이너를 담당했습니다. 반응형 웹디자인으로 모바일과 데스크톱 모두에서 최적화된 사용자 경험을 제공합니다.',
    role: '메인 디자이너',
    tools: ['Figma', 'Photoshop', 'HTML/CSS', 'JavaScript'],
    tags: ['Responsive', 'AI CCTV', 'Team Project']
  },
  badaju: {
    title: '바다주 웹페이지',
    category: 'SIDE QUEST • WEB PUBLISHING',
    date: '2025.10 - 2025.11',
    status: '100% Complete',
    description: '와인 판매 사이트의 메인 및 서브페이지를 디자인하고 퍼블리싱했습니다. 타이포그래피와 여백 활용에 중점을 두었습니다.',
    role: '디자인 & 퍼블리싱',
    tools: ['Figma', 'HTML/CSS', 'JavaScript'],
    tags: ['Publishing', 'E-commerce']
  },
  olive: {
    title: '올리브영 리디자인',
    category: 'SIDE QUEST • WEB REDESIGN',
    date: '2025.09 - 2025.10',
    status: '100% Complete',
    description: '올리브영 웹사이트 메인 페이지를 리디자인했습니다. 사용자 경험을 개선하고 더 직관적인 네비게이션을 제공하는 데 중점을 두었습니다.',
    role: '개인 프로젝트',
    tools: ['Figma', 'Photoshop'],
    tags: ['Redesign', 'UX/UI']
  },
  jeju: {
    title: '제주숨 웹페이지',
    category: 'SIDE QUEST • LANDING',
    date: '2025.08 - 2025.09',
    status: '100% Complete',
    description: '제주 숨결 고르기 활동을 테마로 한 랜딩페이지입니다. 제주의 자연과 문화를 모던하게 표현했습니다.',
    role: '기획 & 디자인',
    tools: ['Figma', 'HTML/CSS'],
    tags: ['Landing Page', 'Personal']
  },
  starbucks: {
    title: '스타벅스 클론코딩',
    category: 'TRAINING • CLONE CODING',
    date: '2025.07',
    status: '100% Complete',
    description: '스타벅스 메인페이지 클론코딩 개인 작업입니다. HTML, CSS, JavaScript를 활용한 인터랙티브 요소 구현에 집중했습니다.',
    role: '개인 학습',
    tools: ['HTML/CSS', 'JavaScript'],
    tags: ['Clone Coding', 'Interactive']
  },
  poster: {
    title: '포스터 디자인',
    category: 'ARCHIVE • EDITORIAL',
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
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.2rem;margin-bottom:1.2rem;font-size:0.9rem;">
      <div><strong style="color: var(--neon-blue);">QUEST:</strong><br>${project.category}</div>
      <div><strong style="color: var(--neon-blue);">DATE:</strong><br>${project.date}</div>
      <div><strong style="color: var(--neon-blue);">STATUS:</strong><br><span style="color: var(--neon-green);">${project.status}</span></div>
      <div><strong style="color: var(--neon-blue);">ROLE:</strong><br>${project.role}</div>
    </div>
    <div style="margin-top:0.6rem;">
      <strong style="color: var(--neon-purple);">TOOLS:</strong><br>
      <span style="color: var(--lighter-gray);">${project.tools.join(', ')}</span>
    </div>
  `;

  modal.querySelector('.modal-description').textContent = project.description;

  const tagsHTML = project.tags.map(tag =>
    `<span style="padding:0.5rem 0.9rem;background:rgba(0,240,255,0.1);border:1px solid rgba(0,240,255,0.3);border-radius:999px;font-size:0.75rem;color:var(--neon-blue);">${tag}</span>`
  ).join('');

  modal.querySelector('.modal-details').innerHTML = `
    <h3 style="font-family: var(--font-display); font-size: 1.4rem; margin-bottom: 1rem; color: var(--neon-purple);">REWARDS</h3>
    <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">${tagsHTML}</div>
  `;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
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

// =======================
// 9) HUD time + log + progress
// =======================
(() => {
  if (prefersReducedMotion) return;

  const hudLines = document.getElementById('hudLines');
  const hudTime = document.getElementById('hudTime');
  const valueEl = document.getElementById('hudProgressValue');
  const fillEl = document.getElementById('hudProgressFill');

  if (!hudLines || !hudTime || !valueEl || !fillEl) return;

  function pad2(n){ return String(n).padStart(2,'0'); }
  function updateTime(){
    const d = new Date();
    hudTime.textContent = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  }
  updateTime();
  setInterval(updateTime, 1000);

  const pool = [
    ['BOOT', 'Initializing UI modules…', true],
    ['SCAN', 'Rendering neon grid layers', false],
    ['NET',  'Handshake established', true],
    ['GPU',  'Bloom shader: OK', false],
    ['SYS',  'Loading portfolio quests…', false],
    ['AI',   'Assistant pipeline ready', true],
    ['HUD',  'Overlay synced', false],
    ['SEC',  'Integrity check passed', true],
    ['IO',   'Listening for input events', false],
  ];

  function addLine(tag, msg, accent){
    const line = document.createElement('div');
    line.className = 'hud-line';
    line.innerHTML = `
      <span class="hud-tag">[${tag}]</span>
      <span class="${accent ? 'hud-accent' : ''}">${msg}</span>
    `;
    hudLines.appendChild(line);
    const lines = hudLines.querySelectorAll('.hud-line');
    if (lines.length > 7) lines[0].remove();
    hudLines.scrollTop = hudLines.scrollHeight;
  }

  addLine('SYS', 'SYSTEM ONLINE', true);
  addLine('BOOT', 'Preparing hero sequence…', false);

  // progress
  let p = 0;
  function step(){
    const inc = p < 60 ? (Math.random()*6 + 2) : (Math.random()*3 + 0.6);
    p = Math.min(100, p + inc);

    const show = Math.floor(p);
    valueEl.textContent = `${show}%`;
    fillEl.style.width = `${show}%`;

    if (show >= 100) {
      addLine('SYS', 'READY. PRESS START.', true);
      return;
    }
    const delay = p < 60 ? (Math.random()*160 + 110) : (Math.random()*220 + 180);
    setTimeout(step, delay);
  }
  setTimeout(step, 500);

  // log stream
  function loop(){
    const [tag, msg, accent] = pool[Math.floor(Math.random()*pool.length)];
    addLine(tag, msg, accent);
    setTimeout(loop, Math.random()*900 + 700);
  }
  setTimeout(loop, 900);
})();

// =======================
// 10) typing text
// =======================
(() => {
  const el = document.getElementById('typingText');
  if (!el) return;

  if (prefersReducedMotion) {
    el.textContent = 'SYSTEM ONLINE';
    return;
  }

  const texts = [
    'SYSTEM ONLINE',
    'CHARACTER SELECT READY',
    'SKILL TREE LOADED',
    'QUEST LOG AVAILABLE',
    'PRESS START TO BEGIN'
  ];

  let textIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function typeLoop(){
    const current = texts[textIndex];

    if (!deleting) {
      el.textContent = current.slice(0, charIndex++);
      if (charIndex > current.length + 6) deleting = true;
    } else {
      el.textContent = current.slice(0, charIndex--);
      if (charIndex < 0) {
        deleting = false;
        charIndex = 0;
        textIndex = (textIndex + 1) % texts.length;
      }
    }

    setTimeout(typeLoop, deleting ? 40 : 70);
  }

  setTimeout(typeLoop, 600);
})();




// =======================
// HUD height sync with hero card
// =======================
(() => {
  const hero = document.querySelector('.hero-container');
  const hud = document.querySelector('.hero-hud');
  if (!hero || !hud) return;

  const syncHeight = () => {
    const rect = hero.getBoundingClientRect();
    hud.style.height = `${rect.height}px`;
  };

  syncHeight();
  window.addEventListener('resize', syncHeight);
})();




// =======================
// Align HUD center with hero card center
// =======================
(() => {
  const hero = document.querySelector('.hero-container');
  const hud = document.querySelector('.hero-hud');
  if (!hero || !hud) return;

  const sync = () => {
    const r = hero.getBoundingClientRect();
    const centerY = r.top + (r.height / 2);
    hud.style.top = `${centerY}px`;
  };

  // 최초 1회
  sync();

  // 리사이즈/스크롤/폰트 로드 등으로 위치가 달라질 수 있어서 계속 동기화
  window.addEventListener('resize', sync);
  window.addEventListener('scroll', sync, { passive: true });

  // 폰트/레이아웃 안정화 후 한 번 더
  setTimeout(sync, 0);
  setTimeout(sync, 300);
})();
