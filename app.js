const TAU = Math.PI * 2;
const MU = 1;

const solveKeplerEquation = (meanAnomaly, e, iterations = 7) => {
  let eccentricAnomaly = e < 0.8 ? meanAnomaly : Math.PI;
  for (let i = 0; i < iterations; i += 1) {
    const f = eccentricAnomaly - e * Math.sin(eccentricAnomaly) - meanAnomaly;
    const fp = 1 - e * Math.cos(eccentricAnomaly);
    eccentricAnomaly -= f / fp;
  }
  return eccentricAnomaly;
};

const getOrbitStateAtTime = (a, e, elapsedSeconds, timeScale = 1, mu = MU) => {
  const meanMotion = Math.sqrt(mu / (a * a * a));
  const meanAnomaly = ((elapsedSeconds * timeScale * meanMotion) % TAU + TAU) % TAU;
  const E = solveKeplerEquation(meanAnomaly, e);
  const oneMinusECosE = 1 - e * Math.cos(E);
  const b = a * Math.sqrt(1 - e * e);

  const x = a * (Math.cos(E) - e);
  const y = b * Math.sin(E);
  const r = a * oneMinusECosE;

  const vx = (-a * meanMotion * Math.sin(E)) / oneMinusECosE;
  const vy = (b * meanMotion * Math.cos(E)) / oneMinusECosE;

  const p = a * (1 - e * e);
  const h = Math.sqrt(mu * p);

  return { x, y, r, vx, vy, h };
};

const getOrbitPoint = (a, e, theta) => {
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
  return { x: r * Math.cos(theta), y: r * Math.sin(theta), r };
};

function drawAxes(ctx, w, h, color = '#274069') {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();
}

