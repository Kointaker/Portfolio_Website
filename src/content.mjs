// Loads, validates, and selects site content from the JSON files in content/.
//
// This module is the single owner of publication, featuring, and ordering rules.
// Templates (src/render.mjs) receive already-filtered, already-sorted data and
// never re-implement these rules.
//
// Only entries with status "published" ever reach the renderer, so drafts are
// excluded from every page and from the copied asset set.

import fs from 'node:fs';
import path from 'node:path';

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;
const STATUSES = new Set(['published', 'draft']);
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.svg']);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

class ContentError extends Error {}

function fail(where, message) {
  throw new ContentError(`${where}: ${message}`);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new ContentError(`${file}: could not read JSON (${error.message})`);
  }
}

function requireString(where, value, field, { optional = false } = {}) {
  if (value === undefined && optional) return;
  if (typeof value !== 'string' || value.trim() === '') fail(where, `"${field}" must be a non-empty string`);
}

function requireHttpsUrl(where, value, field) {
  requireString(where, value, field);
  let url;
  try {
    url = new URL(value);
  } catch {
    fail(where, `"${field}" is not a valid URL`);
  }
  if (url.protocol !== 'https:') fail(where, `"${field}" must use https://`);
}

function requireMonth(where, value, field) {
  if (typeof value !== 'string' || !MONTH_PATTERN.test(value)) fail(where, `"${field}" must be "YYYY-MM"`);
}

function validateCommon(where, entry) {
  if (!entry || typeof entry !== 'object') fail(where, 'entry must be an object');
  if (typeof entry.id !== 'string' || !ID_PATTERN.test(entry.id)) {
    fail(where, '"id" must be lowercase words joined by hyphens, e.g. "my-project"');
  }
  if (!STATUSES.has(entry.status)) fail(where, '"status" must be "published" or "draft"');
  const home = entry.homepage;
  if (!home || typeof home.featured !== 'boolean' || !Number.isInteger(home.order)) {
    fail(where, '"homepage" must be { "featured": true|false, "order": <integer> }');
  }
}

function requireUniqueIds(collection, entries) {
  const seen = new Set();
  for (const entry of entries) {
    if (seen.has(entry.id)) fail(collection, `duplicate id "${entry.id}"`);
    seen.add(entry.id);
  }
}

