/**
 * Quick FKGL test for a piece of text. Reads stdin, prints grade.
 */
import { fleschKincaidGrade } from './voice-check-lib.js'

let data = ''
process.stdin.on('data', (c) => (data += c))
process.stdin.on('end', () => {
  const g = fleschKincaidGrade(data.trim())
  console.log(g === null ? 'null (under 10 words)' : g.toFixed(2))
})
