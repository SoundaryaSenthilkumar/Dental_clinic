import manifest from '../data/frameManifest.json';

export const FRAME_COUNT = manifest.count;

// Frame numbers in the UI are 1-based (frame_001.jpg is number 1).
export function frameUrl(number, { small = false } = {}) {
  const file = manifest.frames[number - 1].file;
  return `${import.meta.env.BASE_URL}assets/${small ? 'frames-sm' : 'frames'}/${file}`;
}

export function assetUrl(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

// Mobile and small tablets get the 1280px set to save bandwidth and memory.
export function prefersSmallFrames() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches;
}
