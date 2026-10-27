'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export default function IntroSequence() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;

    const update = () => {
      frame = 0;
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = reduceMotion ? 0 : clamp(-section.getBoundingClientRect().top / distance);
      const opening = clamp(1 - progress / 0.54);
      const mission = clamp((progress - 0.36) / 0.44);
      const bridge = clamp(1 - Math.abs(progress - 0.43) / 0.3);
      section.style.setProperty('--signature-y', `${progress * -26}vh`);
      section.style.setProperty('--signature-rotation', `${-2 - progress * 4}deg`);
      section.style.setProperty('--signature-scale', `${1 - progress * 0.26}`);
      section.style.setProperty('--signature-opacity', opening.toFixed(4));
      section.style.setProperty('--title-y', `${progress * -35}vh`);
      section.style.setProperty('--title-scale', `${1 - progress * 0.065}`);
      section.style.setProperty('--title-opacity', opening.toFixed(4));
      section.style.setProperty('--bridge-opacity', bridge.toFixed(4));
      section.style.setProperty('--bridge-y', `${(progress - 0.5) * -7}vh`);
      section.style.setProperty('--bridge-scale', clamp((progress - 0.12) / 0.46).toFixed(4));
      section.style.setProperty('--mission-opacity', mission.toFixed(4));
      section.style.setProperty('--mission-y', `${(1 - mission) * 22}vh`);
      section.style.setProperty('--cue-opacity', clamp(1 - progress / 0.2).toFixed(4));
      section.style.setProperty('--cue-y', `${progress * 24}px`);
      window.dispatchEvent(new CustomEvent('intro-motion', { detail: progress }));
    };
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  return (
    <section ref={sectionRef} className="intro-sequence" id="top" data-intro-sequence data-atmosphere-opacity="0.68">
      <div className="intro-sticky">
        <div className="hero-opening">
          <div className="signature" role="img" aria-label="Cheney handwritten signature">
            <Image className="signature-art signature-art-thin" src="/assets/signature-hand.svg" alt="" width={1131} height={346} priority />
            <Image className="signature-art signature-art-bold" src="/assets/signature-hand-bold.svg" alt="" width={1137} height={351} priority />
          </div>
          <div className="hero-title-block">
            <p className="hero-kicker">INDUSTRIAL DESIGN · VISUAL DIRECTION</p>
            <h1>DESIGNING OBJECTS<br />WITH A POINT OF VIEW.</h1>
          </div>
        </div>

        <div className="intro-bridge" aria-hidden="true"><span>SCROLL TO CONNECT</span><i /></div>

        <div className="intro-mission">
          <p className="eyebrow">DESIGN APPROACH / 设计方法</p>
          <p className="statement-copy">FROM AN IDEA<br />TO AN OBJECT<span>—</span><br />CLEAR, USEFUL<br />AND DISTINCT.</p>
          <div className="statement-note"><span>FORM</span><span>FUNCTION</span><span>IDENTITY</span></div>
        </div>

        <a className="scroll-cue" href="#work" aria-label="View selected work"><b aria-hidden="true"><Image className="home-scroll-arrow" src="/assets/arrow-1.svg" alt="" width={22} height={14} /></b></a>
      </div>
    </section>
  );
}
