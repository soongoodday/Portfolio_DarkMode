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
    status: '100% Complete',
    description: '기업 외주 작업으로 진행한 팀 프로젝트입니다. 건설(산업) 현장 같은 특수한 공간에 설치하는 AI 스마트 CCTV 업체로, 사용자 연령대는 30대 이상입니다. 메인 디자이너를 맡아 진행했고, 코딩은 AI(ChatGPT, Claude)를 활용해서 서브 페이지 일부를 진행했습니다. 색상은 CI에서 메인과 서브 컬러를 도출했습니다.',
    role: '메인 디자이너 & 서브 페이지(2페이지) 코딩',
    tools: ['Figma', 'ChatGPT', 'HTML5', 'CSS3', 'Claude'],
    tags: ['Responsive', 'AI CCTV', 'Team Project'],
    image: 'images/nextlab_mac_pixel.png',
    imageAlt: '넥스트랩 웹페이지 미리보기'
  },
  badaju: {
    title: '바다주 웹페이지',
    category: 'SIDE QUEST • WEB PUBLISHING',
    date: '2025.11 - 2026.01',
    status: '100% Complete',
    description: '기획부터 디자인, 코딩까지 모두 참여한 프로젝트입니다. 전체적으로 메인 컬러의 variaiton 안에서 콘셉트를 잡고 진행했습니다. 폰트는 아리따 돋움을 메인으로     사용했으며, 부분적으로 Pretendard를 적용했습니다. 타겟은 20대부터 실질적으로 작업 의뢰를 맡기게     될 40대 이상까지 적용했습니다.',
    role: '디자인 & 퍼블리싱',
    tools: ['Figma', 'Photoshop', 'HTML5', 'CSS3', 'ChatGPT'],
    tags: ['Publishing', 'Portfolio'],
    image: 'images/badaju_mac_pixel.png',
    imageAlt: '바다주 웹페이지 미리보기',
  },
  ukymelar: {
    title: '유키멜라 웹페이지',
    category: 'SIDE QUEST • WEB REDESIGN',
    date: '2025.12 - 2026.01',
    status: '100% Complete',
    description: '기획부터 디자인, 코딩까지 모두 참여한 프로젝트입니다. 지인의 포트폴리오 활용 웹페이지로 제작했습니다. 작업 문의 등의 정보성 전달을 위한 특징을 띄고 있습니다. 꽃잎이 휘날리거나 필름 형태를 띄는 디자인을 시도했고, 코딩 측면에서 스와이퍼 슬라이드 라이브러리를 적용하여 사용자 인터랙션을 유도했습니다.',
    role: '디자인 & 퍼블리싱',
    tools: ['Figma', 'Photoshop', 'HTML5', 'CSS3', 'Ideogram'],
    tags: ['Photographer', 'UX/UI'],
    image: 'images/ukymelar_mac_pixel.png',
    imageAlt: '유키멜라 웹페이지 미리보기',
  },
  cheil: {
    title: '분당제일여성병원 웹페이지',
    category: 'SIDE QUEST • WEB PUBLISHING',
    date: '2025.12',
    status: '100% Complete',
    description: '기획부터 디자인, 코딩까지 모두 참여한 프로젝트입니다. 마진이 좁고 와이드한 구성의 기존 홈페이지를 리디자인했습니다. 컬러는 기존 HI 색상과 차분함과 신뢰감을 전달하는 다소 명도가 낮은 네이비 계열을 선택했습니다. 히어로 메인 애니메이션 효과와 마우스 오버(크기가 커짐)를 적용하여 사용자 인터랙션을 유도했습니다.',
    role: '디자인 & 퍼블리싱',
    tools: ['Figma', 'Photoshop', 'HTML5', 'CSS3', 'Midjourney'],
    tags: ['Bundang Cheil hospital', 'Redesign'],
    image: 'images/cheil_mac_pixel.png',
    imageAlt: '분당제일여성병원 웹페이지 미리보기',
  },
  nouvedilie: {
    title: '누베딜리 웹페이지',
    category: 'SIDE QUEST • WEB REDESIGN',
    date: '2026.01',
    status: '100% Complete',
    description: '가상의 반지 브랜딩을 주제로 진행한 프로젝트입니다. 일상에서 부담없이 캐주얼하게 착용 가능하면서 합리적인 가격의 럭셔리를 누릴 수 있는 반지를 주제로 30대~40대 혹은 그 이상, 10만원대 이상 어포더블 럭셔리 (Affordable Luxury) 라인 캐주얼 반지를 기획/디자인했습니다. 많은 정보를 가독성있게 전달하기 위해 레이아웃은 깔끔하지만 디테일을 살린 방향으로 표현했습니다.',
    role: '기획 & 디자인',
    tools: ['Figma', 'Photoshop', 'Illustrator', 'ChatGPT', 'Ideogram'],
    tags: ['Nouvedilie', 'Affordable Luxury'],
    image: 'images/nouvedilie_mac_pixel.png',
    imageAlt: '누베딜리 웹페이지 미리보기',
  },
  art: {
    title: '미대입시닷컴 웹페이지',
    category: 'SIDE QUEST • WEB REDESIGN',
    date: '2025.12',
    status: '100% Complete',
    description: '기획부터 디자인까지 모두 참여한 프로젝트입니다. 내용이 많고 복잡한 기존 홈페이지를 리디자인했습니다. 폰트는 가평 물결체를 메인으로 사용했으며 부분적으로 Pretendard를 적용했습니다. 사용자 연령대는 미대 입시생(10대 ~ 20대), 미술 입시 관련 선생님(20대 이상)입니다.',
    role: '기획 & 디자인',
    tools: ['Figma', 'Photoshop', 'Illustrator', 'Ideogram'],
    tags: ['Art academy', 'Redesign'],
    image: 'images/art_mac_pixel.png',
    imageAlt: '미대입시닷컴 웹페이지 미리보기',
  },
  wethink: {
    title: '위띵크 디자인 스트리밍 & 커뮤니티 앱',
    category: 'SIDE QUEST • APP REDESIGN',
    date: '2025.11',
    status: '100% Complete',
    description: '모바일 앱 디자인으로 진행한 작업입니다. 스트리밍과 동시에 커뮤니티 활동을 할 수 있는 주제를 생각했고, 평소 즐겨 보는 치지직 앱과 피그마 협업 프로그램을 주로 참고했습니다. 메인 색상은 독특하고 신선한 느낌을 주는 보라색 계열로 선택했고 실시간 스트리밍 화면과 협업 공간인 디자인 캔버스 화면의 디자인에 특히 중점을 두고 작업을 진행했습니다.',
    role: '기획 & 디자인',
    tools: ['Figma', 'Photoshop', 'Illustrator', 'ChatGPT'],
    tags: ['Collaboration Tool', 'Community'],
    image: 'images/wethink_mac_pixel.png',
    imageAlt: '미대입시닷컴 웹페이지 미리보기',
  },
};

