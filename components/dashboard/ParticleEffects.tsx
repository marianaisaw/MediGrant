'use client'

import { motion, AnimatePresence } from 'framer-motion'

type ParticleEffectsProps = {
  particleCount: number
}

export function ParticleEffects({ particleCount }: ParticleEffectsProps) {
  return (
    <AnimatePresence>
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-blue-400/80 pointer-events-none"
          initial={{ 
            x: Math.random() * window.innerWidth / 2,
            y: 0,
            opacity: 0.8,
            scale: 0.5
          }}
          animate={{ 
            y: -50,
            opacity: 0,
            scale: 1.2,
            x: (i * 20) - 40
          }}
          transition={{ 
            duration: 1,
            ease: 'easeOut'
          }}
          style={{
            width: 6,
            height: 6,
            willChange: 'transform, opacity'
          }}
        />
      ))}
    </AnimatePresence>
  )
}
