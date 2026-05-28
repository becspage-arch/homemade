import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const slug = process.argv[2] ?? 'sticky-toffee-pudding'
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    select: {
      slug: true,
      voiceRetrofittedAt: true,
      revisedFrom: true,
      category: { select: { slug: true } },
      body: true,
    },
  })
  if (!t) { console.error(`not found: ${slug}`); process.exit(1) }
  console.log(`slug:                ${t.slug}`)
  console.log(`category:            ${t.category?.slug}`)
  console.log(`voiceRetrofittedAt:  ${t.voiceRetrofittedAt?.toISOString()}`)
  console.log(`revisedFrom set:     ${t.revisedFrom != null}`)
  console.log(`URL:                 https://homemade.education/${t.category?.slug}/${t.slug}`)
  console.log()
  const body = t.body as any
  const firstPara = body?.content?.find((n: any) => n.type === 'paragraph')
  if (firstPara) {
    const text = (firstPara.content ?? []).map((c: any) => c.text ?? '').join('')
    console.log(`First body paragraph (DB):`)
    console.log(text)
  }
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
