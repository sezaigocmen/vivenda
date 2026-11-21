/** iOS tarzı alttan açılan sheet: arka plan kararır, tutamaçtan aşağı çekince kapanır. */
import { motion, useDragControls } from 'motion/react'
import type { ReactNode } from 'react'

const EASE = [0.32, 0.72, 0, 1] as const

export function SheetView({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const controls = useDragControls()

  return (
    <div className="absolute inset-0 z-[500]">
      <motion.div
        className="absolute inset-0 bg-black/35"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        className="absolute inset-x-0 bottom-0 flex max-h-[92%] flex-col rounded-t-[24px] bg-[var(--app-bg)] shadow-[0_-8px_30px_rgb(0_0_0/0.12)]"
        style={{ paddingBottom: 'var(--safe-bottom)' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.42, ease: EASE }}
        drag="y"
        dragControls={controls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.04, bottom: 1 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 110 || info.velocity.y > 500) onClose()
        }}
      >
        {/* Tutamaç: buradan aşağı çekince sheet kapanır */}
        <div className="flex h-7 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing" onPointerDown={(e) => controls.start(e)}>
          <span className="h-[5px] w-9 rounded-full bg-current opacity-20" />
        </div>
        <div className="scroll-y min-h-0 flex-1">{children}</div>
      </motion.div>
    </div>
  )
}
