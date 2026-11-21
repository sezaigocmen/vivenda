import fs from 'node:fs';
const f = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
console.log('FILE:', f.name, '| lastModified', f.lastModified);
console.log('components:', Object.keys(f.components || {}).length, '| componentSets:', Object.keys(f.componentSets || {}).length, '| styles:', Object.keys(f.styles || {}).length);
for (const [id, s] of Object.entries(f.styles || {})) console.log('  STYLE', s.styleType, s.name);
const sets = {};
for (const [id, c] of Object.entries(f.components || {})) { const k = c.componentSetId ? (f.componentSets[c.componentSetId]?.name) : '(single)'; (sets[k] ||= []).push(c.name); }
for (const [k, v] of Object.entries(sets)) console.log('  COMP', k, '->', v.length, v.slice(0, 6).join(' | '));
function count(n, acc = { nodes: 0, instances: 0, autolayout: 0, frames: 0, groups: 0, texts: 0, reactions: 0 }) {
  acc.nodes++;
  if (n.type === 'INSTANCE') acc.instances++;
  if (n.type === 'FRAME' || n.type === 'COMPONENT' || n.type === 'INSTANCE') { acc.frames++; if (n.layoutMode && n.layoutMode !== 'NONE') acc.autolayout++; }
  if (n.type === 'GROUP') acc.groups++;
  if (n.type === 'TEXT') acc.texts++;
  if (n.interactions?.length || n.reactions?.length) acc.reactions++;
  (n.children || []).forEach(c => count(c, acc));
  return acc;
}
for (const page of f.document.children) {
  console.log('\nPAGE', page.id, page.name, 'children:', page.children.length, '| flowStarts:', JSON.stringify(page.flowStartingPoints || []));
  for (const t of page.children) {
    const b = t.absoluteBoundingBox || {};
    const c = count(t);
    console.log(`  ${t.type} ${t.id} "${t.name}" ${Math.round(b.width)}x${Math.round(b.height)} kids:${(t.children||[]).length} | nodes:${c.nodes} inst:${c.instances} frames:${c.frames} AL:${c.autolayout} groups:${c.groups} texts:${c.texts} links:${c.reactions}`);
  }
}
