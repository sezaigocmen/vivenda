/**
 * Figma: açılış (14:2) – şehir/pazar illüstrasyonu, ortada logo ve "VIVENDA".
 * Kısa bir animasyondan sonra giriş ekranına geçer (dokununca hemen geçer).
 */
import { motion } from 'motion/react'
import { useEffect } from 'react'
import city from '../../assets/img/city-bg.jpg'
import logo from '../../assets/brand/logo-large.svg'

const EASE = [0.32, 0.72, 0, 1] as const

export function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2300)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div className="absolute inset-0 z-[300] overflow-hidden bg-white" exit={{ opacity: 0 }} transition={{ duration: 0.45 }} onClick={onDone}>
      {/* Figma: üstte %30 soluk, ters çevrilmiş illüstrasyon */}
      <motion.img
        src={city}
        alt=""
        className="absolute inset-x-0 top-0 h-[46%] w-full rotate-180 object-cover opacity-30"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 0.3 }}
        transition={{ duration: 1.1, ease: EASE }}
      />
      {/* Figma: altta tam opak illüstrasyon */}
      <motion.img
        src={city}
        alt=""
        className="absolute inset-x-0 bottom-0 h-[54%] w-full object-cover"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center pb-[80px]">
        <motion.img src={logo} alt="" className="h-[116px] w-[157px]" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.35 }} />
        <motion.p
          className="mt-[14px] rounded-full bg-white/80 px-3 text-[22px] font-semibold tracking-[0.04em] text-teal"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75 }}
        >
          VIVENDA
        </motion.p>
        <motion.p className="mt-[4px] text-[13px] font-light text-ink-soft" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
          Rediscover your neighborhood
        </motion.p>
      </div>
    </motion.div>
  )
}
