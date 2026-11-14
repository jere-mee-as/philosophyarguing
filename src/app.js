const P = JSON.parse(document.getElementById('data').textContent), JERE = "JERE_PFP";
/* three levels: the honest objection, the confident wrong argument, the one-liner */
const LEVELS = ['serious','bait','rage bait'], LSG = LEVEL_SIGILS;
const sg = ch => { const s = document.createElement('span'); s.className = 'sg'; s.setAttribute('aria-hidden','true'); s.textContent = ch; return s; };
const lab = (ch, text) => { const f = document.createDocumentFragment(), s = document.createElement('span'); s.textContent = text; f.append(sg(ch), s); return f; };
const $ = id => document.getElementById(id), tree = $('tree'), svg = $('wires'), cols = [$('c1'),$('c2'),$('c3'),$('c4'),$('c5')];
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
/* S.pi = field, S.ti = philosophy within it, S.lv = level, S.ki = the reply the philosophy is answering */
const S = {pi:null, ti:null, lv:null, ki:null}; let drawn = '';
const Q = $('q'), QM = $('qm'), FIND = $('find');
const sizeQ = () => { QM.textContent = Q.value || Q.placeholder; QM.parentNode.classList.toggle('sp', QM.textContent !== '…'); };

const btns0 = () => [...cols[0].children];
function btn(text, n, on){ const b = document.createElement('button'); b.style.setProperty('--n', n); b.append(text); b.onclick = on; return b; }
function fill(col, items, sel, fresh){ col.innerHTML = ''; col.classList.toggle('has', sel != null); col.classList.toggle('in', fresh);
  items.forEach((b,i) => { b.setAttribute('aria-current', String(i === sel)); col.appendChild(b); }); }

