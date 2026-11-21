/** MOBİL WEB APP ŞABLONU – ortada açılan onay penceresi (arka plan bulanıklaşır) */
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'

export type DialogButton = { label: string; tone: 'primary' | 'secondary'; onClick: () => void }

export function Dialog({
  open,
  title,
  message,
  buttons,
  onClose,
  colors = { primary: '#0BB791', secondary: '#F3997E' },
  children,
}: {
  open: boolean
  title: string
  message?: string
  buttons: DialogButton[]
  onClose: () => void
  colors?: { primary: string; secondary: string }
  children?: ReactNode
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-[600] flex items-center justify-center bg-white/30 px-[44px] backdrop-blur-[5px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            role="alertdialog"
            className="relative w-full max-w-[300px] rounded-[24px] bg-white px-[24px] pb-[26px] pt-[32px] text-center shadow-[0_0_2px_rgb(0_0_0/0.6),0_12px_40px_-12px_rgb(0_0_0/0.3)]"
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button aria-label="Close" onClick={onClose} className="pressable absolute right-[14px] top-[12px] p-2">
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                <path d="M1 1l10 10M11 1 1 11" stroke="#000" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
            <h2 className="text-[17px] font-semibold text-black">{title}</h2>
            {message && <p className="mt-[8px] text-[13px] italic leading-[17px] text-black/80">{message}</p>}
            {children}
            <div className="mt-[24px] flex justify-center gap-[13px]">
              {buttons.map((b) => (
                <button
                  key={b.label}
                  onClick={b.onClick}
                  className={`pressable h-[30px] min-w-[100px] rounded-[9px] px-4 text-[15px] font-medium shadow-[0_0_1.5px_rgb(0_0_0/0.6)] ${b.tone === 'primary' ? 'text-white' : 'text-white'}`}
                  style={{ background: colors[b.tone] }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
