import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

const appUrl = process.env.PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || '';
const appHostname = appUrl ? new URL(appUrl.startsWith('http') ? appUrl : `https://${appUrl}`).hostname : '';

export default defineConfig({
  site: appHostname ? `https://${appHostname}` : undefined,
  output: 'server',
  adapter: vercel(),
  security: {
    allowedDomains: [
      {
        protocol: 'https',
        hostname: '**.vercel.app'
      },
      ...(appHostname
        ? [
            {
              protocol: 'https',
              hostname: appHostname
            }
          ]
        : [])
    ]
  }
});
