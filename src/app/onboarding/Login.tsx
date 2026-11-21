/**
 * Figma: Log In (14:3) – logo + VIVENDA, "Log In", E-mail / Password alanları, Google / Facebook / Apple.
 * Düzeltmeler: Times'a düşen yazılar Open Sans, "Passwords" → "Password", "Sign In" → "Sign Up",
 * kesik "Forgot your password?" tam, eksik Log In butonu eklendi.
 * DEMO GÜVENLİĞİ: alanlar önceden doldurulmuş ve salt okunur; sosyal girişler de aynı demo hesabını açar.
 */
import { motion } from 'motion/react'
import { useState } from 'react'
import { useNav } from '../../shell/navigation'
import { toast } from '../../shell/toast'
import { Icon } from '../components/Icon'
import { openDemoNotice } from '../components/DemoNotice'
import { useApp } from '../store'
import logo from '../../assets/brand/logo-small.svg'
import { CityBg } from '../components/Screen'

const DEMO_EMAIL = 'emily@vivenda.app'

export function Login() {
  const nav = useNav()
  const setOnboarded = useApp((s) => s.setOnboarded)
  const [loading, setLoading] = useState<string | null>(null)
  const prefilled = () => toast('Demo account is prefilled — just tap Log In')

  const login = (via: 'email' | 'Google' | 'Facebook' | 'Apple') => {
    if (loading) return
    setLoading(via)
    setTimeout(() => {
      if (via !== 'email') toast(`Signed in with a demo ${via} account`)
      setOnboarded(true)
    }, 850)
  }

  const social = [
    { id: 'Google' as const, icon: 'google', ring: 'border-orange text-orange' },
    { id: 'Facebook' as const, icon: 'facebook', ring: 'border-teal text-teal' },
    { id: 'Apple' as const, icon: 'apple', ring: 'border-ink text-ink' },
  ]

  return (
    <div className="relative flex h-full flex-col bg-white" style={{ paddingTop: 'var(--safe-top)', paddingBottom: 'max(var(--safe-bottom), 16px)' }}>
      <CityBg crop="center" opacity={0.18} />

      <div className="scroll-y relative min-h-0 flex-1 px-[30px]">
        {/* Logo */}
        <motion.div className="mt-[90px] flex items-center justify-center gap-[4px]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <img src={logo} alt="" className="h-[50px] w-[68px]" />
          <span className="text-[32px] font-medium leading-[44px] text-teal">VIVENDA</span>
        </motion.div>

        <h1 className="mt-[96px] text-center text-[26px] font-medium leading-[35px] text-orange">Log In</h1>

        {/* Figma: 333×52, turkuaz çerçeve, köşe 12 */}
        <div className="mt-[38px] flex flex-col gap-[25px]">
          <Field label="E-mail" value={DEMO_EMAIL} onPress={prefilled} />
          <Field label="Password" value="••••••••••" onPress={prefilled} />
        </div>

        <button onClick={() => login('email')} className="pressable mt-[26px] flex h-[48px] w-full items-center justify-center gap-2 rounded-[12px] bg-orange text-[16px] font-semibold text-white shadow-[0_4px_12px_rgb(220_96_46/0.3)]">
          {loading === 'email' && <span className="h-[16px] w-[16px] animate-spin rounded-full border-2 border-white border-t-transparent" />}
          Log In
        </button>

        <div className="mt-[24px] flex justify-center gap-[25px]">
          {social.map((s) => (
            <button key={s.id} aria-label={`Continue with ${s.id}`} onClick={() => login(s.id)} className={`pressable flex h-[40px] w-[40px] items-center justify-center rounded-full border bg-white/70 ${s.ring}`}>
              {loading === s.id ? <span className="h-[14px] w-[14px] animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Icon name={s.icon} size={18} />}
            </button>
          ))}
        </div>

        <p className="mt-[28px] text-center text-[14px] font-light">
          Don’t have an account?{' '}
          <button className="pressable font-semibold text-teal" onClick={() => openDemoNotice(nav, 'Sign Up', 'Sign-up is turned off in this demo. Use the sample account to explore every feature.')}>
            Sign Up
          </button>
        </p>
        <button onClick={() => openDemoNotice(nav, 'Forgot your password?', 'Password reset isn’t needed in this demo — the sample account signs in without one.')} className="pressable mx-auto mt-[6px] block text-[14px] text-ink-soft underline-offset-2">
          Forgot your password?
        </button>
      </div>

      <p className="relative pt-[8px] text-center text-[12px] font-light text-muted">Demo account · no real sign-in</p>
    </div>
  )
}

function Field({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <button type="button" onClick={onPress} aria-label={`${label}: ${value}`} className="flex h-[52px] w-full flex-col justify-center rounded-[12px] border border-teal bg-[#d9d9d9]/[0.12] px-[18px] text-left">
      <span className="text-[12px] leading-[16px] text-orange">{label}</span>
      <span className="text-[14px] leading-[20px]">{value}</span>
    </button>
  )
}
