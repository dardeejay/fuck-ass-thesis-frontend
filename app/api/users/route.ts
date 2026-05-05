import { getServerAuthSession } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.enum(['ADMIN', 'USER']),
})

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
}

export async function POST(request: Request) {
  const session = await getServerAuthSession()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return unauthorizedResponse()
  }

  const payload = await request.json()
  const parsed = createUserSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid user data.' },
      { status: 400 }
    )
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        password: await hash(parsed.data.password, 12),
        role: parsed.data.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'That email address is already in use.' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Unable to create user.' }, { status: 500 })
  }
}
