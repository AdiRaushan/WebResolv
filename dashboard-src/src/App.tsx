import React, { useState, useEffect } from 'react'
import { QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { repository } from './lib/repository'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import type { Lead, Task, Activity } from './types'
import { AuthScreen } from './components/AuthScreen'
import { DashboardOverview } from './components/DashboardOverview'
import { LeadsView } from './components/LeadsView'
import { PipelineView } from './components/PipelineView'
import { ClientProfile } from './components/ClientProfile'
import { TasksView } from './components/TasksView'
import { TemplatesView } from './components/TemplatesView'
import {
  LayoutDashboard, Users, Layers, CheckSquare, Mail, 
  Moon, Sun, LogOut, Menu, X
} from 'lucide-react'

// Main App container providing QueryClient
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CRMManager />
    </QueryClientProvider>
  )
}

const CRMManager: React.FC = () => {
  // Navigation & Theme
  const [activeTab, setActiveTab] = useState('overview') // overview, leads, pipeline, tasks, templates, client_profile
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isDark, setIsDark] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Currency Toggle State
  const [currency, setCurrency] = useState<'INR' | 'USD'>(() => {
    return (localStorage.getItem('wr_crm_currency') as 'INR' | 'USD') || 'INR'
  })

  const handleToggleCurrency = () => {
    const next = currency === 'INR' ? 'USD' : 'INR'
    setCurrency(next)
    localStorage.setItem('wr_crm_currency', next)
  }

  const fmtCurrency = (n: number) => {
    return new Intl.NumberFormat(currency === 'INR' ? "en-IN" : "en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0
    }).format(n)
  }

  // Auth Session State
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  // 1. Auth Handlers
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Check current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          setUserEmail(session.user.email)
        }
        setAuthChecked(true)
      })

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.email) {
          setUserEmail(session.user.email)
        } else {
          setUserEmail(null)
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    } else {
      // Local Storage session fallback
      const savedEmail = localStorage.getItem('wr_crm_session_email')
      if (savedEmail) {
        setUserEmail(savedEmail)
      }
      setAuthChecked(true)
    }
  }, [])

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email)
    if (!isSupabaseConfigured) {
      localStorage.setItem('wr_crm_session_email', email)
    }
  }

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    } else {
      localStorage.removeItem('wr_crm_session_email')
    }
    setUserEmail(null)
    setActiveTab('overview')
    setSelectedLead(null)
  }

  // 2. Theme Toggler
  useEffect(() => {
    const root = window.document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  // 3. React Query Data Fetching
  const { data: leads = [], refetch: refetchLeads } = useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: repository.getLeads,
    enabled: !!userEmail
  })

  const { data: tasks = [], refetch: refetchTasks } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: repository.getTasks,
    enabled: !!userEmail
  })

  const { data: activities = [], refetch: refetchActivities } = useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: repository.getActivities,
    enabled: !!userEmail
  })

  // 4. Mutation Handlers
  const saveLeadMutation = useMutation({
    mutationFn: repository.saveLead,
    onSuccess: (savedLead) => {
      refetchLeads()
      // If we are currently viewing this lead, update it in local select state
      if (selectedLead && selectedLead.id === savedLead.id) {
        setSelectedLead(savedLead)
      }
    }
  })

  const saveLeadStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => repository.updateLeadStatus(id, status),
    onSuccess: () => refetchLeads()
  })

  const deleteLeadMutation = useMutation({
    mutationFn: repository.deleteLead,
    onSuccess: () => {
      refetchLeads()
      setSelectedLead(null)
      setActiveTab('leads')
    }
  })

  const saveTaskMutation = useMutation({
    mutationFn: repository.saveTask,
    onSuccess: () => refetchTasks()
  })

  const deleteTaskMutation = useMutation({
    mutationFn: repository.deleteTask,
    onSuccess: () => refetchTasks()
  })

  const saveActivityMutation = useMutation({
    mutationFn: repository.saveActivity,
    onSuccess: () => refetchActivities()
  })

  const deleteActivityMutation = useMutation({
    mutationFn: repository.deleteActivity,
    onSuccess: () => refetchActivities()
  })

  const handleResetDatabase = async () => {
    if (confirm("Reset local storage database? This loads default seed configurations.")) {
      await repository.resetLocalStorage()
      refetchLeads()
      refetchTasks()
      refetchActivities()
      setSelectedLead(null)
      setActiveTab('overview')
    }
  }

  // Render Spinner if session loading
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Render Login screen if not authenticated
  if (!userEmail) {
    return <AuthScreen onSuccess={handleLoginSuccess} />
  }

  // Helper navigation selection
  const handleSelectLeadProfile = (lead: Lead) => {
    setSelectedLead(lead)
    setActiveTab('client_profile')
    setIsMobileMenuOpen(false)
  }

  const navigateTab = (tab: string) => {
    setActiveTab(tab)
    setSelectedLead(null)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-background text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-border bg-white dark:bg-card p-6 shrink-0 justify-between select-none">
        <div className="space-y-8">
          {/* Brand */}
          <div className="flex flex-col">
            <span className="font-display font-black text-2xl tracking-tighter text-slate-900 dark:text-white">
              WebResolv<span className="text-orange-500">.</span>
            </span>
            <span className="text-[9px] font-mono tracking-widest text-slate-400 dark:text-slate-500 uppercase mt-1">
              Studio CMS Engine
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-3 mb-2">CRM Admin Views</p>

            <button
              onClick={() => navigateTab('overview')}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                activeTab === 'overview'
                  ? 'bg-slate-100 dark:bg-background text-orange-500 border-slate-200 dark:border-orange-500/30 shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-background/40 hover:text-orange-500 dark:hover:text-orange-500'
              }`}
            >
              <LayoutDashboard size={15} />
              <span>Overview & Stats</span>
            </button>

            <button
              onClick={() => navigateTab('leads')}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                activeTab === 'leads'
                  ? 'bg-slate-100 dark:bg-background text-orange-500 border-slate-200 dark:border-orange-500/30 shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-background/40 hover:text-orange-500 dark:hover:text-orange-500'
              }`}
            >
              <Users size={15} />
              <span>Captured Leads</span>
            </button>

            <button
              onClick={() => navigateTab('pipeline')}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                activeTab === 'pipeline'
                  ? 'bg-slate-100 dark:bg-background text-orange-500 border-slate-200 dark:border-orange-500/30 shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-background/40 hover:text-orange-500 dark:hover:text-orange-500'
              }`}
            >
              <Layers size={15} />
              <span>Sales Pipeline</span>
            </button>

            <button
              onClick={() => navigateTab('tasks')}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                activeTab === 'tasks'
                  ? 'bg-slate-100 dark:bg-background text-orange-500 border-slate-200 dark:border-orange-500/30 shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-background/40 hover:text-orange-500 dark:hover:text-orange-500'
              }`}
            >
              <CheckSquare size={15} />
              <span>CRM Task Check</span>
            </button>

            <button
              onClick={() => navigateTab('templates')}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                activeTab === 'templates'
                  ? 'bg-slate-100 dark:bg-background text-orange-500 border-slate-200 dark:border-orange-500/30 shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-background/40 hover:text-orange-500 dark:hover:text-orange-500'
              }`}
            >
              <Mail size={15} />
              <span>Message Templates</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer triggers */}
        <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800/80">
          <div className="px-3 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            <span className="truncate max-w-[110px]">{userEmail}</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleCurrency}
                className="px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-bold border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[9px] cursor-pointer"
                title="Toggle Currency"
              >
                {currency}
              </button>
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-all cursor-pointer"
              >
                {isDark ? <Sun size={12} /> : <Moon size={12} />}
              </button>
            </div>
          </div>

          {!isSupabaseConfigured && (
            <button
              onClick={handleResetDatabase}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-2xl text-[10px] font-bold bg-amber-500/10 border border-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
            >
              Reset Mock DB
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-[10px] font-bold bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-all cursor-pointer"
          >
            <LogOut size={13} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* WORKSPACE AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* MOBILE HEADER BAR */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-border bg-white dark:bg-card sticky top-0 z-30 select-none shadow-sm">
          <span className="font-display font-black text-lg tracking-tighter text-slate-900 dark:text-white">
            WebResolv<span className="text-orange-500">.</span>
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-slate-50 dark:bg-background border border-slate-200 dark:border-border rounded-xl text-slate-600 dark:text-slate-300"
          >
            {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </header>

        {/* MOBILE NAVIGATION DRAWER */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <aside className="w-64 bg-white dark:bg-card p-6 flex flex-col justify-between border-r border-slate-200 dark:border-border z-10 relative">
              <div className="space-y-6">
                <span className="font-display font-black text-xl text-slate-900 dark:text-white block mb-6">Menu</span>
                <nav className="space-y-1.5">
                  {[
                    ['overview', 'Overview & Stats', LayoutDashboard],
                    ['leads', 'Captured Leads', Users],
                    ['pipeline', 'Sales Pipeline', Layers],
                    ['tasks', 'CRM Task Check', CheckSquare],
                    ['templates', 'Message Templates', Mail]
                  ].map(([id, label, Icon]: any) => (
                    <button
                      key={id}
                      onClick={() => navigateTab(id)}
                      className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        activeTab === id && !selectedLead
                          ? 'bg-slate-100 dark:bg-background text-orange-500 border-slate-200 dark:border-orange-500/30'
                          : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-background/40 hover:text-orange-500 dark:hover:text-orange-500'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="truncate max-w-[130px]">{userEmail}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleCurrency}
                      className="px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-bold border border-slate-200 dark:border-slate-800 text-[9px]"
                    >
                      {currency}
                    </button>
                    <button onClick={() => setIsDark(!isDark)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                      {isDark ? <Sun size={12} /> : <Moon size={12} />}
                    </button>
                  </div>
                </div>
                {!isSupabaseConfigured && (
                  <button
                    onClick={handleResetDatabase}
                    className="w-full py-2 bg-amber-500/10 border border-amber-500/10 text-amber-500 rounded-xl text-[10px] font-bold"
                  >
                    Reset Mock DB
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full py-2 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5"
                >
                  <LogOut size={12} />
                  <span>Log Out</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* MAIN DISPLAY WORKSPACE */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {activeTab === 'overview' && (
            <DashboardOverview
              leads={leads}
              tasks={tasks}
              activities={activities}
              onNav={navigateTab}
              onSelectLead={handleSelectLeadProfile}
              isDark={isDark}
              fmtCurrency={fmtCurrency}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsView
              leads={leads}
              onSelectLead={handleSelectLeadProfile}
              onSaveLead={saveLeadMutation.mutateAsync}
              onDeleteLead={deleteLeadMutation.mutateAsync}
              fmtCurrency={fmtCurrency}
            />
          )}

          {activeTab === 'pipeline' && (
            <PipelineView
              leads={leads}
              onStatusChange={(id, status) => saveLeadStatusMutation.mutateAsync({ id, status })}
              onSelectLead={handleSelectLeadProfile}
              fmtCurrency={fmtCurrency}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              leads={leads}
              onSaveTask={saveTaskMutation.mutateAsync}
              onDeleteTask={deleteTaskMutation.mutateAsync}
              onSelectLead={handleSelectLeadProfile}
            />
          )}

          {activeTab === 'templates' && <TemplatesView />}

          {activeTab === 'client_profile' && selectedLead && (
            <ClientProfile
              lead={selectedLead}
              activities={activities}
              tasks={tasks}
              onBack={() => navigateTab('leads')}
              onSaveActivity={saveActivityMutation.mutateAsync}
              onDeleteActivity={deleteActivityMutation.mutateAsync}
              onSaveTask={saveTaskMutation.mutateAsync}
              onDeleteTask={deleteTaskMutation.mutateAsync}
              fmtCurrency={fmtCurrency}
            />
          )}
        </main>

      </div>
    </div>
  )
}

export default App
