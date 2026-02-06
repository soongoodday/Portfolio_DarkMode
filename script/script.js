// helpers
function resolveAsset(path){
  // "images/a.png" 같은 상대경로를
  // 현재 페이지 기준으로 절대 URL로 바꿔줌 (GitHub Pages 하위경로에서도 안전)
  try{
    return new URL(path, document.baseURI).href;
  }catch(e){
    return path;
  }
}

function setImgSafe(imgEl, path, alt = ''){
  if (!imgEl) return;

  const url = resolveAsset(path);

  imgEl.onload = () => console.log('✅ IMG LOADED:', url);
  imgEl.onerror = () => console.error('❌ IMG ERROR:', url);

  imgEl.src = url;
  imgEl.alt = alt || '';
}




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
    setImgSafe(imgEl, project.image || '', project.imageAlt || project.title || '');
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
      images: "images/detail_nouvedilie1.png"
    },
    {
      tag: "ARCHIVE",
      status: "100%",
      title: "누베딜리 웹 배너",
      meta: "Design • 2026",
      desc: "가상의 반지 브랜드 누베딜리 웹 배너",
      topic: "가상의 반지 브랜딩/nouvedilie",
      age: "반지 구입 의향이 있는 30대 ~ 40대 이상 여성",
      figma: "https://www.figma.com/",
      images: "images/nouvedilie_banner.png"
    },
    {
      tag: "ARCHIVE",
      status: "100%",
      title: "중앙대학교 리플렛",
      meta: "Design • 2026",
      desc: "중앙대학교 리플렛",
      topic: "중앙대학교/리플렛",
      age: "중앙대학교 관계자 및 학생",
      figma: "https://www.figma.com/",
      images: ["images/university_brochure1.jpg", "images/university_brochure2.jpg"]
    },
    {
      tag: "ARCHIVE",
      status: "100%",
      title: "당근마켓 웹 배너",
      meta: "Design • 2026",
      desc: "당근마켓 웹 배너",
      topic: "당근마켓/배너",
      age: "당근마켓 사용자",
      figma: "https://www.figma.com/",
      images: ["images/carrot_banner1.png","images/carrot_banner2.png"]
    },
    {
      tag: "ARCHIVE",
      status: "100%",
      title: "학원 모집 홍보 포스터",
      meta: "Design • 2026",
      desc: "학원 모집 홍보 포스터",
      topic: "학원/홍보 포스터",
      age: "학원 수강에 관심있는 고객",
      figma: "https://www.figma.com/",
      images: "images/green17_poster.png"
    },
    {
      tag: "ARCHIVE",
      status: "100%",
      title: "미대입시닷컴 웹페이지 배너",
      meta: "Design • 2026",
      desc: "미대입시닷컴 웹페이지 배너",
      topic: "미대입시닷컴/배너",
      age: "미대 입시생(10대 ~ 20대), 미술 입시 관련 선생님(20대 이상)",
      figma: "https://www.figma.com/",
      images: ["images/art_banner1.png", "images/art_banner2.png"]
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
  const elThumbs = document.getElementById("owThumbs");

  if (!grid || !modal) return;

  let current = 0;
  let currentImg = 0;
  let activeImages = [];




    // ✅ 이미지 배열 통일 (string/array 모두 지원)
  function normalizeImages(w){
    if (Array.isArray(w.images) && w.images.length) return w.images.filter(Boolean);
    if (typeof w.images === 'string' && w.images) return [w.images];
    return [];
  }

  // ✅ 현재 이미지 표시
  function showImg(idx){
    if (!activeImages.length) {
      console.error('❌ activeImages empty. check images path:', OTHER_WORKS[current]?.images);
      return;
    }
    currentImg = (idx + activeImages.length) % activeImages.length;
    setImgSafe(elImg, activeImages[currentImg], elTitle?.textContent || '');
    if (elIndex) elIndex.textContent = String(currentImg + 1);
    if (elTotal) elTotal.textContent = String(activeImages.length);
    // 썸네일 active 표시
    if (elThumbs){
    elThumbs.querySelectorAll('.ow-thumb').forEach((b, i) => {
    b.classList.toggle('active', i === currentImg);
  });
}

  }

  // ✅ 이미지 클릭하면 다음 이미지
  elImg?.addEventListener('click', () => {
    if (activeImages.length <= 1) return;
    showImg(currentImg + 1);
  });

  // ✅ 키보드 Up/Down도 이미지 넘기기
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (activeImages.length <= 1) return;

    if (e.key === 'ArrowUp') showImg(currentImg - 1);
    if (e.key === 'ArrowDown') showImg(currentImg + 1);
  });



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

  activeImages = normalizeImages(w);
  currentImg = 0;
  showImg(0); // ✅ 여기서 이미지 + 인덱스/토탈까지 한 번에 처리

  // ✅ 썸네일 만들기
