/**
 * Inline script to prevent theme flash (FOUC)
 * This runs before React hydrates, applying the correct theme immediately.
 */
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('ueh_theme') || 'system';
        var isDark = theme === 'dark' ||
          (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {}
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
