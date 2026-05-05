import { getServerAuthSession } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().trim().optional(),
  role: z.enum(['ADMIN', 'USER']),
})

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
}

async function countAdminUsers() {
  return prisma.user.count({
    where: {
      role: 'ADMIN',
    },
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerAuthSession()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return unauthorizedResponse()
  }

  const { id } = await params
  const payload = await request.json()
  const parsed = updateUserSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid user data.' },
      { status: 400 }
    )
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      role: true,
    },
  })

  if (!existingUser) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 })
  }

  if (session.user.id === id && parsed.data.role !== existingUser.role) {
    return NextResponse.json(
      { error: 'You cannot change your own role from this screen.' },
      { status: 400 }
    )
  }

  if (existingUser.role === 'ADMIN' && parsed.data.role === 'USER') {
    const adminCount = await countAdminUsers()

    if (adminCount <= 1) {
      return NextResponse.json(
        { error: 'At least one administrator account must remain.' },
        { status: 400 }
      )
    }
  }

  try {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        role: parsed.data.role,
        ...(parsed.data.password
          ? {
              password: await hash(parsed.data.password, 12),
            }
          : {}),
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

    return NextResponse.json({ error: 'Unable to update user.' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerAuthSession()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return unauthorizedResponse()
  }

  const { id } = await params

  if (session.user.id === id) {
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 })
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      role: true,
    },
  })

  if (!existingUser) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 })
  }

  if (existingUser.role === 'ADMIN') {
    const adminCount = await countAdminUsers()

    if (adminCount <= 1) {
      return NextResponse.json(
        { error: 'At least one administrator account must remain.' },
        { status: 400 }
      )
    }
  }

  await prisma.user.delete({
    where: {
      id,
    },
  })

  return NextResponse.json({ success: true })
}
