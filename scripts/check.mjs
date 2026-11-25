#!/usr/bin/env node
// Checks the site without any dependencies. Run with `npm run check`.
//
// 1. Builds the real content into a temporary folder and checks the output:
//    exact file list (nothing private or unreferenced), internal links and
//    images resolve, no email addresses or phone numbers, page structure.
// 2. Builds a temporary fixture (real content plus a draft project, a draft
//    job, an extra project, and a certification) to prove that drafts stay out,
//    ordering and homepage limits hold, and certifications render without
//    layout changes.
// 3. Checks text contrast of the theme colors against WCAG AA.
//
// Temporary folders are created in the operating system's temp directory and
// removed afterwards. The repository's dist/ folder is not touched.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const results = [];

function check(name, fn) {
  try {
    fn();
    results.push({ name, ok: true });
  } catch (error) {
    results.push({ name, ok: false, error });
  }
}

function listFiles(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full, base) : [path.relative(base, full).split(path.sep).join('/')];
  });
}

const read = (dir, file) => fs.readFileSync(path.join(dir, file), 'utf8');
const ids = (html, className) => [...html.matchAll(new RegExp(`<li class="${className}[^"]*" id="([^"]+)"`, 'g'))].map((m) => m[1]);
const section = (html, id) => html.match(new RegExp(`<section[^>]*id="${id}"[\\s\\S]*?</section>`))?.[0] ?? '';

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-check-'));

