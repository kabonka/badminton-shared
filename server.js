// 羽球双打轮转 · 共享版后端（零依赖 Node，无需 npm install）
// 功能：托管 index.html + 提供 /api/state（GET 读取 / POST 写入）共享赛事数据
// 运行： node server.js       然后浏览器开 http://localhost:3000
// 端口： 环境变量 PORT（默认 3000）；绑定 0.0.0.0 方便局域网/手机访问

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DIR = __dirname;
const DATA = path.join(DIR, 'data.json');
const MAX_BODY = 4 * 1024 * 1024; // 4MB 上限，防滥用

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon'
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function defaultData() {
  return { players: [], matches: [], restrictions: [], settings: { numMatches: null, pmode: 'none' }, updatedAt: 0 };
}

function readData() {
  try {
    const raw = fs.readFileSync(DATA, 'utf8');
    const d = JSON.parse(raw);
    return Object.assign(defaultData(), d);
  } catch (e) {
    return defaultData();
  }
}

function writeData(d) {
  const tmp = DATA + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(d));
  fs.renameSync(tmp, DATA); // 原子替换，避免写到一半被读
}

function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, CORS));
  res.end(body);
}

function serveStatic(req, res) {
  let urlPath = (req.url.split('?')[0]) || '/';
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  const filePath = path.join(DIR, path.normalize(urlPath));
  if (!filePath.startsWith(DIR)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Not Found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = (req.url.split('?')[0]) || '/';

  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  if (urlPath === '/api/state') {
    if (req.method === 'GET') { sendJSON(res, 200, readData()); return; }

    if (req.method === 'POST') {
      let buf = '';
      let tooBig = false;
      req.on('data', (chunk) => {
        buf += chunk;
        if (buf.length > MAX_BODY) { tooBig = true; req.destroy(); }
      });
      req.on('end', () => {
        if (tooBig) { sendJSON(res, 413, { error: 'payload too large' }); return; }
        try {
          const d = JSON.parse(buf || '{}');
          if (!d || typeof d !== 'object') throw new Error('bad');
          const clean = {
            players: Array.isArray(d.players) ? d.players : [],
            matches: Array.isArray(d.matches) ? d.matches : [],
            restrictions: Array.isArray(d.restrictions) ? d.restrictions : [],
            settings: (d.settings && typeof d.settings === 'object') ? d.settings : { numMatches: null, pmode: 'none' },
            updatedAt: Date.now()
          };
          writeData(clean);
          sendJSON(res, 200, { ok: true, updatedAt: clean.updatedAt });
        } catch (e) {
          sendJSON(res, 400, { error: 'invalid json' });
        }
      });
      return;
    }

    sendJSON(res, 405, { error: 'method not allowed' });
    return;
  }

  if (req.method === 'GET') { serveStatic(req, res); return; }
  sendJSON(res, 404, { error: 'not found' });
});

server.listen(PORT, HOST, () => {
  const ifaces = require('os').networkInterfaces();
  const ips = [];
  for (const k in ifaces) for (const a of ifaces[k]) if (a.family === 'IPv4' && !a.internal) ips.push(a.address);
  console.log('羽球双打轮转（共享版）运行中');
  console.log('  本机：   http://localhost:' + PORT);
  if (ips.length) console.log('  局域网： http://' + ips[0] + ':' + PORT + '  （手机连同一 Wi-Fi 即可打开，同一地址 = 同一份数据）');
  console.log('  数据文件：' + DATA);
});
