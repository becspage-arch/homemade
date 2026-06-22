import type { MetadataRoute } from 'next'
import { siteOrigin, siteUrl } from '@/lib/seo/site-url'
import { SITE_NOINDEX } from '@/lib/launch-flags'

/**
 * Dynamic robots.txt. Pre-launch (SITE_NOINDEX) the whole site is held out of
 * search with a blanket disallow — the splash gate is down but the site is
 * still half-built, so nothing should be crawled yet. Post-launch (flip
 * SITE_NOINDEX = false) this becomes the canonical allow / deny list: public
 * surfaces stay open, account / admin / search-bot-targeted routes stay closed.
 */
export default function robots(): MetadataRoute.Robots {
  if (SITE_NOINDEX) {
    return {
      // TODO(launch): drop this blanket block when SITE_NOINDEX flips to false.
      rules: [{ userAgent: '*', disallow: '/' }],
      sitemap: siteUrl('/sitemap.xml'),
      host: siteOrigin(),
    }
  }

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
