// HTML templates. Each function receives prepared content from src/content.mjs
// and returns an HTML string. Templates do not filter or sort content.

import { formatMonth } from './content.mjs';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

const NAVIGATION = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'experience', label: 'Experience', path: '/experience/' },
];

function arrowIcon() {
  // Decorative "external" arrow; the link text carries the meaning.
  return '<svg class="icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

function image(img, { className = '', loading = 'lazy', priority = false } = {}) {
  return `<img${className ? ` class="${className}"` : ''} src="/${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" width="${img.width}" height="${img.height}" loading="${loading}" decoding="async"${priority ? ' fetchpriority="high"' : ''}>`;
}

// External links open in a new tab so the portfolio stays open. The hidden
// text tells screen-reader users about the new tab before they follow it.
function externalLink(link, className = 'button-link') {
  return `<a class="${className}" target="_blank" rel="noopener noreferrer" href="${escapeHtml(link.url)}">${escapeHtml(link.label)}<span class="visually-hidden"> (opens in a new tab)</span>${arrowIcon()}</a>`;
}

function profileLinks(site, className) {
  return `<ul class="${className}" role="list">${site.profiles
    .map((profile) => `<li>${externalLink(profile)}</li>`)
    .join('')}</ul>`;
}

function dateRange(entry) {
  const start = `<time datetime="${entry.start}">${formatMonth(entry.start)}</time>`;
  if (entry.end === null) return `${start} – Present`;
  if (entry.end === entry.start) return start;
  return `${start} – <time datetime="${entry.end}">${formatMonth(entry.end)}</time>`;
}

function experienceEntry(entry, headingLevel) {
  const h = `h${headingLevel}`;
  return `<li class="entry" id="${escapeHtml(entry.id)}">
  <div class="entry-heading">
    <${h} class="entry-title">${escapeHtml(entry.title)}</${h}>
    <p class="entry-employer">${escapeHtml(entry.employer)}</p>
  </div>
  <p class="entry-dates">${dateRange(entry)}</p>
  <p class="entry-summary">${escapeHtml(entry.summary)}</p>
</li>`;
}

export function experienceList(entries, headingLevel) {
  return `<ol class="entries" role="list">${entries.map((entry) => experienceEntry(entry, headingLevel)).join('\n')}</ol>`;
}

function projectCard(project) {
  const current = project.current ? '<p class="card-label">Current project</p>' : '';
  if (project.presentation === 'teaser') {
    return `<li class="card card-teaser" id="${escapeHtml(project.id)}">
  ${project.logo ? image(project.logo, { className: 'card-logo' }) : ''}
  <div>
    ${current}
    <h3 class="card-title">${escapeHtml(project.title)}</h3>
    <p class="card-status">${escapeHtml(project.teaserLabel)}</p>
  </div>
</li>`;
  }
  const media = project.image ? `<div class="card-media">${image(project.image)}</div>` : '';
  const logo = project.logo ? image(project.logo, { className: 'card-logo' }) : '';
  const links = project.links.length
    ? `<div class="card-actions">${project.links.map((link) => externalLink(link)).join('')}</div>`
    : '';
  return `<li class="card" id="${escapeHtml(project.id)}">
  ${media}${logo}
  ${current}
  <h3 class="card-title">${escapeHtml(project.title)}</h3>
  <p class="card-text">${escapeHtml(project.summary)}</p>
  ${links}
</li>`;
}

function certificationCard(cert) {
  const dates = [];
  if (cert.issued) dates.push(`Issued <time datetime="${cert.issued}">${formatMonth(cert.issued)}</time>`);
  if (cert.expires) dates.push(`Expires <time datetime="${cert.expires}">${formatMonth(cert.expires)}</time>`);
  const link = cert.credentialUrl
    ? `<div class="card-actions">${externalLink({ label: 'View credential', url: cert.credentialUrl })}</div>`
    : '';
  return `<li class="card card-compact" id="${escapeHtml(cert.id)}">
  <h3 class="card-title">${escapeHtml(cert.name)}</h3>
  <p class="card-text">${escapeHtml(cert.issuer)}</p>
  ${dates.length ? `<p class="card-meta">${dates.join(' · ')}</p>` : ''}
  ${link}
</li>`;
}

function layout({ site, page, title, description, path, body, noindex = false, stylesheet }) {
  const fullTitle = title ? `${title} · ${site.name}` : site.name;
  const url = `${site.siteUrl}${path}`;
  const nav = NAVIGATION.map(
    (item) =>
      `<li><a href="${item.path}"${item.id === page ? ' aria-current="page"' : ''}>${item.label}</a></li>`,
  ).join('');
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="${escapeHtml(site.language)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${escapeHtml(url)}">`}
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#1e1f22">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${escapeHtml(site.name)}">
<meta property="og:title" content="${escapeHtml(fullTitle)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(url)}">
<meta property="og:image" content="${escapeHtml(`${site.siteUrl}/${site.portrait.src}`)}">
<meta property="og:image:alt" content="${escapeHtml(site.portrait.alt)}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="data:,">
<link rel="stylesheet" href="${stylesheet}">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="wordmark" href="/">${escapeHtml(site.wordmark)}</a>
    <nav aria-label="Primary"><ul role="list">${nav}</ul></nav>
  </div>
</header>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="site-footer">
  <div class="container footer-inner">
    <p>© ${year} ${escapeHtml(site.name)}</p>
    ${profileLinks(site, 'footer-links')}
  </div>
</footer>
</body>
</html>
`;
}

export function renderHome(content, stylesheet) {
  const { site, home } = content;
  const certifications = home.certifications.length
    ? `<ul class="card-grid card-grid-compact" role="list">${home.certifications.map(certificationCard).join('\n')}</ul>`
    : '<div class="empty-panel"></div>';
  const body = `<section class="intro container" aria-labelledby="intro-title">
  <div class="intro-text">
    <h1 id="intro-title">${escapeHtml(site.name)}</h1>
    <div class="intro-bio">${site.intro.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n')}</div>
    ${profileLinks(site, 'profile-links')}
  </div>
  <div class="intro-portrait">${image(site.portrait, { className: 'portrait', loading: 'eager', priority: true })}</div>
</section>

<section class="section container" id="projects" aria-labelledby="projects-title">
  <h2 id="projects-title" class="section-title">Projects</h2>
  <ul class="card-grid" role="list">
${home.projects.map(projectCard).join('\n')}
  </ul>
</section>

<section class="section container" id="experience" aria-labelledby="experience-title">
  <h2 id="experience-title" class="section-title">Experience</h2>
  ${experienceList(home.experience, 3)}
  <p class="section-more"><a class="text-link" href="/experience/">View all experience<span aria-hidden="true"> →</span></a></p>
</section>

<section class="section container" id="certifications" aria-labelledby="certifications-title">
  <h2 id="certifications-title" class="section-title">Certifications</h2>
  ${certifications}
</section>`;
  return layout({ site, page: 'home', title: '', description: site.description, path: '/', body, stylesheet });
}

export function renderExperience(content, stylesheet) {
  const { site, experience } = content;
  const body = `<section class="page container" aria-labelledby="page-title">
  <h1 id="page-title" class="page-title">Experience</h1>
  ${experienceList(experience, 2)}
</section>`;
  return layout({
    site,
    page: 'experience',
    title: 'Experience',
    description: `Work experience of ${site.name}.`,
    path: '/experience/',
    body,
    stylesheet,
  });
}

export function renderNotFound(content, stylesheet) {
  const { site } = content;
  const body = `<section class="page container" aria-labelledby="page-title">
  <h1 id="page-title" class="page-title">Page not found</h1>
  <p class="page-lead">This page doesn't exist or has moved.</p>
  <p><a class="text-link" href="/">Go to the home page</a></p>
</section>`;
  return layout({
    site,
    page: null,
    title: 'Page not found',
    description: 'Page not found.',
    path: '/404',
    body,
    noindex: true,
    stylesheet,
  });
}
