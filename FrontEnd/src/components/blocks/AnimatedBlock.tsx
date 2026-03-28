'use client'

import { useEffect, useRef } from 'react'
import type { BlockAnimation } from '@/domain/landing/block.types'

const ANIM_CLASS: Record<string, string> = {
  'fade-up':     'animate-block-fade-up',
  'fade-in':     'animate-block-fade-in',
  'zoom-in':     'animate-block-zoom-in',
  'slide-left':  'animate-block-slide-left',
  'slide-right': 'animate-block-slide-right',
}

type Props = {
  animation?: BlockAnimation
  children: React.ReactNode
}

export function AnimatedBlock({ animation, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const hasAnim = animation && animation !== 'none'

  useEffect(() => {
    if (!hasAnim || !ref.current) return
    const el = ref.current

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          el.classList.add('in-view')
          el.classList.add(ANIM_CLASS[animation] ?? '')
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasAnim, animation])

  if (!hasAnim) return <>{children}</>

  return (
    <div ref={ref} data-animate="true">
      {children}
    </div>
  )
}
