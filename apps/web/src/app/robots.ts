import type { MetadataRoute } from 'next'
import { siteOrigin, siteUrl } from '@/lib/seo/site-url'

/**
 * Dynamic robots.txt. While the splash gate is closed the proxy rewrites
 * everything off `/coming-soon`, which is `noindex` via the root layout, so
 * the disallow list here is a belt-and-braces safety net rather than the
 * primary protection. Post-launch this becomes the canonical allow / deny
 * list — public surfaces stay open, account / admin / search-bot-targeted
 * routes stay closed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/me/',
          '/unlock',
          '/coming-soon',
          '/sign-in',
          '/sign-up',
          '/monitoring/',
          // Filtered / paginated permutations of the category surface — the
          // canonical URL is the unfiltered version, declared on the page.
          '/*?difficulty=',
          '/*?equipment=',
          '/*?sort=',
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: siteUrl('/sitemap.xml'),
    host: siteOrigin(),
  }
}
