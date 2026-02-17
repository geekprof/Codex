const TAU = Math.PI * 2;

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
  let t = 0;

  const render = () => {
    t += 0.015;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = 170;
    const cy = 180;
    const a = 110;
    const e = 0.45;
    const p = getOrbitPoint(a, e, t);

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

    const planetX = cx + p.x;
    const planetY = cy + p.y;
    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(planetX, planetY, 6, 0, TAU);
    ctx.fill();

    const hx = 380;
    const hy = 180;
    const hr = 60;
    const hvx = hr * Math.cos(t) + 18;
    const hvy = hr * Math.sin(t);

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
  let theta = 0;
  const a = 120;
  const e = 0.55;

  const render = () => {
    theta += 0.01;
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

    const p = getOrbitPoint(a, e, theta);
    const px = left.x + p.x;
    const py = left.y + p.y;
    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, TAU);
    ctx.fill();

    const tangent = Math.atan2(py - left.y, px - left.x) + Math.PI / 2;
    const speed = 28 + 14 * Math.cos(theta);
    const vx = speed * Math.cos(tangent);
    const vy = speed * Math.sin(tangent);

    ctx.strokeStyle = '#76e3ff';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + vx, py + vy);
    ctx.stroke();

    const hcx = right.x + 22;
    const hcy = right.y;
    const hr = 78;
    ctx.strokeStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(hcx, hcy, hr, 0, TAU);
    ctx.stroke();

    const hvx = hcx + hr * Math.cos(theta);
    const hvy = hcy + hr * Math.sin(theta);

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
    ctx.moveTo(right.x, right.y);
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

  let theta = 0;

  const render = () => {
    theta += 0.012;
    const e = Number(slider.value);
    output.textContent = e.toFixed(2);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const left = { x: 220, y: 215 };
    const right = { x: 645, y: 215 };
    const a = 130;

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

    const p = getOrbitPoint(a, e, theta);
    const px = left.x + p.x;
    const py = left.y + p.y;
    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, TAU);
    ctx.fill();

    const hr = 62;
    const shift = 70 * e;
    ctx.strokeStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(right.x + shift, right.y, hr, 0, TAU);
    ctx.stroke();

    const hvx = right.x + shift + hr * Math.cos(theta);
    const hvy = right.y + hr * Math.sin(theta);

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
  let theta = 0;

  const render = () => {
    theta += 0.017;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const center = { x: 225, y: 190 };
    const a = 130;
    const e = 0.7;
    const p = getOrbitPoint(a, e, theta);

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

    const px = center.x + p.x;
    const py = center.y + p.y;
    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, TAU);
    ctx.fill();

    const speed = 2 + 4 * (1 + Math.cos(theta)) / 2;
    const barX = 520;
    const barY = 80;
    const barH = 240;
    ctx.strokeStyle = '#2e4c7a';
    ctx.strokeRect(barX, barY, 40, barH);

    const fillH = (speed / 6) * barH;
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
