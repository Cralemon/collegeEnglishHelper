import localFont from 'next/font/local';

/**
 * Sarasa Gothic - Chinese/English sans-serif font for body text
 * Subset WOFF2: only common CJK + Latin characters
 * Weights: 400 (Regular), 600 (SemiBold), 700 (Bold)
 */
export const sarasaGothic = localFont({
  src: [
    { path: '../../public/fonts/SarasaUiSC-Regular-subset.woff2', weight: '400' },
    { path: '../../public/fonts/SarasaUiSC-SemiBold-subset.woff2', weight: '600' },
    { path: '../../public/fonts/SarasaUiSC-Bold-subset.woff2', weight: '700' },
  ],
  variable: '--font-sarasa-gothic',
  display: 'swap',
});

/**
 * Combined font variables for applying to HTML elements
 * Note: EB Garamond temporarily removed (needs WOFF2 re-download)
 * --font-eb-garamond falls back to system serif via CSS
 */
export const fontVariables = `${sarasaGothic.variable}`;
