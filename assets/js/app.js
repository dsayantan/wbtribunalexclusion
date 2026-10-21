const DATA = window.SEATS;
const GEO = window.GEO;
const fmt = n => n == null ? 'n/a' : Number(n).toLocaleString('en-IN');
const pct = (n, d=1) => n == null ? 'n/a' : n.toFixed(d) + '%';
const byN = Object.fromEntries(DATA.map(d => [d.n, d]));
const tot = k => DATA.reduce((s, d) => s + d[k], 0);
document.getElementById('fCleared').textContent = '30,00,541';
document.getElementById('fApp').textContent = '14,75,885';
document.getElementById('fDec').textContent = '80,091';

const SCALES = {
  pr: {cuts:[1,2,4,8,12], labels:['Under 1%','1 to 2%','2 to 4%','4 to 8%','8 to 12%','Over 12%'], title:'Appeals as a share of the seat\'s draft roll'},
  app:{cuts:[2000,5000,10000,20000,40000], labels:['Under 2,000','2,000 to 5,000','5,000 to 10,000','10,000 to 20,000','20,000 to 40,000','Over 40,000'], title:'Number of ECI appeals against cleared voters'},
  pa: {cuts:[40,45,50,55,60], labels:['Under 40%','40 to 45%','45 to 50%','50 to 55%','55 to 60%','Over 60%'], title:'Share of cleared voters the ECI appealed against'},
  mi: {cuts:[10,20,30,50,70], labels:['Under 10%','10 to 20%','20 to 30%','30 to 50%','50 to 70%','Over 70%'], title:'Minority (largely Muslim) share of the seat\'s population'}
};
let metric = 'pr', locked = null;
const bin = (v, cuts) => { let i = 0; while (i < cuts.length && v >= cuts[i]) i++; return i; };

const NS = 'http://www.w3.org/2000/svg';
const svg = document.getElementById('map');
svg.setAttribute('viewBox', `0 0 ${GEO.W} ${GEO.H}`);
const gSeats = document.createElementNS(NS, 'g'), gDist = document.createElementNS(NS, 'g'), gLab = document.createElementNS(NS, 'g');
svg.append(gSeats, gDist, gLab);
const seatEls = {};
for (const [n, d] of Object.entries(GEO.paths)) {
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', d); p.setAttribute('class', 'seat'); p.dataset.n = n;
  const t = document.createElementNS(NS, 'title'); t.textContent = byN[n] ? `${byN[n].name}, ${byN[n].dist}` : n; p.append(t);
  gSeats.append(p); seatEls[n] = p;
}
for (const d of Object.values(GEO.dpaths)) { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('class', 'dist'); gDist.append(p); }
for (const name of ['Malda', 'Murshidabad', 'Uttar Dinajpur']) {
  const c = GEO.dcent[name]; if (!c) continue;
  const t = document.createElementNS(NS, 'text'); t.setAttribute('class', 'dlabel'); t.setAttribute('x', c[0]); t.setAttribute('y', c[1]); t.setAttribute('text-anchor', 'middle'); t.textContent = name; gLab.append(t);
}

function paint() {
  const s = SCALES[metric];
  for (const [n, el] of Object.entries(seatEls)) {
    const v = byN[n] ? byN[n][metric] : null;
    el.style.fill = v == null ? 'var(--na)' : `var(--v${bin(v, s.cuts)})`;
  }
  const lg = document.getElementById('legend');
  lg.innerHTML = `<div>${s.title}</div><div class="sw">${s.labels.map((l, i) => `<div><i style="background:var(--v${i})"></i><span>${l}</span></div>`).join('')}</div>`;
}

function showDefault() {
  document.getElementById('panel').innerHTML = `<p class="lead">Select a seat on the map, or search for one, to see how many of its cleared voters the ECI has appealed against, and how that compares with the judges' own verdicts.</p>`;
}
function show(n) {
  const d = byN[n]; if (!d) return;
  const removed = d.ne + d.app, rest = Math.max(d.ua - removed, 0);
  const w = x => (x / d.ua * 100).toFixed(2) + '%';
  document.getElementById('panel').innerHTML = `
    <h2>${d.name}</h2><p class="sub">${d.dist} &middot; seat ${d.n}</p>
    <dl>
      <dt>ECI appeals against cleared voters</dt><dd>${fmt(d.app)}</dd>
      <dt>Share of cleared voters</dt><dd>${pct(d.pa)}</dd>
      <dt>Share of all voters on the roll</dt><dd>${pct(d.pr)}</dd>
      <dt>Marked not eligible by judges</dt><dd>${fmt(d.ne)}</dd>
      <dt>Minority share of seat, largely Muslim</dt><dd>${d.mi == null ? 'n/a' : pct(d.mi)}</dd>
      <dt>Muslim share of district, Census 2011</dt><dd>${pct(d.dm)}</dd>
      <dt>2026 winner, margin</dt><dd>${d.w}${d.m == null ? '' : ', ' + fmt(d.m)}</dd>
      <dt>2021 winner</dt><dd>${d.w21}</dd>
    </dl>
    <div class="bar3" aria-hidden="true"><i style="width:${w(d.ne)};background:var(--slate)"></i><i style="width:${w(d.app)};background:var(--violet)"></i></div>
    <div class="keyline"><span>Of ${fmt(d.ua)} under adjudication, ${(removed / d.ua * 100).toFixed(0)}% would be removed if every appeal succeeded</span></div>`;
}
function highlight(n) {
  for (const el of Object.values(seatEls)) el.classList.remove('on');
  if (n && seatEls[n]) { seatEls[n].classList.add('on'); gSeats.append(seatEls[n]); }
}
function pick(n, lock) { if (lock) locked = n; highlight(n); show(n); }

