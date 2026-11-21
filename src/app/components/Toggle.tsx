/** iOS tarzı aç/kapa anahtarı (turuncu) */
import { motion } from 'motion/react'

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-[30px] w-[50px] shrink-0 rounded-full ${on ? 'bg-orange' : 'bg-beige'}`}>
      <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 35 }} className={`absolute top-[3px] h-[24px] w-[24px] rounded-full bg-white shadow ${on ? 'right-[3px]' : 'left-[3px]'}`} />
    </button>
  )
}

/** Üç seçenekli anahtar (System / Light / Dark) */
export function Segmented<T extends string>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-card bg-beige p-[3px]">
      {options.map((o) => (
        <button key={o.id} onClick={() => onChange(o.id)} className={`relative h-[36px] flex-1 rounded-card text-[14px] font-bold ${value === o.id ? 'text-white' : 'text-ink'}`}>
          {value === o.id && <motion.span layoutId="seg-active" className="absolute inset-0 rounded-card bg-orange" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  )
}
