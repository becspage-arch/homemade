---
name: Worker sessions verify deploy before reporting done
description: Every worker session that pushes to main must wait for the GitHub Actions deploy to complete, fix failures, and verify the site responds, before considering itself done. Bake this protocol into every worker prompt I write.
type: feedback
originSessionId: 51fcaac5-5db7-4df9-82b1-ee909db7152d
---
Workers have pushed broken commits and walked away. Multiple deploys have failed silently because the worker treated "git push completed" as "task done." This rule fixes that.

**Rule:** A worker session that pushes to `main` is NOT done until:
1. The latest GitHub Actions deploy run on `main` has completed successfully.
2. `https://homemade.education/healthz` returns 200.

If the deploy fails, the worker diagnoses, fixes, pushes again, and reruns the verification. Cap at 3 retries; if still failing after 3, the worker stops and hands off to Rebecca with a clear diagnosis rather than thrashing.

**Why:** Silent deploy failures undermine the whole "ship to main and we're done" pattern. The orchestrator can't track real state if commits land but the site doesn't update. Cost of pausing to verify is low; cost of an unnoticed broken deploy is high.

**How to apply:** Include the following block verbatim in every worker prompt that involves code changes to apps/web, packages/, or infra/ (anything that would deploy). Skip for docs-only sessions.

---

### Deploy verification (mandatory after any push to `main`)

After any push that targets `main`, run this verification block. The session is not complete until it passes.

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
# Inspect the failure
gh run view "$RUN_ID" --log-failed
```

Diagnose the root cause from the logs. Fix in code. Commit and push. Repeat the verification block.

Cap at **3 retries**. If the third attempt still fails:
- Stop. Don't keep pushing.
- Report to Rebecca with: the run URL, the failure mode, what you tried, what you'd try next.
- Don't bypass with `--no-verify`, don't revert unless asked, don't switch to a different deploy path.

Once `gh run watch` exits zero, smoke-test:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://homemade.education/healthz
```

Must print `200`. If not, the GitHub Actions step succeeded but ECS didn't take traffic — usually a healthcheck path / env var problem. Investigate the running task in CloudWatch logs (`/homemade/web`) before declaring done.

When both checks pass, the session is done.

---

**Don't:**
- Skip the verification because "the change was tiny."
- Skip because "the previous push worked, this is just docs." (Docs commits don't normally trigger the deploy, but they CAN if the worker also bumped something else. Always verify.)
- Use `--no-verify` on commits to dodge pre-commit hooks. Fix the underlying issue.
- Force-push to fix a broken deploy. The retry path is: new commit, new push, new run.
- Open a PR and walk away. Workers merge to main directly per the existing pattern; PRs are not the verification path.

**Edge cases:**
- If the worker is doing a docs-only change that doesn't trigger the deploy workflow, the verification can be skipped — but explicitly note in the hand-off that no deploy was expected.
- If the deploy fails because a secret needs rotating, a Cloudflare DNS change is pending, or some other external thing only Rebecca can do, the worker stops and hands off rather than retrying.

This rule lives in `CLAUDE.md` once that file is updated. Until then, every worker prompt I produce inlines this block.
