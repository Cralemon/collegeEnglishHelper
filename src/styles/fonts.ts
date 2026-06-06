import localFont from 'next/font/local';

/**
 * EB Garamond - English serif display font
 * Subset WOFF2: Latin characters only (U+0000-00FF)
 * Weights: 400 (Regular), 700 (Bold)
 */
export const ebGaramond = localFont({
  src: [
    { path: '../../public/fonts/EBGaramond-Latin-subset.woff2', weight: '400' },
    { path: '../../public/fonts/EBGaramond-Latin-subset.woff2', weight: '700' },
  ],
  variable: '--font-eb-garamond',
  display: 'swap',
});

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
 */
export const fontVariables = `${ebGaramond.variable} ${sarasaGothic.variable}`;
