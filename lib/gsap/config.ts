'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

export function registerGsap() {
  if (registered) return
  if (typeof window === 'undefined') return

  gsap.registerPlugin(ScrollTrigger)
  gsap.defaults({ ease: 'power3.out', duration: 0.8 })
  ScrollTrigger.defaults({ markers: false, invalidateOnRefresh: true })

  registered = true
}

export { gsap, ScrollTrigger }
