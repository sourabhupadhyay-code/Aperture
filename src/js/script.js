// ============================================
// Aperture Coffee Roasters — site interactivity
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initRoastCurve();
  initNotifyForm();
  document.getElementById('year').textContent = new Date().getFullYear();
});

// ---------- Mobile nav ----------
function initNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---------- Roast curve widget ----------
const ROAST_STAGES = [
  {
    time: '0:00',
    temp: 'Charge · 200°C',
    caption: 'Green beans hit the drum. Temperature drops fast as the cold beans absorb heat.',
    x: 60, y: 270,
  },
  {
    time: '4:30',
    temp: 'Turning point · 95°C',
    caption: 'The lowest point of the roast. From here, temperature climbs steadily as beans dry out.',
    x: 330, y: 205,
  },
  {
    time: '9:15',
    temp: 'First crack · 196°C',
    caption: 'Beans audibly pop as internal steam pressure breaks the cell walls. This is where roast level starts to diverge.',
    x: 560, y: 95,
  },
  {
    time: '10:40',
    temp: 'Development · 205°C',
    caption: 'The stretch after first crack. A few extra seconds here is the difference between light and medium roast.',
    x: 700, y: 60,
  },
  {
    time: '11:20',
    temp: 'Drop · 210°C',
    caption: 'Beans hit the cooling tray immediately. Every extra second on heat now would push the batch into the next roast level.',
    x: 860, y: 42,
  },
];

function initRoastCurve() {
  const slider = document.getElementById('curveSlider');
  const dot = document.getElementById('curveDot');
  const timeEl = document.getElementById('curveTime');
  const tempEl = document.getElementById('curveTemp');
  const captionEl = document.getElementById('curveCaption');
  if (!slider) return;

  function render(stageIndex) {
    const stage = ROAST_STAGES[stageIndex];
    dot.setAttribute('cx', stage.x);
    dot.setAttribute('cy', stage.y);
    timeEl.textContent = stage.time;
    tempEl.textContent = stage.temp;
    captionEl.textContent = stage.caption;
  }

  slider.addEventListener('input', (e) => render(Number(e.target.value)));
  render(0);
}

// ---------- Notify form ----------
function initNotifyForm() {
  const form = document.getElementById('notifyForm');
  const note = document.getElementById('formNote');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = document.getElementById('phone').value.trim();
    if (!phone) return;

    // No backend is wired up in this starter project.
    // Replace this with a real API call (fetch) to your signup service.
    note.textContent = "Thanks — we'll text you when the next origin drops.";
    form.reset();
  });
}
