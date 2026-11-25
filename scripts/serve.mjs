#!/usr/bin/env node
// Minimal local preview server for the built site (no dependencies).
//
// Usage: node scripts/serve.mjs [--dir dist] [--port 4321]
// Serves on 127.0.0.1 only, so the preview is not exposed to your network.
// Files are read on every request: after `npm run build`, just refresh.
// Mirrors the hosting behavior the site relies on: /x/ serves x/index.html,
// /x redirects to /x/ for folders, and unknown paths return 404.html.

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const dir = path.resolve(root, option('--dir', 'dist'));
const port = Number(option('--port', process.env.PORT ?? 4321));
const host = '127.0.0.1';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
};

if (!fs.existsSync(path.join(dir, 'index.html'))) {
  console.error(`No built site in ${dir}. Run "npm run build" first.`);
  process.exit(1);
}

function send(res, status, file) {
  res.writeHead(status, {
    'Content-Type': TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://${host}`).pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }
  const target = path.join(dir, pathname);
  if (target !== dir && !target.startsWith(dir + path.sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  let stat = fs.statSync(target, { throwIfNoEntry: false });
  if (stat?.isDirectory()) {
    if (!pathname.endsWith('/')) {
      res.writeHead(308, { Location: `${pathname}/` }).end();
      return;
    }
    const index = path.join(target, 'index.html');
    stat = fs.statSync(index, { throwIfNoEntry: false });
    if (stat) return send(res, 200, index);
  } else if (stat?.isFile()) {
    return send(res, 200, target);
  }
  send(res, 404, path.join(dir, '404.html'));
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the other server or run with --port <number>.`);
  } else {
    console.error(error);
  }
  process.exit(1);
});

server.listen(port, host, () => {
  console.log(`Preview: http://${host}:${port}/`);
  console.log('Press Ctrl+C to stop.');
});