gSeats.addEventListener('pointerover', e => { const n = e.target.dataset && e.target.dataset.n; if (n && !locked) { highlight(n); show(n); } });
gSeats.addEventListener('pointerleave', () => { if (!locked) { highlight(null); showDefault(); } });
gSeats.addEventListener('click', e => { const n = e.target.dataset && e.target.dataset.n; if (!n) return; if (locked === n) { locked = null; highlight(null); showDefault(); } else pick(n, true); });
document.getElementById('metric').addEventListener('change', e => { metric = e.target.value; paint(); });

const dl = document.getElementById('seatlist');
const sorted = [...DATA].sort((a, b) => a.name.localeCompare(b.name));
dl.innerHTML = sorted.map(d => `<option value="${d.name} (${d.dist})"></option>`).join('');
document.getElementById('q').addEventListener('change', e => {
  const v = e.target.value.trim().toLowerCase();
  const d = DATA.find(x => `${x.name} (${x.dist})`.toLowerCase() === v) || DATA.find(x => x.name.toLowerCase() === v) || DATA.find(x => x.name.toLowerCase().startsWith(v));
  if (d) pick(String(d.n), true);
});

// minority bands
const bands = [[0,10,'Under 10%'],[10,20,'10 to 20%'],[20,30,'20 to 30%'],[30,50,'30 to 50%'],[50,101,'Over 50%']].map(([lo, hi, label]) => {
  const s = DATA.filter(d => d.mi != null && d.mi > lo && d.mi <= hi);
  const app = s.reduce((a, d) => a + d.app, 0), roll = s.reduce((a, d) => a + d.roll, 0), cl = s.reduce((a, d) => a + d.cl, 0);
  return {label, n: s.length, a: app / roll * 100, b: app / cl * 100};
});
const maxA = Math.max(...bands.map(b => b.a));
document.getElementById('bandA').innerHTML = bands.map(b => `<div class="hb"><span class="lbl">${b.label}</span><span class="trk"><span class="fill" style="display:block;width:${(b.a / maxA * 100).toFixed(1)}%"></span></span><span class="val">${b.a.toFixed(1)}%</span></div>`).join('');
document.getElementById('bandB').innerHTML = bands.map(b => `<div class="hb"><span class="lbl">${b.label}</span><span class="trk"><span class="fill" style="display:block;width:${b.b.toFixed(1)}%"></span></span><span class="val">${b.b.toFixed(1)}%</span></div>`).join('');

// stacks
const top10 = [...DATA].sort((a, b) => b.app - a.app).slice(0, 10);
document.getElementById('stacks').innerHTML = top10.map(d => {
  const w = x => (x / d.ua * 100).toFixed(2) + '%';
  return `<div class="stack"><button style="all:unset;cursor:pointer;color:var(--ink-2)" data-n="${d.n}">${d.name}</button><span class="bar"><i style="width:${w(d.ne)};background:var(--slate)"></i><i style="width:${w(d.app)};background:var(--violet)"></i></span><span class="val">${((d.ne + d.app) / d.ua * 100).toFixed(0)}%</span></div>`;
}).join('');
document.getElementById('stacks').addEventListener('click', e => { const n = e.target.dataset.n; if (n) { pick(n, true); document.getElementById('map').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center'}); } });

// table
const td = document.getElementById('td');
[...new Set(DATA.map(d => d.dist))].sort().forEach(x => td.insertAdjacentHTML('beforeend', `<option>${x}</option>`));
let sortK = 'app', sortDir = -1;
function renderTable() {
  const q = document.getElementById('tq').value.trim().toLowerCase(), dist = td.value;
  const rows = DATA.filter(d => (!dist || d.dist === dist) && (!q || d.name.toLowerCase().includes(q) || d.dist.toLowerCase().includes(q)))
    .sort((a, b) => { const x = a[sortK], y = b[sortK]; if (x == null) return 1; if (y == null) return -1; return (typeof x === 'string' ? x.localeCompare(y) : x - y) * sortDir; });
  document.getElementById('tb').innerHTML = rows.map(d => `<tr data-n="${d.n}"><td>${d.name}</td><td>${d.dist}</td><td>${fmt(d.app)}</td><td>${pct(d.pa)}</td><td>${pct(d.pr)}</td><td>${fmt(d.ne)}</td><td>${d.mi == null ? 'n/a' : pct(d.mi)}</td><td>${pct(d.dm)}</td><td>${d.w}</td></tr>`).join('');
}
document.querySelectorAll('thead button').forEach(b => b.addEventListener('click', () => {
  const k = b.dataset.k; sortDir = sortK === k ? -sortDir : (typeof DATA[0][k] === 'string' ? 1 : -1); sortK = k;
  document.querySelectorAll('thead button').forEach(x => x.removeAttribute('aria-sort'));
  b.setAttribute('aria-sort', sortDir === -1 ? 'descending' : 'ascending'); renderTable();
}));
document.getElementById('tq').addEventListener('input', renderTable);
td.addEventListener('change', renderTable);
document.getElementById('tb').addEventListener('click', e => { const tr = e.target.closest('tr'); if (tr) { pick(tr.dataset.n, true); document.getElementById('map').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center'}); } });

paint(); showDefault(); renderTable();
