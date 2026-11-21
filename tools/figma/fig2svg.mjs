// Figma REST (geometry=paths) node → SVG, no image-export API needed.
// Usage: node fig2svg.mjs <file-geo.json> <outDir> name=nodeId ...
import fs from 'node:fs';
import path from 'node:path';

const [file, outDir, ...pairs] = process.argv.slice(2);
const f = JSON.parse(fs.readFileSync(file, 'utf8'));
const byId = new Map();
(function idx(n) { byId.set(n.id, n); (n.children || []).forEach(idx); })(f.document);

const I = [[1, 0, 0], [0, 1, 0]];
const mul = (A, B) => [
  [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1], A[0][0] * B[0][2] + A[0][1] * B[1][2] + A[0][2]],
  [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1], A[1][0] * B[0][2] + A[1][1] * B[1][2] + A[1][2]],
];
const r = (v) => +v.toFixed(3);
const mtx = (M) => `matrix(${r(M[0][0])} ${r(M[1][0])} ${r(M[0][1])} ${r(M[1][1])} ${r(M[0][2])} ${r(M[1][2])})`;
const rgb = (c) => `rgb(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)})`;
/** Önizleme modunda kullanılan fotoğraflar (FIG_IMG_HREF) */
const usedImages = new Set();
const SHAPES = new Set(['VECTOR', 'RECTANGLE', 'ELLIPSE', 'STAR', 'LINE', 'REGULAR_POLYGON', 'BOOLEAN_OPERATION', 'FRAME', 'COMPONENT', 'INSTANCE', 'COMPONENT_SET']);

