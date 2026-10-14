// 서울 시간과 날씨에 맞춰 배경 하늘을 바꾸고, 할 일 카드 옆에 날씨를 보여 준다.
// 미리보기: 주소 뒤에 ?phase=sunset&weather=rain 처럼 붙이면 그 하늘로 고정된다.
//   phase: dawn, sunrise, day, noon, afternoon, sunset, night, midnight
//   weather: clear, partly, cloudy, fog, rain, snow, thunder
(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params = new URLSearchParams(location.search);

  const SEOUL = { latitude: 37.5665, longitude: 126.978 };
  const WEATHER_URL =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${SEOUL.latitude}&longitude=${SEOUL.longitude}` +
    '&current=temperature_2m,weather_code,is_day' +
    '&daily=sunrise,sunset&timezone=Asia%2FSeoul&forecast_days=1';

  const PHASES = {
    dawn: '새벽',
    sunrise: '일출',
    day: '낮',
    noon: '점심',
    afternoon: '오후',
    sunset: '일몰',
    night: '밤',
    midnight: '한밤중',
  };
  const DARK_PHASES = ['dawn', 'night', 'midnight'];

  const WEATHERS = {
    clear: { label: '맑음', day: '☀️', night: '🌙' },
    partly: { label: '구름 조금', day: '⛅', night: '☁️' },
    cloudy: { label: '흐림', day: '☁️', night: '☁️' },
    fog: { label: '안개', day: '🌫️', night: '🌫️' },
    rain: { label: '비', day: '🌧️', night: '🌧️' },
    snow: { label: '눈', day: '❄️', night: '❄️' },
    thunder: { label: '뇌우', day: '⛈️', night: '⛈️' },
  };

  // 날씨마다 띄울 구름 수
  const CLOUDS = { clear: 2, partly: 4, cloudy: 7, fog: 3, rain: 7, snow: 5, thunder: 8 };

  const forcedPhase = PHASES[params.get('phase')] ? params.get('phase') : null;
  const forcedWeather = WEATHERS[params.get('weather')] ? params.get('weather') : null;

  // 오늘 서울의 해 뜨는/지는 시각(시간 단위). 날씨 정보를 못 받으면 이 값을 쓴다.
  let sunrise = 6.5;
  let sunset = 18.5;
  let current = null; // { temp, type, isDay }
  let failed = false;
  let shownWeather = null;

  const icon = document.getElementById('weather-icon');
  const temp = document.getElementById('weather-temp');
  const desc = document.getElementById('weather-desc');
  const meta = document.getElementById('weather-meta');
  const clouds = document.getElementById('clouds');
  const fx = document.getElementById('weather-fx');

  const random = (min, max) => min + Math.random() * (max - min);

  function seoulClock() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23',
    }).formatToParts(new Date());
    const value = (type) => Number(parts.find((p) => p.type === type).value);
    return value('hour') + value('minute') / 60;
  }

  function seoulTimeText() {
    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(new Date());
  }

  // '2026-10-14T06:38' -> 6.63
  function toHours(text) {
    const [hour, minute] = text.split('T')[1].split(':').map(Number);
    return hour + minute / 60;
  }

  function phaseAt(t) {
    if (t >= sunrise - 1.5 && t < sunrise - 0.25) return 'dawn';
    if (t >= sunrise - 0.25 && t < sunrise + 1) return 'sunrise';
    if (t >= sunrise + 1 && t < 11) return 'day';
    if (t >= 11 && t < 14) return 'noon';
    if (t >= 14 && t < sunset - 1) return 'afternoon';
    if (t >= sunset - 1 && t < sunset + 0.5) return 'sunset';
    if (t >= sunset + 0.5 && t < 23) return 'night';
    return 'midnight';
  }

  function weatherType(code) {
    if (code === 0) return 'clear';
    if (code <= 2) return 'partly';
    if (code === 3) return 'cloudy';
    if (code === 45 || code === 48) return 'fog';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
    if (code >= 95) return 'thunder';
    return 'cloudy';
  }

  function buildWeather(type) {
    if (type === shownWeather) return;
    shownWeather = type;
    root.dataset.weather = type;

    clouds.innerHTML = '';
    for (let i = 0; i < CLOUDS[type]; i++) {
      const cloud = document.createElement('div');
      const seconds = random(60, 130);
      cloud.className = 'cloud';
      cloud.style.top = `${random(3, 32)}vh`;
      cloud.style.transform = `scale(${random(0.6, 1.4).toFixed(2)})`;
      cloud.style.animationDuration = `${seconds}s`;
      cloud.style.animationDelay = `${-random(0, seconds)}s`;
      clouds.append(cloud);
    }

    fx.innerHTML = '';
    if (reduceMotion) return;
    if (type === 'rain' || type === 'thunder') {
      for (let i = 0; i < 90; i++) {
        const drop = document.createElement('div');
        drop.className = 'drop';
        drop.style.left = `${random(0, 105)}%`;
        drop.style.animationDuration = `${random(0.6, 1).toFixed(2)}s`;
        drop.style.animationDelay = `${-random(0, 1).toFixed(2)}s`;
        fx.append(drop);
      }
    }
    if (type === 'thunder') {
      const flash = document.createElement('div');
      flash.className = 'flash';
      fx.append(flash);
    }
    if (type === 'snow') {
      for (let i = 0; i < 70; i++) {
        const flake = document.createElement('div');
        const size = random(3, 7);
        flake.className = 'flake';
        flake.style.width = flake.style.height = `${size}px`;
        flake.style.left = `${random(0, 100)}%`;
        flake.style.animationDuration = `${random(6, 12).toFixed(1)}s`;
        flake.style.animationDelay = `${-random(0, 12).toFixed(1)}s`;
        fx.append(flake);
      }
    }
  }

  function update() {
    const phase = forcedPhase || phaseAt(seoulClock());
    root.dataset.phase = phase;

    const type = forcedWeather || (current ? current.type : 'clear');
    buildWeather(type);

    const isNight = forcedPhase ? DARK_PHASES.includes(phase) : current ? !current.isDay : DARK_PHASES.includes(phase);
    if (current || forcedWeather) {
      icon.textContent = WEATHERS[type][isNight ? 'night' : 'day'];
      desc.textContent = WEATHERS[type].label;
    } else {
      icon.textContent = failed ? '❔' : '⏳';
      desc.textContent = failed ? '날씨를 못 불러왔어요' : '날씨 불러오는 중';
    }
    temp.textContent = current ? `${current.temp}°` : '--°';
    meta.textContent = `서울 · ${PHASES[phase]} · ${seoulTimeText()}`;
  }

  async function loadWeather() {
    try {
      const response = await fetch(WEATHER_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      sunrise = toHours(data.daily.sunrise[0]);
      sunset = toHours(data.daily.sunset[0]);
      current = {
        temp: Math.round(data.current.temperature_2m),
        type: weatherType(data.current.weather_code),
        isDay: data.current.is_day === 1,
      };
      failed = false;
    } catch (error) {
      console.error('서울 날씨를 불러오지 못했어요.', error);
      failed = !current;
    }
    update();
  }

  update();
  loadWeather();
  setInterval(update, 60 * 1000); // 1분마다 시간대 확인
  setInterval(loadWeather, 10 * 60 * 1000); // 10분마다 날씨 새로 받기
})();
