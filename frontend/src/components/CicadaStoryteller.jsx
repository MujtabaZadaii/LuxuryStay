import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Helper component to simulate SplitText without commercial/premium plugins
const SplitTextHelper = ({ text }) => {
  return (
    <span style={{ display: 'inline-block' }}>
      {text.split(' ').map((word, idx) => (
        <span key={idx} className="fade-overflow" style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.35em' }}>
          <span className="fade-el" style={{ display: 'inline-block' }}>
            {word}
          </span>
        </span>
      ))}
    </span>
  );
};

export default function CicadaStoryteller() {
  const containerRef = useRef(null);
  const mainTimelineRef = useRef(null);

  // SVG Path references for custom self-drawing simulation (DrawSVG alternative)
  const bottomPathRef = useRef(null);
  const topPathRef = useRef(null);
  const leftPathRef = useRef(null);
  const rightPathRef = useRef(null);
  const rightTopPathRef = useRef(null);
  const leftTopPathRef = useRef(null);
  const branchesPathRef = useRef(null);

  // Audio references
  const audioRef = useRef(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Hover active trigger for tree elements
  const [hoverActive, setHoverActive] = useState(false);

  // Track hover animations for branches
  const [hoveredPosition, setHoveredPosition] = useState(null);

  useEffect(() => {
    // 1. Initialize SVG Path Lengths for drawing animation
    const paths = [
      bottomPathRef.current,
      topPathRef.current,
      leftPathRef.current,
      rightPathRef.current,
      rightTopPathRef.current,
      leftTopPathRef.current,
      branchesPathRef.current
    ];

    paths.forEach(path => {
      if (path) {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
      }
    });

    // 2. Main scroll-driven GSAP timeline
    const ctx = gsap.context(() => {
      // Set initial alignment states for centered coordinate space
      gsap.set('.tree-circle', { xPercent: -50, yPercent: -50, scale: 0 });
      gsap.set('.banner-tree', { xPercent: -50, yPercent: -50, y: -60, scale: 1 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          onEnter: () => setHoverActive(false),
          onLeave: () => setHoverActive(true),
          onEnterBack: () => setHoverActive(false),
        }
      });

      mainTimelineRef.current = tl;

      // Step 1: Slide 1 active -> Scroll to Slide 2
      // Slide 1 fades out, video tree scales up to 2.4 and shifts down slightly (trunk root base effect)
      tl.to('.slide-1', { scale: 0.7, opacity: 0, duration: 1.2 })
        .to('.slide-1 .fade-el', { y: -150, stagger: 0.02, duration: 1.2 }, '<')
        .to('.banner-tree', { scale: 2.4, yPercent: 30, y: -60, duration: 1.2 }, '<');

      // Slide 2 fades in
      tl.fromTo('.slide-2', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2 }, '<0.4')
        .fromTo('.slide-2 .fade-el', { y: 150 }, { y: 0, stagger: 0.02, duration: 1.2 }, '<0.2');

      // Step 2: Slide 2 active -> Scroll to Slide 3
      tl.to('.slide-2', { scale: 0.7, opacity: 0, duration: 1.2 })
        .to('.slide-2 .fade-el', { y: -150, stagger: 0.02, duration: 1.2 }, '<')
        // Slide 3 fades in
        .fromTo('.slide-3', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2 }, '<0.4')
        .fromTo('.slide-3 .fade-el', { y: 150 }, { y: 0, stagger: 0.02, duration: 1.2 }, '<0.2');

      // Step 3: Slide 3 active -> Scroll to Tree Drawing (treeAnimation)
      tl.to('.slide-3', { scale: 0.7, opacity: 0, duration: 1.2 })
        .to('.slide-3 .fade-el', { y: -150, stagger: 0.02, duration: 1.2 }, '<')
        // Video tree returns to circle center (scale 1.0, yPercent 0)
        .to('.banner-tree', { scale: 1.0, yPercent: 0, y: -60, duration: 1.2 }, '<')
        // Video tree fades out
        .to('.banner-tree', { opacity: 0, duration: 0.6 })
        
        // Drawing SVG tree triggers
        .set('.tree-svg', { display: 'block' }, '<')
        .to('.tree-circle', { scale: 0.7, duration: 0.8 }, '<')
        .to(bottomPathRef.current, { strokeDashoffset: 0, duration: 0.8 }, '<')
        .to(topPathRef.current, { strokeDashoffset: 0, duration: 0.6 })
        .to([leftPathRef.current, rightPathRef.current], { strokeDashoffset: 0, duration: 0.6 }, '<0.1')
        .to([leftTopPathRef.current, rightTopPathRef.current], { strokeDashoffset: 0, duration: 0.6 }, '<0.1')
        .to(branchesPathRef.current, { strokeDashoffset: 0, duration: 0.6 })
        // Grow tree elements
        .fromTo('.tree-title span', { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 })
        .fromTo('.tree-ball', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5 }, '<')
        // Fly in wings (butterfly wings)
        .fromTo('.tree-wings', { y: '50%', opacity: 0 }, { y: 0, opacity: 1, duration: 1.2 })
        // Soft flapping loop trigger
        .to('.tree-wings__top-left', { rotate: '-12deg', duration: 0.6 }, '<')
        .to('.tree-wings__top-right', { rotate: '12deg', duration: 0.6 }, '<')
        .to('.tree-wings__bottom-left', { rotate: '-8deg', duration: 0.6 }, '<')
        .to('.tree-wings__bottom-right', { rotate: '8deg', duration: 0.6 }, '<')
        .to('.tree-wings__top-left, .tree-wings__top-right, .tree-wings__bottom-left, .tree-wings__bottom-right', { rotate: 0, duration: 0.6 })
        .call(() => setHoverActive(true));
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Sound bars animation timeline
  const soundBarsRef = useRef([]);
  useEffect(() => {
    if (isAudioPlaying) {
      soundBarsRef.current.forEach((bar, i) => {
        gsap.to(bar, {
          height: i % 2 === 0 ? '24px' : '16px',
          duration: 0.4 + i * 0.1,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        });
      });
    } else {
      soundBarsRef.current.forEach(bar => {
        gsap.killTweensOf(bar);
        gsap.to(bar, { height: '8px', duration: 0.3 });
      });
    }
  }, [isAudioPlaying]);

  const toggleSound = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isAudioPlaying) {
      audio.pause();
      setIsAudioPlaying(false);
    } else {
      audio.play().catch(err => console.log('Audio playback blocked: ', err));
      setIsAudioPlaying(true);
    }
  };

  const handleTitleHover = (position) => {
    if (!hoverActive) return;
    setHoveredPosition(position);

    // Flap wings on hover
    gsap.to('.tree-wings__top-left', { rotate: '-25deg', duration: 0.35, ease: 'power2.out' });
    gsap.to('.tree-wings__top-right', { rotate: '25deg', duration: 0.35, ease: 'power2.out' });
    gsap.to('.tree-wings__bottom-left', { rotate: '-18deg', duration: 0.35, ease: 'power2.out' });
    gsap.to('.tree-wings__bottom-right', { rotate: '18deg', duration: 0.35, ease: 'power2.out' });
  };

  const handleTitleLeave = () => {
    setHoveredPosition(null);

    // Return wings to rest
    gsap.to('.tree-wings__top-left, .tree-wings__top-right, .tree-wings__bottom-left, .tree-wings__bottom-right', {
      rotate: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.4)'
    });
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        height: '300vh', // optimized scroll height for fast transitions
        position: 'relative',
        backgroundColor: '#E0D8EB', // soft desaturated violet
        width: '100%'
      }}
    >
      {/* Pinned viewport frame */}
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
        {/* Decorative background texture mix */}
        <div 
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: "url('https://cdn.zajno.com/dev/codepen/cicada/texture.png')",
            mixBlendMode: 'soft-light',
            opacity: 0.65,
            pointerEvents: 'none'
          }}
        />

        {/* Story Slides */}
        <div style={{ position: 'absolute', width: '90%', maxWidth: '850px', textAlign: 'center', zIndex: 10, pointerEvents: 'none' }}>
          {/* Slide 1 */}
          <h2 className="banner-slide slide-1" style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)', fontWeight: 600, color: '#341F37', lineHeight: 1.1, margin: 0, position: 'absolute', width: '100%', top: '50%', transform: 'translateY(-50%)' }}>
            <SplitTextHelper text="Discovering the future of stillness." />
          </h2>

          {/* Slide 2 */}
          <h2 className="banner-slide slide-2" style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)', fontWeight: 600, color: '#341F37', lineHeight: 1.1, margin: 0, opacity: 0, position: 'absolute', width: '100%', top: '50%', transform: 'translateY(-50%)' }}>
            <SplitTextHelper text="25 years of quiet sanctuaries." />
          </h2>

          {/* Slide 3 */}
          <p className="banner-slide slide-3" style={{ fontSize: 'clamp(1.15rem, 2.5vw, 1.75rem)', fontWeight: 500, color: '#341F37', lineHeight: 1.5, margin: 0, opacity: 0, position: 'absolute', width: '100%', top: '50%', transform: 'translateY(-50%)' }}>
            <SplitTextHelper text="Our mission is to restore your natural rhythm by blending sensory architecture with warm hospitality." />
          </p>
        </div>

        {/* Interactive Tree Section (Scaled to 900px for a massive tree visual) */}
        <div className="tree-wrapp" style={{ position: 'relative', width: '900px', height: '900px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Main Tree Video Background (Mock, scaled to 360px) */}
          <div className="banner-tree" style={{ position: 'absolute', width: '360px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }}>
            <video autoPlay muted loop style={{ width: '100%', borderRadius: '24px' }}>
              <source src="https://cdn.zajno.com/dev/codepen/cicada/cicada_tree.webm" type="video/webm" />
              <source src="https://cdn.zajno.com/dev/codepen/cicada/cicada_tree.mov" type="video/mp4" />
            </video>
          </div>

          {/* Stylized Vector Self-Drawing Tree */}
          <svg 
            className="tree-svg" 
            viewBox="0 0 400 400" 
            fill="none" 
            stroke="#341F37" 
            strokeLinecap="round"
            style={{ display: 'none', width: '100%', height: '100%', zIndex: 2, position: 'absolute', transform: 'translateY(-60px)' }}
          >
            {/* Trunk Bottom */}
            <path 
              ref={bottomPathRef}
              className="tree-svg__bottom" 
              d="M 200 340 L 200 250" 
              strokeWidth="10" 
              stroke={hoveredPosition ? 'var(--color-coral)' : '#341F37'}
              style={{ transition: 'stroke 0.4s' }}
            />
            {/* Trunk Top */}
            <path 
              ref={topPathRef}
              className="tree-svg__top" 
              d="M 200 250 L 200 150" 
              strokeWidth="8" 
              stroke={hoveredPosition ? 'var(--color-coral)' : '#341F37'}
              style={{ transition: 'stroke 0.4s' }}
            />
            {/* Branches */}
            <path 
              ref={leftPathRef}
              className="tree-svg__left" 
              d="M 200 270 C 160 270, 110 240, 90 200" 
              strokeWidth="6" 
              stroke={hoveredPosition === 'left' ? 'var(--color-coral)' : '#341F37'}
              style={{ transition: 'stroke 0.3s' }}
            />
            <path 
              ref={rightPathRef}
              className="tree-svg__right" 
              d="M 200 270 C 240 270, 290 240, 310 200" 
              strokeWidth="6" 
              stroke={hoveredPosition === 'right' ? 'var(--color-coral)' : '#341F37'}
              style={{ transition: 'stroke 0.3s' }}
            />
            <path 
              ref={leftTopPathRef}
              className="tree-svg__left-top" 
              d="M 200 190 C 160 190, 120 160, 100 110" 
              strokeWidth="5" 
              stroke={hoveredPosition === 'left-top' ? 'var(--color-coral)' : '#341F37'}
              style={{ transition: 'stroke 0.3s' }}
            />
            <path 
              ref={rightTopPathRef}
              className="tree-svg__right-top" 
              d="M 200 190 C 240 190, 280 160, 300 110" 
              strokeWidth="5" 
              stroke={hoveredPosition === 'right-top' ? 'var(--color-coral)' : '#341F37'}
              style={{ transition: 'stroke 0.3s' }}
            />
            <path 
              ref={branchesPathRef}
              className="tree-svg__branches" 
              d="M 200 150 C 175 110, 150 100, 130 100 M 200 150 C 225 110, 250 100, 270 100" 
              strokeWidth="3.5" 
              stroke={hoveredPosition === 'top' ? 'var(--color-coral)' : '#341F37'}
              style={{ transition: 'stroke 0.3s' }}
            />
          </svg>

          {/* Butterfly wings clustered around tree center */}
          <svg 
            className="tree-wings" 
            viewBox="0 0 400 400"
            style={{ 
              position: 'absolute', 
              width: '100%', 
              height: '100%', 
              zIndex: 1, 
              opacity: 0, 
              pointerEvents: 'none',
              transformOrigin: '200px 200px',
              transform: 'translateY(-60px)'
            }}
          >
            {/* Top Left Wing */}
            <path 
              className="tree-wings__top-left" 
              d="M 200 170 C 120 70, 40 100, 70 190 C 80 230, 170 190, 200 170" 
              fill="rgba(255, 183, 178, 0.75)" 
              style={{ transformOrigin: '200px 170px' }} 
            />
            {/* Top Right Wing */}
            <path 
              className="tree-wings__top-right" 
              d="M 200 170 C 280 70, 360 100, 330 190 C 320 230, 230 190, 200 170" 
              fill="rgba(255, 183, 178, 0.75)" 
              style={{ transformOrigin: '200px 170px' }} 
            />
            {/* Bottom Left Wing */}
            <path 
              className="tree-wings__bottom-left" 
              d="M 200 170 C 170 200, 90 250, 100 290 C 110 310, 180 230, 200 190" 
              fill="rgba(239, 237, 244, 0.75)" 
              style={{ transformOrigin: '200px 170px' }} 
            />
            {/* Bottom Right Wing */}
            <path 
              className="tree-wings__bottom-right" 
              d="M 200 170 C 230 200, 310 250, 300 290 C 290 310, 220 230, 200 190" 
              fill="rgba(239, 237, 244, 0.75)" 
              style={{ transformOrigin: '200px 170px' }} 
            />
          </svg>

          {/* Central Circular Aura Ring (Scaled to 460px) */}
          <div className="tree-circle" style={{ position: 'absolute', width: '460px', height: '460px', border: '1px solid #341F37', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(0)', zIndex: 1 }}></div>

          {/* Interactive Branch Titles & Indicator Balls (Adjusted for larger 900px container) */}
          {/* Top Node */}
          <div 
            className="tree-title tree-title_top"
            onMouseEnter={() => handleTitleHover('top')}
            onMouseLeave={handleTitleLeave}
            style={{ position: 'absolute', bottom: '660px', left: '50%', transform: 'translateX(-50%)', cursor: 'pointer', zIndex: 10 }}
          >
            <span style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, color: '#341F37' }}>mindfulness</span>
          </div>
          <div className="tree-ball tree-ball_top" style={{ position: 'absolute', bottom: '640px', left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
            <span style={{ display: 'block', width: '12px', height: '12px', backgroundColor: hoveredPosition === 'top' ? 'var(--color-coral)' : '#341F37', borderRadius: '50%', transition: 'background-color 0.3s, transform 0.3s', transform: hoveredPosition === 'top' ? 'scale(1.8)' : 'scale(1)' }}></span>
          </div>

          {/* Left Top Node */}
          <div 
            className="tree-title tree-title_left-top"
            onMouseEnter={() => handleTitleHover('left-top')}
            onMouseLeave={handleTitleLeave}
            style={{ position: 'absolute', top: '180px', left: '70px', cursor: 'pointer', zIndex: 10 }}
          >
            <span style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, color: '#341F37' }}>circadian cycle</span>
          </div>
          <div className="tree-ball tree-ball_left-top" style={{ position: 'absolute', top: '260px', left: '170px', zIndex: 5 }}>
            <span style={{ display: 'block', width: '12px', height: '12px', backgroundColor: hoveredPosition === 'left-top' ? 'var(--color-coral)' : '#341F37', borderRadius: '50%', transition: 'background-color 0.3s, transform 0.3s', transform: hoveredPosition === 'left-top' ? 'scale(1.8)' : 'scale(1)' }}></span>
          </div>

          {/* Right Top Node */}
          <div 
            className="tree-title tree-title_right-top"
            onMouseEnter={() => handleTitleHover('right-top')}
            onMouseLeave={handleTitleLeave}
            style={{ position: 'absolute', top: '180px', right: '70px', cursor: 'pointer', zIndex: 10 }}
          >
            <span style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, color: '#341F37' }}>sleep therapy</span>
          </div>
          <div className="tree-ball tree-ball_right-top" style={{ position: 'absolute', top: '260px', right: '170px', zIndex: 5 }}>
            <span style={{ display: 'block', width: '12px', height: '12px', backgroundColor: hoveredPosition === 'right-top' ? 'var(--color-coral)' : '#341F37', borderRadius: '50%', transition: 'background-color 0.3s, transform 0.3s', transform: hoveredPosition === 'right-top' ? 'scale(1.8)' : 'scale(1)' }}></span>
          </div>

          {/* Left Node */}
          <div 
            className="tree-title tree-title_left"
            onMouseEnter={() => handleTitleHover('left')}
            onMouseLeave={handleTitleLeave}
            style={{ position: 'absolute', bottom: '260px', left: '20px', cursor: 'pointer', zIndex: 10 }}
          >
            <span style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, color: '#341F37' }}>sensory design</span>
          </div>
          <div className="tree-ball tree-ball_left" style={{ position: 'absolute', bottom: '340px', left: '140px', zIndex: 5 }}>
            <span style={{ display: 'block', width: '12px', height: '12px', backgroundColor: hoveredPosition === 'left' ? 'var(--color-coral)' : '#341F37', borderRadius: '50%', transition: 'background-color 0.3s, transform 0.3s', transform: hoveredPosition === 'left' ? 'scale(1.8)' : 'scale(1)' }}></span>
          </div>

          {/* Right Node */}
          <div 
            className="tree-title tree-title_right"
            onMouseEnter={() => handleTitleHover('right')}
            onMouseLeave={handleTitleLeave}
            style={{ position: 'absolute', bottom: '260px', right: '20px', cursor: 'pointer', zIndex: 10 }}
          >
            <span style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, color: '#341F37' }}>digital detox</span>
          </div>
          <div className="tree-ball tree-ball_right" style={{ position: 'absolute', bottom: '340px', right: '140px', zIndex: 5 }}>
            <span style={{ display: 'block', width: '12px', height: '12px', backgroundColor: hoveredPosition === 'right' ? 'var(--color-coral)' : '#341F37', borderRadius: '50%', transition: 'background-color 0.3s, transform 0.3s', transform: hoveredPosition === 'right' ? 'scale(1.8)' : 'scale(1)' }}></span>
          </div>

        </div>
      </div>

      {/* Floating Sound Toggle Button */}
      <button 
        className={`sound ${isAudioPlaying ? 'active' : ''}`} 
        onClick={toggleSound}
        style={{
          position: 'fixed',
          bottom: '2.5rem',
          right: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          width: '56px',
          height: '56px',
          backgroundColor: '#341F37',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          overflow: 'hidden',
          zIndex: 100,
          boxShadow: '0 8px 24px rgba(52, 31, 55, 0.2)'
        }}
      >
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            ref={el => soundBarsRef.current[i] = el}
            className="sound-item"
            style={{
              width: '4px',
              height: '8px',
              borderRadius: '2px',
              backgroundColor: '#E0D8EB'
            }}
          />
        ))}
      </button>

      {/* Ambient Forest Sound Loop */}
      <audio 
        ref={audioRef} 
        loop 
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
      />
    </div>
  );
}
