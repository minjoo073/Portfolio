'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'

let registered = false

export function registerGsap() {
  if (registered) return
  if (typeof window === 'undefined') return

  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)
  gsap.defaults({ ease: 'power3.out', duration: 0.8 })
  ScrollTrigger.defaults({ markers: false, invalidateOnRefresh: true })

  registered = true
}

export { gsap, ScrollTrigger, SplitText, CustomEase }
