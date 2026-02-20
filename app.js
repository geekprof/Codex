const TAU = Math.PI * 2;
const MU = 1;

function getOrbitalState(a, e, theta) {
  const p = a * (1 - e * e);
  const r = p / (1 + e * Math.cos(theta));
  const x = r * Math.cos(theta);
  const y = r * Math.sin(theta);

  const h = Math.sqrt(MU * p);
  const vr = (MU / h) * e * Math.sin(theta);
  const vt = (MU / h) * (1 + e * Math.cos(theta));
  const vx = vr * Math.cos(theta) - vt * Math.sin(theta);
  const vy = vr * Math.sin(theta) + vt * Math.cos(theta);

  return { p, r, x, y, h, vx, vy, speed: Math.hypot(vx, vy) };
}

function advanceTheta(theta, state, dt = 1.6) {
  // dt est le multiplicateur global de vitesse temporelle de la simulation.
  // Plus dt est grand, plus l'astre avance vite sur son orbite.
  const omega = state.h / (state.r * state.r);
  return theta + dt * omega;
}

function drawAxesAt(ctx, cx, cy, halfSize, color = '#2e4c7a') {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - halfSize, cy);
  ctx.lineTo(cx + halfSize, cy);
  ctx.moveTo(cx, cy - halfSize);
  ctx.lineTo(cx, cy + halfSize);
  ctx.stroke();
}

