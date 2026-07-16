import React, { useRef } from 'react';
import gsap from 'gsap';

const galleryImages = [
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=85",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=85",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=85",
  "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=400&q=85",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=85",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=85"
];

export default function MwgEffect000() {
  // Tracking mouse coordinate vectors to calculate velocity delta
  const oldX = useRef(0);
  const oldY = useRef(0);
  const deltaX = useRef(0);
  const deltaY = useRef(0);

  const handleMouseMove = (e) => {
    // Calculate movement distance since last mouse position update
    deltaX.current = e.clientX - oldX.current;
    deltaY.current = e.clientY - oldY.current;

    // Cache current mouse positions
    oldX.current = e.clientX;
    oldY.current = e.clientY;
  };

  const handleMouseEnter = (e) => {
    const container = e.currentTarget;
    const media = container.querySelector('img');
    if (!media) return;

    // Boost z-index to stay layered on top
    container.style.zIndex = '10';

    // Velocity vector scales (clamped to prevent extreme throws)
    const pushX = Math.max(-40, Math.min(40, deltaX.current * 1.5));
    const pushY = Math.max(-40, Math.min(40, deltaY.current * 1.5));

    // Random rotational angle swing (-12deg to 12deg)
    const randomRot = (Math.random() - 0.5) * 20;

    // Clear active tweens
    gsap.killTweensOf(media);

    const tl = gsap.timeline({
      onComplete: () => {
        container.style.zIndex = '1';
      }
    });

    // 1. Kick out in the direction of mouse entry
    tl.to(media, {
      x: pushX,
      y: pushY,
      rotate: randomRot,
      duration: 0.2,
      ease: 'power2.out'
    });

    // 2. Elastic rebound back to rest state
    tl.to(media, {
      x: 0,
      y: 0,
      rotate: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.4)'
    });
  };

  return (
    <section 
      className="mwg_effect000 container"
      onMouseMove={handleMouseMove}
      style={{ padding: '4rem 1.5rem', position: 'relative' }}
    >
      {/* Gallery Header */}
      <div 
        className="header" 
        style={{ 
          display: 'flex', 
          justifyContent: 'between', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2.5rem',
          borderBottom: '1px solid rgba(41, 37, 36, 0.08)',
          paddingBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <p 
            className="button button1"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: 'var(--color-sage)', 
              padding: '0.5rem 1rem', 
              borderRadius: '50px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-dark)'
            }}
          >
            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--color-coral)', borderRadius: '50%' }}></span>
            <span>sensory gallery</span>
          </p>
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--color-muted)', flex: 1, textAlign: 'center' }}>
          6 sanctuaries saved in your collection
        </div>
        <div>
          <a 
            href="#experience" 
            className="button button2"
            style={{ 
              background: 'var(--color-dark)', 
              color: '#FDFCF8', 
              padding: '0.6rem 1.25rem', 
              borderRadius: '50px',
              fontSize: '0.85rem',
              textDecoration: 'none',
              fontWeight: 500,
              display: 'inline-block'
            }}
          >
            book now
          </a>
        </div>
      </div>

      {/* 6 Item Media Grid (smaller columns, responsive class) */}
      <div className="mwg-gallery-grid">
        {galleryImages.map((src, i) => (
          <div 
            key={i} 
            className="media"
            onMouseEnter={handleMouseEnter}
            style={{ 
              borderRadius: '1.25rem', 
              overflow: 'hidden', 
              aspectRatio: '1/1', 
              cursor: 'pointer', 
              position: 'relative',
              backgroundColor: '#faf9f6',
              boxShadow: 'var(--shadow-soft)'
            }}
          >
            <img 
              src={src} 
              alt={`Sanctuary slice ${i + 1}`} 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                pointerEvents: 'none',
                willChange: 'transform'
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
