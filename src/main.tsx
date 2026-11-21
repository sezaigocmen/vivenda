import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppShell } from './shell/AppShell'
import type { ShowcaseMeta } from './shell/InfoPanel'
import { App } from './app/App'
import { resetDemo } from './app/store'
import logo from './assets/brand/logo-large.svg'

/** Masaüstü tanıtım paneli bilgileri (her projede burası değişir) */
const meta: ShowcaseMeta = {
  name: 'Vivenda',
  tagline: 'Rediscover your neighborhood',
  description: 'A community shopping app that connects local businesses with young people through products, stories and events — for customers and shop owners in one app.',
  logo,
  accent: '#05A8AA',
  pageBackground: 'radial-gradient(900px 600px at 15% 15%, #DDF1F1 0%, transparent 60%), radial-gradient(700px 500px at 90% 90%, #F8E2D6 0%, transparent 60%), #F8F6F3',
  designer: 'Sezai Göçmen',
  links: [{ label: 'Full case study', href: 'https://www.sezaigocmen.com/projects/vivenda' }],
  onReset: resetDemo,
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppShell meta={meta}>
      <App />
    </AppShell>
  </StrictMode>,
)
