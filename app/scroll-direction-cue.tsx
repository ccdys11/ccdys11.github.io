'use client';

import { useEffect, useRef } from 'react';

const EDGE_SIZE = 11;
const MIN_THUMB_HEIGHT = 42;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function ScrollDirectionCue() {
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const thumbRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const scrollbar = scrollbarRef.current;
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!scrollbar || !track || !thumb) return;

    let lastScrollY = window.scrollY;
    let hideTimer = 0;
    let frame = 0;
    let dragPointerId: number | null = null;
    let dragOriginY = 0;
    let dragOriginScroll = 0;

    const getMetrics = () => {
      const root = document.documentElement;
      const pageHeight = Math.max(root.scrollHeight, document.body.scrollHeight);
      const viewportHeight = window.innerHeight;
      const trackHeight = Math.max(1, viewportHeight - EDGE_SIZE * 2);
      const thumbHeight = Math.min(trackHeight, Math.max(MIN_THUMB_HEIGHT, trackHeight * (viewportHeight / pageHeight)));
      const scrollRange = Math.max(0, pageHeight - viewportHeight);
      const thumbTravel = Math.max(0, trackHeight - thumbHeight);
      return { scrollRange, thumbHeight, thumbTravel };
    };

    const updateThumb = () => {
      frame = 0;
      const { scrollRange, thumbHeight, thumbTravel } = getMetrics();
      const progress = scrollRange > 0 ? clamp(window.scrollY / scrollRange, 0, 1) : 0;
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translate3d(0,${thumbTravel * progress}px,0)`;
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateThumb);
    };

    const showDirection = (direction: 'up' | 'down') => {
      scrollbar.dataset.direction = direction;
      scrollbar.classList.add('is-scrolling');
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => scrollbar.classList.remove('is-scrolling'), 180);
    };

    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      if (nextScrollY !== lastScrollY) {
        showDirection(nextScrollY > lastScrollY ? 'down' : 'up');
        lastScrollY = nextScrollY;
      }
      requestUpdate();
    };

    const stopDragging = (pointerId: number) => {
      if (dragPointerId !== pointerId) return;
      if (track.hasPointerCapture(pointerId)) track.releasePointerCapture(pointerId);
      dragPointerId = null;
      scrollbar.classList.remove('is-dragging');
      document.documentElement.classList.remove('is-scrollbar-dragging');
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      event.preventDefault();
      const metrics = getMetrics();
      const target = event.target as HTMLElement;

      document.documentElement.classList.add('is-scrollbar-dragging');
      scrollbar.classList.add('is-dragging');
      track.setPointerCapture(event.pointerId);
      dragPointerId = event.pointerId;

      if (!target.closest('.portfolio-scrollbar-thumb')) {
        const trackRect = track.getBoundingClientRect();
        const offset = clamp(event.clientY - trackRect.top - metrics.thumbHeight / 2, 0, metrics.thumbTravel);
        const nextScrollY = metrics.thumbTravel > 0 ? (offset / metrics.thumbTravel) * metrics.scrollRange : 0;
        if (nextScrollY !== window.scrollY) showDirection(nextScrollY > window.scrollY ? 'down' : 'up');
        window.scrollTo(0, nextScrollY);
        updateThumb();
      }

      dragOriginY = event.clientY;
      dragOriginScroll = window.scrollY;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (dragPointerId !== event.pointerId) return;
      const { scrollRange, thumbTravel } = getMetrics();
      if (thumbTravel <= 0) return;
      const nextScrollY = clamp(dragOriginScroll + ((event.clientY - dragOriginY) / thumbTravel) * scrollRange, 0, scrollRange);
      if (nextScrollY !== window.scrollY) showDirection(nextScrollY > window.scrollY ? 'down' : 'up');
      window.scrollTo(0, nextScrollY);
      updateThumb();
    };

    const handlePointerEnd = (event: PointerEvent) => stopDragging(event.pointerId);

    const resizeObserver = new ResizeObserver(requestUpdate);
    resizeObserver.observe(document.body);
    updateThumb();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    track.addEventListener('pointerdown', handlePointerDown);
    track.addEventListener('pointermove', handlePointerMove);
    track.addEventListener('pointerup', handlePointerEnd);
    track.addEventListener('pointercancel', handlePointerEnd);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(hideTimer);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', requestUpdate);
      track.removeEventListener('pointerdown', handlePointerDown);
      track.removeEventListener('pointermove', handlePointerMove);
      track.removeEventListener('pointerup', handlePointerEnd);
      track.removeEventListener('pointercancel', handlePointerEnd);
      document.documentElement.classList.remove('is-scrollbar-dragging');
    };
  }, []);

  return (
    <div ref={scrollbarRef} className="portfolio-scrollbar" aria-hidden="true">
      <span className="portfolio-scrollbar-direction" />
      <span ref={trackRef} className="portfolio-scrollbar-track">
        <i ref={thumbRef} className="portfolio-scrollbar-thumb" />
      </span>
    </div>
  );
}
