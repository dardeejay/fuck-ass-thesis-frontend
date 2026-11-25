import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import 'dotenv/config'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
})

// Production must supply its own admin password; the well-known dev default
// is only allowed outside production.
const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@olongapo.gov.ph'
const adminPassword =
  process.env.SEED_ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? null : 'admin123')

if (!adminPassword) {
  throw new Error('SEED_ADMIN_PASSWORD must be set when NODE_ENV=production')
}

async function main() {
  // Runs on every deploy (see the `migrate` service in docker-compose.yml),
  // so an existing admin is left alone — a redeploy must not reset a
  // password changed after the first seed.
  await prisma.user.upsert({
    where: {
      email: adminEmail,
    },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: await hash(adminPassword, 12),
      role: 'ADMIN',
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
