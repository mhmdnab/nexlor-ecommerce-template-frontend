/**
 * Inline, render-blocking script that sets the theme class before paint to
 * avoid a flash of the wrong theme. Drop into <head> with
 * `<script dangerouslySetInnerHTML={{ __html: themeScript }} />`.
 */
export const themeScript = `(() => {
  try {
    const t = localStorage.getItem('theme') || 'system';
    const dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  } catch (_) {}
})();`;
