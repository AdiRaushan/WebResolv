import React, { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { LayoutDashboard, Mail, Lock, ShieldAlert, Check } from 'lucide-react'

interface AuthScreenProps {
  onSuccess: (email: string) => void
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    if (!email || !password) {
      setError('Please fill in all fields.')
      setLoading(false)
      return
    }

    if (isSupabaseConfigured && supabase) {
      try {
        if (isSignUp) {
          const { error } = await supabase.auth.signUp({ email, password })
          if (error) throw error
          setSuccessMsg('Sign up successful! Please check your email for confirmation.')
        } else {
          const { error, data } = await supabase.auth.signInWithPassword({ email, password })
          if (error) throw error
          if (data?.user?.email) {
            onSuccess(data.user.email)
          }
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during authentication.')
      } finally {
        setLoading(false)
      }
    } else {
      // Local Storage Fallback Mode
      setTimeout(() => {
        setLoading(false)
        if (isSignUp) {
          // Simulate sign up
          localStorage.setItem('wr_mock_user', JSON.stringify({ email, password }))
          setSuccessMsg('Account created successfully! You can now log in.')
          setIsSignUp(false)
        } else {
          // Simulate login
          const mockUser = localStorage.getItem('wr_mock_user')
          if (mockUser) {
            const parsed = JSON.parse(mockUser)
            if (parsed.email === email && parsed.password === password) {
              onSuccess(email)
              return
            }
          }
          // Default bypass for local testing: allow any email if no user is registered yet
          onSuccess(email)
        }
      }, 800)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-slate-100 p-4 relative overflow-hidden font-sans">
      {/* Background spot glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-950/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center mb-3 text-white shadow-lg shadow-orange-500/30">
            <LayoutDashboard size={24} />
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-white">
            WebResolv<span className="text-orange-500">.</span>
          </h1>
          <span className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-mono">CRM Admin Suite</span>
        </div>

        {/* Fallback Warning */}
        {!isSupabaseConfigured && (
          <div className="flex items-start gap-2.5 p-3.5 mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Offline / Fallback Mode Active</p>
              <p className="opacity-90">Supabase credentials are missing. Running locally via Local Storage. Enter any email/password to log in.</p>
            </div>
          </div>
        )}

        {/* Header Tabs */}
        <div className="flex bg-slate-900 p-1.5 rounded-2xl mb-6">
          <button
            onClick={() => { setIsSignUp(false); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 text-center text-sm font-semibold rounded-xl transition-all ${!isSignUp ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Log In
          </button>
          <button
            onClick={() => { setIsSignUp(true); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 text-center text-sm font-semibold rounded-xl transition-all ${isSignUp ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium flex gap-1.5 items-center">
              <Check size={14} />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-xl py-3 pl-10 pr-4 text-sm outline-none text-white transition-all focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-xl py-3 pl-10 pr-4 text-sm outline-none text-white transition-all focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{isSignUp ? 'Create Account' : 'Log In to Console'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