function runHome() {
  const canvas = document.getElementById('home-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let startTime = null;

  const render = (timestamp) => {
    if (startTime === null) startTime = timestamp;
    const elapsedSeconds = (timestamp - startTime) / 1000;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = 170;
    const cy = 180;
    const a = 110;
    const e = 0.45;
    const state = getOrbitStateAtTime(a, e, elapsedSeconds, 8);

    ctx.strokeStyle = '#5ca5ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let th = 0; th <= TAU; th += 0.02) {
      const op = getOrbitPoint(a, e, th);
      const x = cx + op.x;
      const y = cy + op.y;
      th === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, TAU);
    ctx.fill();

    const planetX = cx + state.x;
    const planetY = cy + state.y;
    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(planetX, planetY, 6, 0, TAU);
    ctx.fill();

    const hx = 380;
    const hy = 180;
    const hr = 60;
    const hScale = 55;
    const hvx = state.vx * hScale + 18;
    const hvy = state.vy * hScale;

    drawAxes(ctx, 260, 360);

    ctx.save();
    ctx.translate(hx, hy);
    ctx.strokeStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(18, 0, hr, 0, TAU);
    ctx.stroke();

    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(hvx, hvy, 5, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = '#76e3ff';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(hvx, hvy);
    ctx.stroke();
    ctx.restore();

    requestAnimationFrame(render);
  };

  render();
}

function runKepler() {
  const canvas = document.getElementById('kepler-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let startTime = null;
  const a = 120;
  const e = 0.55;
  const timeScale = 8;

  const render = (timestamp) => {
    if (startTime === null) startTime = timestamp;
    const elapsedSeconds = (timestamp - startTime) / 1000;
    const state = getOrbitStateAtTime(a, e, elapsedSeconds, timeScale);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const left = { x: 220, y: 195 };
    const right = { x: 640, y: 195 };

    ctx.fillStyle = '#dce8ff';
    ctx.fillText('Plan des positions', left.x - 55, 22);
    ctx.fillText('Plan des vitesses (hodographe)', right.x - 95, 22);

    ctx.strokeStyle = '#4e8de6';
    ctx.beginPath();
    for (let th = 0; th <= TAU; th += 0.02) {
      const p = getOrbitPoint(a, e, th);
      const x = left.x + p.x;
      const y = left.y + p.y;
      th === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(left.x, left.y, 7, 0, TAU);
    ctx.fill();

    const px = left.x + state.x;
    const py = left.y + state.y;
    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, TAU);
    ctx.fill();

    const velocityScale = 300;
    const vx = state.vx * velocityScale;
    const vy = state.vy * velocityScale;

    ctx.strokeStyle = '#76e3ff';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + vx, py + vy);
    ctx.stroke();

    const hScale = 240;
    const hcx = right.x;
    const hcy = right.y;
    const hr = (MU / state.h) * hScale;
    ctx.strokeStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(hcx, hcy + (MU * e / state.h) * hScale, hr, 0, TAU);
    ctx.stroke();

    const hvx = hcx + state.vx * hScale;
    const hvy = hcy + state.vy * hScale;

    ctx.strokeStyle = '#2e4c7a';
    ctx.beginPath();
    ctx.moveTo(right.x - 130, hcy);
    ctx.lineTo(right.x + 130, hcy);
    ctx.moveTo(right.x, hcy - 130);
    ctx.lineTo(right.x, hcy + 130);
    ctx.stroke();

    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(hvx, hvy, 5, 0, TAU);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(hcx, hcy);
    ctx.lineTo(hvx, hvy);
    ctx.stroke();

    requestAnimationFrame(render);
  };

  render();
}

function runConstruction() {
  const canvas = document.getElementById('construction-canvas');
  const slider = document.getElementById('ecc');
  const output = document.getElementById('ecc-value');
  if (!canvas || !slider || !output) return;
  const ctx = canvas.getContext('2d');

  let startTime = null;

  const render = (timestamp) => {
    if (startTime === null) startTime = timestamp;
    const elapsedSeconds = (timestamp - startTime) / 1000;
    const e = Number(slider.value);
    const a = 130;
    const state = getOrbitStateAtTime(a, e, elapsedSeconds, 8);
    output.textContent = e.toFixed(2);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const left = { x: 220, y: 215 };
    const right = { x: 645, y: 215 };

    ctx.fillStyle = '#dce8ff';
    ctx.fillText(`e = ${e.toFixed(2)}`, 24, 26);

    ctx.strokeStyle = '#4e8de6';
    ctx.beginPath();
    for (let th = 0; th <= TAU; th += 0.02) {
      const pt = getOrbitPoint(a, e, th);
      const x = left.x + pt.x;
      const y = left.y + pt.y;
      th === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(left.x, left.y, 7, 0, TAU);
    ctx.fill();

    const px = left.x + state.x;
    const py = left.y + state.y;
    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, TAU);
    ctx.fill();

    const hScale = 180;
    const hr = (MU / state.h) * hScale;
    const shift = (MU * e / state.h) * hScale;
    ctx.strokeStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(right.x + shift, right.y, hr, 0, TAU);
    ctx.stroke();

    const hvx = right.x + state.vx * hScale;
    const hvy = right.y + state.vy * hScale;

    ctx.strokeStyle = '#2e4c7a';
    ctx.beginPath();
    ctx.moveTo(right.x - 130, right.y);
    ctx.lineTo(right.x + 130, right.y);
    ctx.moveTo(right.x, right.y - 130);
    ctx.lineTo(right.x, right.y + 130);
    ctx.stroke();

    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(hvx, hvy, 5, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = '#76e3ff';
    ctx.beginPath();
    ctx.moveTo(right.x, right.y);
    ctx.lineTo(hvx, hvy);
    ctx.stroke();

    requestAnimationFrame(render);
  };

  render();
}

function runApplications() {
  const canvas = document.getElementById('applications-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let startTime = null;

  const render = (timestamp) => {
    if (startTime === null) startTime = timestamp;
    const elapsedSeconds = (timestamp - startTime) / 1000;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const center = { x: 225, y: 190 };
    const a = 130;
    const e = 0.7;
    const state = getOrbitStateAtTime(a, e, elapsedSeconds, 9);

    ctx.strokeStyle = '#4e8de6';
    ctx.beginPath();
    for (let th = 0; th <= TAU; th += 0.02) {
      const op = getOrbitPoint(a, e, th);
      const x = center.x + op.x;
      const y = center.y + op.y;
      th === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(center.x, center.y, 7, 0, TAU);
    ctx.fill();

    const px = center.x + state.x;
    const py = center.y + state.y;
    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, TAU);
    ctx.fill();

    const speed = Math.hypot(state.vx, state.vy);
    const maxSpeed = (MU / state.h) * (1 + e);
    const barX = 520;
    const barY = 80;
    const barH = 240;
    ctx.strokeStyle = '#2e4c7a';
    ctx.strokeRect(barX, barY, 40, barH);

    const fillH = (speed / maxSpeed) * barH;
    ctx.fillStyle = '#76e3ff';
    ctx.fillRect(barX, barY + barH - fillH, 40, fillH);

    ctx.fillStyle = '#dce8ff';
    ctx.fillText('vitesse orbitale', barX - 20, barY - 15);
    ctx.fillText('apoastre', 575, 300);
    ctx.fillText('périastre', 575, 100);

    requestAnimationFrame(render);
  };

  render();
}

const page = document.body.dataset.page;
if (page === 'home') runHome();
if (page === 'kepler') runKepler();
if (page === 'construction') runConstruction();
if (page === 'applications') runApplications();