function render(){
  const key = [S.pi,S.ti,S.lv,S.ki].join('/'), was = drawn.split('/'), now = key.split('/'); drawn = key;
  const fresh = i => was[i] !== now[i];           // which column is newly grown this time
  const p = S.pi != null ? P[S.pi] : null, t = p && S.ti != null ? p.t[S.ti] : null;
  document.title = "So you’re arguing about" + (t ? ' ' + t.t : '…');
  Q.placeholder = t ? t.t : '…'; sizeQ(); $('hint').classList.toggle('on', S.pi == null && !Q.value);
  if(!cols[0].children.length) fill(cols[0], P.map((g,pi) => btn(lab(g.s, g.n), pi, () => go(S.pi === pi ? {pi:null,ti:null,lv:null} : {pi,ti:null,lv:null}))), null, false);
  cols[0].classList.toggle('has', S.pi != null); btns0().forEach((b,i) => b.setAttribute('aria-current', String(i === S.pi)));
  fill(cols[1], p ? p.t.map((x,i) => btn(lab(x.s, x.t), i, () => go({ti: S.ti === i ? null : i, lv:null}))) : [], S.ti, fresh(0));
  fill(cols[2], t ? LEVELS.map((x,i) => btn(lab(LSG[i], x), i, () => go({lv: S.lv === i ? null : i}))) : [], S.lv, fresh(0) || fresh(1));
  /* nothing is copied by tapping a line; a faint mark after it copies when asked */
  const cp = txt => { const c = document.createElement('span'); c.className = 'cp'; c.setAttribute('role','button'); c.tabIndex = 0; c.title = 'Copy'; c.setAttribute('aria-label','Copy this line');
    c.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>';
    const run = e => { e.stopPropagation(); e.preventDefault(); if(navigator.clipboard) navigator.clipboard.writeText(txt).catch(()=>{}); c.classList.add('ok'); setTimeout(() => c.classList.remove('ok'), 900); };
    c.addEventListener('click', run); c.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' ') run(e); }); return c; };
  const grew3 = fresh(0) || fresh(1) || fresh(2);
  const mk = (i, k) => { const txt = k.l[S.lv]; const q = document.createElement('span'); q.className = 'q'; q.textContent = '“' + k.b + '”';
      const s = document.createElement('span'); s.className = 'say'; s.textContent = txt; s.appendChild(cp(txt));
      /* tapping a reply runs a leg out to the philosophy's answer */
      const b = btn('', i, () => { if(k.r) go({ki: S.ki === i ? null : i}); }); b.append(q, s); return b; };
  if(grew3) fill(cols[3], t && S.lv != null ? t.k.map((k,i) => mk(i, k)) : [], S.ki, true);
  else { cols[3].classList.remove('in'); cols[3].classList.toggle('has', S.ki != null); [...cols[3].children].forEach((b,i) => b.setAttribute('aria-current', String(i === S.ki))); }
  const k = t && S.lv != null && S.ki != null ? t.k[S.ki] : null;
  fill(cols[4], k && k.r ? [(() => { const txt = k.r[S.lv]; const q = document.createElement('span'); q.className = 'q'; q.textContent = t.s + '  ' + t.t + ' answers';
      const s = document.createElement('span'); s.className = 'say'; s.textContent = txt; s.appendChild(cp(txt)); const b = btn('', 0, () => {}); b.style.cursor = 'default'; b.append(q, s); return b; })()] : [], null, true);
  place(); wire(fresh);
  const last = [...cols].reverse().find(c => c.children.length);
  if(last && last !== cols[0]) setTimeout(() => glide(last), 60);
}
/* bring the newest column into view, a little slower than the browser's own smooth scroll */
let glideId = 0;
function glide(el){
  const sc = $('scroll'), r = el.getBoundingClientRect(), pad = 24;
  const dx = r.right + pad > innerWidth ? Math.min(r.right + pad - innerWidth, r.left - pad) : (r.left < pad ? r.left - pad : 0);
  const dy = r.bottom + pad > innerHeight ? Math.min(r.bottom + pad - innerHeight, r.top - pad) : (r.top < pad ? r.top - pad : 0);
  if(!dx && !dy) return;
  const x0 = sc.scrollLeft, y0 = scrollY, id = ++glideId;
  if(reduced){ sc.scrollLeft = x0 + dx; scrollTo(0, y0 + dy); return; }
  const dur = 650 + Math.min(350, Math.hypot(dx, dy) * .4), t0 = performance.now(), e = k => k < .5 ? 4*k*k*k : 1 - Math.pow(-2*k + 2, 3)/2;
  (function step(now){ if(id !== glideId) return; const k = Math.min(1, (now - t0)/dur), v = e(k);
    sc.scrollLeft = x0 + dx*v; scrollTo(0, y0 + dy*v); if(k < 1) requestAnimationFrame(step); })(t0);
}
/* each grown column centres itself on the node it grew from */
function mid(el){ const r = el.getBoundingClientRect(), o = tree.getBoundingClientRect(); return {l:r.left - o.left, r:r.right - o.left, y:r.top - o.top + r.height/2}; }
function place(){ for(let i = 1; i < 5; i++){ const c = cols[i]; c.style.marginTop = '0px'; const src = cols[i-1].querySelector('[aria-current="true"]'); if(!src || !c.children.length) continue;
    c.style.marginTop = Math.max(0, mid(src).y - c.offsetHeight/2) + 'px'; } }
/* Wires are jointed like an insect's leg: a thick femur rising to a knee, a long tibia coming down, a thin tarsus to the foot */
function seg(d, w, off, delay, anim, dur = .2){ const p = document.createElementNS('http://www.w3.org/2000/svg','path'); p.setAttribute('d', d); p.style.strokeWidth = w; if(off) p.classList.add('off'); svg.appendChild(p);
  if(anim){ const L = p.getTotalLength(); p.style.strokeDasharray = `${L} ${L + 6}`; p.style.strokeDashoffset = L + 3; p.getBoundingClientRect(); p.style.transition = `stroke-dashoffset ${dur}s linear ${delay}s, opacity .3s`; p.style.strokeDashoffset = 0; } }
