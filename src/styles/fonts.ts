import localFont from 'next/font/local';

/**
 * EB Garamond - English serif font for display headings
 * Weights: 400, 500, 600, 700, 800 + italic variants
 */
export const ebGaramond = localFont({
  src: [
    { path: '../../public/fonts/EBGaramond-Regular.ttf', weight: '400' },
    { path: '../../public/fonts/EBGaramond-Medium.ttf', weight: '500' },
    { path: '../../public/fonts/EBGaramond-SemiBold.ttf', weight: '600' },
    { path: '../../public/fonts/EBGaramond-Bold.ttf', weight: '700' },
    { path: '../../public/fonts/EBGaramond-ExtraBold.ttf', weight: '800' },
    { path: '../../public/fonts/EBGaramond-Italic.ttf', weight: '400', style: 'italic' },
    { path: '../../public/fonts/EBGaramond-MediumItalic.ttf', weight: '500', style: 'italic' },
    { path: '../../public/fonts/EBGaramond-SemiBoldItalic.ttf', weight: '600', style: 'italic' },
    { path: '../../public/fonts/EBGaramond-BoldItalic.ttf', weight: '700', style: 'italic' },
    { path: '../../public/fonts/EBGaramond-ExtraBoldItalic.ttf', weight: '800', style: 'italic' },
  ],
  variable: '--font-eb-garamond',
  display: 'swap',
});

/**
 * Sarasa Gothic - Chinese/English sans-serif font for body text
 * Weights: 200, 300, 400, 600, 700 + italic variants
 */
export const sarasaGothic = localFont({
  src: [
    { path: '../../public/fonts/SarasaUiSC-ExtraLight.ttf', weight: '200' },
    { path: '../../public/fonts/SarasaUiSC-Light.ttf', weight: '300' },
    { path: '../../public/fonts/SarasaUiSC-Regular.ttf', weight: '400' },
    { path: '../../public/fonts/SarasaUiSC-SemiBold.ttf', weight: '600' },
    { path: '../../public/fonts/SarasaUiSC-Bold.ttf', weight: '700' },
    { path: '../../public/fonts/SarasaUiSC-ExtraLightItalic.ttf', weight: '200', style: 'italic' },
    { path: '../../public/fonts/SarasaUiSC-LightItalic.ttf', weight: '300', style: 'italic' },
    { path: '../../public/fonts/SarasaUiSC-Italic.ttf', weight: '400', style: 'italic' },
    { path: '../../public/fonts/SarasaUiSC-SemiBoldItalic.ttf', weight: '600', style: 'italic' },
    { path: '../../public/fonts/SarasaUiSC-BoldItalic.ttf', weight: '700', style: 'italic' },
  ],
  variable: '--font-sarasa-gothic',
  display: 'swap',
});

/**
 * Combined font variables for applying to HTML elements
 */
export const fontVariables = `${ebGaramond.variable} ${sarasaGothic.variable}`;
