/** Masaüstü çerçevesindeki sahte iOS durum çubuğu (saat, sinyal, Wi-Fi, pil). */
export function StatusBar({ color = '#000' }: { color?: string }) {
  return (
    <div className="flex h-[54px] items-center justify-between pl-[52px] pr-[34px] pt-[6px]" style={{ color }}>
      <span className="text-[17px] font-semibold tracking-[-0.2px]" style={{ fontFamily: 'var(--font-sans)' }}>
        9:41
      </span>
      <div className="flex items-center gap-[6px]">
        {/* sinyal */}
        <svg width="19" height="12" viewBox="0 0 19 12" fill="currentColor" aria-hidden>
          <rect x="0" y="8" width="3.2" height="4" rx="1" />
          <rect x="5" y="5.5" width="3.2" height="6.5" rx="1" />
          <rect x="10" y="3" width="3.2" height="9" rx="1" />
          <rect x="15" y="0" width="3.2" height="12" rx="1" />
        </svg>
        {/* wi-fi */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" aria-hidden>
          <path d="M8.5 2.4c2.4 0 4.6.9 6.3 2.5l1.2-1.2A10.5 10.5 0 0 0 8.5.7 10.5 10.5 0 0 0 1 3.7l1.2 1.2A8.8 8.8 0 0 1 8.5 2.4Z" />
          <path d="M8.5 5.8c1.5 0 2.8.5 3.9 1.5l1.2-1.2a7.3 7.3 0 0 0-10.2 0l1.2 1.2c1-1 2.4-1.5 3.9-1.5Z" />
          <path d="M8.5 9.1c.6 0 1.1.2 1.5.6L8.5 11.2 7 9.7c.4-.4.9-.6 1.5-.6Z" />
        </svg>
        {/* pil */}
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none" aria-hidden>
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" />
          <path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
    </div>
  )
}
