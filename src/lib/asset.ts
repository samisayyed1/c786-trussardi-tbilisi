/**
 * Resolves a root-relative asset path against the deployment's base URL.
 *
 * The media manifest stores paths as `/media/…`, which is correct when the site
 * is served from a domain root. GitHub Pages serves project sites from
 * `/<repo>/`, where those paths would 404. Vite rewrites asset URLs it can see
 * in HTML and CSS, but it cannot rewrite strings built at runtime — so every
 * manifest path goes through here.
 *
 * `import.meta.env.BASE_URL` is '/' for a root deployment, so this is a no-op
 * in that case.
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL;
  if (base === '/' || !path.startsWith('/')) return path;
  return `${base.replace(/\/$/, '')}${path}`;
}
