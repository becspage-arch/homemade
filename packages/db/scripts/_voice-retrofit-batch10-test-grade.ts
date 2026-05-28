/**
 * Quick grade-level checker. Read text from stdin and print FK grade.
 *   echo "..." | tsx scripts/_voice-retrofit-batch10-test-grade.ts
 */
import { fleschKincaidGrade } from './voice-check-lib.js'

let buffer = ''
process.stdin.on('data', (chunk) => { buffer += chunk })
process.stdin.on('end', () => {
  const text = buffer.trim()
  const grade = fleschKincaidGrade(text)
  const words = text.split(/\s+/).length
  console.log(`grade ${grade?.toFixed(2) ?? 'n/a'}  words ${words}`)
})
