import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useAnimationFrame, useTransform } from 'framer-motion';

const carouselImages = [
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=85"
];

export default function DepthBlurCarousel({ scrollYProgress }) {
  // Motion value tracking the composite index center (0 to 6)
  const activeCenter = useMotionValue(0);

  // Keep track of autoplay offset value
  const autoplayOffset = useRef(0);

  // Update loop on animation frame (runs at 60fps/120fps)
  useAnimationFrame((time, delta) => {
    // 1. Slow autoplay speed (increases index slowly over time)
    const baseAutoplaySpeed = 0.0004; // incremental units per ms
    autoplayOffset.current = (autoplayOffset.current + baseAutoplaySpeed * delta) % carouselImages.length;

    // 2. Scroll-linked offset: maps the 0-1 scroll range to index shifts
    // Multiplying scroll progress by 18 makes it rotate quickly (nearly 3 full loops) as they scroll
    const scrollOffset = scrollYProgress.get() * 18;

    // 3. Composite center position
    const compositeCenter = (autoplayOffset.current + scrollOffset) % carouselImages.length;
    activeCenter.set(compositeCenter);
  });

  // Angle between each card in a cylinder (360 / 7 = 51.43)
  const anglePerCard = 360 / carouselImages.length;

  // Cylinder track rotation (opposite of center index progression)
  const trackRotateY = useTransform(activeCenter, (val) => val * -anglePerCard);

  return (
    <div 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '350px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        perspective: '1200px',
        overflow: 'hidden',
        margin: '1rem 0'
      }}
    >
      {/* 3D Cylindrical Cylinder Track */}
      <motion.div 
        style={{ 
          position: 'relative', 
          width: '100%', 
          maxWidth: '800px', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          transformStyle: 'preserve-3d',
          rotateY: trackRotateY,
          rotateX: 6 // slight tilt facing downward for perspective depth
        }}
      >
        {carouselImages.map((src, i) => {
          // Dynamic relative distance to the center front
          const diff = useTransform(activeCenter, (val) => {
            let d = i - (val % carouselImages.length);
            // Shortest circular wrap distance calculation
            if (d > carouselImages.length / 2) d -= carouselImages.length;
            if (d < -carouselImages.length / 2) d += carouselImages.length;
            return d;
          });

          // Calculations based on distance
          const scale = useTransform(diff, (d) => 1.15 - Math.min(0.4, Math.abs(d) * 0.16));
          const filter = useTransform(diff, (d) => `blur(${Math.min(8, Math.abs(d) * 2.5)}px)`);
          const opacity = useTransform(diff, (d) => 1 - Math.min(0.75, Math.abs(d) * 0.28));
          const zIndex = useTransform(diff, (d) => Math.round(100 - Math.abs(d) * 15));

          return (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: '280px',
                height: '180px',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(41, 37, 36, 0.12)',
                border: '1px solid rgba(253, 252, 248, 0.4)',
                // Moves cards onto the perimeter of the cylinder (300px radius)
                transform: `rotateY(${i * anglePerCard}deg) translateZ(300px)`,
                transformStyle: 'preserve-3d',
                scale,
                filter,
                opacity,
                zIndex
              }}
            >
              <img 
                src={src} 
                alt={`Sanctuary room perspective ${i + 1}`} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }} 
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
