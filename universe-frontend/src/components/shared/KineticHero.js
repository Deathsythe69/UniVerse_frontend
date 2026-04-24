import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Orbit, Sparkles, Telescope, Globe2, Infinity } from 'lucide-react';

const HIERARCHY = [
  {
    id: 'planetary',
    label: 'PLANETARY SYSTEM',
    desc: 'A star and the objects that orbit it.',
    example: 'Our Solar System',
    icon: Orbit,
    scale: '1×',
    color: 'var(--primary)',
    glow: 'rgba(61,194,253,0.4)',
  },
  {
    id: 'galaxy',
    label: 'GALAXY',
    desc: 'Billions of stars, gas, and dust held together by gravity.',
    example: 'The Milky Way',
    icon: Sparkles,
    scale: '10¹¹×',
    color: 'var(--secondary)',
    glow: 'rgba(193,128,255,0.4)',
  },
  {
    id: 'cluster',
    label: 'GALAXY CLUSTER',
    desc: 'A collection of galaxies gravitationally bound.',
    example: 'The Local Group',
    icon: Globe2,
    scale: '10¹³×',
    color: 'var(--tertiary)',
    glow: 'rgba(255,156,126,0.4)',
  },
  {
    id: 'supercluster',
    label: 'SUPERCLUSTER',
    desc: 'Giant groups of smaller galaxy clusters.',
    example: 'Laniakea Supercluster',
    icon: Telescope,
    scale: '10¹⁶×',
    color: '#ff6e84',
    glow: 'rgba(255,110,132,0.4)',
  },
  {
    id: 'universe',
    label: 'THE UNIVERSE',
    desc: 'The totality of all space, time, matter, and energy.',
    example: 'Everything',
    icon: Infinity,
    scale: '∞',
    color: '#fff',
    glow: 'rgba(255,255,255,0.3)',
  },
];

const letterVariants = {
  hidden: { opacity: 0, y: 40, rotateX: -90 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.04,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const KineticHero = () => {
  const [activeLevel, setActiveLevel] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const title = 'CAMPUS ORBIT';

  return (
    <div className="relative overflow-hidden rounded-3xl mb-6" style={{
      background: 'linear-gradient(135deg, rgba(14,14,19,0.7) 0%, rgba(25,25,31,0.5) 100%)',
      border: '1px solid rgba(72,71,77,0.15)',
      backdropFilter: 'blur(20px)',
    }}>
      {/* Ambient glow spots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, rgba(193,128,255,0.4), transparent 70%)' }} />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, rgba(61,194,253,0.4), transparent 70%)' }} />
      </div>

      <div className="relative z-10 p-8 md:p-10">
        {/* Kinetic Title */}
        <div className="mb-2">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs font-bold tracking-[0.3em] uppercase mb-3"
            style={{ color: 'var(--primary)' }}
          >
            ✦ Mission Control
          </motion.p>

          <h1 className="text-4xl md:text-6xl font-black leading-none tracking-tighter"
              style={{ perspective: '500px' }}>
            {title.split('').map((char, i) => (
              <motion.span
                key={i}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={letterVariants}
                className="inline-block cosmic-text"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: 'none',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm mt-3 max-w-md"
            style={{ color: 'var(--on-surface-variant)' }}
          >
            Navigate through the cosmic hierarchy — from your campus orbit to the edges of the observable universe.
          </motion.p>
        </div>

        {/* Cosmic Scale — Toggle Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:scale-105"
          style={{
            border: '1px solid var(--outline-variant)',
            color: 'var(--primary)',
            background: isExpanded ? 'rgba(61,194,253,0.08)' : 'transparent',
          }}
        >
          <Telescope className="w-3.5 h-3.5" />
          {isExpanded ? 'Collapse Scale' : 'Explore Cosmic Scale'}
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            ▾
          </motion.span>
        </motion.button>

        {/* Cosmic Scale Hierarchy — Expandable */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-6 space-y-0">
                {/* Scale Timeline */}
                <div className="relative">
                  {HIERARCHY.map((level, idx) => {
                    const Icon = level.icon;
                    const isActive = activeLevel === level.id;
                    return (
                      <motion.div
                        key={level.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-stretch gap-4 group"
                        onMouseEnter={() => setActiveLevel(level.id)}
                        onMouseLeave={() => setActiveLevel(null)}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Timeline Line + Dot */}
                        <div className="flex flex-col items-center w-8 flex-shrink-0">
                          <motion.div
                            animate={{
                              scale: isActive ? 1.4 : 1,
                              boxShadow: isActive ? `0 0 12px ${level.glow}` : '0 0 0 transparent',
                            }}
                            className="w-3 h-3 rounded-full border-2 flex-shrink-0 z-10"
                            style={{
                              borderColor: level.color,
                              background: isActive ? level.color : 'var(--surface)',
                            }}
                          />
                          {idx < HIERARCHY.length - 1 && (
                            <div className="flex-1 w-px" style={{
                              background: `linear-gradient(${level.color}, ${HIERARCHY[idx + 1].color})`,
                              opacity: 0.25,
                            }} />
                          )}
                        </div>

                        {/* Content */}
                        <motion.div
                          animate={{
                            background: isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                          }}
                          className="flex-1 pb-5 rounded-xl px-3 py-2 -mx-3 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4" style={{ color: level.color }} />
                            <span className="text-xs font-black tracking-[0.15em]"
                                  style={{ color: level.color }}>
                              {level.label}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md ml-auto"
                                  style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--on-surface-variant)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                  }}>
                              {level.scale}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
                            {level.desc}
                          </p>
                          <AnimatePresence>
                            {isActive && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-xs font-medium mt-1"
                                style={{ color: level.color }}
                              >
                                Example: {level.example}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Fun Fact Banner */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 p-4 rounded-2xl"
                  style={{
                    background: 'rgba(61,194,253,0.05)',
                    border: '1px solid rgba(61,194,253,0.12)',
                  }}
                >
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
                    <span className="font-bold" style={{ color: 'var(--primary)' }}>💡 Scale Check: </span>
                    If the Sun were a grain of sand, the Milky Way would be roughly the size of North America. 
                    There are over <span className="font-bold" style={{ color: 'var(--tertiary)' }}>2 trillion galaxies</span> in 
                    the observable universe — and space between them is still expanding.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default KineticHero;