function drawOrbitFromFocus(ctx, fx, fy, a, e, stroke = '#4e8de6') {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let th = 0; th <= TAU; th += 0.02) {
    const pt = getOrbitalState(a, e, th);
    const x = fx + pt.x;
    const y = fy - pt.y;
    if (th === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function runHome() {
  const canvas = document.getElementById('home-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const focus = { x: 160, y: 180 };
  const hodoOrigin = { x: 400, y: 180 };
  const a = 110;
  const e = 0.45;
  // Echelle du hodographe (taille du cercle + distance du point vitesse).
  const velocityScale = 1000;
  // Echelle du vecteur vitesse dessine depuis l'origine du plan des vitesses.
  const positionVectorScale = 95;
  let theta = 0;

  const render = () => {
    const state = getOrbitalState(a, e, theta);
    // Regle ici la vitesse de defilement de cette simulation.
    theta = advanceTheta(theta, state, 1.7);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawOrbitFromFocus(ctx, focus.x, focus.y, a, e, '#5ca5ff');

    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(focus.x, focus.y, 7, 0, TAU);
    ctx.fill();

    const px = focus.x + state.x;
    const py = focus.y - state.y;
    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, TAU);
    ctx.fill();

    drawAxesAt(ctx, hodoOrigin.x, hodoOrigin.y, 95);

    const baseSpeed = MU / state.h;
    const circleRadius = velocityScale * baseSpeed;
    const circleCy = hodoOrigin.y - velocityScale * baseSpeed * e;
    ctx.strokeStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(hodoOrigin.x, circleCy, circleRadius, 0, TAU);
    ctx.stroke();

    const hvx = hodoOrigin.x + velocityScale * state.vx;
    const hvy = hodoOrigin.y - velocityScale * state.vy;
    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(hvx, hvy, 5, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = '#76e3ff';
    ctx.beginPath();
    ctx.moveTo(hodoOrigin.x, hodoOrigin.y);
    ctx.lineTo(
      hodoOrigin.x + positionVectorScale * state.vx,
      hodoOrigin.y - positionVectorScale * state.vy
    );
    ctx.stroke();

    requestAnimationFrame(render);
  };

  render();
}

function runKepler() {
  const canvas = document.getElementById('kepler-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const a = 120;
  const e = 0.55;
  const focus = { x: 220, y: 195 };
  const hodoOrigin = { x: 640, y: 195 };
  // Echelle du hodographe (page Kepler).
  const velocityScale = 190;
  const orbitVectorScale = 42;
  let theta = 0;

  const render = () => {
    const state = getOrbitalState(a, e, theta);
    // Regle ici la vitesse de defilement de cette simulation.
    theta = advanceTheta(theta, state, 1.45);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#dce8ff';
    ctx.fillText('Plan des positions', focus.x - 55, 22);
    ctx.fillText('Plan des vitesses (hodographe)', hodoOrigin.x - 95, 22);

    drawOrbitFromFocus(ctx, focus.x, focus.y, a, e);

    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(focus.x, focus.y, 7, 0, TAU);
    ctx.fill();

    const px = focus.x + state.x;
    const py = focus.y - state.y;
    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = '#76e3ff';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + orbitVectorScale * state.vx, py - orbitVectorScale * state.vy);
    ctx.stroke();

    drawAxesAt(ctx, hodoOrigin.x, hodoOrigin.y, 130);

    const baseSpeed = MU / state.h;
    const circleRadius = velocityScale * baseSpeed;
    const circleCy = hodoOrigin.y - velocityScale * baseSpeed * e;
    ctx.strokeStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(hodoOrigin.x, circleCy, circleRadius, 0, TAU);
    ctx.stroke();

    const hvx = hodoOrigin.x + velocityScale * state.vx;
    const hvy = hodoOrigin.y - velocityScale * state.vy;

    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(hvx, hvy, 5, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = '#76e3ff';
    ctx.beginPath();
    ctx.moveTo(hodoOrigin.x, hodoOrigin.y);
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

  const a = 130;
  const focus = { x: 220, y: 215 };
  const hodoOrigin = { x: 645, y: 215 };
  // Echelle du hodographe (page Construction).
  const velocityScale = 165;
  const orbitVectorScale = 35;
  let theta = 0;

  const render = () => {
    const e = Number(slider.value);
    const state = getOrbitalState(a, e, theta);
    // Regle ici la vitesse de defilement de cette simulation.
    theta = advanceTheta(theta, state, 1.55);
    output.textContent = e.toFixed(2);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#dce8ff';
    ctx.fillText(`e = ${e.toFixed(2)}`, 24, 26);

    drawOrbitFromFocus(ctx, focus.x, focus.y, a, e);

    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(focus.x, focus.y, 7, 0, TAU);
    ctx.fill();

    const px = focus.x + state.x;
    const py = focus.y - state.y;
    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = '#76e3ff';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + orbitVectorScale * state.vx, py - orbitVectorScale * state.vy);
    ctx.stroke();

    drawAxesAt(ctx, hodoOrigin.x, hodoOrigin.y, 130);

    const baseSpeed = MU / state.h;
    const circleRadius = velocityScale * baseSpeed;
    const circleCy = hodoOrigin.y - velocityScale * baseSpeed * e;
    ctx.strokeStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(hodoOrigin.x, circleCy, circleRadius, 0, TAU);
    ctx.stroke();

    const hvx = hodoOrigin.x + velocityScale * state.vx;
    const hvy = hodoOrigin.y - velocityScale * state.vy;
    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(hvx, hvy, 5, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = '#76e3ff';
    ctx.beginPath();
    ctx.moveTo(hodoOrigin.x, hodoOrigin.y);
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

  const focus = { x: 225, y: 190 };
  const a = 130;
  const e = 0.7;
  const vMin = Math.sqrt((MU / a) * ((1 - e) / (1 + e)));
  const vMax = Math.sqrt((MU / a) * ((1 + e) / (1 - e)));
  let theta = 0;

  const render = () => {
    const state = getOrbitalState(a, e, theta);
    // Regle ici la vitesse de defilement de cette simulation.
    theta = advanceTheta(theta, state, 1.5);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawOrbitFromFocus(ctx, focus.x, focus.y, a, e);

    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(focus.x, focus.y, 7, 0, TAU);
    ctx.fill();

    const px = focus.x + state.x;
    const py = focus.y - state.y;
    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, TAU);
    ctx.fill();

    const barX = 520;
    const barY = 80;
    const barH = 240;
    const speedRatio = (state.speed - vMin) / (vMax - vMin);
    const clampedRatio = Math.max(0, Math.min(1, speedRatio));

    ctx.strokeStyle = '#2e4c7a';
    ctx.strokeRect(barX, barY, 40, barH);

    const fillH = clampedRatio * barH;
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

function cross2(a, b) {
  return a.x * b.y - a.y * b.x;
}

function drawArrow(ctx, x1, y1, x2, y2, color = '#76e3ff', width = 2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return;
  const ux = dx / len;
  const uy = dy / len;
  const head = Math.min(10, Math.max(6, len * 0.25));

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * ux + 0.5 * head * uy, y2 - head * uy - 0.5 * head * ux);
  ctx.lineTo(x2 - head * ux - 0.5 * head * uy, y2 - head * uy + 0.5 * head * ux);
  ctx.closePath();
  ctx.fill();
}

function buildHodographeSteps(n, e = 0.55) {
  const a = 1;
  const p = a * (1 - e * e);
  const h = Math.sqrt(MU * p);
  const dTheta = TAU / n;
  const dvScale = -(MU / h) * dTheta;

  let point = { x: a * (1 - e), y: 0 };
  let velocity = { x: 0, y: (MU / h) * (1 + e) };
  const steps = [];

  for (let k = 0; k < n; k++) {
    const theta = Math.atan2(point.y, point.x);
    const r = Math.hypot(point.x, point.y);
    const rHat = { x: point.x / r, y: point.y / r };
    const targetTheta = theta + dTheta;
    const targetDir = { x: Math.cos(targetTheta), y: Math.sin(targetTheta) };

    const denom = cross2(velocity, targetDir);
    let nextPoint;
    if (Math.abs(denom) < 1e-9) {
      const nextR = p / (1 + e * Math.cos(targetTheta));
      nextPoint = { x: nextR * targetDir.x, y: nextR * targetDir.y };
    } else {
      const t = -cross2(point, targetDir) / denom;
      const lambda = -cross2(velocity, point) / denom;
      if (t <= 1e-9 || lambda <= 1e-9) {
        const nextR = p / (1 + e * Math.cos(targetTheta));
        nextPoint = { x: nextR * targetDir.x, y: nextR * targetDir.y };
      } else {
        nextPoint = {
          x: point.x + t * velocity.x,
          y: point.y + t * velocity.y
        };
      }
    }

    const deltaV = { x: dvScale * rHat.x, y: dvScale * rHat.y };
    const nextVelocity = {
      x: velocity.x + deltaV.x,
      y: velocity.y + deltaV.y
    };

    steps.push({
      point: { ...point },
      velocity: { ...velocity },
      theta,
      targetTheta,
      nextPoint,
      deltaV,
      nextVelocity
    });

    point = nextPoint;
    velocity = nextVelocity;
  }

  return { steps, dTheta, h, e };
}

function runHodographe() {
  const canvas = document.getElementById('hodographe-canvas');
  const slider = document.getElementById('n-steps');
  const nValue = document.getElementById('n-steps-value');
  const stepValue = document.getElementById('hodo-step');
  const dThetaValue = document.getElementById('hodo-dtheta');
  const restart = document.getElementById('restart-hodographe');
  if (!canvas || !slider || !nValue || !stepValue || !dThetaValue || !restart) return;
  const ctx = canvas.getContext('2d');

  const posOrigin = { x: 210, y: 250 };
  const velOrigin = { x: 730, y: 230 };
  const posScale = 130;
  const velScale = 95;
  const stepDurationMs = 650;

  let model = buildHodographeSteps(Number(slider.value));
  let currentStep = 0;
  let lastAdvance = 0;

  function resetModel() {
    model = buildHodographeSteps(Number(slider.value));
    currentStep = 0;
    lastAdvance = 0;
    nValue.textContent = String(model.steps.length);
    stepValue.textContent = `0 / ${model.steps.length}`;
    const dThetaDeg = (model.dTheta * 180) / Math.PI;
    dThetaValue.textContent = `${model.dTheta.toFixed(4)} rad (${dThetaDeg.toFixed(2)}°)`;
  }

  slider.addEventListener('input', resetModel);
  restart.addEventListener('click', resetModel);
  resetModel();

  function toPosCanvas(p) {
    return { x: posOrigin.x + posScale * p.x, y: posOrigin.y - posScale * p.y };
  }

  function toVelCanvas(v) {
    return { x: velOrigin.x + velScale * v.x, y: velOrigin.y - velScale * v.y };
  }

  function drawReferenceOrbit() {
    ctx.strokeStyle = 'rgba(118, 227, 255, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    const p = 1 * (1 - model.e * model.e);
    for (let th = 0; th <= TAU + 0.01; th += 0.02) {
      const r = p / (1 + model.e * Math.cos(th));
      const pt = toPosCanvas({ x: r * Math.cos(th), y: r * Math.sin(th) });
      if (th === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function render(ts) {
    if (lastAdvance === 0) lastAdvance = ts;
    if (ts - lastAdvance >= stepDurationMs) {
      lastAdvance = ts;
      currentStep = (currentStep + 1) % model.steps.length;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#dce8ff';
    ctx.font = '15px Inter, system-ui, sans-serif';
    ctx.fillText('Plan des positions', 132, 28);
    ctx.fillText('Plan des vitesses (hodographe)', 628, 28);

    ctx.strokeStyle = 'rgba(118, 227, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(480, 35);
    ctx.lineTo(480, 425);
    ctx.stroke();

    drawReferenceOrbit();

    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(posOrigin.x, posOrigin.y, 7, 0, TAU);
    ctx.fill();
    ctx.fillText('S', posOrigin.x + 10, posOrigin.y - 10);

    const step = model.steps[currentStep];
    const p0 = toPosCanvas(step.point);
    const p1 = toPosCanvas(step.nextPoint);

    ctx.strokeStyle = '#76e3ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= currentStep; i++) {
      const pt = toPosCanvas(model.steps[i].point);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();

    drawArrow(ctx, p0.x, p0.y, p1.x, p1.y, '#8be9a8', 2.5);

    const ray0 = toPosCanvas({ x: 1.7 * Math.cos(step.theta), y: 1.7 * Math.sin(step.theta) });
    const ray1 = toPosCanvas({ x: 1.7 * Math.cos(step.targetTheta), y: 1.7 * Math.sin(step.targetTheta) });
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.55)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(posOrigin.x, posOrigin.y);
    ctx.lineTo(ray0.x, ray0.y);
    ctx.moveTo(posOrigin.x, posOrigin.y);
    ctx.lineTo(ray1.x, ray1.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(p0.x, p0.y, 6, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#8be9a8';
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, 4, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#dce8ff';
    ctx.fillText('P', p0.x + 10, p0.y - 8);

    const legendStart = { x: 52, y: 412 };
    const legendEnd = { x: 112, y: 412 };
    drawArrow(ctx, legendStart.x, legendStart.y, legendEnd.x, legendEnd.y, '#8be9a8', 3);
    ctx.fillStyle = '#8be9a8';
    const drX = legendEnd.x + 8;
    const drY = legendEnd.y + 4;
    ctx.fillText('Δr', drX, drY);
    const drWidth = ctx.measureText('Δr').width;
    drawArrow(ctx, drX + 1, drY - 13, drX + drWidth - 1, drY - 13, '#8be9a8', 1.8);
    ctx.fillStyle = '#dce8ff';
    ctx.fillText('vecteur déplacement', legendEnd.x + 34, legendEnd.y + 4);

    drawAxesAt(ctx, velOrigin.x, velOrigin.y, 130);
    const base = MU / model.h;
    const circleCenter = toVelCanvas({ x: 0, y: -base * model.e });
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.arc(circleCenter.x, circleCenter.y, velScale * base, 0, TAU);
    ctx.stroke();

    ctx.strokeStyle = '#76e3ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= currentStep; i++) {
      const vv = toVelCanvas(model.steps[i].velocity);
      if (i === 0) ctx.moveTo(vv.x, vv.y);
      else ctx.lineTo(vv.x, vv.y);
    }
    const vNext = toVelCanvas(step.nextVelocity);
    ctx.lineTo(vNext.x, vNext.y);
    ctx.stroke();

    const v0 = toVelCanvas(step.velocity);
    drawArrow(ctx, v0.x, v0.y, vNext.x, vNext.y, '#ff8fa3', 2.2);
    ctx.fillStyle = '#ff8fa3';
    ctx.fillText('Δv', (v0.x + vNext.x) * 0.5 + 8, (v0.y + vNext.y) * 0.5 - 8);

    ctx.fillStyle = '#76e3ff';
    ctx.beginPath();
    ctx.arc(v0.x, v0.y, 5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#8be9a8';
    ctx.beginPath();
    ctx.arc(vNext.x, vNext.y, 4, 0, TAU);
    ctx.fill();

    stepValue.textContent = `${currentStep + 1} / ${model.steps.length}`;
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

const page = document.body.dataset.page;
if (page === 'home') runHome();
if (page === 'kepler') runKepler();
if (page === 'construction') runConstruction();
if (page === 'applications') runApplications();
if (page === 'hodographe') runHodographe();