// Reads intrinsic pixel dimensions so templates can set width/height and
// prevent layout shift. Supports JPEG, PNG, and SVG (width/height or viewBox).
function imageSize(file) {
  const ext = path.extname(file).toLowerCase();
  const data = fs.readFileSync(file);
  if (ext === '.png') {
    return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  }
  if (ext === '.svg') {
    const text = data.toString('utf8');
    const root = text.match(/<svg\b[^>]*>/i)?.[0] ?? '';
    const attr = (name) => root.match(new RegExp(`\\s${name}="([\\d.]+)(?:px)?"`))?.[1];
    if (attr('width') && attr('height')) return { width: Number(attr('width')), height: Number(attr('height')) };
    const box = root.match(/viewBox="[\d.\-]+[\s,]+[\d.\-]+[\s,]+([\d.]+)[\s,]+([\d.]+)"/);
    if (box) return { width: Number(box[1]), height: Number(box[2]) };
    return null;
  }
  // JPEG: walk segments until a start-of-frame marker.
  let offset = 2;
  while (offset < data.length) {
    if (data[offset] !== 0xff) return null;
    const marker = data[offset + 1];
    const length = data.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: data.readUInt16BE(offset + 5), width: data.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
}

// Validates an image reference and resolves it to { src, alt, width, height }.
// Image paths are repository-relative and must live under assets/.
function resolveImage(where, image, root) {
  if (!image || typeof image !== 'object') fail(where, 'image must be { "src": ..., "alt": ... }');
  requireString(where, image.src, 'src');
  requireString(where, image.alt, 'alt');
  const normalized = path.posix.normalize(image.src);
  if (!normalized.startsWith('assets/') || normalized.includes('..')) {
    fail(where, `image "${image.src}" must be a path inside assets/`);
  }
  if (!IMAGE_EXTENSIONS.has(path.extname(normalized).toLowerCase())) {
    fail(where, `image "${image.src}" must be .jpg, .jpeg, .png, or .svg`);
  }
  const file = path.join(root, normalized);
  if (!fs.existsSync(file)) fail(where, `image "${image.src}" does not exist`);
  const size = imageSize(file);
  if (!size) fail(where, `could not read dimensions of "${image.src}"`);
  return { src: normalized, alt: image.alt, width: size.width, height: size.height };
}

function byHomepageOrder(a, b) {
  return a.homepage.order - b.homepage.order || a.id.localeCompare(b.id);
}

// Current roles first (most recent start first), then past roles by most
// recent end date, then most recent start date.
function byExperienceDate(a, b) {
  const aCurrent = a.end === null;
  const bCurrent = b.end === null;
  if (aCurrent !== bCurrent) return aCurrent ? -1 : 1;
  if (!aCurrent && a.end !== b.end) return b.end.localeCompare(a.end);
  return b.start.localeCompare(a.start) || a.id.localeCompare(b.id);
}

// By most recent issue date; entries without a date keep file order after dated ones.
function byIssuedDate(a, b) {
  return (b.issued ?? '').localeCompare(a.issued ?? '');
}

export function formatMonth(value) {
  const [, year, month] = value.match(MONTH_PATTERN);
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

function warnDuplicateOrders(collection, entries, warnings) {
  const orders = new Map();
  for (const entry of entries) {
    const list = orders.get(entry.homepage.order) ?? [];
    list.push(entry.id);
    orders.set(entry.homepage.order, list);
  }
  for (const [order, ids] of orders) {
    if (ids.length > 1) warnings.push(`${collection}: homepage order ${order} is shared by ${ids.join(', ')}`);
  }
}

function loadSite(file, root) {
  const site = readJson(file);
  const where = 'content/site.json';
  requireString(where, site.name, 'name');
  requireString(where, site.wordmark, 'wordmark');
  requireHttpsUrl(where, site.siteUrl, 'siteUrl');
  requireString(where, site.language, 'language');
  requireString(where, site.description, 'description');
  if (!Array.isArray(site.intro) || site.intro.length === 0) fail(where, '"intro" must be a list of paragraphs');
  site.intro.forEach((paragraph, i) => requireString(where, paragraph, `intro[${i}]`));
  site.portrait = resolveImage(`${where} portrait`, site.portrait, root);
  if (!Array.isArray(site.profiles)) fail(where, '"profiles" must be a list');
  for (const profile of site.profiles) {
    requireString(where, profile.label, 'profiles[].label');
    requireHttpsUrl(where, profile.url, 'profiles[].url');
  }
  for (const key of ['projectLimit', 'experienceLimit', 'certificationLimit']) {
    if (!Number.isInteger(site.home?.[key]) || site.home[key] < 0) fail(where, `"home.${key}" must be a whole number`);
  }
  site.siteUrl = site.siteUrl.replace(/\/+$/, '');
  return site;
}

function loadProjects(file, root) {
  const { projects } = readJson(file);
  if (!Array.isArray(projects)) fail('content/projects.json', '"projects" must be a list');
  for (const project of projects) {
    const where = `content/projects.json "${project?.id ?? '?'}"`;
    validateCommon(where, project);
    requireString(where, project.title, 'title');
    if (typeof project.current !== 'boolean') fail(where, '"current" must be true or false');
    if (project.presentation === 'card') {
      requireString(where, project.summary, 'summary');
      project.links = project.links ?? [];
      if (!Array.isArray(project.links)) fail(where, '"links" must be a list');
      for (const link of project.links) {
        requireString(where, link.label, 'links[].label');
        requireHttpsUrl(where, link.url, 'links[].url');
      }
    } else if (project.presentation === 'teaser') {
      // Teasers intentionally show only a name, logo, and short label.
      requireString(where, project.teaserLabel, 'teaserLabel');
      for (const field of ['summary', 'links', 'image']) {
        if (project[field] !== undefined) fail(where, `teasers do not display "${field}"; remove it or use "presentation": "card"`);
      }
    } else {
      fail(where, '"presentation" must be "card" or "teaser"');
    }
    if (project.status !== 'published') continue;
    if (project.logo !== undefined) project.logo = resolveImage(where, project.logo, root);
    if (project.image !== undefined) project.image = resolveImage(where, project.image, root);
  }
  requireUniqueIds('content/projects.json', projects);
  return projects;
}

function loadExperience(file) {
  const { experience } = readJson(file);
  if (!Array.isArray(experience)) fail('content/experience.json', '"experience" must be a list');
  for (const entry of experience) {
    const where = `content/experience.json "${entry?.id ?? '?'}"`;
    validateCommon(where, entry);
    requireString(where, entry.employer, 'employer');
    requireString(where, entry.title, 'title');
    requireString(where, entry.summary, 'summary');
    requireMonth(where, entry.start, 'start');
    if (entry.end !== null) {
      requireMonth(where, entry.end, 'end');
      if (entry.end < entry.start) fail(where, '"end" is before "start"');
    }
  }
  requireUniqueIds('content/experience.json', experience);
  return experience;
}

function loadCertifications(file) {
  const { certifications } = readJson(file);
  if (!Array.isArray(certifications)) fail('content/certifications.json', '"certifications" must be a list');
  for (const entry of certifications) {
    const where = `content/certifications.json "${entry?.id ?? '?'}"`;
    validateCommon(where, entry);
    requireString(where, entry.name, 'name');
    requireString(where, entry.issuer, 'issuer');
    if (entry.issued !== undefined) requireMonth(where, entry.issued, 'issued');
    if (entry.expires !== undefined) requireMonth(where, entry.expires, 'expires');
    if (entry.credentialUrl !== undefined) requireHttpsUrl(where, entry.credentialUrl, 'credentialUrl');
  }
  requireUniqueIds('content/certifications.json', certifications);
  return certifications;
}

// Returns everything the renderer needs, plus the list of asset paths that
// published content references (the only assets copied into the build).
export function loadContent({ contentDir, root }) {
  const warnings = [];
  const site = loadSite(path.join(contentDir, 'site.json'), root);
  const published = (list) => list.filter((entry) => entry.status === 'published');

  const projects = published(loadProjects(path.join(contentDir, 'projects.json'), root));
  const experience = published(loadExperience(path.join(contentDir, 'experience.json'))).sort(byExperienceDate);
  const certifications = published(loadCertifications(path.join(contentDir, 'certifications.json'))).sort(byIssuedDate);

  const featured = (list) => list.filter((entry) => entry.homepage.featured).sort(byHomepageOrder);
  const homeProjects = featured(projects);
  const homeExperience = featured(experience);
  const homeCertifications = featured(certifications);
  warnDuplicateOrders('projects', homeProjects, warnings);
  warnDuplicateOrders('experience', homeExperience, warnings);
  warnDuplicateOrders('certifications', homeCertifications, warnings);

  const home = {
    projects: homeProjects.slice(0, site.home.projectLimit),
    experience: homeExperience.slice(0, site.home.experienceLimit),
    certifications: homeCertifications.slice(0, site.home.certificationLimit),
  };
  if (projects.length > home.projects.length) {
    warnings.push(
      `projects: ${projects.length - home.projects.length} published project(s) are not shown on Home. ` +
        'A "See more" destination has not been built yet; decide how it should work before relying on it.',
    );
  }

  const assets = new Set([site.portrait.src]);
  for (const project of projects) {
    if (project.logo) assets.add(project.logo.src);
    if (project.image) assets.add(project.image.src);
  }

  return { site, projects, experience, certifications, home, assets: [...assets].sort(), warnings };
}

export { ContentError };
