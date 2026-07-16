import React, { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

export default function ScrollZoomReveal() {
  const containerRef = useRef(null);

  // Track the scroll of the scroll-jacking wrapper section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Interpolate the pill dimensions
  const width = useTransform(scrollYProgress, [0, 0.65], ["160px", "100vw"]);
  const height = useTransform(scrollYProgress, [0, 0.65], ["64px", "100vh"]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.65], ["32px", "0px"]);
  
  // Subtle scaling on the image itself to stabilize visual weight
  const imgScale = useTransform(scrollYProgress, [0, 0.65], [1.4, 1]);

  // Translate text spans outward as the image zooms in
  const leftX = useTransform(scrollYProgress, [0, 0.45], [0, -350]);
  const rightX = useTransform(scrollYProgress, [0, 0.45], [0, 350]);
  
  // Fade out the surrounding text
  const textOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  // Reveal details inside the image when it is fully expanded
  const innerTextOpacity = useTransform(scrollYProgress, [0.6, 0.9], [0, 1]);
  const innerTextY = useTransform(scrollYProgress, [0.6, 0.9], [40, 0]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        height: '220vh', // Sets scroll length for pinning the animation
        position: 'relative',
        width: '100%',
        backgroundColor: 'var(--bg-primary)'
      }}
    >
      {/* Sticky viewport frame */}
      <div 
        style={{ 
          position: 'sticky', 
          top: 0, 
          height: '100vh', 
          overflow: 'hidden', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        {/* Horizontal Row Wrapper */}
        <div 
          style={{ 
            position: 'relative',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '1.5rem',
            width: '100%'
          }}
        >
          {/* Left Text */}
          <motion.span 
            style={{ 
              x: leftX, 
              opacity: textOpacity, 
              fontSize: 'clamp(1.75rem, 5vw, 3.5rem)', 
              fontWeight: 600, 
              color: 'var(--color-dark)',
              whiteSpace: 'nowrap',
              zIndex: 1
            }}
          >
            &copy;2026
          </motion.span>

          {/* Placeholder matching the initial pill size to preserve layout spacing */}
          <div style={{ width: '160px', height: '64px', flexShrink: 0 }}></div>

          {/* Right Text */}
          <motion.span 
            style={{ 
              x: rightX, 
              opacity: textOpacity, 
              fontSize: 'clamp(1.75rem, 5vw, 3.5rem)', 
              fontWeight: 600, 
              color: 'var(--color-dark)',
              whiteSpace: 'nowrap',
              zIndex: 1
            }}
          >
            sanctuaries
          </motion.span>

          {/* Expanding absolute-positioned Pill Window */}
          <motion.div 
            style={{ 
              position: 'absolute', 
              width, 
              height, 
              borderRadius, 
              overflow: 'hidden', 
              left: '50%',
              top: '50%',
              x: '-50%',
              y: '-50%',
              zIndex: 10,
              boxShadow: '0 10px 40px rgba(41, 37, 36, 0.08)'
            }}
          >
            <motion.img 
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=85" 
              alt="LuxuryStay Sanctuary Wellness" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                scale: imgScale
              }}
            />

            {/* Inner reveal card details overlay */}
            <motion.div 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                background: 'linear-gradient(to bottom, rgba(41,37,36,0.1), rgba(41,37,36,0.5))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: innerTextOpacity
              }}
            >
              <motion.div 
                style={{ 
                  y: innerTextY, 
                  textAlign: 'center', 
                  color: '#FDFCF8',
                  padding: '1.5rem'
                }}
              >
                <span 
                  style={{ 
                    fontSize: '0.85rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.2em', 
                    color: 'var(--color-coral)',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '0.75rem'
                  }}
                >
                  luxury wellness escape
                </span>
                <h3 
                  style={{ 
                    fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
                    color: '#FDFCF8', 
                    textTransform: 'lowercase',
                    lineHeight: 1.1
                  }}
                >
                  a room to <span className="font-handwritten" style={{ color: 'var(--color-coral)', fontSize: '1.25em' }}>discover</span> stillness
                </h3>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