function openModal(projectId) {
  if (!modal) return;
  const project = projectData[projectId];
  if (!project) return;

  // ✅ 이미지 세팅 (추가)
  const imgEl = modal.querySelector('#modalMainImg');
  if (imgEl) {
    imgEl.src = project.image || '';
    imgEl.alt = project.imageAlt || project.title || '';
  }

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
    if (lines.length > 20) lines[0].remove();
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




/* =========================
   OTHER WORKS ARCHIVE (NEW)
========================= */
(() => {
  // ✅ 여기만 네 작업물 데이터로 채우면 끝!
  const OTHER_WORKS = [
    {
      tag: "ARCHIVE",
      status: "100%",
      title: "누베딜리 상세 페이지",
      meta: "Design • 2026",
      desc: "가상의 반지 브랜드 누베딜리 상세 페이지",
      topic: "가상의 반지 브랜딩/nouvedilie",
      age: "반지 구입 의향이 있는 30대 ~ 40대 이상 여성",
      figma: "https://www.figma.com/",
      img: "images/sample_01.png"
    },
    {
      tag: "ARCHIVE",
      status: "100%",
      title: "기타 작업물 02",
      meta: "Editorial • 2025",
      desc: "작업물 요약 설명을 넣어주세요.",
      topic: "주제/키워드",
      age: "연령대",
      figma: "https://www.figma.com/",
      img: "images/sample_02.png"
    }
  ];

  const grid = document.getElementById("otherWorksGrid");
  const modal = document.getElementById("owModal");

  const elTitle = document.getElementById("owTitle");
  const elMeta = document.getElementById("owMeta");
  const elDesc = document.getElementById("owDesc");
  const elTopic = document.getElementById("owTopic");
  const elAge = document.getElementById("owAge");
  const elImg = document.getElementById("owImg");
  const elFigma = document.getElementById("owFigma");

  const elPrev = document.getElementById("owPrev");
  const elNext = document.getElementById("owNext");
  const elIndex = document.getElementById("owIndex");
  const elTotal = document.getElementById("owTotal");

  if (!grid || !modal) return;

  let current = 0;

  function renderCards() {
    grid.innerHTML = OTHER_WORKS.map((w, i) => `
      <li class="ow-item">
        <article class="ow-card">
          <button class="ow-card-btn" type="button" data-ow="${i}">
            <div class="ow-top">
              <span class="ow-tag">${w.tag}</span>
              <span class="ow-status">${w.status}</span>
            </div>

            <h3 class="ow-title">${w.title}</h3>
            <p class="ow-desc">${w.desc}</p>

            <footer class="ow-footer">
              <span class="ow-meta">${w.meta}</span>
              <span class="ow-open">OPEN →</span>
            </footer>
          </button>
        </article>
      </li>
    `).join("");
  }

  function openModal(index) {
    current = index;
    const w = OTHER_WORKS[current];

    elTitle.textContent = w.title;
    elMeta.textContent = w.meta;
    elDesc.textContent = w.desc;
    elTopic.textContent = w.topic;
    elAge.textContent = w.age;

    elImg.src = w.img;
    elImg.alt = w.title;

    const hasLink = !!w.figma && w.figma !== "#";
    elFigma.href = hasLink ? w.figma : "#";
    elFigma.style.pointerEvents = hasLink ? "auto" : "none";
    elFigma.style.opacity = hasLink ? "1" : ".5";

    elTotal.textContent = String(OTHER_WORKS.length);
    elIndex.textContent = String(current + 1);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function move(step) {
    const next = (current + step + OTHER_WORKS.length) % OTHER_WORKS.length;
    openModal(next);
  }

  // init
  renderCards();

  // open
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-ow]");
    if (!btn) return;
    openModal(Number(btn.dataset.ow));
  });

  // close
  modal.addEventListener("click", (e) => {
    if (e.target.matches("[data-ow-close]")) closeModal();
  });

  // nav + esc
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") move(-1);
    if (e.key === "ArrowRight") move(1);
  });

  elPrev?.addEventListener("click", () => move(-1));
  elNext?.addEventListener("click", () => move(1));
})();
