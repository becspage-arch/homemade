import { readFileSync } from 'node:fs'

const file = process.argv[2]
const idx = Number(process.argv[3])

const data = JSON.parse(readFileSync(file, 'utf8'))
const content = data.body.content
console.log(`Total top-level nodes: ${content.length}`)
const node = content[idx]
console.log(`Node type: ${node?.type}`)
console.log(JSON.stringify(node, null, 2))
