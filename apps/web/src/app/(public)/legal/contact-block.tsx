import { LEGAL_ENTITY, legalField } from '@/lib/legal-entity'

interface ContactBlockProps {
  topic: 'privacy' | 'general' | 'legal'
}

export function ContactBlock({ topic }: ContactBlockProps) {
  const email =
    topic === 'privacy'
      ? LEGAL_ENTITY.contactEmail
      : topic === 'legal'
        ? LEGAL_ENTITY.legalEmail
        : LEGAL_ENTITY.contactEmail

  return (
    <aside className="legal-contact-block">
      <h3>Contact</h3>
      <p>
        <strong>Controller:</strong> {LEGAL_ENTITY.name}
      </p>
      <p>
        <strong>Email:</strong>{' '}
        <a href={`mailto:${email}`}>{email}</a>
      </p>
      {topic === 'privacy' && (
        <p>
          <strong>Data Protection enquiries:</strong>{' '}
          <a href={`mailto:${LEGAL_ENTITY.dpoEmail}`}>{LEGAL_ENTITY.dpoEmail}</a>
        </p>
      )}
      <p>
        <strong>Postal address:</strong> {legalField(LEGAL_ENTITY.postalAddress)}
      </p>
      <p>
        <strong>Jurisdiction:</strong> {LEGAL_ENTITY.jurisdiction}
      </p>
      <p>
        <strong>ICO registration:</strong>{' '}
        {legalField(LEGAL_ENTITY.icoRegistrationNumber, 'Registration pending')}
      </p>
    </aside>
  )
}
