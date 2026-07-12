'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password.')
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 space-y-3 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="rounded-xl border border-border bg-background p-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">Project HANDA</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Access the class suspension dashboard.
            </p>
          </div>
        </div>

        <Card className="border-border/80 bg-background shadow-sm">
          <CardHeader className="space-y-1 pb-4 text-left">
            <CardTitle className="text-lg text-foreground">Administrator Login</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Use your assigned account credentials to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error ? (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@olongapo.gov.ph"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="border-border bg-input text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="border-border bg-input text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              <p className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
                Seeded admin: admin@olongapo.gov.ph / admin123
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          City Government of Olongapo, DepEd Olongapo, and PAGASA
        </p>
      </div>
    </div>
  )
}
