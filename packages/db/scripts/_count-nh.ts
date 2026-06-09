import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials', override: true })
import { prisma } from '../src'
const count = await prisma.tutorial.count({ where: { categorySlug: 'natural-home', status: 'PUBLISHED' } })
console.log('natural-home PUBLISHED:', count)
await prisma.$disconnect()
