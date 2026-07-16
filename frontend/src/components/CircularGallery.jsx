/**
 * CircularGallery — Performant WebGL gallery with subtle scroll-reactive wave
 *
 * Perf notes:
 * - DPR locked to 1 (no 4× overdraw on Retina)
 * - Geometry: 15×30 segments (visible wave, minimal vertices)
 * - Wave shader: displaces z only when scrolling (uSpeed), not every frame
 * - mediump precision throughout
 * - Container-scoped wheel/touch listeners (no global window wheel)
 * - Passive all touch events
 */
import React, { useEffect, useRef } from 'react';
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';

function lerp(a, b, t) { return a + (b - a) * t; }

function createTextTexture(gl, text, font, color) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = font;
  const tw = Math.ceil(ctx.measureText(text).width) + 24;
  const fs = parseInt(font.match(/(\d+)px/)?.[1] ?? '24', 10);
  const th = Math.ceil(fs * 1.4) + 12;
  canvas.width = tw; canvas.height = th;
  ctx.font = font; ctx.fillStyle = color;
  ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  ctx.fillText(text, tw / 2, th / 2);
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: tw, height: th };
}

class Title {
  constructor({ gl, plane, text, textColor, font }) {
    const { texture, width, height } = createTextTexture(gl, text, font, textColor);
    const geometry = new Plane(gl);
    const program = new Program(gl, {
      vertex: `attribute vec3 position;attribute vec2 uv;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragment: `precision mediump float;uniform sampler2D tMap;varying vec2 vUv;void main(){vec4 c=texture2D(tMap,vUv);if(c.a<0.1)discard;gl_FragColor=c;}`,
      uniforms: { tMap: { value: texture } },
      transparent: true
    });
    this.mesh = new Mesh(gl, { geometry, program });
    const aspect = width / height;
    const h = plane.scale.y * 0.13;
    this.mesh.scale.set(h * aspect, h, 1);
    this.mesh.position.y = -plane.scale.y * 0.5 - h * 0.5 - 0.05;
    this.mesh.setParent(plane);
  }
}

class Media {
  constructor({ geometry, gl, image, index, length, scene, screen, text, viewport, bend, textColor, borderRadius, font }) {
    this.extra = 0;
    this.gl = gl;
    this.index = index;
    this.length = length;
    this.screen = screen;
    this.viewport = viewport;
    this.bend = bend;

    const texture = new Texture(gl, { generateMipmaps: false });

    this.program = new Program(gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision mediump float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main(){
          vUv = uv;
          vec3 p = position;
          /* Subtle wave — amplitude scales with abs(speed), so still when idle */
          float wave = sin(p.x * 3.0 + uTime * 2.0) * 0.5 + cos(p.y * 2.5 + uTime * 1.5) * 0.5;
          p.z += wave * clamp(abs(uSpeed) * 0.6, 0.0, 0.35);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision mediump float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        float rBox(vec2 p,vec2 b,float r){vec2 d=abs(p)-b;return length(max(d,vec2(0.0)))+min(max(d.x,d.y),0.0)-r;}
        void main(){
          vec2 ratio=vec2(
            min((uPlaneSizes.x/uPlaneSizes.y)/(uImageSizes.x/uImageSizes.y),1.0),
            min((uPlaneSizes.y/uPlaneSizes.x)/(uImageSizes.y/uImageSizes.x),1.0)
          );
          vec2 uv=vec2(vUv.x*ratio.x+(1.0-ratio.x)*0.5,vUv.y*ratio.y+(1.0-ratio.y)*0.5);
          vec4 color=texture2D(tMap,uv);
          float d=rBox(vUv-0.5,vec2(0.5-uBorderRadius),uBorderRadius);
          float alpha=1.0-smoothstep(-0.002,0.002,d);
          gl_FragColor=vec4(color.rgb,alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: Math.random() * 100 },
        uBorderRadius: { value: borderRadius }
      },
      transparent: true
    });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };

    this.plane = new Mesh(gl, { geometry, program: this.program });
    this.plane.setParent(scene);
    new Title({ gl, plane: this.plane, text, textColor, font });
    this.onResize();
  }

  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend !== 0) {
      const B = Math.abs(this.bend);
      const R = (H * H + B * B) / (2 * B);
      const ex = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(R * R - ex * ex);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(ex / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(ex / R);
      }
    }

    const speed = scroll.current - scroll.last;
    /* Only update time when actually scrolling to save CPU when idle */
    if (Math.abs(speed) > 0.001) {
      this.program.uniforms.uTime.value += 0.05;
    }
    this.program.uniforms.uSpeed.value = lerp(this.program.uniforms.uSpeed.value, speed, 0.1);

    const po = this.plane.scale.x / 2;
    const vo = this.viewport.width / 2;
    if (direction === 'right' && this.plane.position.x + po < -vo) this.extra -= this.widthTotal;
    if (direction === 'left' && this.plane.position.x - po > vo) this.extra += this.widthTotal;
  }

  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) this.viewport = viewport;
    const scale = this.screen.height / 1500;
    this.plane.scale.y = (this.viewport.height * (900 * scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (700 * scale)) / this.screen.width;
    this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = 2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class AppCore {
  constructor(container, { items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase }) {
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.isDown = false;
    this.startX = 0;
    this.scrollPos = 0;
    this.raf = 0;
    this.medias = [];

    // Renderer — DPR=1 always for performance
    this.renderer = new Renderer({ alpha: true, antialias: false, dpr: 1 });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    const canvas = this.renderer.gl.canvas;
    canvas.style.cssText = 'display:block;width:100%;height:100%;';
    container.appendChild(canvas);

    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
    this.scene = new Transform();

    this._onResize();

    // 15×30 segments — enough for smooth wave, small vertex count
    const geo = new Plane(this.gl, { heightSegments: 15, widthSegments: 30 });

    const defaults = [
      { image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=75', text: 'deluxe oasis' },
      { image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=75', text: 'standard sanctuary' },
      { image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=75', text: 'lavender sleep' },
      { image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=75', text: 'ocean penthouse' },
      { image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=75', text: 'circadian cabin' }
    ];
    const list = (items?.length) ? items : defaults;
    const all = [...list, ...list];
    this.medias = all.map((d, i) => new Media({
      geometry: geo, gl: this.gl, image: d.image, index: i,
      length: all.length, scene: this.scene, screen: this.screen,
      text: d.text, viewport: this.viewport, bend, textColor, borderRadius, font
    }));

    this._bindEvents();
    this._loop();
  }

  _onResize() {
    this.screen = { width: this.container.clientWidth, height: this.container.clientHeight };
    if (this.renderer) this.renderer.setSize(this.screen.width, this.screen.height);
    if (this.camera) {
      this.camera.perspective({ aspect: this.screen.width / this.screen.height });
      const fov = (this.camera.fov * Math.PI) / 180;
      const h = 2 * Math.tan(fov / 2) * this.camera.position.z;
      this.viewport = { width: h * this.camera.aspect, height: h };
    }
    this.medias?.forEach(m => m.onResize({ screen: this.screen, viewport: this.viewport }));
  }

  _onWheel(e) {
    e.stopPropagation();
    const delta = e.deltaY || e.detail || e.wheelDelta;
    this.scroll.target += (delta > 0 ? 1 : -1) * this.scrollSpeed * 0.3;
  }

  _onDown(e) {
    this.isDown = true;
    this.scrollPos = this.scroll.current;
    this.startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  }

  _onMove(e) {
    if (!this.isDown) return;
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    this.scroll.target = this.scrollPos + (this.startX - x) * this.scrollSpeed * 0.04;
  }

  _onUp() { this.isDown = false; }

  _bindEvents() {
    const el = this.container;
    this._rh = this._onResize.bind(this);
    this._wh = this._onWheel.bind(this);
    this._dh = this._onDown.bind(this);
    this._mh = this._onMove.bind(this);
    this._uh = this._onUp.bind(this);
    window.addEventListener('resize', this._rh);
    el.addEventListener('wheel', this._wh, { passive: true });
    el.addEventListener('mousedown', this._dh);
    window.addEventListener('mousemove', this._mh);
    window.addEventListener('mouseup', this._uh);
    el.addEventListener('touchstart', this._dh, { passive: true });
    el.addEventListener('touchmove', this._mh, { passive: true });
    el.addEventListener('touchend', this._uh, { passive: true });
  }

  _loop() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const dir = this.scroll.current > this.scroll.last ? 'right' : 'left';
    this.medias.forEach(m => m.update(this.scroll, dir));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = requestAnimationFrame(this._loop.bind(this));
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    const el = this.container;
    window.removeEventListener('resize', this._rh);
    el.removeEventListener('wheel', this._wh);
    el.removeEventListener('mousedown', this._dh);
    window.removeEventListener('mousemove', this._mh);
    window.removeEventListener('mouseup', this._uh);
    el.removeEventListener('touchstart', this._dh);
    el.removeEventListener('touchmove', this._mh);
    el.removeEventListener('touchend', this._uh);
    if (this.gl?.canvas?.parentNode) this.gl.canvas.parentNode.removeChild(this.gl.canvas);
  }
}

export function CircularGallery({
  items,
  bend = 2.5,
  textColor = '#292524',
  borderRadius = 0.06,
  font = 'bold 24px Outfit, sans-serif',
  scrollSpeed = 5,
  scrollEase = 0.12,
  className = ''
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const app = new AppCore(ref.current, { items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase });
    return () => app.destroy();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: 'grab',
        touchAction: 'pan-y',
        willChange: 'transform'
      }}
      className={className}
    />
  );
}

export default CircularGallery;
