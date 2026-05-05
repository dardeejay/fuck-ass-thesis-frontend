'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, CloudRain, Shield } from 'lucide-react'
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
    <div className="flex min-h-screen">
      <div className="bg-secondary/50 hidden flex-col justify-between p-12 lg:flex lg:w-1/2">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-primary/20 p-2">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">Project HANDA</span>
          </div>
          <p className="ml-14 text-sm text-muted-foreground">
            Hazard Assessment for Notification and Decision Automation
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-balance text-4xl leading-tight font-bold text-foreground">
              AI-Powered Decision Support for Class Suspension
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Making informed decisions to protect students and educators during hazardous weather conditions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <CloudRain className="text-chart-2 mb-2 h-6 w-6" />
              <h3 className="font-semibold text-foreground">Weather Analysis</h3>
              <p className="text-sm text-muted-foreground">Real-time weather data integration</p>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <AlertTriangle className="text-warning mb-2 h-6 w-6" />
              <h3 className="font-semibold text-foreground">Smart Alerts</h3>
              <p className="text-sm text-muted-foreground">AI-driven suspension recommendations</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">City Government of Olongapo • DepEd Olongapo • PAGASA</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader className="text-center">
            <div className="mb-4 flex items-center justify-center gap-2 lg:hidden">
              <div className="rounded-lg bg-primary/20 p-2">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">Project HANDA</span>
            </div>
            <CardTitle className="text-2xl text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Seeded admin: admin@olongapo.gov.ph / admin123
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
