/** Figma'dan çıkarılan tek renkli ikonlar: rengi yazı renginden alır, tema ile değişir */
import type { CSSProperties } from 'react'

const files = import.meta.glob('../../assets/icons/*.svg', { eager: true, import: 'default' }) as Record<string, string>
const ICONS: Record<string, string> = Object.fromEntries(Object.entries(files).map(([p, url]) => [p.split('/').pop()!.replace('.svg', ''), url]))

export type IconName = keyof typeof ICONS

export function Icon({ name, size = 24, className = '', style }: { name: string; size?: number; className?: string; style?: CSSProperties }) {
  return <span aria-hidden className={`icon ${className}`} style={{ width: size, height: size, ['--icon' as string]: `url("${ICONS[name]}")`, ...style }} />
}
