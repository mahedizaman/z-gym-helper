/**
 * Client-Side Card Rasterization Utility
 *
 * Utilizes the browser's native text shaping engine (Blink/Gecko/WebKit with HarfBuzz)
 * to ensure Bengali vowel signs, ligatures, and conjuncts are 100% grammatically
 * and typographically accurate.
 */

import * as htmlToImage from 'html-to-image';

export interface CardRasterizeOptions {
  width?: number;
  height?: number;
}

/**
 * Rasterizes a DOM element into a PNG Blob after confirming all document web fonts are loaded.
 */
export async function rasterizeCardToBlob(
  element: HTMLElement,
  options?: CardRasterizeOptions
): Promise<Blob> {
  if (typeof window === 'undefined') {
    throw new Error('Card rasterization can only run in the browser environment');
  }

  // Ensure all web fonts (such as Hind Siliguri) are loaded and shaped
  if ('fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Proceed even if fonts.ready fails or times out
    }
  }

  const width = options?.width || element.offsetWidth || 1080;
  const height = options?.height || element.offsetHeight || 1350;

  const blob = await htmlToImage.toBlob(element, {
    width,
    height,
    pixelRatio: 1,
    cacheBust: true,
    backgroundColor: '#0F1412',
    style: {
      transform: 'none',
      visibility: 'visible',
      display: 'flex',
    },
  });

  if (!blob) {
    throw new Error('Failed to generate PNG blob from card element');
  }

  return blob;
}

/**
 * Rasterizes a DOM element into a PNG Data URL.
 */
export async function rasterizeCardToPng(
  element: HTMLElement,
  options?: CardRasterizeOptions
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Card rasterization can only run in the browser environment');
  }

  if ('fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  const width = options?.width || element.offsetWidth || 1080;
  const height = options?.height || element.offsetHeight || 1350;

  return await htmlToImage.toPng(element, {
    width,
    height,
    pixelRatio: 1,
    cacheBust: true,
    backgroundColor: '#0F1412',
    style: {
      transform: 'none',
      visibility: 'visible',
      display: 'flex',
    },
  });
}
