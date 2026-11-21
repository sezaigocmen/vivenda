// Uygulama ikonlarını ve iOS açılış ekranlarını Figma logosundan üretir (Edge headless ile ekran görüntüsü).
// Kullanım: node tools/brand/make-icons.mjs   (proje klasöründen; eksik dosya kalırsa tekrar çalıştır)
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const root = process.cwd()
const logo = fs.readFileSync(path.join(root, 'src/assets/brand/logo-large.svg'), 'utf8')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-'))

function shot(name, w, h, body) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@600&display=block" rel="stylesheet">
<style>html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:#fff}body{display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Open Sans',sans-serif}svg{display:block}</style></head><body>${body}</body></html>`
  const file = path.join(tmp, name.replaceAll('/', '_') + '.html')
  fs.writeFileSync(file, html)
  const out = path.join(root, 'public', name + '.png')
  fs.mkdirSync(path.dirname(out), { recursive: true })
  const args = ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--virtual-time-budget=5000', `--user-data-dir=${path.join(tmp, 'profile')}`, `--window-size=${w},${h}`, `--screenshot=${out}`, pathToFileURL(file).href]
  for (let i = 0; i < 3 && !fs.existsSync(out); i++) execFileSync(EDGE, args, { stdio: 'ignore' })
  console.log(fs.existsSync(out) ? '✓' : '✗', name)
}

// logo-large: 157×116 → genişliğe göre ölçekle
const mark = (w) => logo.replace(/<svg ([^>]*?)width="[^"]*" height="[^"]*"/, `<svg $1width="${w}" height="${Math.round((w * 116) / 157)}"`)

shot('icon-512', 512, 512, mark(380))
shot('icon-192', 192, 192, mark(142))
shot('apple-touch-icon', 180, 180, mark(134))
shot('favicon', 64, 64, mark(56))
shot('icon-maskable-512', 512, 512, mark(300))

const SPLASH = [[1320, 2868], [1206, 2622], [1290, 2796], [1179, 2556], [1284, 2778], [1170, 2532], [1080, 2340], [1242, 2688], [1125, 2436], [828, 1792], [750, 1334], [1242, 2208]]
for (const [w, h] of SPLASH) {
  const s = Math.round(w * 0.42)
  shot(`splash/splash-${w}x${h}`, w, h, `${mark(s)}<div style="margin-top:${Math.round(s * 0.12)}px;font-size:${Math.round(s * 0.2)}px;color:#05A8AA;font-weight:600;letter-spacing:.02em">VIVENDA</div>`)
}
fs.rmSync(tmp, { recursive: true, force: true })