function wire(fresh){ svg.innerHTML = '';
  for(let i = 1; i < 5; i++){ const src = cols[i-1].querySelector('[aria-current="true"]'); if(!src) break; const a = mid(src.querySelector('.say') || src), sel = cols[i].querySelector('[aria-current="true"]');
    /* the tail starts a little past the end of the name, not at the column's edge */
    const rg = document.createRange(); rg.selectNodeContents(src); const tail = Math.min(a.r + 7, rg.getBoundingClientRect().right - tree.getBoundingClientRect().left + 22);
    let maxEnd = 0; const count = cols[i].children.length; const isNew = !!fresh && !reduced && (i === 4 || (i === 3 && (fresh(0) || fresh(1) || fresh(2))) || (i === 2 && (fresh(0) || fresh(1))) || (i === 1 && fresh(0)));
    [...cols[i].children].forEach((b,n) => { const z = mid(b.querySelector('.say') || b), x1 = a.r + 7, x2 = z.l - 7, w = x2 - x1, dy = z.y - a.y, off = !!sel && b !== sel;
      const hip = [x1 + w*.07, a.y - 2];
      const knee = [x1 + w*.40, a.y + dy*.28 - (13 + Math.min(40, Math.abs(dy)*.11))];
      const ankle = [x2 - w*.16, z.y - 6];
      const f = q => q[0].toFixed(1) + ' ' + q[1].toFixed(1);
      /* legs move at the same speed whatever their length, and the whole fan spreads over the same time
         whether it has three legs or twelve */
      const len = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]);
      const k = Math.max(.85, Math.min(1.8, (len([tail, a.y], hip) + len(hip, knee) + len(knee, ankle) + len(ankle, [x2, z.y])) / 112));
      const st = count > 1 ? n * .105 / (count - 1) : 0; maxEnd = Math.max(maxEnd, st + .56*k);
      seg(`M${tail.toFixed(1)} ${a.y} L${f(hip)} L${f(knee)}`, 2.1, off, st, isNew, .2*k);
      seg(`M${f(knee)} L${f(ankle)}`, 1.35, off, st + .18*k, isNew, .2*k);
      seg(`M${f(ankle)} L${x2} ${z.y}`, .85, off, st + .36*k, isNew, .2*k); });
    cols[i].style.setProperty('--wait', Math.max(.5, maxEnd - .06) + 's'); } }

/* address: #nietzsche/3 for a philosophy and level, #continental for a field alone */
function go(o){ if(!('ki' in o)) S.ki = null; Object.assign(S, o); const p = S.pi != null ? P[S.pi] : null;
  const h = p ? (S.ti != null ? slug(p.t[S.ti].t) + (S.lv != null ? '/' + (S.lv+1) : '') : slug(p.n)) : '';
  try { history.replaceState(null, '', h ? '#' + h : location.pathname + location.search); } catch(e){} render(); }
(function fromHash(){ let hash = ''; try { hash = decodeURIComponent(location.hash.slice(1)); } catch(e){} const [a, l] = hash.split('/'); if(!a) return;
  for(let pi = 0; pi < P.length; pi++){ const ti = P[pi].t.findIndex(t => slug(t.t) === a);
    if(ti >= 0){ S.pi = pi; S.ti = ti; if(l >= 1 && l <= 3) S.lv = l - 1; return; } }
  const pi = P.findIndex(g => slug(g.n) === a); if(pi >= 0) S.pi = pi; })();
addEventListener('keydown', e => { if(e.target === Q || e.metaKey || e.ctrlKey || e.altKey) return;
  if(S.ti != null && e.key >= '1' && e.key <= '3'){ go({lv:+e.key - 1}); return; }
  /* typing anywhere goes to the heading */
  if(e.key === '/' ){ e.preventDefault(); Q.focus(); return; }
  if(e.key.length === 1 && /[a-zA-Z\u00c0-\u024f]/.test(e.key)) Q.focus(); });
