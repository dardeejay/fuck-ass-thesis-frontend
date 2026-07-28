"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Shield,
  LayoutDashboard,
  History,
  TestTube2,
  Users,
  Megaphone,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Moon,
  Sun,
  ClipboardCheck,
  Cpu,
} from "lucide-react"
import { useTheme } from "next-themes"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Historical Data", href: "/dashboard/historical", icon: History },
  {
    name: "Scenario Simulation",
    href: "/dashboard/simulation",
    icon: TestTube2,
  },
  { name: "Post Automation", href: "/dashboard/social-posts", icon: Megaphone },
  { name: "Label Today", href: "/dashboard/label", icon: ClipboardCheck },
  { name: "Model Training", href: "/dashboard/model", icon: Cpu },
  { name: "User Management", href: "/dashboard/users", icon: Users },
]

export default function DashboardLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const userName = session?.user?.name ?? "Admin User"
  const userEmail = session?.user?.email ?? "admin@olongapo.gov.ph"
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-16 items-center gap-3 border-b border-sidebar-border px-4",
            collapsed && "justify-center"
          )}
        >
          <div className="shrink-0 rounded-lg bg-primary/20 p-1.5">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="block text-sm font-bold text-sidebar-foreground">
                Project HANDA
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                Olongapo City
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto text-sidebar-foreground lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse toggle - desktop only */}
        <div className="hidden border-t border-sidebar-border p-3 lg:block">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              collapsed && "px-2"
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180"
              )}
            />
            {!collapsed && <span className="ml-2">Collapse</span>}
          </Button>
        </div>

        {/* Logout */}
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            className={cn(
              "w-full text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive",
              collapsed ? "justify-center px-2" : "justify-start"
            )}
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/95 px-4 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-4 lg:ml-0">
            <h1 className="text-lg font-semibold text-foreground">
              {navigation.find((item) => item.href === pathname)?.name ||
                "Dashboard"}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20">
              <span className="text-sm font-medium text-primary">
                {userInitial}
              </span>
            </div>
          </div>
          <div>
            {/* dark mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 text-foreground"
              onClick={() => {
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }}
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">{children}</main>
      </div>

      {modal}
    </div>
  )
}
