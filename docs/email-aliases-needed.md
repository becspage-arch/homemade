# Email aliases — what Rebecca needs to create

The legal pages reference three email addresses. The links work even
before the aliases exist — they just bounce. Set them up in Google
Workspace so they reach `rebecca@homemade.education`.

## The three aliases

| Alias | Used on | Forwards to |
| --- | --- | --- |
| `privacy@homemade.education` | Privacy Policy contact, general data enquiries | `rebecca@homemade.education` |
| `dpo@homemade.education` | UK GDPR data-rights centre, subject-access requests | `rebecca@homemade.education` |
| `legal@homemade.education` | Terms, DMCA notices, security disclosures | `rebecca@homemade.education` |

`dpo` is shorthand for "data protection officer". UK GDPR doesn't
require us to appoint a formal DPO at our size, but using the alias
gives subject-access requests a clean lane and reads professionally.

## How to set them up

In the Google Workspace admin console:

1. Open **Apps → Google Workspace → Gmail → Routing → Email aliases**
   (or **Users → rebecca@homemade.education → User information →
   Email aliases** for per-user aliases).
2. Add each alias and target it at the `rebecca@` mailbox.
3. Inside Gmail, create three filters that label incoming mail by
   alias so you can sort it at a glance:
   - `to:(privacy@homemade.education)` → label `Inbox/Privacy`
   - `to:(dpo@homemade.education)` → label `Inbox/Data rights`
   - `to:(legal@homemade.education)` → label `Inbox/Legal`

## After they exist

No code change is needed — the constants in
`apps/web/src/lib/legal-entity.ts` already use these addresses. Once
the aliases are live, links across the legal pages start delivering
properly.

If you ever change the alias targets (for example, when a
co-administrator joins), the change is purely admin-console — no code
change.
