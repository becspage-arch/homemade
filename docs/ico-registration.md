# ICO registration — what Rebecca needs to do

The Information Commissioner's Office (ICO) is the UK regulator for data
protection. Almost every organisation that handles personal data has to
register with the ICO and pay an annual data protection fee. Homemade
collects email addresses, account data, content people upload, and
analytics events, so we are in scope.

Registering is straightforward and inexpensive. Until it is done, our
privacy policy honestly notes "registration pending".

## What it costs

For a small organisation (turnover under £632,000 / fewer than 11 staff)
the fee is **Tier 1 — £40 per year**, or **£35 if paid by direct debit**.
Sole traders qualify for Tier 1.

If turnover grows past £632,000 the fee moves to Tier 2 (£60). Higher
tiers exist beyond that but neither applies to us in the near term.

## What you need to provide

- Legal name (currently: `Rebecca Page (trading as Homemade)`).
- Trading name (`Homemade`).
- Address.
- Contact name + email (use `dpo@homemade.education` once the alias
  exists; otherwise `rebecca@homemade.education`).
- Nature of the business.
- Why you process personal data (account management, providing the
  service, marketing, etc.).
- The categories of people whose data you process (users / members,
  prospective members, suppliers).
- Whether you process special category or criminal-conviction data
  (we don't).
- Payment details for the fee.

## Where to register

Online via the ICO self-service portal:
**https://ico.org.uk/for-organisations/data-protection-fee/**

The form takes 10–15 minutes. You get an immediate confirmation email
with a registration number.

## After registering

1. Update `apps/web/src/lib/legal-entity.ts`:
   - Set `icoRegistrationNumber` to the registration number from the
     confirmation email (it looks like `ZA123456`).
   - If you want the bump to show up in the "Last updated" date on the
     legal pages, also bump `effectiveDate` to today's date.
2. Commit and push. The footer and privacy page footer pick up the
   value automatically.
3. Set a calendar reminder for the renewal date (12 months later).

## When to incorporate as a Ltd company

When you incorporate, you re-register with the ICO under the new legal
entity (the registration follows the controller, not the trading name).
At that point, also update `legal-entity.ts`:

- `name` → the registered company name.
- `companiesHouseNumber` → the company number.
- `icoRegistrationNumber` → the new ICO number.
- `postalAddress` → the registered office address.
- `vatNumber` → once VAT-registered.
- `effectiveDate` → today.

The legal pages re-render from those values so no other file needs to
change.

## Related external follow-ups

These are Rebecca-must-do steps the legal compliance session can't run
for you. Once each is in place, tick it off and update
`apps/web/src/lib/legal-entity.ts` or the relevant policy page as noted.

- [ ] Create Google Workspace aliases `privacy@`, `dpo@`, `legal@`.
      See `docs/email-aliases-needed.md`.
- [ ] Register with the ICO (this document).
- [ ] Decide on a postal address (home address, virtual office, or
      registered-office service if/when incorporating). Once decided,
      set `LEGAL_ENTITY.postalAddress`.
- [ ] DMCA designated agent registration with the US Copyright Office
      (https://www.copyright.gov/dmca-directory/). Fee currently
      $6 for the initial designation, $6 per amendment. The
      `/legal/dmca` page acknowledges this is pending.
- [ ] When incorporating: update `companiesHouseNumber` and rotate the
      ICO registration.
- [ ] When VAT-registered: update `vatNumber` and revisit the
      "VAT and other taxes" section of `/legal/subscription-terms` —
      the current copy already accounts for both pre- and
      post-registration states.
