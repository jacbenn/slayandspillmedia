// A tiny local web server for the Slay & Spill Media page.
// No installs needed, it only uses what comes with Node.
// Start it with:  npm start   (or:  node server.js)

const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT) || 3000;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

// Only these files are served, so server.js and package.json stay private.
const hidden = new Set(['server.js', 'package.json', 'README.md', '.env', '.env.example']);

// Read .env if there is one (so the sign-up form can send email locally).
try {
  for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith('#') && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const influencer = require('./api/influencer.js');

const server = http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400);
    return res.end('Bad request');
  }
  if (urlPath === '/api/influencer' && req.method === 'POST') {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 20000) req.destroy(); });
    req.on('end', async () => {
      let body = {};
      try { body = JSON.parse(raw); } catch {}
      const out = await influencer.handle(body);
      res.writeHead(out.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(out.json));
    });
    return;
  }

  if (urlPath.endsWith('/')) urlPath += 'index.html';
  if (!path.extname(urlPath) && urlPath !== '/') urlPath += '.html';

  const filePath = path.resolve(root, '.' + urlPath);
  const relative = path.relative(root, filePath);

  // Block anything outside this folder, and the files listed above.
  if (relative.startsWith('..') || path.isAbsolute(relative) || hidden.has(relative) || relative.startsWith('api')) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Not found');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }
    res.writeHead(200, {
      'Content-Type': types[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Slay & Spill Media is running at http://localhost:${port}`);
  console.log('Press Ctrl+C to stop it.');
});
