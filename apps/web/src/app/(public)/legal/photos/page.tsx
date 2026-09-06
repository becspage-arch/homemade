import type { Metadata } from 'next'
import { LegalHeader } from '../legal-header'
import { ContactBlock } from '../contact-block'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'

export const metadata: Metadata = buildPublicMetadata({
  title: 'Your photos on Homemade',
  description:
    'What happens to a photo you upload of something you made: where it appears, what Homemade may use it for, and how to take it down.',
  path: '/legal/photos',
  ogType: 'article',
})

export default function PhotosTermsPage() {
  return (
    <article className="legal-page">
      <LegalHeader eyebrow="Photos" title="Your photos on Homemade" />

      <div className="legal-body">
        <p>
          When you upload a photo of something you made, it appears on the
          pattern or recipe page it belongs to, on that category&rsquo;s gallery
          and on the home page, with your handle beside it. Homemade may also
          use it, with your handle, in Homemade&rsquo;s own promotion: social
          media, emails and adverts for the site. Homemade does not sell your
          photo or license it to anyone else.
        </p>

        <p>The photo stays yours.</p>

        <p>
          You are responsible for what is in your photos. Only upload photos you
          took yourself of something you made yourself. Make sure nobody else
          appears in the photo unless they have agreed to it, and do not include
          children, other people&rsquo;s work, or anything you do not have the
          right to share.
        </p>

        <p>
          Every photo is checked automatically before it appears. If yours is not
          accepted and you think that is wrong, use &ldquo;Ask us to look
          again&rdquo; and a person will check it.
        </p>

        <p>
          You can remove any photo at any time from My photos, and it comes off
          the site straight away. You can also turn off use in promotion in your
          settings. If you close your account, your photos are removed with it.
        </p>

        <p>
          If a photo is reported to us and we agree it should not be on the site,
          we will take it down and tell you why.
        </p>
      </div>

      <ContactBlock topic="general" />
    </article>
  )
}
