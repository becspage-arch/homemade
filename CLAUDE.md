# Homemade — repo-level guide for Claude Code sessions

This file is auto-loaded by every Claude Code session that opens the repo.
It's intentionally short — per-user preferences, the build state, and project
context all live in the user's auto-memory at
`C:\Users\Rebecca\.claude\projects\C--Users-Rebecca-Projects-code-homemade\memory\`,
which is also auto-loaded. Read both before starting non-trivial work.

The single canonical build log is `BUILD_PROGRESS.md` at the repo root.
Update it as part of any session that ships a phase or pre-launch debt item.

## Deploy verification

A worker session that pushes code to `main` is **not done** until the deploy
is green. `git push` completing is not the finish line — the GitHub Actions
deploy and a `/healthz` 200 are. Skip this block only for docs-only commits
that demonstrably can't trigger the deploy.

After any push that targets `main`:

```bash
# Wait for the run to register, then grab its id
sleep 15
RUN_ID=$(gh run list --branch main --workflow deploy.yml --limit 1 \
  --json databaseId -q '.[0].databaseId')

# Block until the run completes; exits non-zero if it failed
gh run watch "$RUN_ID" --exit-status
```

If `gh run watch` exits non-zero:

```bash
gh run view "$RUN_ID" --log-failed
```

Diagnose the root cause from the logs. Fix in code. Commit and push. Repeat
the verification block.

**Cap at 3 retries.** If the third attempt still fails:

- Stop. Don't keep pushing.
- Report to Rebecca with: the run URL, the failure mode, what you tried,
  what you'd try next.
- Don't bypass with `--no-verify`, don't revert unless asked, don't switch
  to a different deploy path.

Once `gh run watch` exits zero, smoke-test:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://homemade.education/healthz
```

Must print `200`. If not, the GitHub Actions step succeeded but ECS didn't
take traffic — usually a healthcheck path / env var problem. Investigate the
running task in CloudWatch logs (`/homemade/web`) before declaring done.

When both checks pass, the session is done.

### Don't

- Skip the verification because "the change was tiny."
- Skip because "the previous push worked, this is just docs." Docs commits
  don't normally trigger the deploy, but they CAN if the same commit also
  bumps something else. Always verify.
- Use `--no-verify` on commits to dodge pre-commit hooks. Fix the underlying
  issue.
- Force-push to fix a broken deploy. The retry path is: new commit, new
  push, new run.
- Open a PR and walk away. Workers merge to `main` directly per the existing
  pattern; PRs are not the verification path.

### Edge cases

- A docs-only change that doesn't trigger the deploy workflow can skip
  verification — but explicitly note in the hand-off that no deploy was
  expected.
- If the deploy fails because a secret needs rotating, a Cloudflare DNS
  change is pending, or some other external thing only Rebecca can do, the
  worker stops and hands off rather than retrying.

## A few repo quirks worth knowing on day one

- `pnpm deploy` is a built-in pnpm command — never name a workspace script
  `deploy`. Use `pnpm --filter X exec cdk deploy` for CDK.
- `apps/web/src/proxy.ts` is the Next.js 16 rename of `middleware.ts`.
- Admin lives at `/admin` inside `apps/web`, not a separate app.
- Public bundle stays TipTap-free — the editor (admin) imports `@tiptap/*`,
  the public renderer walks the JSON with plain React.
- Prisma 7's datasource `url` lives in `prisma.config.ts`, not in the
  `schema.prisma` `datasource` block.
- For Bash invocations the harness needs
  `PATH="$PATH:$HOME/AppData/Roaming/npm"` so pnpm resolves.
