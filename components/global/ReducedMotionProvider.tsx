'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

const ReducedMotionContext = createContext(false)

export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  return <ReducedMotionContext.Provider value={reduced}>{children}</ReducedMotionContext.Provider>
}

export function useReducedMotionContext() {
  return useContext(ReducedMotionContext)
}
