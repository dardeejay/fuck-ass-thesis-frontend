import { getServerAuthSession } from '@/auth'
import UsersClient from '@/components/dashboard/users-client'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const session = await getServerAuthSession()

  if (!session?.user?.id) {
    redirect('/')
  }

  if (session.user.role !== 'ADMIN') {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Restricted Access</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Only administrators can manage user accounts.
        </p>
      </div>
    )
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
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

  const initialUsers = users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }))

  return <UsersClient currentUserId={session.user.id} initialUsers={initialUsers} />
}
