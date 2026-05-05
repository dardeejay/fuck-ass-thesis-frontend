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

async function main() {
  const password = await hash('admin123', 12)

  await prisma.user.upsert({
    where: {
      email: 'admin@olongapo.gov.ph',
    },
    update: {
      name: 'Admin User',
      password,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@olongapo.gov.ph',
      name: 'Admin User',
      password,
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