if (elThumbs){
  elThumbs.innerHTML = activeImages.map((src, i) => `
    <button class="ow-thumb ${i===0 ? 'active' : ''}" type="button" data-thumb="${i}">
      <img src="${resolveAsset(src)}" alt="thumb ${i+1}">
    </button>
  `).join("");

  elThumbs.onclick = (e) => {
    const b = e.target.closest('[data-thumb]');
    if (!b) return;
    showImg(Number(b.dataset.thumb));
  };
}

  // figma 링크
  const hasLink = !!w.figma && w.figma !== "#";
  elFigma.href = hasLink ? w.figma : "#";
  elFigma.style.pointerEvents = hasLink ? "auto" : "none";
  elFigma.style.opacity = hasLink ? "1" : ".5";

  // ✅ (선택) 이미지가 여러 장이면 콘솔로 확인
  // console.log('activeImages=', activeImages);

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  const bodyEl = modal.querySelector(".ow-panel-body");
  if (bodyEl) bodyEl.scrollTop = 0;
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




/* =========================
   OW PREVIEW -> LIGHTBOX OPEN (ROBUST)
   ✅ DOM 로드 후 실행
   ✅ 이벤트 위임(owImg src가 바뀌어도 항상 동작)
========================= */
window.addEventListener('DOMContentLoaded', () => {
  const lb = document.getElementById('imgLb');
  const lbImg = document.getElementById('imgLbImg');

  if (!lb || !lbImg) {
    console.error('❌ Lightbox DOM not found: #imgLb / #imgLbImg');
    return;
  }

  function openLbWithSrc(src) {
    if (!src) return;
    lbImg.src = src;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    // 모달도 이미 잠그고 있다면 유지되어도 괜찮음
    document.body.style.overflow = 'hidden';
    console.log('✅ Lightbox open:', src);
  }

  function closeLb() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    lbImg.src = '';
    // ⚠️ OW 모달이 열려있으면 overflow를 풀면 안 됨
    const owModalOpen = document.getElementById('owModal')?.classList.contains('is-open');
    if (!owModalOpen) document.body.style.overflow = '';
  }

  // ✅ (핵심) owImg를 직접 잡지 말고 문서에서 위임으로 잡기
  document.addEventListener('click', (e) => {
    const img = e.target.closest('#owImg');
    if (!img) return;

    e.preventDefault();
    e.stopPropagation();

    const src = img.currentSrc || img.getAttribute('src');
    console.log('🖱️ owImg clicked, src=', src);
    openLbWithSrc(src);
  });

  // 모바일 사파리 대비 touch
  document.addEventListener('touchend', (e) => {
    const img = e.target.closest('#owImg');
    if (!img) return;

    e.preventDefault();
    e.stopPropagation();

    const src = img.currentSrc || img.getAttribute('src');
    console.log('👆 owImg touch, src=', src);
    openLbWithSrc(src);
  }, { passive: false });

  // 닫기 (백드롭/닫기버튼)
  lb.addEventListener('click', (e) => {
    if (e.target.matches('[data-lb-close], .imglb-backdrop')) closeLb();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lb.classList.contains('is-open')) closeLb();
  });
});





