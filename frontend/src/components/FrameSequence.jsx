import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FRAME_COUNT, frameUrl, loadImage, prefersSmallFrames, assetUrl } from '../utils/frames.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

gsap.registerPlugin(ScrollTrigger);

const LOAD_CONCURRENCY = 6;
const SCRUB_SMOOTHING = 0.5;
const HERO_ALT = 'Dentist in a white coat examining a patient in a modern, blue-and-white treatment room';

// ─── 3-D depth layers drawn on top of the frame canvas ───────────────────────
// Each layer is a pure CSS/canvas overlay that moves at a different parallax rate.
// Nothing here claims real 3-D geometry; it is a 2-D cinematic depth illusion.

function drawDepthOverlays(ctx, w, h, progress) {
  // 1. Radial vignette — darkens edges, focuses the eye on the centre
  const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.28, w / 2, h / 2, h * 0.85);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(8,20,40,0.62)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  // 2. Ambient blue glow — top-right corner, shifts slightly with scroll
  const glowX = w * (0.82 + progress * 0.06);
  const glowY = h * (0.12 - progress * 0.04);
  const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, w * 0.55);
  glow.addColorStop(0, 'rgba(114,199,240,0.18)');
  glow.addColorStop(0.5, 'rgba(22,119,200,0.08)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // 3. Bottom gradient — ensures hero text overlay is always readable
  const bottom = ctx.createLinearGradient(0, h * 0.45, 0, h);
  bottom.addColorStop(0, 'rgba(10,24,48,0)');
  bottom.addColorStop(0.6, 'rgba(10,24,48,0.38)');
  bottom.addColorStop(1, 'rgba(10,24,48,0.72)');
  ctx.fillStyle = bottom;
  ctx.fillRect(0, 0, w, h);

  // 4. Subtle horizontal light streak — moves upward as scroll progresses
  const streakY = h * (0.38 - progress * 0.12);
  const streak = ctx.createLinearGradient(0, streakY - 2, 0, streakY + 2);
  streak.addColorStop(0, 'rgba(255,255,255,0)');
  streak.addColorStop(0.5, `rgba(255,255,255,${0.04 * (1 - progress)})`);
  streak.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = streak;
  ctx.fillRect(0, streakY - 60, w, 120);
}