try {
  // ---- 1. Real content -------------------------------------------------
  const out = path.join(temp, 'site');
  const content = build({ out, content: path.join(root, 'content'), quiet: true });
  const files = listFiles(out).sort();
  const pages = ['index.html', 'experience/index.html', '404.html'];

  check('output contains only pages, stylesheet, and referenced assets', () => {
    const expected = [...pages, 'styles.css', ...content.assets].sort();
    assert.deepEqual(files, expected);
  });

  check('no email addresses, phone numbers, or private paths in output', () => {
    for (const file of files.filter((f) => /\.(html|css|svg)$/.test(f))) {
      const text = read(out, file);
      assert.doesNotMatch(text, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, `${file} contains an email address`);
      assert.doesNotMatch(text, /mailto:|tel:/i, `${file} contains a mailto/tel link`);
      assert.doesNotMatch(text, /\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/, `${file} contains a phone-like number`);
      assert.doesNotMatch(text, /documentation\/|context\.md|\.pdf\b/i, `${file} references private material`);
    }
  });

  check('internal links and images resolve to built files', () => {
    for (const page of pages) {
      const html = read(out, page);
      for (const [, ref] of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
        const clean = ref.split(/[?#]/)[0];
        const target = clean.endsWith('/') ? `${clean}index.html` : clean;
        assert.ok(fs.existsSync(path.join(out, target)), `${page}: ${ref} does not resolve`);
      }
    }
  });

  check('every image has alt text and intrinsic dimensions', () => {
    for (const page of pages) {
      for (const [tag] of read(out, page).matchAll(/<img\b[^>]*>/g)) {
        assert.match(tag, /\salt="[^"]+"/, `${page}: image without alt: ${tag}`);
        assert.match(tag, /\swidth="\d+"/, `${page}: image without width`);
        assert.match(tag, /\sheight="\d+"/, `${page}: image without height`);
      }
    }
  });

  check('each page has one h1, a skip link, and Home/Experience navigation only', () => {
    for (const page of pages) {
      const html = read(out, page);
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${page}: h1 count`);
      assert.match(html, /<a class="skip-link" href="#main">/);
      const nav = html.match(/<nav aria-label="Primary">([\s\S]*?)<\/nav>/)[1];
      const labels = [...nav.matchAll(/>([^<]+)<\/a>/g)].map((m) => m[1]);
      assert.deepEqual(labels, ['Home', 'Experience'], `${page}: navigation`);
    }
    assert.match(read(out, 'index.html'), /<a href="\/" aria-current="page">Home<\/a>/);
    assert.match(read(out, 'experience/index.html'), /<a href="\/experience\/" aria-current="page">Experience<\/a>/);
  });

  check('home shows intro, projects, two current roles, and an empty certifications area', () => {
    const html = read(out, 'index.html');
    assert.match(html, /<h1 id="intro-title">Joshua Ferreira<\/h1>/);
    assert.match(html, /joshua-ferreira\.jpg/);
    assert.deepEqual(ids(section(html, 'projects'), 'card'), ['centurion', 'board-flies']);
    assert.deepEqual(ids(section(html, 'experience'), 'entry'), ['bath-and-body-works-retail', 'merrimack-it-help-desk']);
    assert.match(section(html, 'experience'), /href="\/experience\/">View all experience/);
    const certs = section(html, 'certifications');
    assert.match(certs, /<h2[^>]*>Certifications<\/h2>/);
    assert.match(certs, /<div class="empty-panel"><\/div>/);
    assert.match(html, /https:\/\/www\.linkedin\.com\/in\/joshua-ferreira-mass\//);
    assert.match(html, /https:\/\/github\.com\/Kointaker"/);
  });

  check('Board Flies teaser shows only name, logo, and "Coming soon" with no link', () => {
    const card = read(out, 'index.html').match(/<li class="card card-teaser" id="board-flies">[\s\S]*?<\/li>/)[0];
    assert.doesNotMatch(card, /<a\b/);
    assert.match(card, /table-mark\.svg/);
    assert.match(card, />Board Flies</);
    assert.match(card, />Coming soon</);
    assert.equal(card.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), 'Board Flies Coming soon');
  });

  check('Centurion card links to GitHub with the approved label', () => {
    const card = read(out, 'index.html').match(/<li class="card" id="centurion">[\s\S]*?<\/li>/)[0];
    assert.match(card, /href="https:\/\/github\.com\/Kointaker\/Centurion">View on GitHub/);
  });

  check('experience page lists all seven entries, current roles first, then by date', () => {
    const html = read(out, 'experience/index.html');
    assert.deepEqual(ids(html, 'entry'), [
      'bath-and-body-works-retail',
      'merrimack-it-help-desk',
      'mit-clean-energy-intern',
      'rapid-coatings-operations-intern',
      'wbla-cybersecurity-intern',
      'hydracor-software-intern',
      'haverhill-technical-support-intern',
    ]);
    assert.match(html, /<time datetime="2026-09">Sep 2026<\/time> – Present/);
    assert.match(html, /<time datetime="2026-10">Oct 2026<\/time> – Present/);
    assert.match(html, /<p class="entry-dates"><time datetime="2026-08">Aug 2026<\/time><\/p>/);
  });

  check('404 page is not indexed', () => {
    assert.match(read(out, '404.html'), /<meta name="robots" content="noindex">/);
  });

  // ---- 2. Maintenance fixture ------------------------------------------
  const fixtureContent = path.join(temp, 'fixture-content');
  fs.cpSync(path.join(root, 'content'), fixtureContent, { recursive: true });
  const edit = (file, fn) => {
    const target = path.join(fixtureContent, file);
    fs.writeFileSync(target, JSON.stringify(fn(JSON.parse(fs.readFileSync(target, 'utf8'))), null, 2));
  };
  edit('projects.json', (data) => {
    data.projects.push(
      { id: 'fixture-draft', title: 'Fixture Draft Project', status: 'draft', current: false,
        homepage: { featured: true, order: 0 }, presentation: 'card', summary: 'Should never appear.' },
      { id: 'fixture-first', title: 'Fixture First', status: 'published', current: true,
        homepage: { featured: true, order: 0 }, presentation: 'card', summary: 'Placed first by order.' },
      { id: 'fixture-unfeatured', title: 'Fixture Unfeatured', status: 'published', current: false,
        homepage: { featured: false, order: 0 }, presentation: 'card', summary: 'Not on Home.' },
    );
    return data;
  });
  edit('experience.json', (data) => {
    data.experience.push({ id: 'fixture-draft-job', employer: 'Fixture Draft Employer', title: 'Draft Role',
      start: '2026-11', end: null, status: 'draft', homepage: { featured: true, order: 0 }, summary: 'Hidden.' });
    return data;
  });
  edit('certifications.json', () => ({
    certifications: [{ id: 'fixture-cert', name: 'Fixture Certification', issuer: 'Fixture Issuer', issued: '2026-10',
      status: 'published', homepage: { featured: true, order: 1 }, credentialUrl: 'https://example.com/credential' }],
  }));
  const fixtureOut = path.join(temp, 'fixture-site');
  const fixture = build({ out: fixtureOut, content: fixtureContent, quiet: true });

  check('fixture: drafts never appear in any output file', () => {
    for (const file of listFiles(fixtureOut).filter((f) => f.endsWith('.html'))) {
      const html = read(fixtureOut, file);
      assert.doesNotMatch(html, /Fixture Draft|fixture-draft/, `${file} contains a draft`);
    }
  });

  check('fixture: homepage order and featuring are explicit', () => {
    const html = read(fixtureOut, 'index.html');
    assert.deepEqual(ids(section(html, 'projects'), 'card'), ['fixture-first', 'centurion', 'board-flies']);
    assert.match(html, /Current project/);
    assert.ok(fixture.warnings.some((w) => w.includes('not shown on Home')), 'expected a "See more" note');
  });

  check('fixture: certifications render as cards in the existing section', () => {
    const certs = section(read(fixtureOut, 'index.html'), 'certifications');
    assert.deepEqual(ids(certs, 'card'), ['fixture-cert']);
    assert.match(certs, /Issued <time datetime="2026-10">Oct 2026<\/time>/);
    assert.match(certs, /View credential/);
    assert.doesNotMatch(certs, /empty-panel/);
  });

  check('fixture: invalid content is rejected with a clear message', () => {
    edit('experience.json', (data) => {
      data.experience[0].end = '2020-01';
      return data;
    });
    assert.throws(() => build({ out: path.join(temp, 'bad'), content: fixtureContent, quiet: true }), /"end" is before "start"/);
  });

  // ---- 3. Contrast -----------------------------------------------------
  check('theme text colors meet WCAG AA contrast', () => {
    const css = fs.readFileSync(path.join(root, 'src', 'styles.css'), 'utf8');
    const color = (name) => css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, 'i'))[1];
    const luminance = (hex) => {
      const [r, g, b] = [1, 3, 5].map((i) => {
        const c = parseInt(hex.slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (a, b) => {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    const pairs = [
      ['text', 'bg', 4.5], ['text', 'surface', 4.5], ['text', 'surface-hover', 4.5],
      ['text-muted', 'bg', 4.5], ['text-muted', 'surface', 4.5], ['text-muted', 'surface-hover', 4.5],
      ['accent', 'bg', 3], ['accent', 'surface', 3],
    ];
    for (const [fg, bg, min] of pairs) {
      const value = ratio(color(fg), color(bg));
      results.push({ name: `  contrast ${fg} on ${bg}: ${value.toFixed(2)}:1 (min ${min})`, ok: value >= min, info: true });
      assert.ok(value >= min, `${fg} on ${bg} is ${value.toFixed(2)}:1`);
    }
  });
} catch (error) {
  results.push({ name: 'build completed', ok: false, error });
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

let failed = 0;
for (const result of results) {
  if (result.info) {
    console.log(result.name);
    continue;
  }
  console.log(`${result.ok ? 'PASS' : 'FAIL'}  ${result.name}`);
  if (!result.ok) {
    failed += 1;
    console.log(`      ${result.error.message.split('\n').join('\n      ')}`);
  }
}
console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.');
process.exit(failed ? 1 : 0);
