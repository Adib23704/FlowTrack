'use client'

import { ArrowRight, BarChart3, Shield, Users, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'

const features = [
  { icon: Zap, text: 'Real-time delivery tracking' },
  { icon: Users, text: 'Team performance insights' },
  { icon: Shield, text: 'Client satisfaction metrics' },
]

const demoAccounts = [
  { role: 'Admin', email: 'admin@flowtrack.com', password: 'admin123' },
  { role: 'Team', email: 'john@flowtrack.com', password: 'team123' },
  { role: 'Client', email: 'client@acme.com', password: 'client123' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const quickLogin = (account: (typeof demoAccounts)[0]) => {
    setEmail(account.email)
    setPassword(account.password)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-indigo-600" />
      </div>
    )
  }

  if (user) return null

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 lg:block relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white">FlowTrack</span>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold leading-tight text-white">
                Delivery insights
                <br />
                <span className="text-indigo-200">that drive results</span>
              </h1>
              <p className="mt-4 max-w-md text-lg text-indigo-100/80">
                Track project health, team workload, and client satisfaction with automated scoring
                and weekly reports.
              </p>
            </div>

            <div className="space-y-4">
              {features.map(feature => (
                <div key={feature.text} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <feature.icon className="h-4 w-4 text-indigo-200" />
                  </div>
                  <span className="text-indigo-100">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-indigo-200/60">Trusted by teams shipping better software</p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-slate-50 px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">FlowTrack</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
            <p className="mt-1 text-slate-500">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-11 border-slate-200 bg-white transition-shadow focus:border-indigo-500 focus:ring-indigo-500/20"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-11 border-slate-200 bg-white transition-shadow focus:border-indigo-500 focus:ring-indigo-500/20"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full bg-indigo-600 font-medium text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-50 px-3 text-slate-400">Demo accounts</span>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {demoAccounts.map(account => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => quickLogin(account)}
                  className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50/50"
                >
                  <div>
                    <span className="text-sm font-medium text-slate-700">{account.role}</span>
                    <span className="ml-2 text-xs text-slate-400">{account.email}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
