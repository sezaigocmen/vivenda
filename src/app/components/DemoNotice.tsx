/** Demo'da gerçek karşılığı olmayan işlemler için kısa bilgi paneli */
import type { NavApi } from '../../shell/navigation'

export function openDemoNotice(nav: NavApi, title: string, text?: string) {
  nav.openSheet((close) => (
    <div className="flex flex-col gap-3 px-6 pb-6 pt-1">
      <h2 className="text-[20px] font-semibold text-teal">{title}</h2>
      <p className="text-[15px] font-light leading-[22px]">
        {text ?? 'Vivenda is a portfolio demo. Sign-in is simulated with a sample account — no real credentials are needed, and nothing you do leaves this device.'}
      </p>
      <button onClick={close} className="pressable mt-2 h-[46px] rounded-card bg-orange text-[16px] font-semibold text-white">
        Got it
      </button>
    </div>
  ))
}
