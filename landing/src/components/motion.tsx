import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'

// Shared easing + timing so every entrance in the page feels like one system.
const EASE = [0.22, 1, 0.36, 1] as const
const DURATION = 0.55

// Statically resolved motion components. Resolving `as` through this map (rather
// than calling motion(tag) during render) keeps a stable component identity, so
// re-renders never remount the element and re-fire its entrance animation.
type MotionTagName = 'div' | 'section' | 'article' | 'span' | 'li' | 'ul'
const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  span: motion.span,
  li: motion.li,
  ul: motion.ul,
} as const

/**
 * Reveal — fades + rises its children into view once, when scrolled near.
 * Collapses to an instant, static render when the user prefers reduced motion.
 */
interface RevealProps {
  children: ReactNode
  className?: string
  /** Seconds to wait before animating in. */
  delay?: number
  /** Distance in px the element travels up as it fades in. */
  y?: number
  as?: MotionTagName
  once?: boolean
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
  as = 'div',
  once = true,
}: RevealProps) {
  const reduce = useReducedMotion()
  const MotionTag = MOTION_TAGS[as]

  return (
    <MotionTag
      className={className}
      initial={reduce ? undefined : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, margin: '0px 0px -12% 0px' }}
      transition={{ duration: DURATION, ease: EASE, delay }}
    >
      {children}
    </MotionTag>
  )
}

/**
 * RevealGroup — staggers direct <RevealItem> children as the group enters view.
 */
interface RevealGroupProps {
  children: ReactNode
  className?: string
  /** Seconds between each child's entrance. */
  stagger?: number
  delayChildren?: number
  as?: MotionTagName
  once?: boolean
}

export function RevealGroup({
  children,
  className,
  stagger = 0.06,
  delayChildren = 0,
  as = 'div',
  once = true,
}: RevealGroupProps) {
  const reduce = useReducedMotion()
  const MotionTag = MOTION_TAGS[as]

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : stagger,
        delayChildren: reduce ? 0 : delayChildren,
      },
    },
  }

  return (
    <MotionTag
      className={className}
      variants={container}
      initial={reduce ? undefined : 'hidden'}
      whileInView={reduce ? undefined : 'show'}
      viewport={{ once, margin: '0px 0px -10% 0px' }}
    >
      {children}
    </MotionTag>
  )
}

interface RevealItemProps {
  children: ReactNode
  className?: string
  y?: number
  as?: MotionTagName
}

export function RevealItem({ children, className, y = 18, as = 'div' }: RevealItemProps) {
  const reduce = useReducedMotion()
  const MotionTag = MOTION_TAGS[as]

  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : y },
    show: { opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE } },
  }

  return (
    <MotionTag className={className} variants={item}>
      {children}
    </MotionTag>
  )
}

/**
 * CountUp — animates a number from 0 to `value` when it scrolls into view.
 * Renders the plain value immediately under reduced motion.
 */
interface CountUpProps {
  value: number
  className?: string
  durationMs?: number
  /** Text appended after the number, e.g. "+" or "ms". */
  suffix?: string
  /** Digits after the decimal point. */
  decimals?: number
}

export function CountUp({
  value,
  className,
  durationMs = 1200,
  suffix = '',
  decimals = 0,
}: CountUpProps) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const format = (n: number) => n.toFixed(decimals) + suffix

    if (reduce || !inView) {
      // Show the final value up front when motion is off or not yet visible.
      if (reduce) node.textContent = format(value)
      return
    }

    let raf = 0
    let start: number | null = null
    const step = (ts: number) => {
      if (start === null) start = ts
      const progress = Math.min((ts - start) / durationMs, 1)
      // easeOutCubic for a natural settle.
      const eased = 1 - Math.pow(1 - progress, 3)
      node.textContent = format(value * eased)
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, durationMs, suffix, decimals, reduce])

  return (
    <span ref={ref} className={className}>
      {reduce ? value.toFixed(decimals) + suffix : '0' + suffix}
    </span>
  )
}

export { motion, useReducedMotion }
