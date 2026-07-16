import React, { useRef, useEffect, useState } from 'react';
import { useScroll, useTransform, useSpring, motion } from 'framer-motion';

export default function MwgEffect104() {
  const sectionRef = useRef(null);
  const pathRef = useRef(null);

  // Track scroll progress of the sticky wrapper
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  // Smooth the scroll input with spring physics to filter out scroll steps/ticks
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 22,
    restDelta: 0.001
  });

  // State to hold dynamic image coordinates
  const [img1, setImg1] = useState({ x: 0, y: 195 });
  const [img2, setImg2] = useState({ x: 0, y: 195 });

  // Paths: flat line path and wave path have the same commands/control points for morphing
  const flatD = "M 0.21875 195 C 0.21875 195 382.004 195 644.219 195 C 906.434 195 1051.3 195 1288.22 195 C 1531.72 195 1668.87 195 1932.22 195 C 2195.57 195 2576.22 195 2576.22 195";
  const waveD = "M 0.21875 190.5 C 0.21875 190.5 382.004 0.5 644.219 0.5 C 906.434 0.5 1051.3 78.1239 1288.22 190.5 C 1531.72 306 1668.87 390.5 1932.22 390.5 C 2195.57 390.5 2576.22 190.5 2576.22 190.5";

  // Morph the path definition attribute d on smooth progress
  const d = useTransform(smoothProgress, [0.15, 0.65], [flatD, waveD]);

  // Compute text offsets to travel along the line as progress advances
  const offset1 = useTransform(smoothProgress, [0, 1], ["85%", "-75%"]);
  const offset2 = useTransform(smoothProgress, [0, 1], ["135%", "-25%"]);
  const offset3 = useTransform(smoothProgress, [0, 1], ["185%", "25%"]);

  // Calculate image coordinates along the morphing path on smooth progress changes
  useEffect(() => {
    return smoothProgress.onChange((p) => {
      const path = pathRef.current;
      if (!path) return;
      const length = path.getTotalLength();

      // Core offset mapping to trace elements across the SVG width
      const offset = (1 - p) * length * 1.6 - length * 0.35;

      // Image 1 coordinates (placed between Text 1 and 2)
      const point1 = path.getPointAtLength(Math.max(0, Math.min(length, offset + 1100)));
      setImg1({ x: point1.x, y: point1.y });

      // Image 2 coordinates (placed between Text 2 and 3)
      const point2 = path.getPointAtLength(Math.max(0, Math.min(length, offset + 2200)));
      setImg2({ x: point2.x, y: point2.y });
    });
  }, [smoothProgress]);

  return (
    <section 
      ref={sectionRef} 
      className="mwg_effect104"
      style={{ 
        height: '240vh',
        position: 'relative',
        backgroundColor: 'var(--color-sage)', // soft desaturated sage green
        width: '100%'
      }}
    >
      <div 
        style={{ 
          position: 'sticky', 
          top: 0, 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        <div className="container" style={{ width: '100%', maxWidth: '1400px' }}>
          <svg 
            width="100%" 
            viewBox="0 0 2577 391" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <clipPath id="round-clip">
                <rect width="260" height="180" rx="40" ry="40" x="0" y="0"/>
              </clipPath>
            </defs>

            {/* Morphing Path */}
            <motion.path 
              ref={pathRef}
              id="line" 
              d={d}
              stroke="var(--color-coral)" // Primary branding Coral accent
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Track Group holding moving texts & images */}
            <g id="track">
              {/* Text Segment 1 */}
              <text fill="var(--color-dark)" fontSize="130" fontWeight="600" style={{ letterSpacing: '-0.025em' }}>
                <motion.textPath href="#line" startOffset={offset1} textAnchor="start">
                  Sync the BPM
                </motion.textPath>
              </text>

              {/* Image Segment 1 */}
              <g transform={`translate(${img1.x - 130}, ${img1.y - 90})`}>
                <g clipPath="url(#round-clip)">
                  <image 
                    href="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80" 
                    width="260" 
                    height="180" 
                    preserveAspectRatio="xMidYMid slice"
                  />
                </g>
                {/* Elegant border framing the rounded moving clip */}
                <rect width="260" height="180" rx="40" ry="40" fill="none" stroke="var(--color-coral)" strokeWidth="3" opacity="0.8"/>
              </g>

              {/* Text Segment 2 */}
              <text fill="var(--color-dark)" fontSize="130" fontWeight="600" style={{ letterSpacing: '-0.025em' }}>
                <motion.textPath href="#line" startOffset={offset2} textAnchor="start">
                  with your heartbeat
                </motion.textPath>
              </text>

              {/* Image Segment 2 */}
              <g transform={`translate(${img2.x - 130}, ${img2.y - 90})`}>
                <g clipPath="url(#round-clip)">
                  <image 
                    href="https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=400&q=80" 
                    width="260" 
                    height="180" 
                    preserveAspectRatio="xMidYMid slice"
                  />
                </g>
                <rect width="260" height="180" rx="40" ry="40" fill="none" stroke="var(--color-coral)" strokeWidth="3" opacity="0.8"/>
              </g>

              {/* Text Segment 3 */}
              <text fill="var(--color-dark)" fontSize="130" fontWeight="600" style={{ letterSpacing: '-0.025em' }}>
                <motion.textPath href="#line" startOffset={offset3} textAnchor="start">
                  to feel the pulse
                </motion.textPath>
              </text>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
