/**
 * Validates AUTH_URL / NEXTAUTH_URL for production builds.
 * Fails with a clear error message if configured to localhost or loopback IPs.
 */
export function validateAuthUrlForProduction(authUrl?: string | null): void {
  if (!authUrl) return;
  const trimmed = authUrl.trim();
  if (!trimmed) return;

  const isLocalhost =
    /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/.*)?$/i.test(trimmed) ||
    trimmed.includes('localhost') ||
    trimmed.includes('127.0.0.1') ||
    trimmed.includes('0.0.0.0');

  if (isLocalhost) {
    const errorMsg =
      '\n====================================================================\n' +
      '❌ BUILD FAILED: AUTH_URL or NEXTAUTH_URL cannot point to localhost in production!\n' +
      `Current value: "${trimmed}"\n` +
      'In production, AUTH_URL / NEXTAUTH_URL must be configured to your production domain (e.g. https://your-domain.com).\n' +
      '====================================================================\n';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}