let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { place(); wire(null); if(found.length) legs(false); }, 80); });

/* ---------- search: the heading's "…" is a text field ---------- */
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").replace(/[“”]/g,'"');
const IDX = []; P.forEach((g,pi) => g.t.forEach((t,ti) => IDX.push({pi, ti, name:norm(t.t), field:norm(g.n), k:t.k.map(k => ({b:norm(k.b), l:k.l.map(norm)}))})));
let found = [], cur = 0, foundKey = '';
function search(raw){ const q = norm(raw.trim()); if(!q) return [];
  const out = []; IDX.forEach((x,i) => { let score = 0, sub = P[x.pi].n, lv = null;
    if(x.name.startsWith(q)) score = 100; else if(x.name.split(/[^a-z0-9]+/).some(w => w.startsWith(q))) score = 80; else if(q.length > 2 && x.name.includes(q)) score = 60;
    else if(q.length > 2 && x.field.split(/[^a-z0-9]+/).some(w => w.startsWith(q))) score = 30;
    else if(q.length > 2){ const t = P[x.pi].t[x.ti];
      let ki = x.k.findIndex(k => k.b.includes(q)); if(ki >= 0){ score = 20; sub = '“' + t.k[ki].b + '”'; }
      else { for(let j = 0; j < x.k.length && !score; j++){ const li = x.k[j].l.findIndex(l => l.includes(q)); if(li >= 0){ score = 10 - li; lv = li; sub = LEVELS[li] + ' · “' + t.k[j].b + '”'; } } } }
    if(score) out.push({pi:x.pi, ti:x.ti, score, sub, lv, i}); });
  return out.sort((a,b) => b.score - a.score || a.i - b.i).slice(0, 8); }
function fw(){ let s = $('fw'); if(!s){ s = document.createElementNS('http://www.w3.org/2000/svg','svg'); s.id = 'fw'; s.setAttribute('aria-hidden','true'); document.body.appendChild(s); } return s; }
function pick(r){ Q.value = ''; Q.blur(); closeFind(); go({pi:r.pi, ti:r.ti, lv:r.lv}); }
function closeFind(){ found = []; foundKey = ''; FIND.innerHTML = ''; fw().innerHTML = ''; document.documentElement.classList.remove('finding'); sizeQ(); $('hint').classList.toggle('on', S.pi == null && !Q.value); place(); wire(null); creditCheck(); }
function mark(){ [...FIND.children].forEach((b,i) => b.setAttribute('aria-selected', String(i === cur))); }
function find(){ sizeQ(); const raw = Q.value; if(!raw.trim()){ if(document.documentElement.classList.contains('finding')) closeFind(); return; }
  document.documentElement.classList.add('finding'); $('hint').classList.remove('on');
  found = search(raw); const key = found.map(r => r.i + ':' + r.sub).join('|'), fresh = key !== foundKey; foundKey = key; if(fresh) cur = 0;
  if(fresh){ FIND.innerHTML = ''; FIND.classList.toggle('in', !reduced);
    if(!found.length){ const d = document.createElement('div'); d.className = 'none'; d.textContent = 'nothing by that name'; FIND.appendChild(d); }
    found.forEach((r,n) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role','option'); b.style.setProperty('--n', n);
      const s = document.createElement('span'); s.className = 'say'; s.textContent = P[r.pi].t[r.ti].t; const u = document.createElement('span'); u.className = 'sub'; u.textContent = r.sub; b.append(sg(P[r.pi].t[r.ti].s), s, u);
      b.addEventListener('mousedown', e => e.preventDefault()); b.onclick = () => pick(r); FIND.appendChild(b); }); }
  mark(); legs(fresh); }
/* legs from the typed word to each match. Wide screens: the matches stand to the right of the heading, like a branch.
   Narrow screens: they hang below it and the legs come down the left margin. */
