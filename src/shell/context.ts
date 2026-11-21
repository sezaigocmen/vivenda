import { createContext, useContext } from 'react'

export type DisplayMode = 'phone' | 'desktop'

const ShellContext = createContext<{ mode: DisplayMode; scale: number }>({ mode: 'phone', scale: 1 })
/** Çerçeve küçültülmüşse (scale < 1) parmak/fare hareketlerini doğru hesaplamak için kullanılır. */
export const useShell = () => useContext(ShellContext)
export const ShellProvider = ShellContext.Provider