function render(rootId, opts = {}) {
  const root = byId.get(rootId);
  if (!root) throw new Error('node not found ' + rootId);
  const defs = [];
  const warn = new Set();
  let uid = 0;
  const id = (p) => `${p}${++uid}`;

  function paint(p, n, M) {
    const op = (p.opacity ?? 1);
    if (p.type === 'SOLID') return { fill: rgb(p.color), opacity: op * (p.color.a ?? 1) };
    if (p.type === 'GRADIENT_LINEAR' || p.type === 'GRADIENT_RADIAL') {
      const w = n.size?.x ?? n.absoluteBoundingBox.width, h = n.size?.y ?? n.absoluteBoundingBox.height;
      const [h0, h1, h2] = p.gradientHandlePositions;
      const gid = id('g');
      const stops = p.gradientStops.map((s) => `<stop offset="${r(s.position)}" stop-color="${rgb(s.color)}" stop-opacity="${r((s.color.a ?? 1) * op)}"/>`).join('');
      if (p.type === 'GRADIENT_LINEAR') {
        defs.push(`<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${r(h0.x * w)}" y1="${r(h0.y * h)}" x2="${r(h1.x * w)}" y2="${r(h1.y * h)}" gradientTransform="${mtx(M)}">${stops}</linearGradient>`);
      } else {
        const rx = Math.hypot((h1.x - h0.x) * w, (h1.y - h0.y) * h), ry = Math.hypot((h2.x - h0.x) * w, (h2.y - h0.y) * h);
        const ang = Math.atan2((h1.y - h0.y) * h, (h1.x - h0.x) * w) * 180 / Math.PI;
        const G = mul(M, [[1, 0, h0.x * w], [0, 1, h0.y * h]]);
        defs.push(`<radialGradient id="${gid}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="${mtx(G)} rotate(${r(ang)}) scale(${r(rx)} ${r(ry)})">${stops}</radialGradient>`);
      }
      return { fill: `url(#${gid})`, opacity: 1 };
    }
    warn.add(p.type);
    return null;
  }

  function effectsFilter(n) {
    const ef = (n.effects || []).filter((e) => e.visible !== false);
    if (!ef.length) return '';
    const fid = id('f');
    const parts = [];
    let src = 'SourceGraphic';
    const shadows = [];
    for (const e of ef) {
      if (e.type === 'DROP_SHADOW') shadows.push(`<feDropShadow dx="${r(e.offset.x)}" dy="${r(e.offset.y)}" stdDeviation="${r(e.radius / 2)}" flood-color="${rgb(e.color)}" flood-opacity="${r(e.color.a)}"/>`);
      if (e.type === 'LAYER_BLUR') parts.push(`<feGaussianBlur stdDeviation="${r(e.radius / 2)}"/>`);
    }
    defs.push(`<filter id="${fid}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">${shadows.join('')}${parts.join('')}</filter>`);
    return ` filter="url(#${fid})"`;
  }

  function node(n, M) {
    if (n.visible === false) return '';
    let s = '';
    if (SHAPES.has(n.type)) {
      for (const p of n.fills || []) {
        if (p.visible === false) continue;
        if (p.type === 'IMAGE') {
          // FIG_IMG_HREF ayarlıysa fotoğrafı çiz (önizleme için), değilse atla
          if (!process.env.FIG_IMG_HREF) { warn.add('IMAGE'); continue; }
          const w = n.size?.x ?? n.absoluteBoundingBox.width, h = n.size?.y ?? n.absoluteBoundingBox.height;
          const cid = id('i');
          defs.push(`<clipPath id="${cid}">${(n.fillGeometry || []).map((g) => `<path d="${g.path}" transform="${mtx(M)}"/>`).join('')}</clipPath>`);
          const fit = p.scaleMode === 'FIT' ? 'meet' : 'slice';
          s += `<g clip-path="url(#${cid})"${p.opacity < 1 ? ` opacity="${r(p.opacity)}"` : ''}><image href="${process.env.FIG_IMG_HREF}${p.imageRef}" width="${r(w)}" height="${r(h)}" preserveAspectRatio="xMidYMid ${fit}" transform="${mtx(M)}"/></g>`;
          usedImages.add(p.imageRef);
          continue
        }
        const pp = paint(p, n, M);
        if (!pp) continue;
        for (const g of n.fillGeometry || []) s += `<path d="${g.path}" fill-rule="${g.windingRule === 'EVENODD' ? 'evenodd' : 'nonzero'}" fill="${pp.fill}"${pp.opacity < 1 ? ` fill-opacity="${r(pp.opacity)}"` : ''} transform="${mtx(M)}"/>`;
      }
      for (const p of n.strokes || []) {
        if (p.visible === false) continue;
        const pp = paint(p, n, M);
        if (!pp) continue;
        for (const g of n.strokeGeometry || []) s += `<path d="${g.path}" fill-rule="nonzero" fill="${pp.fill}"${pp.opacity < 1 ? ` fill-opacity="${r(pp.opacity)}"` : ''} transform="${mtx(M)}"/>`;
      }
    } else if (n.type === 'TEXT') {
      if (process.env.FIG_TEXT) {
        // Önizleme için metni HTML olarak çiz (tarayıcı satır kaydırmayı yapar)
        const st = n.style, w = n.size?.x ?? n.absoluteBoundingBox.width, h = n.size?.y ?? n.absoluteBoundingBox.height
        const f = (n.fills || []).find((p) => p.visible !== false && p.type === 'SOLID')
        const color = f ? `rgba(${Math.round(f.color.r * 255)},${Math.round(f.color.g * 255)},${Math.round(f.color.b * 255)},${r((f.opacity ?? 1) * (f.color.a ?? 1))})` : '#000'
        const esc = n.characters.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        const align = { LEFT: 'left', CENTER: 'center', RIGHT: 'right', JUSTIFIED: 'justify' }[st.textAlignHorizontal] || 'left'
        const valign = { TOP: 'flex-start', CENTER: 'center', BOTTOM: 'flex-end' }[st.textAlignVertical] || 'flex-start'
        s += `<foreignObject width="${r(w + 2)}" height="${r(h + 2)}" transform="${mtx(M)}"><div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;flex-direction:column;justify-content:${valign};width:100%;height:100%;font-family:'${st.fontFamily}';font-size:${st.fontSize}px;font-weight:${st.fontWeight};${st.italic ? 'font-style:italic;' : ''}line-height:${st.lineHeightPx ? r(st.lineHeightPx) + 'px' : 'normal'};letter-spacing:${r(st.letterSpacing || 0)}px;color:${color};text-align:${align};white-space:pre-wrap">${esc}</div></foreignObject>`
      } else warn.add('TEXT:' + n.characters.slice(0, 20))
    }

    if (n.type !== 'BOOLEAN_OPERATION' && n.children) {
      let clip = null;
      const kids = [];
      for (const c of n.children) {
        const CM = mul(M, c.relativeTransform || I);
        if (c.isMask) {
          clip = id('m');
          const geo = (c.fillGeometry || []).map((g) => `<path d="${g.path}" transform="${mtx(CM)}"/>`).join('');
          defs.push(`<clipPath id="${clip}">${geo}</clipPath>`);
          continue;
        }
        const out = node(c, CM);
        kids.push(clip ? `<g clip-path="url(#${clip})">${out}</g>` : out);
      }
      let inner = kids.join('');
      if ((n.type === 'FRAME' || n.type === 'INSTANCE' || n.type === 'COMPONENT') && n.clipsContent && n !== root) {
        const cid = id('c');
        const w = n.size?.x ?? n.absoluteBoundingBox.width, h = n.size?.y ?? n.absoluteBoundingBox.height;
        defs.push(`<clipPath id="${cid}"><rect width="${r(w)}" height="${r(h)}" rx="${n.cornerRadius || 0}" transform="${mtx(M)}"/></clipPath>`);
        inner = `<g clip-path="url(#${cid})">${inner}</g>`;
      }
      s += inner;
    }
    const op = n.opacity ?? 1;
    const fx = effectsFilter(n);
    const blend = n.blendMode && !['NORMAL', 'PASS_THROUGH'].includes(n.blendMode) ? ` style="mix-blend-mode:${n.blendMode.toLowerCase().replace('_', '-')}"` : '';
    if (op < 1 || fx || blend) s = `<g${op < 1 ? ` opacity="${r(op)}"` : ''}${fx}${blend}>${s}</g>`;
    return s;
  }

  const bb = root.absoluteBoundingBox;
  const rb = opts.tight ? bb : root.absoluteRenderBounds || bb;
  const vx = rb.x - bb.x, vy = rb.y - bb.y;
  const body = node(root, I);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${r(rb.width)}" height="${r(rb.height)}" viewBox="${r(vx)} ${r(vy)} ${r(rb.width)} ${r(rb.height)}" fill="none"><defs>${process.env.FIG_TEXT && process.env.FIG_FONTS ? `<style>@import url('${process.env.FIG_FONTS.replace(/&/g, '&amp;')}');</style>` : ''}${defs.join('')}</defs>${body}</svg>`;
  return { svg, warn: [...warn], pad: { left: r(-vx), top: r(-vy) } };
}

fs.mkdirSync(outDir, { recursive: true });
for (const p of pairs) {
  const [name, nid] = p.split('=');
  const { svg, warn, pad } = render(nid, { tight: name.endsWith('!') });
  const fname = name.replace(/!$/, '');
  fs.writeFileSync(path.join(outDir, fname + '.svg'), svg);
  console.log(fname, (svg.length / 1024).toFixed(1) + 'KB', pad.left || pad.top ? `pad ${pad.left},${pad.top}` : '', warn.length ? 'WARN ' + warn.join(',') : '');
}
if (usedImages.size) console.log('IMAGES ' + [...usedImages].join(' '));
