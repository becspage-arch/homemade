/**
 * The async Fargate render's POLL STATE MACHINE, tested against real
 * `aws ecs describe-tasks` shapes.
 *
 * This is the piece the whole asynchronous render turns on. A poll that says
 * "still running" when the task is gone hangs an idea for the full twenty-minute
 * ceiling; a poll that says "finished" when the container never ran downloads a
 * PNG that does not exist and reports a render failure as a missing file. So
 * every branch is pinned here, with payloads copied from what ECS actually
 * returns.
 *
 * Runnable as a tsx script, like the repo's other `*.test.ts` files:
 *   cd apps/web && pnpm exec tsx scripts/loom-fargate-render.test.ts
 */

import assert from 'node:assert/strict'
import { fargateTaskState, describePollFailure, type DescribeTasksPayload } from './loom-fargate-render'

const CONTAINER = 'loom-render'

const results: Array<{ name: string; passed: boolean; detail?: string }> = []

function check(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
  } catch (e) {
    results.push({ name, passed: false, detail: e instanceof Error ? e.message : String(e) })
  }
}

// ── still going ─────────────────────────────────────────────────────────────

check('PROVISIONING reads as RUNNING', () => {
  const desc: DescribeTasksPayload = { tasks: [{ lastStatus: 'PROVISIONING', containers: [{ name: CONTAINER }] }] }
  const poll = fargateTaskState(desc, CONTAINER)
  assert.equal(poll.state, 'RUNNING')
  assert.equal(poll.lastStatus, 'PROVISIONING')
  assert.equal(poll.exitCode, null)
})

check('PENDING (a cold image pull) reads as RUNNING', () => {
  const desc: DescribeTasksPayload = { tasks: [{ lastStatus: 'PENDING', containers: [{ name: CONTAINER }] }] }
  assert.equal(fargateTaskState(desc, CONTAINER).state, 'RUNNING')
})

check('RUNNING reads as RUNNING', () => {
  const desc: DescribeTasksPayload = { tasks: [{ lastStatus: 'RUNNING', containers: [{ name: CONTAINER }] }] }
  assert.equal(fargateTaskState(desc, CONTAINER).state, 'RUNNING')
})

check('DEACTIVATING mid-shutdown is not yet finished', () => {
  const desc: DescribeTasksPayload = { tasks: [{ lastStatus: 'DEACTIVATING', containers: [{ name: CONTAINER, exitCode: 0 }] }] }
  assert.equal(fargateTaskState(desc, CONTAINER).state, 'RUNNING')
})

check('a task with no lastStatus at all is not treated as finished', () => {
  const desc: DescribeTasksPayload = { tasks: [{ containers: [{ name: CONTAINER }] }] }
  const poll = fargateTaskState(desc, CONTAINER)
  assert.equal(poll.state, 'RUNNING')
  assert.equal(poll.lastStatus, null)
})

// ── finished cleanly ────────────────────────────────────────────────────────

check('STOPPED with exit 0 is the only success', () => {
  const desc: DescribeTasksPayload = {
    tasks: [{ lastStatus: 'STOPPED', stoppedReason: 'Essential container in task exited', containers: [{ name: CONTAINER, exitCode: 0 }] }],
  }
  const poll = fargateTaskState(desc, CONTAINER)
  assert.equal(poll.state, 'STOPPED')
  assert.equal(poll.exitCode, 0)
  assert.equal(poll.reason, null)
})

check('the render container is found by name among several', () => {
  const desc: DescribeTasksPayload = {
    tasks: [{ lastStatus: 'STOPPED', containers: [{ name: 'sidecar', exitCode: 137 }, { name: CONTAINER, exitCode: 0 }] }],
  }
  assert.equal(fargateTaskState(desc, CONTAINER).state, 'STOPPED')
})

check('a renamed single container still reports its exit code', () => {
  const desc: DescribeTasksPayload = { tasks: [{ lastStatus: 'STOPPED', containers: [{ name: 'loom-render-v2', exitCode: 0 }] }] }
  assert.equal(fargateTaskState(desc, CONTAINER).state, 'STOPPED')
})

// ── failed ──────────────────────────────────────────────────────────────────

check('a non-zero exit is FAILED, with the code and the reason', () => {
  const desc: DescribeTasksPayload = {
    tasks: [
      {
        lastStatus: 'STOPPED',
        stoppedReason: 'Essential container in task exited',
        containers: [{ name: CONTAINER, exitCode: 1, reason: 'blender crashed' }],
      },
    ],
  }
  const poll = fargateTaskState(desc, CONTAINER)
  assert.equal(poll.state, 'FAILED')
  assert.equal(poll.exitCode, 1)
  assert.equal(poll.reason, 'blender crashed')
})

check('a task killed before its container ran (no exit code) is FAILED, not finished', () => {
  const desc: DescribeTasksPayload = {
    tasks: [
      {
        lastStatus: 'STOPPED',
        stoppedReason: 'CannotPullContainerError: pull image manifest has been retried 5 time(s)',
        containers: [{ name: CONTAINER, reason: 'CannotPullContainerError' }],
      },
    ],
  }
  const poll = fargateTaskState(desc, CONTAINER)
  assert.equal(poll.state, 'FAILED')
  assert.equal(poll.exitCode, null)
  assert.equal(poll.reason, 'CannotPullContainerError')
})

check('a stopped task with no containers falls back to the task stoppedReason', () => {
  const desc: DescribeTasksPayload = { tasks: [{ lastStatus: 'STOPPED', stoppedReason: 'Task stopped by user' }] }
  const poll = fargateTaskState(desc, CONTAINER)
  assert.equal(poll.state, 'FAILED')
  assert.equal(poll.reason, 'Task stopped by user')
})

check('a task ECS cannot find is FAILED, never a wait forever', () => {
  const desc: DescribeTasksPayload = {
    tasks: [],
    failures: [{ arn: 'arn:aws:ecs:eu-west-2:1:task/homemade/abc', reason: 'MISSING' }],
  }
  const poll = fargateTaskState(desc, CONTAINER)
  assert.equal(poll.state, 'FAILED')
  assert.equal(poll.reason, 'MISSING')
})

check('an empty payload is FAILED with a usable reason', () => {
  const poll = fargateTaskState({}, CONTAINER)
  assert.equal(poll.state, 'FAILED')
  assert.equal(poll.reason, 'task not found')
})

check('the failure description names the code, the status and the reason', () => {
  const poll = fargateTaskState(
    { tasks: [{ lastStatus: 'STOPPED', containers: [{ name: CONTAINER, exitCode: 137, reason: 'OutOfMemoryError' }] }] },
    CONTAINER,
  )
  const line = describePollFailure(poll)
  assert.ok(line.includes('137'), line)
  assert.ok(line.includes('STOPPED'), line)
  assert.ok(line.includes('OutOfMemoryError'), line)
})

const failed = results.filter((r) => !r.passed)
for (const r of results) {
  console.log(`${r.passed ? 'PASS' : 'FAIL'}: ${r.name}`)
  if (!r.passed && r.detail) console.log(`     ${r.detail}`)
}
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length > 0) process.exit(1)
