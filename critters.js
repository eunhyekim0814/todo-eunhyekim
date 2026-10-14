// 들판을 돌아다니는 작고 귀여운 친구들.
// - 할 일을 추가하면 우르르 올라간다(critters.rush)
// - 할 일을 완료하면 한 친구가 "완료했다!"라고 말한다(critters.cheer)
// - 15~30초마다 기본 친구 1~2마리가 응원 메시지를 순서대로 말한다
// - 친구를 누르면 아무 말이나 한다
// - 한 친구가 마우스 오른쪽 아래에서 마우스를 쳐다보며 따라다닌다
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BASIC_KINDS = ['chii', 'hachi', 'usagi'];
  const OTHER_KINDS = ['momonga', 'kuri', 'shisa', 'rakko'];
  const ALL_KINDS = [...BASIC_KINDS, ...OTHER_KINDS];
  const OUTLINE = 'stroke="#3a3a3a" stroke-width="2"';
  let clipCount = 0;

  const CHEERS = [
    '오늘도 잘하고 있어!',
    '하나씩 하면 돼!',
    '천천히 해도 괜찮아',
    '할 수 있다!',
    '조금만 더 힘내!',
    '벌써 이만큼 했어!',
    '쉬는 것도 중요해',
    '물 한 잔 마시자!',
    '최고야!',
    '응원하고 있어!',
    '오늘 할 일, 같이 하자',
    '너무 멋져!',
    '끝까지 가 보자!',
    '작은 일부터 시작!',
    '포기하지 마!',
    '잘하고 있다니까!',
    '파이팅!',
    '한 걸음씩!',
    '오늘도 수고했어',
    '기지개 한번 켜자!',
    '대단해!',
    '다 끝나면 간식 먹자',
    '집중력 최고!',
    '할 일 부수기!',
    '우리가 지켜보고 있어!',
    '실수해도 괜찮아',
    '어제보다 한 발 더!',
    '반짝반짝 빛나는 중!',
    '지금 딱 좋아!',
    '하나 끝내면 기분 좋아!',
    '심호흡하고 다시!',
    '너라면 할 수 있어',
    '오늘의 주인공!',
    '노력은 배신하지 않아',
    '힘들면 잠깐 쉬어',
    '거의 다 왔어!',
    '와, 열심히 한다!',
    '박수 짝짝짝!',
    '멋지게 해내자!',
    '오늘도 화이팅!',
    '내가 옆에 있을게',
    '느려도 괜찮아',
    '하면 된다!',
    '목표까지 달려!',
    '잘 해낼 거야',
    '우와, 대단하다!',
    '스트레칭 한번 하자',
    '눈도 좀 쉬어 줘',
    '오늘 하루도 반짝!',
    '끝나면 같이 놀자!',
  ];

  const TALKS = [
    '?',
    '??',
    '왜 불렀어?',
    '아야!',
    '오늘은 피자를 저녁으로 먹어야지',
    '오늘은 햄버거',
    '야하~~!',
    '우나',
    '앗',
    '헤헤',
    '간지러워!',
    '배고파...',
    '졸려...',
    '뭐 해?',
    '심심해',
    '같이 놀자!',
    '라멘 먹고 싶다',
    '풀밭 좋아',
    '으앙',
    '부르르',
    '응?',
    '하아~',
    '오늘 날씨 좋다',
    '나 찾았어?',
  ];

  const random = (min, max) => min + Math.random() * (max - min);
  const pick = (items) => items[Math.floor(Math.random() * items.length)];

  // ---- 그림 ----
  const face = (cheek, big = false) => {
    const rx = big ? 3.6 : 2.6;
    const ry = big ? 4.6 : 3.4;
    const shine = big
      ? `<circle cx="25.2" cy="30.2" r="1.4" fill="#fff"/><circle cx="41.2" cy="30.2" r="1.4" fill="#fff"/>
         <circle cx="23.2" cy="34" r="0.7" fill="#fff"/><circle cx="39.2" cy="34" r="0.7" fill="#fff"/>`
      : `<circle cx="24.8" cy="30.8" r="0.9" fill="#fff"/><circle cx="40.8" cy="30.8" r="0.9" fill="#fff"/>`;
    return `
      <g class="eyes">
        <ellipse cx="24" cy="32" rx="${rx}" ry="${ry}" fill="#222"/>
        <ellipse cx="40" cy="32" rx="${rx}" ry="${ry}" fill="#222"/>
        ${shine}
      </g>
      <ellipse cx="16" cy="39" rx="4.2" ry="2.4" fill="${cheek}"/>
      <ellipse cx="48" cy="39" rx="4.2" ry="2.4" fill="${cheek}"/>`;
  };

  const body = (fill) => `
    <ellipse cx="32" cy="58" rx="15" ry="11" fill="${fill}" ${OUTLINE}/>
    <path d="M20 54 q-5 2 -4 7 M44 54 q5 2 4 7" fill="none" ${OUTLINE} stroke-linecap="round"/>`;

  const head = (fill) => `<ellipse cx="32" cy="32" rx="24" ry="21" fill="${fill}" ${OUTLINE}/>`;
  const roundEars = (fill) => `
    <circle cx="16" cy="15" r="6.5" fill="${fill}" ${OUTLINE}/>
    <circle cx="48" cy="15" r="6.5" fill="${fill}" ${OUTLINE}/>`;
  const smile = '<path d="M29 39 q3 3 6 0" fill="none" stroke="#3a3a3a" stroke-width="1.6" stroke-linecap="round"/>';
  const catMouth = '<path d="M27 39 q2.5 3 5 0 q2.5 3 5 0" fill="none" stroke="#3a3a3a" stroke-width="1.6" stroke-linecap="round"/>';
  const openMouth = '<path d="M27 38 q5 9 10 0 Z" fill="#e8636f" stroke="#3a3a3a" stroke-width="1.6" stroke-linejoin="round"/>';

  function drawing(kind) {
    switch (kind) {
      case 'hachi': {
        const id = `hachi-clip-${clipCount++}`;
        return `
          ${body('#ffffff')}
          <path d="M11 22 L13 4 L27 13 Z M53 22 L51 4 L37 13 Z" fill="#8fb4dc" ${OUTLINE} stroke-linejoin="round"/>
          <clipPath id="${id}"><ellipse cx="32" cy="32" rx="24" ry="21"/></clipPath>
          <ellipse cx="32" cy="32" rx="24" ry="21" fill="#ffffff"/>
          <path d="M0 0 H64 V27 H43 L32 13 L21 27 H0 Z" fill="#8fb4dc" clip-path="url(#${id})"/>
          <ellipse cx="32" cy="32" rx="24" ry="21" fill="none" ${OUTLINE}/>
          ${face('#ffb3c1')}
          ${catMouth}`;
      }
      case 'usagi':
        return `
          ${body('#fff1a8')}
          <ellipse cx="23" cy="10" rx="5.5" ry="15" fill="#fff1a8" ${OUTLINE}/>
          <ellipse cx="41" cy="10" rx="5.5" ry="15" fill="#fff1a8" ${OUTLINE}/>
          <ellipse cx="23" cy="10" rx="2.4" ry="10" fill="#ffc7d1"/>
          <ellipse cx="41" cy="10" rx="2.4" ry="10" fill="#ffc7d1"/>
          ${head('#fff1a8')}
          ${face('#ffb3a1')}
          ${openMouth}`;
      case 'momonga':
        // 커다란 반짝 눈과 복슬복슬한 꼬리
        return `
          <ellipse cx="54" cy="50" rx="10" ry="16" fill="#f1ece4" ${OUTLINE} transform="rotate(25 54 50)"/>
          ${body('#ffffff')}
          <path d="M12 20 L12 6 L24 12 Z M52 20 L52 6 L40 12 Z" fill="#ffffff" ${OUTLINE} stroke-linejoin="round"/>
          ${head('#ffffff')}
          ${face('#ffb3c1', true)}
          ${smile}`;
      case 'kuri':
        // 갈색 밤 같은 친구
        return `
          ${body('#c98a55')}
          ${roundEars('#c98a55')}
          ${head('#c98a55')}
          <ellipse cx="32" cy="40" rx="11" ry="7" fill="#f3d7b5"/>
          ${face('#e98f7a')}
          ${smile}`;
      case 'shisa':
        // 복슬복슬한 갈기를 가진 주황 친구
        return `
          ${body('#ffd27a')}
          <g fill="#f29b38" ${OUTLINE}>
            <circle cx="12" cy="20" r="8"/><circle cx="22" cy="10" r="8"/><circle cx="32" cy="7" r="8"/>
            <circle cx="42" cy="10" r="8"/><circle cx="52" cy="20" r="8"/>
          </g>
          ${head('#ffd27a')}
          ${face('#ff9f8a')}
          ${openMouth}`;
      case 'rakko':
        // 회갈색 해달 친구, 얼굴 아래쪽이 하얗다
        return `
          ${body('#b49c86')}
          ${roundEars('#b49c86')}
          ${head('#b49c86')}
          <ellipse cx="32" cy="39" rx="15" ry="9" fill="#f7f1ea"/>
          ${face('#f0a6a6')}
          <ellipse cx="32" cy="36.5" rx="2.2" ry="1.5" fill="#3a3a3a"/>
          ${catMouth}`;
      default: // chii
        return `
          ${body('#ffffff')}
          ${roundEars('#ffffff')}
          ${head('#ffffff')}
          ${face('#ffb3c1')}
          ${smile}`;
    }
  }

  function svg(kind) {
    return `<svg viewBox="-4 -8 72 82" aria-hidden="true">${drawing(kind)}</svg>`;
  }

  // ---- 들판에서 돌아다니는 친구들 ----
  const field = document.getElementById('critters');
  const walkers = [];

  function scheduleWander(walker, delay) {
    clearTimeout(walker.timer);
    if (!reduceMotion) walker.timer = setTimeout(() => wander(walker), delay);
  }

  function wander(walker) {
    if (walker.talking) return;
    const maxX = Math.max(0, window.innerWidth - walker.size);
    const target = random(0, maxX);
    const seconds = Math.abs(target - walker.x) / random(25, 60);
    walker.x = target;
    walker.el.style.transition = `transform ${seconds}s linear`;
    walker.el.style.transform = `translateX(${target}px)`;
    walker.el.classList.add('walking');
    clearTimeout(walker.timer);
    walker.timer = setTimeout(() => {
      walker.el.classList.remove('walking');
      scheduleWander(walker, random(800, 4000));
    }, seconds * 1000);
  }

  // 걷던 자리에서 멈춘다.
  function stop(walker) {
    clearTimeout(walker.timer);
    walker.x = walker.el.getBoundingClientRect().left;
    walker.el.style.transition = 'none';
    walker.el.style.transform = `translateX(${walker.x}px)`;
    walker.el.classList.remove('walking');
  }

  function say(walker, text, ms) {
    stop(walker);
    walker.talking = true;
    const bubble = walker.bubble;
    bubble.textContent = text;
    bubble.style.setProperty('--say', `${ms}ms`);

    // 말풍선이 화면 밖으로 나가지 않게 옆으로 민다.
    const width = bubble.offsetWidth;
    const center = walker.x + walker.size / 2;
    let shift = 0;
    if (center - width / 2 < 8) shift = 8 - (center - width / 2);
    if (center + width / 2 > window.innerWidth - 8) shift = window.innerWidth - 8 - (center + width / 2);
    bubble.style.setProperty('--shift', `${shift}px`);

    walker.el.classList.add('talking');
    bubble.classList.remove('show');
    void bubble.offsetWidth; // 연달아 말해도 애니메이션이 처음부터 다시 나오게
    bubble.classList.add('show');

    clearTimeout(walker.talkTimer);
    walker.talkTimer = setTimeout(() => {
      bubble.classList.remove('show');
      walker.el.classList.remove('talking');
      walker.talking = false;
      scheduleWander(walker, random(500, 2000));
    }, ms);
  }

  function addWalker(kind, index, total) {
    // 위쪽(멀리)일수록 작게, 아래쪽(가까이)일수록 크게
    const depth = Math.random();
    const size = Math.round(44 + depth * 30);
    const el = document.createElement('div');
    el.className = 'critter';
    el.title = '눌러 보세요';
    el.style.width = `${size}px`;
    el.style.bottom = `${(1 - depth) * 18 + 1}vh`;
    el.style.zIndex = String(Math.round(depth * 10));
    el.innerHTML = `<div class="bubble"></div><div class="hop">${svg(kind)}</div>`;

    const walker = {
      el,
      kind,
      size,
      bubble: el.querySelector('.bubble'),
      x: (window.innerWidth - size) * ((index + Math.random()) / total),
      talking: false,
      lastTalk: '',
    };
    el.style.transform = `translateX(${walker.x}px)`;
    el.querySelector('.hop').style.animationDelay = `${-random(0, 1)}s`;
    el.addEventListener('click', () => {
      let text = pick(TALKS);
      while (text === walker.lastTalk) text = pick(TALKS);
      walker.lastTalk = text;
      say(walker, text, 1800);
    });

    field.append(el);
    walkers.push(walker);
    scheduleWander(walker, random(0, 3000));
  }

  // 기본 3종류가 절반쯤, 나머지는 다른 친구들
  const walkerCount = Math.round(Math.min(18, Math.max(8, window.innerWidth / 90)));
  const kinds = [];
  for (let i = 0; i < walkerCount; i++) {
    kinds.push(i % 2 === 0
      ? BASIC_KINDS[(i / 2) % BASIC_KINDS.length]
      : OTHER_KINDS[((i - 1) / 2) % OTHER_KINDS.length]);
  }
  kinds.sort(() => Math.random() - 0.5);
  kinds.forEach((kind, i) => addWalker(kind, i, walkerCount));

  // ---- 화면에 잘 보이는 친구 고르기 ----
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

  function choose(pool, count) {
    const free = pool.filter((w) => !w.talking);
    const visible = free.filter(isVisible);
    const from = visible.length >= count ? visible : free;
    return [...from].sort(() => Math.random() - 0.5).slice(0, count);
  }

  // ---- 할 일 완료: 무작위 한 친구가 "완료했다!" ----
  function cheer() {
    const [walker] = choose(walkers, 1);
    if (walker) say(walker, '완료했다!', 2200);
  }

  // ---- 15~30초마다 기본 친구 1~2마리가 응원 ----
  let cheerIndex = 0;

  function encourage() {
    if (!document.hidden) {
      const basics = walkers.filter((w) => BASIC_KINDS.includes(w.kind));
      const speakers = choose(basics, Math.random() < 0.5 ? 1 : 2);
      speakers.forEach((walker, i) => {
        const text = CHEERS[cheerIndex];
        cheerIndex = (cheerIndex + 1) % CHEERS.length;
        setTimeout(() => say(walker, text, 3500), i * 700);
      });
    }
    setTimeout(encourage, random(15000, 30000));
  }

  setTimeout(encourage, random(15000, 30000));

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
      el.innerHTML = svg(pick(ALL_KINDS));
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

  // ---- 마우스 오른쪽 아래에서 마우스를 쳐다보며 따라다니는 친구 ----
  function startFollower() {
    // 마우스가 없는 휴대폰·태블릿에서는 만들지 않는다.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const size = 56;
    const scale = size / 72;
    const headX = 36 * scale; // 그림 안에서 얼굴 가운데 위치(px)
    const headY = 40 * scale;
    const OFFSET = 42; // 마우스에서 오른쪽 아래 45도로 떨어진 거리(px)

    const el = document.createElement('div');
    el.className = 'follower';
    el.style.width = `${size}px`;
    el.innerHTML = svg('chii');
    document.body.append(el);
    const eyes = el.querySelector('.eyes');

    let mouseX = 0;
    let mouseY = 0;
    let x = 0; // 얼굴 가운데
    let y = 0;
    let angle = 0;
    let started = false;

    document.addEventListener('mousemove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (!started) {
        started = true;
        x = mouseX + OFFSET;
        y = mouseY + OFFSET;
        requestAnimationFrame(frame);
      }
      el.classList.add('show');
    });
    document.documentElement.addEventListener('mouseleave', () => el.classList.remove('show'));

    function frame() {
      const previousX = x;
      const ease = reduceMotion ? 1 : 0.12;
      x += (mouseX + OFFSET - x) * ease;
      y += (mouseY + OFFSET - y) * ease;

      // 움직이는 방향으로 살짝만 기울어진다.
      if (!reduceMotion) {
        const tilt = Math.max(-8, Math.min(8, (x - previousX) * 0.5));
        angle += (tilt - angle) * 0.1;
      }

      // 눈동자가 마우스 쪽을 본다.
      const dx = mouseX - x;
      const dy = mouseY - y;
      const distance = Math.hypot(dx, dy) || 1;
      eyes.setAttribute('transform', `translate(${(dx / distance) * 2} ${(dy / distance) * 2})`);

      el.style.transform = `translate(${x - headX}px, ${y - headY}px) rotate(${angle}deg)`;
      requestAnimationFrame(frame);
    }
  }

  startFollower();

  window.critters = { rush, cheer };
})();
