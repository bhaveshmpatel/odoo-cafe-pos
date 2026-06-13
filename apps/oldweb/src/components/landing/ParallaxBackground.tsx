'use client';

import { useEffect, useRef } from 'react';

export default function ParallaxBackground() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // JS Fallback for browsers that don't support animation-timeline
    if (typeof window !== 'undefined' && !CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      
      const layers = wrapper.querySelectorAll<HTMLElement>('.parallax-layer');
      
      const onScroll = () => {
        const scrollY = window.scrollY;
        
        layers.forEach((layer, index) => {
          // Calculate an offset based on index
          const initialTranslateY = 100 * (index + 1);
          // Very simple fallback parallax math
          const translateY = initialTranslateY - (scrollY * (0.2 + (index * 0.1)));
          layer.style.transform = `translateY(${translateY}px)`;
        });
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            window.addEventListener('scroll', onScroll, { passive: true });
          } else {
            window.removeEventListener('scroll', onScroll);
          }
        });
      }, { threshold: 0 });

      observer.observe(wrapper);
      
      // Trigger once to set initial state
      onScroll();

      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', onScroll);
      };
    }
  }, []);

  return (
    <div 
      ref={wrapperRef} 
      className="absolute inset-0 overflow-hidden pointer-events-none z-0 hero-parallax-wrapper"
    >
      {/* Decorative Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-accent/20 blur-[100px] animate-pulse-glow" />
      <div className="absolute top-[20%] right-[-5%] w-[35%] h-[35%] rounded-full bg-violet-500/20 blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: '4s' }} />

      {/* CSS Driven Parallax Layers */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes hero-parallax {
          from { transform: translateY(calc(150px * var(--parallax-index, 1))); }
        }
        .hero-parallax-wrapper {
          view-timeline-name: --hero-wrapper;
        }
        .parallax-layer {
          animation: hero-parallax linear both;
          animation-timeline: --hero-wrapper;
          /* Default range */
          animation-range: entry 0% exit 100%;
        }
        @media (prefers-reduced-motion: reduce) {
          .parallax-layer { animation: none !important; }
        }
      `}} />

      {/* Abstract Shape 1 */}
      <div 
        className="parallax-layer absolute top-[15%] right-[10%] w-32 h-32 rounded-3xl bg-gradient-to-br from-brand-accent/30 to-violet-500/30 border border-canvas/20 backdrop-blur-3xl shadow-glow rotate-12"
        style={{ '--parallax-index': 1 } as React.CSSProperties}
      />
      
      {/* Abstract Shape 2 */}
      <div 
        className="parallax-layer absolute top-[40%] left-[5%] w-24 h-24 rounded-full bg-gradient-to-br from-success/30 to-emerald-500/30 border border-canvas/20 backdrop-blur-3xl shadow-glow -rotate-12"
        style={{ '--parallax-index': 2 } as React.CSSProperties}
      />
      
      {/* Abstract Shape 3 */}
      <div 
        className="parallax-layer absolute bottom-[20%] right-[20%] w-40 h-40 rounded-2xl bg-gradient-to-tr from-warning/20 to-orange-500/20 border border-canvas/20 backdrop-blur-3xl shadow-glow rotate-45"
        style={{ '--parallax-index': 1.5 } as React.CSSProperties}
      />
    </div>
  );
}
