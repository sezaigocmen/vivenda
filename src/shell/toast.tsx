/** MOBİL WEB APP ŞABLONU – iOS tarzı kısa bilgi balonu (toast). Kullanım: toast('Saved') */
import { AnimatePresence, motion } from 'motion/react'
import { create } from 'zustand'

const useToastStore = create<{ msg: string | null; id: number }>(() => ({ msg: null, id: 0 }))
let timer: ReturnType<typeof setTimeout> | undefined

export function toast(msg: string, ms = 1800) {
  clearTimeout(timer)
  useToastStore.setState((s) => ({ msg, id: s.id + 1 }))
  timer = setTimeout(() => useToastStore.setState({ msg: null }), ms)
}

export function ToastHost() {
  const { msg, id } = useToastStore()
  return (
    <div className="pointer-events-none absolute inset-x-0 z-[900] flex justify-center px-6" style={{ top: 'calc(var(--safe-top) + 12px)' }}>
      <AnimatePresence>
        {msg && (
          <motion.div
            key={id}
            className="rounded-full bg-black/80 px-4 py-2 text-[14px] font-medium text-white shadow-lg backdrop-blur"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
