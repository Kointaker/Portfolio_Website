import { interests } from '../data/site';

const module = document.querySelector<HTMLElement>('[data-orbit-module]');
const canvas = module?.querySelector<HTMLCanvasElement>('canvas');
const context = canvas?.getContext('2d');
if (module && canvas && context) {
  const ctx = context;
  const el = canvas;
  let width = 500,
    height = 420,
    angle = 0.3,
    pointerX = 0,
    pointerY = 0,
    frame = 0;
  let reduced =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('reduce-motion');
  let visible = true;
  let selected = 0;
  const points = Array.from({ length: 90 }, (_, i) => {
    const y = 1 - (i / 89) * 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * Math.PI * (3 - Math.sqrt(5));
    return { x: Math.cos(phi) * r, y, z: Math.sin(phi) * r };
  });
  function project(x: number, y: number, z: number) {
    const a = angle + pointerX * 0.18;
    const rx = x * Math.cos(a) - z * Math.sin(a);
    const rz = x * Math.sin(a) + z * Math.cos(a);
    const tilt = -0.22 + pointerY * 0.12;
    const ry = y * Math.cos(tilt) - rz * Math.sin(tilt);
    const depth = y * Math.sin(tilt) + rz * Math.cos(tilt);
    const radius = Math.min(width * 0.31, height * 0.38);
    return { x: width / 2 + rx * radius, y: height / 2 + ry * radius, z: depth };
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const center = { x: width / 2, y: height / 2 };
    const glow = ctx.createRadialGradient(center.x, center.y, 10, center.x, center.y, width * 0.45);
    glow.addColorStop(0, 'rgba(77,174,157,.09)');
    glow.addColorStop(1, 'rgba(77,174,157,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
    const p = points.map((point) => project(point.x, point.y, point.z));
    points.forEach((point, i) => {
      for (let j = i + 1; j < points.length; j++) {
        const other = points[j];
        const distance = Math.hypot(point.x - other.x, point.y - other.y, point.z - other.z);
        if (distance < 0.46) {
          ctx.beginPath();
          ctx.moveTo(p[i].x, p[i].y);
          ctx.lineTo(p[j].x, p[j].y);
          ctx.strokeStyle = `rgba(113,196,177,${0.05 + ((p[i].z + p[j].z + 2) / 4) * 0.19})`;
          ctx.lineWidth = 0.65;
          ctx.stroke();
        }
      }
    });
    for (let ring = 0; ring < 3; ring++) {
      ctx.beginPath();
      for (let i = 0; i <= 160; i++) {
        const t = (i / 160) * Math.PI * 2;
        const x = Math.cos(t) * 1.21;
        const y = Math.sin(t) * Math.cos(ring * 1.1 + 0.4) * 1.21;
        const z = Math.sin(t) * Math.sin(ring * 1.1 + 0.4) * 1.21;
        const q = project(x, y, z);
        if (i === 0) ctx.moveTo(q.x, q.y);
        else ctx.lineTo(q.x, q.y);
      }
      ctx.strokeStyle = ring === selected % 3 ? 'rgba(144,228,200,.5)' : 'rgba(122,166,165,.19)';
      ctx.lineWidth = ring === selected % 3 ? 1 : 0.65;
      ctx.stroke();
    }
    p.forEach((point, i) => {
      const bright = i % 9 === selected;
      ctx.beginPath();
      ctx.arc(point.x, point.y, bright ? 2.6 : 1.2, 0, Math.PI * 2);
      ctx.fillStyle = bright ? '#b9f7df' : `rgba(124,202,183,${0.25 + ((point.z + 1) / 2) * 0.55})`;
      if (bright) {
        ctx.shadowColor = '#84dfbd';
        ctx.shadowBlur = 10;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    module?.classList.add('canvas-ready');
  }
  function animate() {
    frame = 0;
    if (!visible || document.hidden) return;
    if (!reduced) angle += 0.0019;
    draw();
    if (!reduced) frame = requestAnimationFrame(animate);
  }
  function resume() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    animate();
  }
  const resize = new ResizeObserver((entries) => {
    const box = entries[0].contentRect;
    width = box.width;
    height = box.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    el.width = width * dpr;
    el.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
    resume();
  });
  resize.observe(el);
  const observer = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    resume();
  });
  observer.observe(el);
  el.addEventListener('pointermove', (event) => {
    if (reduced) return;
    const rect = el.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / width - 0.5;
    pointerY = (event.clientY - rect.top) / height - 0.5;
  });
  el.addEventListener('pointerleave', () => {
    pointerX = 0;
    pointerY = 0;
  });
  window.addEventListener('motionchange', ((event: CustomEvent<boolean>) => {
    reduced = event.detail;
    resume();
  }) as EventListener);
  document.addEventListener('visibilitychange', resume);
  module.querySelectorAll<HTMLButtonElement>('[data-interest]').forEach((button) =>
    button.addEventListener('click', () => {
      selected = Number(button.dataset.interest);
      module
        .querySelectorAll('[data-interest]')
        .forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      const description = module.querySelector('#interest-description');
      if (description) description.textContent = interests[selected].description;
      draw();
    }),
  );
}
