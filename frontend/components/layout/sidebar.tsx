'use client'

import {
  Activity,
  BarChart3,
  ChevronRight,
  ClipboardList,
  FolderKanban,
  Home,
  LogOut,
  Users,
  UsersRound,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles?: string[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Home className="h-[18px] w-[18px]" />,
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: <FolderKanban className="h-[18px] w-[18px]" />,
  },
  {
    label: 'Teams',
    href: '/teams',
    icon: <UsersRound className="h-[18px] w-[18px]" />,
    roles: ['admin'],
  },
  {
    label: 'Users',
    href: '/users',
    icon: <Users className="h-[18px] w-[18px]" />,
    roles: ['admin'],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: <ClipboardList className="h-[18px] w-[18px]" />,
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: <BarChart3 className="h-[18px] w-[18px]" />,
    roles: ['admin'],
  },
  {
    label: 'Activity',
    href: '/activity',
    icon: <Activity className="h-[18px] w-[18px]" />,
    roles: ['admin'],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const filteredNavItems = navItems.filter(
    item => !item.roles || (user && item.roles.includes(user.role))
  )

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-indigo-100 text-indigo-700'
      case 'team':
        return 'bg-emerald-100 text-emerald-700'
      case 'client':
        return 'bg-amber-100 text-amber-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-sm shadow-indigo-200">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-semibold text-slate-900">FlowTrack</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {filteredNavItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <span
                  className={cn(
                    'transition-colors',
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 text-indigo-400" />}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-sm font-medium text-white shadow-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{user?.name}</p>
            <span
              className={cn(
                'inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                getRoleBadgeStyle(user?.role || '')
              )}
            >
              {user?.role}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