export default function FrameSequence({ trackRef }) {
  const canvasRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [small] = useState(() => prefersSmallFrames());
  const [status, setStatus] = useState('loading');
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const canvas = canvasRef.current;
    const track = trackRef.current;
    if (!canvas || !track) return undefined;

    const ctx = canvas.getContext('2d');
    const images = new Array(FRAME_COUNT);
    const scrub = { frame: 0, progress: 0 };
    let cancelled = false;
    let loaded = 0;
    let version = 0;
    let lastIndex = -1;
    let lastVersion = -1;
    let tween = null;
    let progressTween = null;

    // ── Canvas sizing ──────────────────────────────────────────────────────────
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      lastIndex = -1; // force redraw at new size
    };
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(canvas);
    resizeCanvas();

    // ── Draw one frame + depth overlays ───────────────────────────────────────
    const draw = (index, progress) => {
      const w = canvas.width;
      const h = canvas.height;

      // Find nearest loaded frame
      let img = null;
      for (let i = index; i >= 0 && !img; i -= 1) img = images[i] || null;
      for (let i = index + 1; i < FRAME_COUNT && !img; i += 1) img = images[i] || null;
      if (!img) return;

      ctx.clearRect(0, 0, w, h);

      // ── 3-D push-in: scale the source rect slightly as scroll progresses ──
      // This creates a camera-zoom-in feel without distorting faces/equipment.
      const zoom = 1 + progress * 0.04; // max 4 % zoom-in
      const srcW = img.naturalWidth / zoom;
      const srcH = img.naturalHeight / zoom;
      const srcX = (img.naturalWidth - srcW) / 2;
      // Parallax vertical shift: image rises slightly as we scroll in
      const srcY = (img.naturalHeight - srcH) / 2 - progress * img.naturalHeight * 0.015;

      // Cover-fit the canvas
      const scaleX = w / srcW;
      const scaleY = h / srcH;
      const scale = Math.max(scaleX, scaleY);
      const dw = srcW * scale;
      const dh = srcH * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;

      ctx.drawImage(img, srcX, srcY, srcW, srcH, dx, dy, dw, dh);

      // ── Depth overlays on top of the frame ────────────────────────────────
      drawDepthOverlays(ctx, w, h, progress);
    };

    // ── GSAP ticker render loop ────────────────────────────────────────────────
    const render = () => {
      const index = Math.round(scrub.frame);
      if (index !== lastIndex || version !== lastVersion) {
        draw(index, scrub.progress);
        lastIndex = index;
        lastVersion = version;
      }
    };
    gsap.ticker.add(render);

    // ── ScrollTrigger ─────────────────────────────────────────────────────────
    const startScrollAnimation = () => {
      tween = gsap.to(scrub, {
        frame: FRAME_COUNT - 1,
        ease: 'none',
        scrollTrigger: {
          trigger: track,
          start: 'top top',
          end: 'bottom bottom',
          scrub: SCRUB_SMOOTHING,
          onUpdate: (self) => { scrub.progress = self.progress; },
        },
      });
      // Sync progress separately so depth overlays update even between integer frames
      progressTween = gsap.to(scrub, {
        progress: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: track,
          start: 'top top',
          end: 'bottom bottom',
          scrub: SCRUB_SMOOTHING,
        },
      });
    };

    // ── Frame loading ─────────────────────────────────────────────────────────
    const onLoaded = (i, img) => {
      if (cancelled) return;
      images[i] = img;
      loaded += 1;
      version += 1;
      if (loaded % 4 === 0 || loaded === FRAME_COUNT) setLoadedCount(loaded);
    };

    const loadSequence = async () => {
      try {
        onLoaded(0, await loadImage(frameUrl(1, { small })));
      } catch {
        if (!cancelled) setStatus('error');
        return;
      }
      if (cancelled) return;
      setStatus('ready');
      setLoadedCount(loaded);
      startScrollAnimation();

      const queue = Array.from({ length: FRAME_COUNT - 1 }, (_, k) => k + 1);
      const worker = async () => {
        while (!cancelled && queue.length) {
          const i = queue.shift();
          try { onLoaded(i, await loadImage(frameUrl(i + 1, { small }))); } catch { /* skip */ }
        }
      };
      await Promise.all(Array.from({ length: LOAD_CONCURRENCY }, worker));
      if (!cancelled) setLoadedCount(loaded);
    };

    loadSequence();

    return () => {
      cancelled = true;
      ro.disconnect();
      gsap.ticker.remove(render);
      if (tween) tween.kill();
      if (progressTween) progressTween.kill();
      ScrollTrigger.getAll().forEach((st) => { if (st.trigger === track) st.kill(); });
      for (let i = 0; i < images.length; i += 1) images[i] = null;
    };
  }, [reducedMotion, small, trackRef]);

  const percent = Math.round((loadedCount / FRAME_COUNT) * 100);
  const showPoster = reducedMotion || status === 'error';
  const showLoader = !reducedMotion && status === 'loading';

  return (
    <>
      {/* Static poster for reduced-motion / error fallback */}
      <img
        className={`frame-poster-full ${showPoster ? 'is-visible' : ''}`}
        src={assetUrl('assets/images/hero-poster.jpg')}
        alt={HERO_ALT}
        width="1920"
        height="1080"
        fetchPriority="high"
      />

      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          className={`frame-canvas-full ${status === 'ready' ? 'is-ready' : ''}`}
          role="img"
          aria-label={HERO_ALT}
        />
      )}

      {showLoader && (
        <div className="frame-loader-full" role="status" aria-live="polite">
          <span className="frame-loader-label">Loading {percent}%</span>
          <div className="frame-loader-track" aria-hidden="true">
            <div className="frame-loader-bar" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}
    </>
  );
}
