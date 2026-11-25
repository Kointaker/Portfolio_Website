#!/usr/bin/env node
// Builds the static site into dist/ (or --out <dir>).
//
// Usage:
//   node scripts/build.mjs                         # content/ -> dist/
//   node scripts/build.mjs --out <dir> --content <dir>
//
// Output contains only rendered pages, the stylesheet, and the image files
// referenced by published content. Nothing else from the repository is copied.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ContentError, loadContent } from '../src/content.mjs';
import { renderExperience, renderHome, renderNotFound } from '../src/render.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const args = { out: path.join(root, 'dist'), content: path.join(root, 'content') };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--out') args.out = path.resolve(argv[++i]);
    else if (argv[i] === '--content') args.content = path.resolve(argv[++i]);
    else throw new Error(`Unknown argument: ${argv[i]}`);
  }
  return args;
}

function write(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
}

export function build({ out, content: contentDir, quiet = false }) {
  const content = loadContent({ contentDir, root });

  // Refuse to clear anything that is not a dedicated output folder.
  const resolvedOut = path.resolve(out);
  if (resolvedOut === root || root.startsWith(resolvedOut + path.sep)) {
    throw new Error(`Refusing to use ${resolvedOut} as the output folder.`);
  }
  fs.rmSync(resolvedOut, { recursive: true, force: true });

  const css = fs.readFileSync(path.join(root, 'src', 'styles.css'));
  const cssVersion = crypto.createHash('sha256').update(css).digest('hex').slice(0, 10);
  const stylesheet = `/styles.css?v=${cssVersion}`;

  write(path.join(resolvedOut, 'styles.css'), css);
  write(path.join(resolvedOut, 'index.html'), renderHome(content, stylesheet));
  write(path.join(resolvedOut, 'experience', 'index.html'), renderExperience(content, stylesheet));
  write(path.join(resolvedOut, '404.html'), renderNotFound(content, stylesheet));

  for (const asset of content.assets) {
    const target = path.join(resolvedOut, asset);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, asset), target);
  }

  if (!quiet) {
    console.log(`Built ${path.relative(process.cwd(), resolvedOut) || '.'}/`);
    console.log(
      `  Home: ${content.home.projects.length} project(s), ${content.home.experience.length} experience entr(ies), ` +
        `${content.home.certifications.length} certification(s)`,
    );
    console.log(`  Experience page: ${content.experience.length} entr(ies)`);
    console.log(`  Assets copied: ${content.assets.length}`);
    for (const warning of content.warnings) console.warn(`  Note: ${warning}`);
  }
  return content;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    build(parseArgs(process.argv.slice(2)));
  } catch (error) {
    if (error instanceof ContentError) {
      console.error(`Content error — ${error.message}`);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}
