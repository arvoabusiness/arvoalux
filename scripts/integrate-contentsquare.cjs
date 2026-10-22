/* Applies only to the current CLI-uploaded Arvoalux source, preserving it.
 * Run before its normal Next.js build. No dependencies or credentials required.
 */
const fs = require('node:fs');
const path = require('node:path');
function contentsquare() {
  'use strict';
  if (!/^(www\.)?arvoalux\.hu$/.test(location.hostname) || window.__arvoaContentsquare) return;
  window.__arvoaContentsquare = true;
  var key = 'arvoalux:contentsquare-consent:v1', gaKey = 'arvoalux:analytics-consent:v1';
  var ttl = 90 * 86400000, loaded = false, active = false, lastPath = '';
  var panel = document.getElementById('arvoalux-cookie-consent');
  if (!panel) return;
  function read(k) {
    try {
      var c = JSON.parse(localStorage.getItem(k)), age = Date.now() - (c && c.at);
      return c && typeof c.at === 'number' && Number.isFinite(c.at) && age >= 0 && age < ttl && typeof c.analytics === 'boolean' ? c : null;
    } catch (_) { return null; }
  }
  function allowed() {
    var c = read(key), g = read(gaKey);
    return !!(c && c.version === 1 && c.analytics && g && g.version === 2 && g.analytics);
  }
  function queue(command) { window._uxa = window._uxa || []; window._uxa.push(command); }
  function privacy() {
    queue(['setQuery', '']);
    queue(['referrer:removeQueryString']);
    queue(['hidePageTitle']);
    // Mask all replay text, including customer details rendered after navigation.
    queue(['setPIISelectors', {PIISelectors:['body'], Attributes:[
      {selector:'a',attrName:'href'}, {selector:'input',attrName:'value'},
      {selector:'*',attrName:'data-email'}, {selector:'*',attrName:'data-customer-id'}
    ]}]);
  }
  function safePath() {
    var p = location.pathname;
    return /^\/(?:account|login|cart|checkout|api|search)(?:\/|$)/i.test(p) ? '/private-page' : p;
  }
  function update() {
    if (!allowed()) {
      if (active || loaded) {
        active = false;
        try { localStorage.setItem(key + ':optout','1'); } catch (_) {}
        queue(['optout']); location.reload();
      }
      return;
    }
    active = true;
    if (loaded) return;
    // Only undo an opt-out created by this integration after a new explicit opt-in.
    try {
      if (localStorage.getItem(key + ':optout') === '1') {
        ['', '; domain=' + location.hostname, '; domain=.arvoalux.hu'].forEach(function(d) {
          document.cookie = '_cs_optout=; Max-Age=0; path=/' + d + '; SameSite=Lax';
        });
        localStorage.removeItem(key + ':optout');
      }
    } catch (_) { return; }
    privacy(); lastPath = safePath(); queue(['setPath', lastPath]);
    loaded = true;
    var tag = document.createElement('script'); tag.id = 'arvoalux-contentsquare-tag';
    tag.defer = true; tag.src = 'https://t.contentsquare.net/uxa/3b98b4ad2adf5.js';
    tag.onerror = function() { loaded = false; tag.remove(); };
    document.head.appendChild(tag);
  }
  var notice = document.createElement('p'); notice.id = 'arvoalux-contentsquare-notice';
  notice.textContent = 'Az analitikai hozzájárulás a Contentsquare hőtérképeire és maszkolt munkamenet-visszajátszásaira is vonatkozik. Ezekkel a kattintásokat, görgetést és az oldal használatát elemezzük. A visszajátszásban a szöveges adatokat és az űrlapmezőket maszkoljuk. A hozzájárulás a Sütibeállítások alatt bármikor visszavonható.';
  panel.insertBefore(notice, panel.querySelector('div'));
  if (!read(key)) panel.hidden = false;
  document.addEventListener('click', function(event) {
    var target = event.target instanceof Element ? event.target.closest('#arvoalux-cookie-consent button[data-choice]') : null;
    if (!target) return;
    var yes = target.getAttribute('data-choice') !== 'none';
    try {
      localStorage.setItem(key, JSON.stringify({version:1, analytics:yes, at:Date.now()}));
      if (!yes && loaded) localStorage.setItem(key + ':optout','1');
    } catch (_) { if (loaded) { queue(['optout']); location.reload(); } return; }
    update();
  });
  document.addEventListener('arvoa:consent', function() { queueMicrotask(update); });
  window.addEventListener('storage', function(event) {
    if (event.key === key || event.key === gaKey || event.key === null) update();
  });
  // Next.js navigates without a document reload. Track each pathname once.
  function page() {
    if (!active || !allowed()) { update(); return; }
    var next = safePath(); if (next === lastPath) return;
    lastPath = next; privacy(); queue(['trackPageview', next]);
  }
  ['pushState','replaceState'].forEach(function(name) {
    var original = history[name];
    history[name] = function() { var result = original.apply(this, arguments); queueMicrotask(page); return result; };
  });
  window.addEventListener('popstate', page);
  window.setInterval(update, 1000);
  update();
}
const candidates = [process.cwd(), path.resolve(process.cwd(), '../..')];
const root = candidates.find(dir => fs.existsSync(path.join(dir, 'apps/arvoalux/app/ga4-consent.ts')));
if (!root) throw new Error('Current Arvoalux ga4-consent.ts source required; refusing to patch an older checkout.');
const file = path.join(root, 'apps/arvoalux/app/ga4-consent.ts');
const source = fs.readFileSync(file, 'utf8');
const match = source.match(/^export const ga4Consent = ("(?:[^"\\]|\\.)*");/);
if (!match) throw new Error('Unrecognized consent module format; no files changed.');
const original = JSON.parse(match[1]);
if (!original.includes("panel.id='arvoalux-cookie-consent'") || !original.includes("data-choice=")) throw new Error('Consent UI changed; inspect integration before deploying.');
if (!original.includes('window.__arvoaContentsquare')) {
  const next = original + '\n;(' + contentsquare.toString() + ')();\n';
  fs.writeFileSync(file, source.replace(match[0], 'export const ga4Consent = ' + JSON.stringify(next) + ';'));
}
console.log('Arvoalux Contentsquare integration ready: 3b98b4ad2adf5');
