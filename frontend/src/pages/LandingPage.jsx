import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, HelpCircle, Mail, MapPin, Compass, Sparkles, Star, Menu, X } from 'lucide-react';
import ScrollZoomReveal from '../components/ScrollZoomReveal';
import DepthBlurCarousel from '../components/DepthBlurCarousel';
import MwgEffect104 from '../components/MwgEffect104';
import MwgEffect000 from '../components/MwgEffect000';
import CicadaStoryteller from '../components/CicadaStoryteller';
import CircularGallery from '../components/CircularGallery';


const galleryItems = [
  { image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80", text: "deluxe oasis" },
  { image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80", text: "standard sanctuary" },
  { image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80", text: "lavender sleep" },
  { image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", text: "ocean penthouse" },
  { image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", text: "circadian cabin" }
];

/* ── FooterBrand ─────────────────────────────────────────────────────
   Pure CSS letter-reveal — zero GSAP overhead.
   IntersectionObserver fires once to add .visible class;
   hover re-triggers the animation by toggling the class.
──────────────────────────────────────────────────────────────────── */
const BRAND = 'luxurystay'.split('');

function FooterBrand() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const replay = () => {
    setVisible(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  };

  return (
    <div className="footer-brand-row">
      <div className="footer-brand-tagline">a sanctuary for soft living</div>

      <h2
        ref={ref}
        className={`footer-brand-title${visible ? ' visible' : ''}`}
        onMouseEnter={replay}
        aria-label="luxurystay"
      >
        {BRAND.map((letter, i) => (
          <span
            key={i}
            className="footer-brand-letter"
            style={{ '--i': i, '--total': BRAND.length }}
          >
            {letter}
          </span>
        ))}
      </h2>

      <div className="footer-brand-tagline footer-brand-tagline-right">2026 · mujtaba zadaii</div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState('');
  const [user, setUser] = useState(null);
  
  // Accordion active state
  const [activeFaq, setActiveFaq] = useState(null);

  // Mobile menu active state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Image cycler active indices mapped by card index
  const [cardImageIndices, setCardImageIndices] = useState({});

  const handleCardMouseMove = (e, index, imagesLength) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const imgIdx = Math.min(
      imagesLength - 1,
      Math.floor((x / width) * imagesLength)
    );
    setCardImageIndices(prev => ({ ...prev, [index]: imgIdx }));
  };

  const handleCardMouseLeave = (index) => {
    setCardImageIndices(prev => ({ ...prev, [index]: 0 }));
  };

  // Check login status on load
  useEffect(() => {
    const loggedUser = localStorage.getItem('user');
    if (loggedUser) {
      try {
        setUser(JSON.parse(loggedUser));
      } catch (e) {
        // Clear corrupt storage
        localStorage.clear();
      }
    }
  }, []);

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setWaitlistStatus('Thank you for joining our waitlist! We will touch base soon.');
    setEmail('');
    setTimeout(() => setWaitlistStatus(''), 5000);
  };

  const faqs = [
    {
      q: "What makes LuxuryStay a digital living room?",
      a: "We believe hospitality should feel analog and mindful. Our services, lighting, and room amenities are designed to support digital detoxing, relaxation, and physical presence."
    },
    {
      q: "How does the in-room wellness system work?",
      a: "Every room features tactile controls, smart-glass windows that mimic natural circadian rhythms, and offline entertainment options such as a curated paperback library and record player."
    },
    {
      q: "Can I request assistance without opening my phone?",
      a: "Yes. Every room is equipped with a classic rotary-dial guest services telephone that connects you directly with our front desk receptionist for analog service requests."
    },
    {
      q: "Are the wellness activities included in my stay?",
      a: "Absolutely. Guests have 24/7 access to our hot-spring baths, sensory gardens, daily slow-yoga sessions, and sound bath meditations."
    }
  ];

  const sanctuaries = [
    {
      title: "standard sanctuary",
      subtitle: "rest room 101",
      images: [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=85",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=85",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=85"
      ]
    },
    {
      title: "sage deluxe oasis",
      subtitle: "balcony room 201",
      images: [
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=85",
        "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=600&q=85",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=85"
      ]
    },
    {
      title: "lavender sleep suite",
      subtitle: "executive room 301",
      images: [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=85",
        "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=85",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=85"
      ]
    },
    {
      title: "grand ocean penthouse",
      subtitle: "vip floor 401",
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=85",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=85",
        "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=85"
      ]
    },
    {
      title: "circadian log cabin",
      subtitle: "forest villa 108",
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=85",
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=85",
        "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=600&q=85"
      ]
    }
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Paper Grain Overlay */}
      <div className="grain-overlay"></div>

      {/* Floating Background Blobs */}
      <div className="background-blobs">
        <div className="blob blob-pink"></div>
        <div className="blob blob-purple"></div>
        <div className="blob blob-sage"></div>
      </div>

      {/* Floating Pill Nav Bar */}
      <nav className="floating-nav">
        <Link to="/" className="nav-logo">
          <div className="nav-dot"></div>
          <span>luxurystay</span>
        </Link>
        <div className="nav-links">
          <a href="#experience" className="nav-link">experience</a>
          <a href="#scenarios" className="nav-link">scenarios</a>
          <a href="#testimonials" className="nav-link">notes</a>
          <a href="#faq" className="nav-link">faq</a>
        </div>
        {user ? (
          <Link to="/dashboard" className="nav-btn">dashboard</Link>
        ) : (
          <Link to="/login" className="nav-btn">sign in</Link>
        )}
        
        {/* Mobile Menu Toggler */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Navigation Dropdown Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-links">
            <a href="#experience" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>experience</a>
            <a href="#scenarios" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>scenarios</a>
            <a href="#testimonials" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>notes</a>
            <a href="#faq" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>faq</a>
            {user ? (
              <Link to="/dashboard" className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(false)}>dashboard</Link>
            ) : (
              <Link to="/login" className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(false)}>sign in</Link>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="container section-padding" style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: 'var(--color-dark)', marginBottom: '1.5rem', maxWidth: '800px', margin: '0 auto 1.5rem auto' }}>
            a space built to <span className="font-handwritten" style={{ color: 'var(--color-coral)', fontSize: '1.15em' }}>breathe</span> and slow down.
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-muted)', maxWidth: '500px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
            welcome to your digital living room.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            {user ? (
              <Link to="/dashboard" className="btn-primary">
                go to dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <Link to="/register" className="btn-primary">
                reserve your stay <ArrowRight size={18} />
              </Link>
            )}
            <a href="#experience" className="btn-secondary">explore rooms</a>
          </div>

          {/* Interactive WebGL Circular Gallery */}
          <div 
            className="hero-gallery-container relative w-full overflow-hidden rounded-[32px] border border-[rgba(41,37,36,0.05)] bg-[rgba(253,252,248,0.2)] backdrop-blur-sm shadow-[0_30px_70px_rgba(0,0,0,0.04)]"
            style={{ height: '480px' }}
          >
            <CircularGallery 
              items={galleryItems}
              bend={2.5}
              textColor="#292524"
              borderRadius={0.06}
              scrollEase={0.12}
              scrollSpeed={5}
              font="bold 24px Outfit, sans-serif"
            />
          </div>
        </motion.div>
      </header>

      {/* App Experience Preview Section */}
      <section id="experience" className="container section-padding" style={{ position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>the mobile wellness companion</h2>
          <p style={{ color: 'var(--color-muted)', maxWidth: '550px', margin: '0 auto' }}>
            Manage your entire stay from our tactile guest portal. Request morning teas, dim your smart lighting, or schedule yoga sessions with simple taps.
          </p>
        </div>

        {/* 3-Phone Cascade Layout */}
        <div className="cascade-wrapper">
          {/* Left Phone: Sage Accent */}
          <motion.div 
            className="phone-mockup phone-mockup-left"
            initial={{ opacity: 0, x: -100, rotate: -5 }}
            whileInView={{ opacity: 0.85, x: 0, rotate: -3 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>08:15 AM</span>
                <Compass size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', tracking: '0.1em', color: 'var(--color-muted)' }}>morning session</span>
                <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem', marginBottom: '1rem' }}>grounding meditation</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', lineHeight: '1.4' }}>A 15-minute gentle sound bath in the central garden to welcome the sun.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.4)', padding: '0.75rem', borderRadius: '15px', fontSize: '0.8rem', textAlign: 'center' }}>
                Joined by 14 guests today
              </div>
            </div>
          </motion.div>

          {/* Center Phone: Opaque, Coral 'Breathe' Button */}
          <div className="phone-mockup phone-mockup-center">
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', padding: '1.5rem 1rem' }}>
              <div className="flex-between">
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>luxurystay</span>
                <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-coral)', borderRadius: '50%' }}></div>
              </div>
              
              <div className="flex-center" style={{ flexDirection: 'column', flex: 1 }}>
                {/* Pulsing Breathe button */}
                <motion.button 
                  className="flex-center"
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--color-coral)', 
                    border: 'none',
                    color: 'var(--color-dark)',
                    fontFamily: 'var(--font-primary)',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(255, 183, 178, 0.4)'
                  }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                >
                  breathe
                </motion.button>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '1.5rem' }}>tap to sync breath in-room</span>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '0.875rem', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-sage)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☕</div>
                <div style={{ fontSize: '0.75rem', textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold' }}>room service request</div>
                  <div style={{ color: 'var(--color-muted)' }}>herbal tea on the way to Room 201</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Phone: Lavender Accent */}
          <motion.div 
            className="phone-mockup phone-mockup-right"
            initial={{ opacity: 0, x: 100, rotate: 5 }}
            whileInView={{ opacity: 0.85, x: 0, rotate: 3 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', padding: '1rem' }}>
              <div className="flex-between">
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>09:30 PM</span>
                <Sparkles size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-muted)' }}>curated sleep</span>
                <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem', marginBottom: '1rem' }}>nighttime routine</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', lineHeight: '1.4' }}>Circadian lighting will automatically shift to low-red amber in 15 minutes.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.4)', padding: '0.75rem', borderRadius: '15px', fontSize: '0.8rem', textAlign: 'center' }}>
                Active (Offline Mode)
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Curved Infinite Loop Panorama Showcase */}
      <section id="scenarios" className="curved-carousel-wrapper">
        <div className="container" style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>explore our sanctuaries</h2>
          <p style={{ color: 'var(--color-muted)', maxWidth: '500px', margin: '0 auto' }}>
            Hover to view the glowing crystal shadow. Move your cursor across the cards to quickly preview different room angles.
          </p>
        </div>

        <div className="curved-carousel-track">
          {[...sanctuaries, ...sanctuaries].map((sc, i) => {
            const activeImgIdx = cardImageIndices[i] || 0;
            return (
              <div 
                key={i} 
                className="crystal-card"
                onMouseMove={(e) => handleCardMouseMove(e, i, sc.images.length)}
                onMouseLeave={() => handleCardMouseLeave(i)}
              >
                {/* Crystal Shadow Glow Layer */}
                <div className="crystal-card-glow"></div>

                <div className="crystal-img-wrapper">
                  <img 
                    src={sc.images[activeImgIdx]} 
                    alt={sc.title} 
                    className="crystal-img"
                  />
                </div>
                
                <div className="crystal-info">
                  <span className="crystal-title">{sc.title}</span>
                  <span className="crystal-subtitle">{sc.subtitle}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Diary Entry Testimonials */}
      <section id="testimonials" className="container section-padding">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>written notes from the bedside</h2>
          <p style={{ color: 'var(--color-muted)' }}>Letters left on writing desks by guests who found peace here.</p>
        </div>

        <div className="diary-grid">
          <div className="diary-card diary-card-rot-left">
            <p className="diary-content">
              “For the first time in years, I left my laptop in my suitcase for three full days. Sitting on the balcony watching the sunrise with sage tea was exactly what my nervous system needed.”
            </p>
            <div className="diary-footer">
              <div className="diary-line"></div>
              <span className="diary-author">Eleanor Vance</span>
            </div>
          </div>

          <div className="diary-card diary-card-rot-right">
            <p className="diary-content">
              “The paper-like styling of their digital check-in interface set the mood before I even arrived. And the physical rotary phones to request fresh towels was a whimsical, analog dream!”
            </p>
            <div className="diary-footer">
              <div className="diary-line"></div>
              <span className="diary-author">Marcus Sterling</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section id="faq" className="container section-padding" style={{ backgroundColor: 'rgba(239, 237, 244, 0.3)', borderRadius: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>frequently asked questions</h2>
          <p style={{ color: 'var(--color-muted)' }}>All the small details about your mindful stay.</p>
        </div>

        <div className="accordion-wrapper">
          {faqs.map((faq, i) => (
            <div key={i} className="accordion-item">
              <div 
                className="accordion-header" 
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <span>{faq.q}</span>
                <span className={`accordion-icon ${activeFaq === i ? 'accordion-icon-active' : ''}`} style={{ fontSize: '1.5rem', fontWeight: 300 }}>+</span>
              </div>
              <div className={`accordion-content ${activeFaq === i ? 'accordion-content-open' : ''}`}>
                <div className="accordion-body">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Morphing Path Segment Animation Section */}
      <MwgEffect104 />

      {/* Media Inertia Gallery Section */}
      <MwgEffect000 />

      {/* Drawing Tree & Butterfly Storytelling Section */}
      <CicadaStoryteller />

      {/* Waitlist Conversion Form */}
      <section className="container section-padding">
        <div className="waitlist-card">
          <div className="waitlist-icon">
            <div className="waitlist-dot"></div>
            <Mail size={24} style={{ color: '#fff' }} />
          </div>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>join the quiet circle</h2>
          <p style={{ color: 'var(--color-muted)', maxWidth: '400px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Sign up to receive invitations to our seasonal wellness retreats, slow living tips, and opening updates.
          </p>

          <form className="waitlist-form" onSubmit={handleWaitlistSubmit}>
            <input 
              type="email" 
              placeholder="Your email address" 
              className="waitlist-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="waitlist-btn">
              subscribe to quiet
            </button>
          </form>
          {waitlistStatus && (
            <p style={{ marginTop: '1.5rem', color: 'var(--color-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>{waitlistStatus}</p>
          )}
        </div>
      </section>

      {/* ═══ Premium Footer ═══ */}
      <footer className="site-footer">

        {/* Brand Headline — CSS-only letter reveal, zero JS overhead */}
        <FooterBrand />

        {/* Decorative divider */}
        <div className="footer-divider">
          <span className="footer-divider-dot" />
          <div className="footer-divider-line" />
          <span className="footer-divider-dot" />
        </div>

        {/* 4-Column Grid */}
        <div className="footer-grid">

          {/* Col 1 – About */}
          <div className="footer-col">
            <div className="footer-col-label">about us</div>
            <p className="footer-col-desc">
              LuxuryStay blends digital minimalism with warm hospitality — a curated retreat where technology steps aside and presence begins.
            </p>
            <div className="footer-coral-badge">✦ digital living room</div>
          </div>

          {/* Col 2 – Navigate */}
          <div className="footer-col">
            <div className="footer-col-label">navigate</div>
            <ul className="footer-links">
              <li><a href="#experience" className="footer-link">the experience</a></li>
              <li><a href="#scenarios" className="footer-link">our sanctuaries</a></li>
              <li><a href="#testimonials" className="footer-link">guest notes</a></li>
              <li><a href="#faq" className="footer-link">faq</a></li>
              <li><Link to="/register" className="footer-link">reserve a stay</Link></li>
            </ul>
          </div>

          {/* Col 3 – Experiences */}
          <div className="footer-col">
            <div className="footer-col-label">experiences</div>
            <ul className="footer-links">
              <li><span className="footer-link-static">✦ hot-spring baths</span></li>
              <li><span className="footer-link-static">✦ sensory gardens</span></li>
              <li><span className="footer-link-static">✦ slow-yoga sessions</span></li>
              <li><span className="footer-link-static">✦ sound bath meditations</span></li>
              <li><span className="footer-link-static">✦ circadian light rooms</span></li>
            </ul>
          </div>

          {/* Col 4 – Connect */}
          <div className="footer-col">
            <div className="footer-col-label">connect</div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">✉</span>
              <span>hello@luxurystay.com</span>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">✆</span>
              <span>+1 (800) 000-STAY</span>
            </div>
            <div className="footer-contact-item">
              <span className="footer-contact-icon">◎</span>
              <span>12 Quiet Lane, Serenity Valley</span>
            </div>
            <div className="footer-social-row">
              <a href="#" className="footer-social-btn" aria-label="Instagram">ig</a>
              <a href="#" className="footer-social-btn" aria-label="Pinterest">pt</a>
              <a href="#" className="footer-social-btn" aria-label="Twitter">tw</a>
              <a href="#" className="footer-social-btn" aria-label="LinkedIn">in</a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span className="footer-bottom-copy">
            &copy; 2026 LuxuryStay Hospitality · Built by Mujtaba Zadaii
          </span>
          <div className="footer-bottom-dots">
            <span /><span /><span />
          </div>
          <span className="footer-bottom-copy">made with care for soft living.</span>
        </div>

      </footer>
    </div>
  );
}