function legs(anim){ const s = fw(); s.innerHTML = ''; s.style.height = '0px';
  const ir = QM.getBoundingClientRect(), hr = $('hd').getBoundingClientRect(), sx = scrollX, sy = scrollY, pad = parseFloat(getComputedStyle($('hd')).paddingLeft);
  const wide = ir.right + 110 + 320 <= innerWidth;
  const ml = wide ? ir.right + 110 : pad + 54; FIND.style.marginLeft = ml + 'px'; FIND.style.maxWidth = (document.documentElement.clientWidth - ml - 14) + 'px';
  FIND.style.marginTop = (wide ? -(hr.bottom - (ir.top + ir.height/2)) - 18 : 2) + 'px';
  s.style.height = document.documentElement.scrollHeight + 'px';
  const rows = [...FIND.querySelectorAll('button')], count = rows.length; let maxEnd = 0;
  const O = wide ? [ir.right + sx + 9, ir.top + sy + ir.height/2] : [pad + sx + 10, hr.bottom + sy - 9];
  const f = q => q[0].toFixed(1) + ' ' + q[1].toFixed(1), len = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]);
  rows.forEach((b,n) => { const r = b.getBoundingClientRect(), z = [r.left + sx - 7, r.top + sy + r.height/2], w = z[0] - O[0], dy = z[1] - O[1];
    const hip = wide ? [O[0] + w*.07, O[1] - 2] : [O[0] + 1, O[1] + 7];
    const knee = wide ? [O[0] + w*.40, O[1] + dy*.28 - (13 + Math.min(40, Math.abs(dy)*.11))] : [O[0] + w*.5, O[1] + dy*.62 - 12];
    const ankle = wide ? [z[0] - w*.16, z[1] - 6] : [z[0] - 9, z[1] - 6];
    const k = Math.max(.7, Math.min(1.5, (len(O, hip) + len(hip, knee) + len(knee, ankle) + len(ankle, z)) / 150));
    const st = count > 1 ? n * .09 / (count - 1) : 0, go = anim && !reduced; maxEnd = Math.max(maxEnd, st + .46*k);
    [[`M${f(O)} L${f(hip)} L${f(knee)}`, 2.1, 0], [`M${f(knee)} L${f(ankle)}`, 1.35, .15], [`M${f(ankle)} L${f(z)}`, .85, .3]].forEach(([d, sw, at]) => {
      const p = document.createElementNS('http://www.w3.org/2000/svg','path'); p.setAttribute('d', d); p.style.strokeWidth = sw; s.appendChild(p);
      if(go){ const L = p.getTotalLength(); p.style.strokeDasharray = `${L} ${L + 6}`; p.style.strokeDashoffset = L + 3; p.getBoundingClientRect(); p.style.transition = `stroke-dashoffset ${.16*k}s linear ${st + at*k}s`; p.style.strokeDashoffset = 0; } }); });
  FIND.style.setProperty('--wait', Math.max(.3, maxEnd - .06) + 's'); }
Q.addEventListener('input', find);
Q.addEventListener('focus', () => { $('hint').classList.remove('on'); });
Q.addEventListener('blur', () => { if(!Q.value.trim()){ Q.value = ''; if(document.documentElement.classList.contains('finding')) closeFind(); else { sizeQ(); $('hint').classList.toggle('on', S.pi == null); } } });
Q.addEventListener('keydown', e => {
  if(e.key === 'Escape'){ Q.value = ''; Q.blur(); closeFind(); }
  else if(e.key === 'Enter'){ if(found[cur]) pick(found[cur]); }
  else if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){ if(!found.length) return; e.preventDefault(); cur = (cur + (e.key === 'ArrowDown' ? 1 : found.length - 1)) % found.length; mark(); } });
(function(){ const a = document.createElement('span'); a.className = 'av'; const im = new Image(); im.src = JERE; im.alt = ''; a.appendChild(im);
  const c = $('credit'); c.insertBefore(a, c.querySelector('b')); })();
