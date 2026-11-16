const menu = document.querySelector<HTMLButtonElement>('.menu-toggle');
const nav = document.querySelector('#navigation');
menu?.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!expanded));
  nav?.classList.toggle('is-open', !expanded);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
    menu.setAttribute('aria-expanded', 'false');
    nav?.classList.remove('is-open');
    menu.focus();
  }
});

const motionButton = document.querySelector<HTMLButtonElement>('.motion-toggle');
const media = window.matchMedia('(prefers-reduced-motion: reduce)');
let override: string | null = null;
try {
  override = localStorage.getItem('jf-motion');
} catch {
  /* Optional preference storage. */
}
function applyMotion() {
  const reduced = media.matches || override === 'off';
  document.documentElement.classList.toggle('reduce-motion', reduced);
  motionButton?.setAttribute('aria-pressed', String(reduced));
  if (motionButton) motionButton.textContent = `Motion: ${reduced ? 'off' : 'on'}`;
  window.dispatchEvent(new CustomEvent('motionchange', { detail: reduced }));
}
applyMotion();
media.addEventListener('change', applyMotion);
motionButton?.addEventListener('click', () => {
  override = document.documentElement.classList.contains('reduce-motion') ? 'on' : 'off';
  if (media.matches) override = 'off';
  try {
    localStorage.setItem('jf-motion', override);
  } catch {
    /* Navigation remains functional without storage. */
  }
  applyMotion();
});

const filterButtons = document.querySelectorAll<HTMLButtonElement>('[data-filter]');
const cards = document.querySelectorAll<HTMLElement>('[data-category]');
filterButtons.forEach((button) =>
  button.addEventListener('click', () => {
    filterButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    cards.forEach((card) => {
      card.hidden =
        button.dataset.filter !== 'All' && card.dataset.category !== button.dataset.filter;
      if (!card.hidden) count++;
    });
    const output = document.querySelector('[data-filter-count]');
    if (output) output.textContent = `${count} ${count === 1 ? 'project' : 'projects'}`;
  }),
);
