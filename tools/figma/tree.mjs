// node tree.mjs file.json nodeId [maxDepth]
import fs from 'node:fs';
const f = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const id = process.argv[3], maxD = +(process.argv[4] || 4);
const hex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
let target;
(function find(n) { if (n.id === id) target = n; else (n.children || []).forEach(find); })(f.document);
if (!target) { console.log('not found'); process.exit(); }
const o = target.absoluteBoundingBox;
(function p(n, d) {
  const b = n.absoluteBoundingBox || {};
  const fills = (n.fills || []).filter(x => x.visible !== false).map(x => x.type === 'SOLID' ? hex(x.color) + (x.opacity < 1 ? '@' + x.opacity.toFixed(2) : '') : x.type === 'IMAGE' ? 'IMG:' + x.imageRef.slice(0, 8) : x.type).join(',');
  const strokes = (n.strokes || []).filter(x => x.visible !== false).map(x => x.type === 'SOLID' ? hex(x.color) : x.type).join(',');
  const extra = [
    n.type === 'TEXT' ? JSON.stringify(n.characters.slice(0, 60)) + ` ${n.style.fontWeight} ${n.style.fontSize}${n.style.italic ? ' italic' : ''}` : '',
    fills && 'fill:' + fills, strokes && `stroke:${strokes}/${n.strokeWeight}`, n.cornerRadius ? 'r' + n.cornerRadius : '',
    n.rectangleCornerRadii ? 'r[' + n.rectangleCornerRadii + ']' : '',
    n.layoutMode && n.layoutMode !== 'NONE' ? `AL:${n.layoutMode} gap${n.itemSpacing} pad${n.paddingTop},${n.paddingRight},${n.paddingBottom},${n.paddingLeft}` : '',
    n.effects?.filter(e => e.visible !== false).map(e => `${e.type}(${e.offset?.x ?? ''},${e.offset?.y ?? ''},${e.radius}${e.color ? ',' + hex(e.color) + '@' + e.color.a.toFixed(2) : ''})`).join(' ') || '',
    n.opacity !== undefined && n.opacity < 1 ? 'op' + n.opacity.toFixed(2) : '', n.visible === false ? 'HIDDEN' : '',
    n.componentId ? 'comp:' + n.componentId : ''
  ].filter(Boolean).join(' ');
  console.log(`${'  '.repeat(d)}${n.type} ${n.id} "${n.name}" ${Math.round(b.x - o.x)},${Math.round(b.y - o.y)} ${Math.round(b.width)}x${Math.round(b.height)} ${extra}`);
  if (d < maxD) (n.children || []).forEach(c => p(c, d + 1));
})(target, 0);
