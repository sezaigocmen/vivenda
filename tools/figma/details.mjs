import fs from 'node:fs';
const f = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const mode = process.argv[3];
const hex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase() + (c.a !== undefined && c.a < 1 ? `@${c.a.toFixed(2)}` : '');
const ui = f.document.children.find(p => p.id === '0:1');
const proto = f.document.children.find(p => p.id === '4048:5547');
const all = {};
function walk(n, fn, depth = 0, parent) { fn(n, depth, parent); (n.children || []).forEach(c => walk(c, fn, depth + 1, n)); }
for (const p of f.document.children) walk(p, n => { all[n.id] = n; });

if (mode === 'tokens') {
  const colors = {}, fonts = {}, radii = {}, effects = {};
  const screens = ui.children.filter(t => t.type === 'FRAME' && t.absoluteBoundingBox.width === 375);
  for (const s of screens) walk(s, n => {
    if (n.visible === false) return;
    for (const p of n.fills || []) if (p.type === 'SOLID' && p.visible !== false) { const k = hex({ ...p.color, a: (p.opacity ?? 1) * (p.color.a ?? 1) }); colors[k] = (colors[k] || 0) + 1; }
    for (const p of n.fills || []) if (p.type?.startsWith('GRADIENT')) { const k = p.type + ' ' + p.gradientStops.map(s => hex(s.color)).join('>'); colors[k] = (colors[k] || 0) + 1; }
    if (n.type === 'TEXT') { const s = n.style; const k = `${s.fontFamily} ${s.fontWeight} ${s.fontSize}/${Math.round(s.lineHeightPx)} ls:${(s.letterSpacing||0).toFixed(2)}`; fonts[k] = (fonts[k] || 0) + 1; }
    if (n.cornerRadius) radii[n.cornerRadius] = (radii[n.cornerRadius] || 0) + 1;
    for (const e of n.effects || []) if (e.visible !== false) { const k = `${e.type} ${e.color ? hex(e.color) : ''} x${e.offset?.x ?? ''} y${e.offset?.y ?? ''} r${e.radius}`; effects[k] = (effects[k] || 0) + 1; }
  });
  const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
  console.log('COLORS'); top(colors, 45).forEach(([k, v]) => console.log(' ', v, k));
  console.log('FONTS'); top(fonts, 40).forEach(([k, v]) => console.log(' ', v, k));
  console.log('RADII'); top(radii, 15).forEach(([k, v]) => console.log(' ', v, k));
  console.log('EFFECTS'); top(effects, 12).forEach(([k, v]) => console.log(' ', v, k));
  // Colors/Typography frame texts
  const ct = ui.children.find(t => t.name === 'Colors/Typography');
  console.log('\nCOLORS/TYPOGRAPHY FRAME');
  walk(ct, n => { if (n.type === 'TEXT') console.log('  T', JSON.stringify(n.characters), n.style.fontFamily, n.style.fontWeight, n.style.fontSize); else if (n !== ct) console.log('  ', n.type, n.name, (n.fills || []).filter(p => p.type === 'SOLID').map(p => hex(p.color)).join(',')); });
}

if (mode === 'texts') {
  // texts per screen, in reading order
  const screens = ui.children.filter(t => t.type === 'FRAME' && t.absoluteBoundingBox.width === 375).reverse();
  for (const s of screens) {
    const out = [];
    walk(s, n => { if (n.type === 'TEXT' && n.visible !== false) out.push([n.absoluteBoundingBox.y - s.absoluteBoundingBox.y, n.absoluteBoundingBox.x - s.absoluteBoundingBox.x, n.characters.replace(/\n/g, ' / ')]); });
    out.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    console.log(`\n## ${s.name} (${s.id})`);
    console.log(out.map(o => o[2]).join(' | '));
  }
}

if (mode === 'proto') {
  for (const t of proto.children) walk(t, n => {
    for (const it of n.interactions || []) for (const a of it.actions || []) {
      if (!a) continue;
      const dest = a.destinationId ? (all[a.destinationId]?.name + ' ' + a.destinationId) : '';
      const tr = a.transition ? `${a.transition.type}${a.transition.direction ? '-' + a.transition.direction : ''} ${a.transition.duration ?? ''}s ${a.transition.easing?.type ?? ''}` : '';
      console.log(`${t.name} :: "${n.name}" [${it.trigger?.type}${it.trigger?.delay ? ' ' + it.trigger.delay + 'ms' : ''}] -> ${a.type} ${a.navigation ?? ''} ${dest} ${tr} ${a.overlayRelativePosition ? 'overlay' : ''}`);
    }
    if (n.overflowDirection && n.overflowDirection !== 'NONE') console.log(`${t.name} :: "${n.name}" scroll=${n.overflowDirection}`);
  });
}

if (mode === 'components') {
  for (const [id, c] of Object.entries(f.components)) {
    const n = all[id]; const b = n?.absoluteBoundingBox || {};
    const uses = []; walk(ui, x => { if (x.type === 'INSTANCE' && x.componentId === id) uses.push(x); });
    console.log(`${c.name} ${id} ${Math.round(b.width)}x${Math.round(b.height)} AL:${n?.layoutMode || 'NONE'} used:${uses.length}`);
  }
}
