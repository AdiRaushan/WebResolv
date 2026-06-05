import React from 'react'
import type { Lead, Task, Activity } from '../types'
import {
  Users, CheckCircle, Zap, Target, DollarSign, AlertCircle,
  ArrowUpRight, Mail, PhoneCall, MessageCircle, Video, FileText, Calendar, Edit
} from 'lucide-react'
import {
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

interface DashboardOverviewProps {
  leads: Lead[]
  tasks: Task[]
  activities: Activity[]
  onNav: (tab: string) => void
  onSelectLead: (lead: Lead) => void
  isDark: boolean
  fmtCurrency?: (n: number) => string
}

const STAGES = [
  { id: "new_lead",       label: "New Lead",       hex: "#8b5cf6" },
  { id: "contacted",      label: "Contacted",      hex: "#f59e0b" },
  { id: "interested",     label: "Interested",     hex: "#0ea5e9" },
  { id: "demo_sent",      label: "Demo Sent",      hex: "#3b82f6" },
  { id: "proposal_sent",  label: "Proposal Sent",  hex: "#a855f7" },
  { id: "follow_up",      label: "Follow Up",      hex: "#ec4899" },
  { id: "negotiation",    label: "Negotiation",    hex: "#f97316" },
  { id: "onboarding",     label: "Onboarding",     hex: "#14b8a6" },
  { id: "active_client",  label: "Active Client",  hex: "#22c55e" },
  { id: "completed",      label: "Completed",      hex: "#64748b" },
  { id: "lost",           label: "Lost",           hex: "#ef4444" },
]

const REVENUE_DATA = [
  { month:"Aug", revenue:85000,  leads:12 },
  { month:"Sep", revenue:105000, leads:18 },
  { month:"Oct", revenue:92000,  leads:15 },
  { month:"Nov", revenue:138000, leads:22 },
  { month:"Dec", revenue:125000, leads:20 },
  { month:"Jan", revenue:158000, leads:28 },
]

const SOURCE_DATA = [
  { name:"Google Maps", value:35, color:"#3b82f6" },
  { name:"Cold Call",   value:25, color:"#f59e0b" },
  { name:"Referral",    value:20, color:"#10b981" },
  { name:"WhatsApp",    value:12, color:"#22c55e" },
  { name:"Email",       value:5,  color:"#8b5cf6" },
  { name:"Others",      value:3,  color:"#94a3b8" },
]

const fmtDate = (d: string) => {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const actMeta = (type: string) => ({
  Call:           { icon: PhoneCall,      bg: "bg-blue-500/10 dark:bg-blue-500/15",     color: "text-blue-500" },
  Email:          { icon: Mail,           bg: "bg-purple-500/10 dark:bg-purple-500/15", color: "text-purple-500" },
  WhatsApp:       { icon: MessageCircle,  bg: "bg-green-500/10 dark:bg-green-500/15",   color: "text-green-500" },
  "Demo Sent":    { icon: Video,          bg: "bg-teal-500/10 dark:bg-teal-500/15",     color: "text-teal-500" },
  "Proposal Sent":{ icon: FileText,       bg: "bg-orange-500/10 dark:bg-orange-500/15", color: "text-orange-500" },
  Meeting:        { icon: Calendar,       bg: "bg-orange-500/10 dark:bg-orange-500/15", color: "text-orange-500" },
  Onboarding:     { icon: CheckCircle,    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",color: "text-emerald-500" },
  Note:           { icon: Edit,           bg: "bg-gray-500/10 dark:bg-gray-500/15",     color: "text-gray-400" },
}[type] || { icon: Zap, bg: "bg-gray-500/10", color: "text-gray-400" })

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  leads,
  tasks,
  activities,
  onNav,
  onSelectLead,
  isDark,
  fmtCurrency = fmtINR
}) => {
  const isUSD = fmtCurrency(100).includes('$')
  const curSymbol = isUSD ? '$' : '₹'
  const todayStr = new Date().toISOString().split("T")[0]
  
  const total = leads.length
  const active = leads.filter(l => l.status === "active_client").length
  const todayFollowUps = leads.filter(l => l.nextFollowUp === todayStr).length
  const pipeVal = leads.filter(l => !["completed", "lost"].includes(l.status)).reduce((s, l) => s + (l.dealValue || 0), 0)
  const overdueTasks = tasks.filter(t => t.status === "Overdue" || (t.dueDate && t.dueDate < todayStr && t.status !== "Completed")).length

  const upcomingLeads = [...leads]
    .filter(l => l.nextFollowUp)
    .sort((a, b) => new Date(a.nextFollowUp).getTime() - new Date(b.nextFollowUp).getTime())
    .slice(0, 5)

  const recentActs = [...activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(act => ({
      ...act,
      lead: leads.find(l => l.id === act.leadId)
    }))

  const gridColor = isDark ? "#1e293b" : "#f1f5f9"
  const tickColor = isDark ? "#94a3b8" : "#64748b"

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white leading-tight">
            Console Overview & Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {overdueTasks > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-500">
              <AlertCircle size={14} />
              <span>{overdueTasks} Overdue Tasks</span>
            </div>
          )}
          {todayFollowUps > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-500 animate-pulse">
              <Zap size={14} />
              <span>{todayFollowUps} Follow-ups Today</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Leads */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 font-mono">Leads CRM</span>
            <div className="p-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl">
              <Users size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black font-display text-slate-800 dark:text-white mt-3">{total}</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-1 text-emerald-500">
            <ArrowUpRight size={12} />
            <span>+12% conversion</span>
          </p>
        </div>

        {/* Card 2: Active Clients */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 font-mono">Clients</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <CheckCircle size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black font-display text-slate-800 dark:text-white mt-3">{active}</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">Onboarded & Live</p>
        </div>

        {/* Card 3: Pipeline Value */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 font-mono">Pipeline</span>
            <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
              <Target size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black font-display text-slate-800 dark:text-white mt-3">{curSymbol}{(pipeVal / 1000).toFixed(0)}K</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">Weighted potential deal value</p>
        </div>

        {/* Card 4: Monthly Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 font-mono">Revenue</span>
            <div className="p-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl">
              <DollarSign size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black font-display text-slate-800 dark:text-white mt-3">{curSymbol}158K</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-1 text-emerald-500">
            <ArrowUpRight size={12} />
            <span>+15% monthly growth</span>
          </p>
        </div>
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Side: Revenue & Conversion Area chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm xl:col-span-2 space-y-4">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            Traffic & B2B Lead Conversion
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="rev" tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} tickFormatter={v => `${curSymbol}${v/1000}K`} />
                <YAxis yAxisId="lds" orientation="right" tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: isDark ? '#0b0f19' : '#fff',
                    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                    borderRadius: '16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '11px'
                  }}
                  labelClassName="font-mono text-slate-400"
                  formatter={(value: any, name: any) => name === "revenue" ? [fmtCurrency(value), "Revenue"] : [value, "Leads"]}
                />
                <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="url(#revenueGlow)" />
                <Bar yAxisId="lds" dataKey="leads" fill={isDark ? "#1e293b" : "#f1f5f9"} radius={[4, 4, 0, 0]} barSize={12} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Lead Source distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            Lead Source Channels
          </h4>
          <div className="h-32 my-4 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={SOURCE_DATA} cx="50%" cy="50%" innerRadius={36} outerRadius={55} paddingAngle={3} dataKey="value">
                  {SOURCE_DATA.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: isDark ? '#0b0f19' : '#fff',
                    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    fontSize: '10px'
                  }}
                  formatter={(v: any) => [`${v}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {SOURCE_DATA.slice(0, 4).map((source, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: source.color }} />
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{source.name}</span>
                </div>
                <span className="text-slate-700 dark:text-slate-200 font-bold">{source.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column details (Follow-ups & Activities) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Upcoming Followups */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Actionable Followups
            </h4>
            <button
              onClick={() => onNav("leads")}
              className="text-xs font-bold text-orange-500 dark:text-orange-400 hover:underline cursor-pointer"
            >
              See all leads
            </button>
          </div>
          <div className="space-y-3">
            {upcomingLeads.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs font-medium">
                No scheduled followups found.
              </div>
            ) : (
              upcomingLeads.map((lead) => {
                const s = STAGES.find(x => x.id === lead.status) || STAGES[0]
                const isToday = lead.nextFollowUp === todayStr
                return (
                  <div
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800/60 cursor-pointer transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs font-display"
                        style={{ backgroundColor: s.hex }}
                      >
                        {lead.businessName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-orange-500 transition-colors">
                          {lead.businessName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">{lead.contactPerson}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-[10px] font-bold ${isToday ? 'text-amber-500 font-black' : 'text-slate-400 dark:text-slate-500'}`}>
                        {isToday ? 'TODAY' : fmtDate(lead.nextFollowUp)}
                      </p>
                      <p className="text-[10px] font-bold text-emerald-500 mt-0.5">{fmtCurrency(lead.dealValue)}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Side: Recent Activity log */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              CRM Activity Logs
            </h4>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Real-time
            </span>
          </div>
          <div className="space-y-4">
            {recentActs.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs font-medium">
                No activity logged yet.
              </div>
            ) : (
              recentActs.map((act) => {
                const { icon: Icon, bg, color } = actMeta(act.type)
                return (
                  <div key={act.id} className="flex gap-3 items-start text-xs">
                    <div className={`p-2 rounded-xl shrink-0 ${bg} ${color}`}>
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-800 dark:text-white leading-snug">
                        <span className="font-bold">{act.lead?.businessName || 'General'}</span>
                        <span className="text-slate-400 dark:text-slate-500 font-medium"> · {act.type}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed truncate">{act.description}</p>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 font-mono mt-0.5 shrink-0">
                      {fmtDate(act.date)}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
