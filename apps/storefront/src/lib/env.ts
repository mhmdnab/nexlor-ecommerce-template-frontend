/**
 * Public env, validated at module load so misconfiguration fails fast and
 * obviously rather than producing confusing runtime errors.
 */
function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required env var ${name}. See .env.example.`);
  return value;
}

export const env = {
  API_URL: required('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL),
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
};
