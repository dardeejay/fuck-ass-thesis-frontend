"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CloudRain, Shield, AlertTriangle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulated login - replace with actual authentication
    setTimeout(() => {
      if (email === "admin@olongapo.gov.ph" && password === "admin123") {
        router.push("/dashboard")
      } else {
        setError("Invalid credentials. Try admin@olongapo.gov.ph / admin123")
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary/50 flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">Project HANDA</span>
          </div>
          <p className="text-muted-foreground text-sm ml-14">
            Hazard Assessment for Notification and Decision Automation
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground leading-tight text-balance">
              AI-Powered Decision Support for Class Suspension
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Making informed decisions to protect students and educators during hazardous weather conditions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-card/50 rounded-lg border border-border">
              <CloudRain className="h-6 w-6 text-chart-2 mb-2" />
              <h3 className="font-semibold text-foreground">Weather Analysis</h3>
              <p className="text-sm text-muted-foreground">Real-time weather data integration</p>
            </div>
            <div className="p-4 bg-card/50 rounded-lg border border-border">
              <AlertTriangle className="h-6 w-6 text-warning mb-2" />
              <h3 className="font-semibold text-foreground">Smart Alerts</h3>
              <p className="text-sm text-muted-foreground">AI-driven suspension recommendations</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          City Government of Olongapo &bull; DepEd Olongapo &bull; PAGASA
        </p>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4 lg:hidden">
              <div className="p-2 bg-primary/20 rounded-lg">
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
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@olongapo.gov.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Demo: admin@olongapo.gov.ph / admin123
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