/* the credit and the link show once the last field is clear of the bottom edge */
function creditCheck(){ const last = cols[0].lastElementChild; if(!last) return; const on = last.getBoundingClientRect().bottom < innerHeight - 60;
  $('credit').classList.toggle('on', on); $('more').classList.toggle('on', on); }
addEventListener('scroll', creditCheck, {passive:true}); addEventListener('resize', creditCheck);
render(); creditCheck();
/* day / night */
(function(){ const r = document.documentElement, b = $('theme'), mq = matchMedia('(prefers-color-scheme: dark)');
  try { const t = localStorage.getItem('pa-theme'); if(t === 'day' || t === 'night') r.dataset.theme = t; } catch(e){}
  const dark = () => r.dataset.theme ? r.dataset.theme === 'night' : mq.matches;
  b.addEventListener('click', e => { e.stopPropagation(); const t = dark() ? 'day' : 'night'; r.dataset.theme = t; try { localStorage.setItem('pa-theme', t); } catch(e){} }); })();

const NS = 'http://www.w3.org/2000/svg';
(function intro(){
  const hd = $('hd'), R = document.documentElement;
  /* the <head> already hid everything if the intro is due, so nothing flashes before it */
  if(!R.classList.contains('intro') || S.pi != null){ R.classList.remove('intro'); return; }
  try { localStorage.setItem('pa-intro', new Date().toDateString()); } catch(e){}
  let done = false; const timers = [];
  const at = (ms, f) => timers.push(setTimeout(f, ms));
  const svgI = document.createElementNS(NS,'svg'); svgI.id = 'intro'; svgI.style.height = document.documentElement.scrollHeight + 'px'; document.body.appendChild(svgI);
  const g = document.createElementNS(NS,'g'); svgI.appendChild(g);
  const finish = () => { if(done) return; done = true; timers.forEach(clearTimeout); svgI.remove(); R.classList.remove('intro','show'); };
  addEventListener('pointerdown', finish, {once:true}); addEventListener('keydown', finish, {once:true});
  hd.classList.add('wake');
  /* something reaches in from the right edge and touches the "…" */
  at(1300, () => {
    const rg = document.createRange(); rg.selectNodeContents(hd); const r = rg.getBoundingClientRect(), W = document.documentElement.clientWidth;
    const F = [r.right + scrollX + 7, r.bottom + scrollY - 6], E = [W + 4, F[1] + 110];
    const K = [F[0] + Math.min(150, (E[0] - F[0]) * .4), Math.max(scrollY + 8, F[1] - 34)], A = [F[0] + 14, F[1] - 15];
    const f = q => q[0].toFixed(1) + ' ' + q[1].toFixed(1);
    const segs = [[`M${f(E)} L${f(K)}`, 2.1, 1.1], [`M${f(K)} L${f(A)}`, 1.35, .7], [`M${f(A)} L${f(F)}`, .85, .35]];
    let t = 0;
    const paths = segs.map(([d, w, dur]) => {
      const p = document.createElementNS(NS,'path'); p.setAttribute('d', d); p.style.strokeWidth = w; g.appendChild(p);
      const T = p.getTotalLength(), L = T + 3; p.style.strokeDasharray = `${T} ${T + 6}`; p.style.strokeDashoffset = L; p.getBoundingClientRect();
      p.style.transition = `stroke-dashoffset ${dur}s cubic-bezier(.45,0,.55,1) ${t}s`; p.style.strokeDashoffset = 0; t += dur * .92; return [p, L]; });
    g.style.transformOrigin = `${E[0]}px ${E[1]}px`;
    const reach = t * 1000;
    /* two small taps, then it notices you */
    at(reach + 350, () => g.classList.add('tap'));
    at(reach + 1250, () => R.classList.add('show'));
    at(reach + 1650, () => paths.slice().reverse().forEach(([p, L], j) => { p.style.transition = `stroke-dashoffset .16s cubic-bezier(.6,0,1,1) ${j*.05}s`; p.style.strokeDashoffset = L; }));
    at(reach + 2400, finish);
  });
})();
