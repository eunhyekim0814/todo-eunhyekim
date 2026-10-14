// 들판을 돌아다니는 작고 귀여운 친구들.
// 할 일을 추가하면 우르르 올라가고(critters.rush), 완료하면 한 친구가 말풍선을 띄운다(critters.cheer).
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KINDS = ['chii', 'hachi', 'usagi'];
  const OUTLINE = 'stroke="#3a3a3a" stroke-width="2"';
  let clipCount = 0;

  const face = (cheek) => `
    <ellipse cx="24" cy="32" rx="2.6" ry="3.4" fill="#222"/>
    <ellipse cx="40" cy="32" rx="2.6" ry="3.4" fill="#222"/>
    <circle cx="24.8" cy="30.8" r="0.9" fill="#fff"/>
    <circle cx="40.8" cy="30.8" r="0.9" fill="#fff"/>
    <ellipse cx="16" cy="39" rx="4.2" ry="2.4" fill="${cheek}"/>
    <ellipse cx="48" cy="39" rx="4.2" ry="2.4" fill="${cheek}"/>`;

  const body = (fill) => `
    <ellipse cx="32" cy="58" rx="15" ry="11" fill="${fill}" ${OUTLINE}/>
    <path d="M20 54 q-5 2 -4 7 M44 54 q5 2 4 7" fill="none" ${OUTLINE} stroke-linecap="round"/>`;

  function drawing(kind) {
    if (kind === 'hachi') {
      const id = `hachi-clip-${clipCount++}`;
      return `
        ${body('#ffffff')}
        <path d="M11 22 L13 4 L27 13 Z M53 22 L51 4 L37 13 Z" fill="#8fb4dc" ${OUTLINE} stroke-linejoin="round"/>
        <clipPath id="${id}"><ellipse cx="32" cy="32" rx="24" ry="21"/></clipPath>
        <ellipse cx="32" cy="32" rx="24" ry="21" fill="#ffffff"/>
        <path d="M0 0 H64 V27 H43 L32 13 L21 27 H0 Z" fill="#8fb4dc" clip-path="url(#${id})"/>
        <ellipse cx="32" cy="32" rx="24" ry="21" fill="none" ${OUTLINE}/>
        ${face('#ffb3c1')}
        <path d="M27 39 q2.5 3 5 0 q2.5 3 5 0" fill="none" stroke="#3a3a3a" stroke-width="1.6" stroke-linecap="round"/>`;
    }
    if (kind === 'usagi') {
      return `
        ${body('#fff1a8')}
        <ellipse cx="23" cy="10" rx="5.5" ry="15" fill="#fff1a8" ${OUTLINE}/>
        <ellipse cx="41" cy="10" rx="5.5" ry="15" fill="#fff1a8" ${OUTLINE}/>
        <ellipse cx="23" cy="10" rx="2.4" ry="10" fill="#ffc7d1"/>
        <ellipse cx="41" cy="10" rx="2.4" ry="10" fill="#ffc7d1"/>
        <ellipse cx="32" cy="32" rx="24" ry="21" fill="#fff1a8" ${OUTLINE}/>
        ${face('#ffb3a1')}
        <path d="M27 38 q5 9 10 0 Z" fill="#e8636f" stroke="#3a3a3a" stroke-width="1.6" stroke-linejoin="round"/>`;
    }
    return `
      ${body('#ffffff')}
      <circle cx="16" cy="15" r="6.5" fill="#ffffff" ${OUTLINE}/>
      <circle cx="48" cy="15" r="6.5" fill="#ffffff" ${OUTLINE}/>
      <ellipse cx="32" cy="32" rx="24" ry="21" fill="#ffffff" ${OUTLINE}/>
      ${face('#ffb3c1')}
      <path d="M29 39 q3 3 6 0" fill="none" stroke="#3a3a3a" stroke-width="1.6" stroke-linecap="round"/>`;
  }

  function svg(kind) {
    return `<svg viewBox="-4 -8 72 82" aria-hidden="true">${drawing(kind)}</svg>`;
  }

  // 두 팔을 머리 위로 뻗어 마우스를 잡고 매달린 흰 친구. 두 손 사이 (32, -8)이 마우스 위치다.
  function holderSvg() {
    const arm = (d) => `
      <path d="${d}" fill="none" stroke="#3a3a3a" stroke-width="9" stroke-linecap="round"/>
      <path d="${d}" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>`;
    return `<svg viewBox="-4 -14 72 88" aria-hidden="true">
      ${body('#ffffff')}
      ${arm('M20 52 Q4 30 27 -3')}
      ${arm('M44 52 Q60 30 37 -3')}
      <circle cx="16" cy="15" r="6.5" fill="#ffffff" ${OUTLINE}/>
      <circle cx="48" cy="15" r="6.5" fill="#ffffff" ${OUTLINE}/>
      <ellipse cx="32" cy="32" rx="24" ry="21" fill="#ffffff" ${OUTLINE}/>
      ${face('#ffb3c1')}
      <path d="M28 38 q4 6 8 0 Z" fill="#e8636f" stroke="#3a3a3a" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="27.5" cy="-5" r="4.5" fill="#ffffff" ${OUTLINE}/>
      <circle cx="36.5" cy="-5" r="4.5" fill="#ffffff" ${OUTLINE}/>
    </svg>`;
  }

  const random = (min, max) => min + Math.random() * (max - min);
  const pick = (items) => items[Math.floor(Math.random() * items.length)];

  // ---- 들판에서 돌아다니는 친구들 ----
  const field = document.getElementById('critters');
  const walkers = [];

  function wander(walker) {
    const maxX = Math.max(0, window.innerWidth - walker.size);
    const target = random(0, maxX);
    const seconds = Math.abs(target - walker.x) / random(25, 60);
    walker.x = target;
    walker.el.style.transition = `transform ${seconds}s linear`;
    walker.el.style.transform = `translateX(${target}px)`;
    walker.el.classList.add('walking');
    setTimeout(() => {
      walker.el.classList.remove('walking');
      setTimeout(() => wander(walker), random(800, 4000));
    }, seconds * 1000);
  }

  function addWalker(index, total) {
    // 위쪽(멀리)일수록 작게, 아래쪽(가까이)일수록 크게
    const depth = Math.random();
    const size = Math.round(44 + depth * 30);
    const el = document.createElement('div');
    el.className = 'critter';
    el.style.width = `${size}px`;
    el.style.bottom = `${(1 - depth) * 18 + 1}vh`;
    el.style.zIndex = String(Math.round(depth * 10));
    el.innerHTML = `<div class="bubble">완료했다!</div><div class="hop">${svg(KINDS[index % KINDS.length])}</div>`;

    const walker = { el, size, x: (window.innerWidth - size) * ((index + Math.random()) / total) };
    el.style.transform = `translateX(${walker.x}px)`;
    el.querySelector('.hop').style.animationDelay = `${-random(0, 1)}s`;
    field.append(el);
    walkers.push(walker);
    if (!reduceMotion) setTimeout(() => wander(walker), random(0, 3000));
  }

  const walkerCount = Math.round(Math.min(12, Math.max(5, window.innerWidth / 130)));
  for (let i = 0; i < walkerCount; i++) addWalker(i, walkerCount);

  // ---- 할 일 추가: 아래에서 위로 우르르 ----
  const rushLayer = document.getElementById('rush');

  function rush() {
    const count = reduceMotion ? 6 : Math.round(Math.min(60, Math.max(30, window.innerWidth / 25)));
    const height = window.innerHeight;

    for (let i = 0; i < count; i++) {
      const size = Math.round(random(40, 84));
      const el = document.createElement('div');
      el.className = 'runner';
      el.style.width = `${size}px`;
      el.style.left = `${random(-size / 2, window.innerWidth - size / 2)}px`;
      el.innerHTML = svg(pick(KINDS));
      rushLayer.append(el);

      const sway = random(-60, 60);
      const tilt = random(-18, 18);
      const frames = reduceMotion
        ? [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }]
        : [
            { transform: `translate(0, ${height + 20}px) rotate(${-tilt}deg)` },
            { transform: `translate(${sway}px, ${height / 2}px) rotate(${tilt}deg)`, offset: 0.5 },
            { transform: `translate(0, -${size * 1.6}px) rotate(${-tilt}deg)` },
          ];
      const animation = el.animate(frames, {
        duration: reduceMotion ? 900 : random(1100, 2000),
        delay: random(0, reduceMotion ? 200 : 700),
        easing: 'cubic-bezier(0.3, 0.1, 0.4, 1)',
        fill: 'both',
      });
      animation.onfinish = () => el.remove();
    }
  }

  // ---- 할 일 완료: 무작위 한 친구가 "완료했다!" ----
  const card = document.querySelector('main');

  function isVisible(walker) {
    const rect = walker.el.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const onScreen = rect.left > 30 && rect.right < window.innerWidth - 30;
    const hidden =
      rect.left < cardRect.right && rect.right > cardRect.left &&
      rect.top < cardRect.bottom && rect.bottom > cardRect.top;
    return onScreen && !hidden;
  }

  function cheer() {
    if (walkers.length === 0) return;
    const candidates = walkers.filter(isVisible);
    const walker = pick(candidates.length > 0 ? candidates : walkers);
    const bubble = walker.el.querySelector('.bubble');
    walker.el.classList.add('cheering');
    bubble.classList.remove('show');
    void bubble.offsetWidth; // 연달아 눌러도 애니메이션이 처음부터 다시 나오게
    bubble.classList.add('show');
    clearTimeout(walker.cheerTimer);
    walker.cheerTimer = setTimeout(() => {
      bubble.classList.remove('show');
      walker.el.classList.remove('cheering');
    }, 2200);
  }

  // ---- 마우스를 두 손으로 잡고 따라다니는 친구 ----
  function startFollower() {
    // 마우스가 없는 휴대폰·태블릿에서는 만들지 않는다.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const size = 64;
    const scale = size / 72;
    const anchorX = 36 * scale; // viewBox 안의 (32, -8) 위치를 픽셀로
    const anchorY = 6 * scale;

    const el = document.createElement('div');
    el.className = 'follower';
    el.style.width = `${size}px`;
    el.style.transformOrigin = `${anchorX}px ${anchorY}px`;
    el.innerHTML = holderSvg();
    document.body.append(el);

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let angle = 0;
    let swing = 0;
    let started = false;

    document.addEventListener('mousemove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!started) {
        started = true;
        x = targetX;
        y = targetY;
        requestAnimationFrame(frame);
      }
      el.classList.add('show');
    });
    document.documentElement.addEventListener('mouseleave', () => el.classList.remove('show'));

    function frame() {
      const previousX = x;
      const ease = reduceMotion ? 1 : 0.25;
      x += (targetX - x) * ease;
      y += (targetY - y) * ease;

      // 움직이는 반대쪽으로 몸이 흔들렸다가 제자리로 돌아온다(진자처럼).
      if (!reduceMotion) {
        const speedX = x - previousX;
        swing += (-speedX * 1.2 - angle) * 0.12;
        swing *= 0.82;
        angle = Math.max(-40, Math.min(40, angle + swing));
      }

      el.style.transform = `translate(${x - anchorX}px, ${y - anchorY}px) rotate(${angle}deg)`;
      requestAnimationFrame(frame);
    }
  }

  startFollower();

  window.critters = { rush, cheer };
})();
