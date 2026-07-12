'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { CheckCircle, Edit, Mail, Plus, Search, Shield, Trash2, User, Users } from 'lucide-react'

type Role = 'ADMIN' | 'USER' | 'VIEWER'

type ManagedUser = {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
  updatedAt: string
}

type UserFormState = {
  name: string
  email: string
  role: Role
  password: string
}

const emptyForm: UserFormState = {
  name: '',
  email: '',
  role: 'USER',
  password: '',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function getRoleLabel(role: Role) {
  if (role === 'ADMIN') return 'Admin'
  if (role === 'VIEWER') return 'Viewer'
  return 'User'
}

export default function UsersClient({
  currentUserId,
  initialUsers,
}: {
  currentUserId: string
  initialUsers: ManagedUser[]
}) {
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | Role>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [addForm, setAddForm] = useState<UserFormState>(emptyForm)
  const [editForm, setEditForm] = useState<UserFormState>(emptyForm)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = searchTerm.trim().toLowerCase()
      const matchesSearch =
        query.length === 0 ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      const matchesRole = filterRole === 'all' || user.role === filterRole
      return matchesSearch && matchesRole
    })
  }, [filterRole, searchTerm, users])

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((user) => user.role === 'ADMIN').length,
      regularUsers: users.filter((user) => user.role === 'USER').length,
      newlyAdded: users.filter((user) => {
        const createdAt = new Date(user.createdAt)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return createdAt >= thirtyDaysAgo
      }).length,
    }),
    [users]
  )

  async function handleCreateUser() {
    setFormError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addForm),
      })

      const payload = await response.json()

      if (!response.ok) {
        setFormError(payload.error ?? 'Unable to create user.')
        return
      }

      setUsers((current) => [payload.user, ...current])
      setAddForm(emptyForm)
      setIsAddDialogOpen(false)
    } catch {
      setFormError('Unable to create user right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function openEditDialog(user: ManagedUser) {
    setFormError(null)
    setEditingUserId(user.id)
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    })
    setIsEditDialogOpen(true)
  }

  async function handleUpdateUser() {
    if (!editingUserId) {
      return
    }

    setFormError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/users/${editingUserId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      const payload = await response.json()

      if (!response.ok) {
        setFormError(payload.error ?? 'Unable to update user.')
        return
      }

      setUsers((current) =>
        current.map((user) => (user.id === payload.user.id ? payload.user : user))
      )
      setEditingUserId(null)
      setEditForm(emptyForm)
      setIsEditDialogOpen(false)
    } catch {
      setFormError('Unable to update user right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteUser(userId: string) {
    setDeletingUserId(userId)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        return
      }

      setUsers((current) => current.filter((user) => user.id !== userId))
    } finally {
      setDeletingUserId(null)
    }
  }

  const editingOwnAccount = editingUserId === currentUserId

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="rounded-lg bg-primary/20 p-3">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Administrators</p>
                <p className="text-2xl font-bold text-foreground">{stats.admins}</p>
              </div>
              <div className="rounded-lg bg-chart-2/20 p-3">
                <Shield className="h-5 w-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Regular Users</p>
                <p className="text-2xl font-bold text-foreground">{stats.regularUsers}</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Added This Month</p>
                <p className="text-2xl font-bold text-foreground">{stats.newlyAdded}</p>
              </div>
              <div className="rounded-lg bg-success/20 p-3">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-foreground">User Management</CardTitle>
              <CardDescription className="text-muted-foreground">
                Add, edit, and remove user accounts from the dashboard.
              </CardDescription>
            </div>
            <Dialog
              open={isAddDialogOpen}
              onOpenChange={(open) => {
                setIsAddDialogOpen(open)
                setFormError(null)
                if (!open) {
                  setAddForm(emptyForm)
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="border-border bg-card">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Add User</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Create a new account and assign its role.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-name" className="text-foreground">
                      Full Name
                    </Label>
                    <Input
                      id="add-name"
                      value={addForm.name}
                      onChange={(event) => setAddForm({ ...addForm, name: event.target.value })}
                      placeholder="Enter full name"
                      className="border-border bg-input text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-email" className="text-foreground">
                      Email
                    </Label>
                    <Input
                      id="add-email"
                      type="email"
                      value={addForm.email}
                      onChange={(event) => setAddForm({ ...addForm, email: event.target.value })}
                      placeholder="Enter email address"
                      className="border-border bg-input text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-password" className="text-foreground">
                      Password
                    </Label>
                    <Input
                      id="add-password"
                      type="password"
                      value={addForm.password}
                      onChange={(event) => setAddForm({ ...addForm, password: event.target.value })}
                      placeholder="Minimum 8 characters"
                      className="border-border bg-input text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Role</Label>
                    <Select
                      value={addForm.role}
                      onValueChange={(value: Role) => setAddForm({ ...addForm, role: value })}
                    >
                      <SelectTrigger className="border-border bg-input text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-popover">
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="USER">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="border-border"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateUser}
                    className="bg-primary text-primary-foreground"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Adding...' : 'Add User'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="border-border bg-input pl-9 text-foreground"
              />
            </div>
            <Select value={filterRole} onValueChange={(value: 'all' | Role) => setFilterRole(value)}>
              <SelectTrigger className="w-full border-border bg-input text-foreground sm:w-[160px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Role</TableHead>
                  <TableHead className="hidden text-muted-foreground md:table-cell">
                    Created
                  </TableHead>
                  <TableHead className="hidden text-muted-foreground lg:table-cell">
                    Last Updated
                  </TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const isCurrentUser = user.id === currentUserId

                  return (
                    <TableRow key={user.id} className="border-border hover:bg-secondary/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
                            <span className="text-sm font-medium text-primary">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {user.name}
                              {isCurrentUser ? ' (You)' : ''}
                            </p>
                            <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                              <Mail className="h-3 w-3 shrink-0" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.role === 'ADMIN'
                              ? 'border-chart-2/30 bg-chart-2/20 text-chart-2'
                              : ''
                          }
                          variant={user.role === 'ADMIN' ? undefined : 'secondary'}
                        >
                          {user.role === 'ADMIN' ? <Shield className="mr-1 h-3 w-3" /> : null}
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {formatDate(user.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                disabled={isCurrentUser || deletingUserId === user.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="border-border bg-card">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">
                                  Delete User
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                  This will permanently remove {user.name}&apos;s account.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-border text-foreground">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No users found matching your criteria.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          setFormError(null)
          if (!open) {
            setEditingUserId(null)
            setEditForm(emptyForm)
          }
        }}
      >
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit User</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update account details. Leave password blank to keep the current one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-foreground">
                Full Name
              </Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                className="border-border bg-input text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-foreground">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(event) => setEditForm({ ...editForm, email: event.target.value })}
                className="border-border bg-input text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password" className="text-foreground">
                New Password
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={editForm.password}
                onChange={(event) => setEditForm({ ...editForm, password: event.target.value })}
                placeholder="Optional"
                className="border-border bg-input text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(value: Role) => setEditForm({ ...editForm, role: value })}
                disabled={editingOwnAccount}
              >
                <SelectTrigger className="border-border bg-input text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                </SelectContent>
              </Select>
              {editingOwnAccount ? (
                <p className="text-xs text-muted-foreground">
                  Your own role cannot be changed from this screen.
                </p>
              ) : null}
            </div>
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              className="bg-primary text-primary-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
