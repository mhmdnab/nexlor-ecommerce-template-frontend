function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required env var ${name}. See .env.example.`);
  return value;
}

export const env = {
  API_URL: required('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL),
};
