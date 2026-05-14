# Refreshing the Cloudflare origin IP allowlist

The ALB security group is locked to Cloudflare's published origin IP ranges
(`infra/lib/cloudflare-ips.ts`). Any request that reaches the ALB from
outside those ranges is dropped before it can be served. This keeps scanners
from probing the origin directly and bypassing Cloudflare's WAF / bot
detection / rate limits.

Cloudflare updates the list a few times a year, usually with no fanfare.
When they do, this runbook is the path to refresh ours.

## Signals it's time to refresh

- Cloudflare's status page or changelog announces an IP-range addition.
- Sentry / CloudWatch starts showing a spike of dropped connections that
  trace back to Cloudflare ASNs not currently in our allowlist.
- A quarterly "is this still current?" check (see calendar reminder).

## Refresh procedure

1. **Fetch the canonical lists.**

   ```bash
   curl -sS https://www.cloudflare.com/ips-v4
   curl -sS https://www.cloudflare.com/ips-v6
   ```

2. **Compare against `infra/lib/cloudflare-ips.ts`.** If both lists already
   match, you're done — bump the `Last refreshed:` header comment to today
   and commit.

3. **If they differ:** replace the contents of `CLOUDFLARE_IPV4` and
   `CLOUDFLARE_IPV6` with the new lists. Update the `Last refreshed:` date
   in the header comment.

4. **Sanity-check the rule count.** AWS security groups have a default
   quota of 60 inbound rules. Each Cloudflare CIDR adds two rules (port 80
   + port 443). With ~22 CIDRs we sit around 44 rules — fine. If Cloudflare
   ever pushes us past ~25 CIDRs we'll need to request a quota increase
   before the next deploy.

5. **Deploy.** Pure security-group change, no IAM grants, no secret
   references — single deploy is safe:

   ```bash
   pnpm --filter infra exec cdk deploy
   ```

   The ECS service is not replaced. The deployment circuit breaker stays
   clean.

6. **Validate.** From any non-Cloudflare host (your laptop is fine):

   ```bash
   # Cloudflare-fronted path keeps working
   curl -sS -o /dev/null -w "%{http_code}\n" https://homemade.education/healthz
   # Expect: 200

   # Direct-to-ALB probe is refused
   ALB_DNS=$(aws elbv2 describe-load-balancers --region eu-west-2 \
     --names homemade-web --query 'LoadBalancers[0].DNSName' --output text)
   curl -sS --max-time 5 -k -o /dev/null -w "%{http_code}\n" \
     https://$ALB_DNS/healthz || echo "blocked (good)"
   # Expect: timeout / blocked
   ```

7. **Commit.** Single commit, message form
   `chore(infra): refresh Cloudflare IP allowlist`.

## What to do if Cloudflare publishes an emergency / out-of-band update

Same procedure, but skip the quarterly check and just run it. The change is
low-risk (ingress rules only) and reversible (the previous list lives in
`git log`).

## Why we hardcode instead of fetching at synth time

Two reasons:

1. CDK `cdk synth` then becomes dependent on Cloudflare's URL being
   reachable. A transient DNS failure during a deploy turns into a synth
   error.
2. The list changing silently between deploys would mean every
   no-op-looking deploy could produce a different security-group diff,
   which makes the deploy history harder to reason about.

Hardcoding + manual refresh keeps deploys deterministic. Cost is a periodic
check; benefit is a stable infra surface.