/* =========================
   IMAGE LIGHTBOX: Zoom + Pan (FINAL CENTER FIX)
========================= */
(() => {
  const lb = document.getElementById('imgLb');
  const viewport = document.getElementById('imgLbViewport');
  const img = document.getElementById('imgLbImg');
  const pctEl = document.getElementById('imgLbPct');

  if (!lb || !viewport || !img) return;

  const btnZoomIn = lb.querySelector('[data-lb-zoom-in]');
  const btnZoomOut = lb.querySelector('[data-lb-zoom-out]');
  const btnReset = lb.querySelector('[data-lb-reset]');

  let scale = 1;
  let tx = 0;
  let ty = 0;

  const MIN = 0.25;  // ✅ 100%보다 더 축소 가능
  const MAX = 6;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function getImgSize(){
    const iw = img.naturalWidth || img.width || 1;
    const ih = img.naturalHeight || img.height || 1;
    return { iw, ih };
  }

  // ✅ 항상 "가운데 유지" + (큰 경우엔 드래그 범위 제한)
  function clampTranslate(){
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const { iw, ih } = getImgSize();

    const sw = iw * scale;
    const sh = ih * scale;

    if (sw <= vw) tx = (vw - sw) / 2;
    else tx = clamp(tx, vw - sw, 0);

    if (sh <= vh) ty = (vh - sh) / 2;
    else ty = clamp(ty, vh - sh, 0);
  }

  function render(){
    clampTranslate();
    img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    if (pctEl) pctEl.textContent = `${Math.round(scale * 100)}%`;
  }

  function reset(){
    scale = 1;
    tx = 0;
    ty = 0;
    render();
  }

  // ✅ 특정 포인트 기준으로 줌
  function zoomAt(newScale, clientX, clientY){
    newScale = clamp(newScale, MIN, MAX);

    const rect = viewport.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    const ix = (px - tx) / scale;
    const iy = (py - ty) / scale;

    scale = newScale;
    tx = px - ix * scale;
    ty = py - iy * scale;

    render();
  }

  /* WHEEL 줌 */
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const dir = e.deltaY > 0 ? -1 : 1;
    const step = 0.12;
    zoomAt(scale * (1 + step * dir), e.clientX, e.clientY);
  }, { passive:false });

  /* DRAG */
  let isDown = false;
  let startX = 0, startY = 0;
  let baseTx = 0, baseTy = 0;

  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    isDown = true;
    viewport.classList.add('is-dragging');
    startX = e.clientX;
    startY = e.clientY;
    baseTx = tx;
    baseTy = ty;
    viewport.setPointerCapture?.(e.pointerId);
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    tx = baseTx + (e.clientX - startX);
    ty = baseTy + (e.clientY - startY);
    render();
  });

  function endDrag(e){
    if (!isDown) return;
    isDown = false;
    viewport.classList.remove('is-dragging');
    viewport.releasePointerCapture?.(e.pointerId);
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('pointerleave', endDrag);

  /* DOUBLE CLICK */
  viewport.addEventListener('dblclick', (e) => {
    e.preventDefault();
    if (scale < 1.8) zoomAt(2.2, e.clientX, e.clientY);
    else reset();
  });

  /* BUTTONS */
  btnZoomIn?.addEventListener('click', () => {
    const r = viewport.getBoundingClientRect();
    zoomAt(scale * 1.2, r.left + r.width/2, r.top + r.height/2);
  });

  btnZoomOut?.addEventListener('click', () => {
    const r = viewport.getBoundingClientRect();
    zoomAt(scale / 1.2, r.left + r.width/2, r.top + r.height/2);
  });

  btnReset?.addEventListener('click', reset);

  // ✅ 라이트박스 열릴 때/이미지 로드될 때 항상 중앙 리셋
  const mo = new MutationObserver(() => {
    if (lb.classList.contains('is-open')) reset();
  });
  mo.observe(lb, { attributes:true, attributeFilter:['class'] });

  img.addEventListener('load', () => {
    reset();
    // 이미지 로드 직후 레이아웃 튀는 경우 한 번 더
    requestAnimationFrame(reset);
  });

  // 최초
  render();
})();
