/**
 * Public env, validated at module load so misconfiguration fails fast and
 * obviously rather than producing confusing runtime errors.
 */
function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required env var ${name}. See .env.example.`);
  return value;
}

/**
 * Coerce NEXT_PUBLIC_SITE_URL into a valid absolute URL. Accepts a bare domain
 * (assumes https) so a scheme-less value can't crash the build through
 * `new URL()` in layout's `metadataBase`. Trailing slashes are stripped to match
 * the .env.example convention; falls back to localhost if still unparseable.
 */
function siteUrl(value: string | undefined): string {
  const raw = (value ?? 'http://localhost:3000').trim().replace(/\/+$/, '');
  const candidate = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  try {
    new URL(candidate);
    return candidate;
  } catch {
    return 'http://localhost:3000';
  }
}

export const env = {
  API_URL: required('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL),
  SITE_URL: siteUrl(process.env.NEXT_PUBLIC_SITE_URL),
};
