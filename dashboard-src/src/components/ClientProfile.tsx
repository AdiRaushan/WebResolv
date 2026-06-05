import React, { useState } from 'react'
import type { Lead, Task, Activity } from '../types'
import {
  ChevronLeft, Phone, Mail, MessageCircle, Globe, MapPin, Calendar, Clock,
  User, Tag, Bell, Plus, CheckCircle, Activity as ActIcon, Edit, Trash2, X, FileText, Upload
} from 'lucide-react'

interface ClientProfileProps {
  lead: Lead
  activities: Activity[]
  tasks: Task[]
  onBack: () => void
  onSaveActivity: (act: Omit<Activity, 'id'>) => Promise<Activity>
  onDeleteActivity: (id: string) => Promise<void>
  onSaveTask: (task: Omit<Task, 'id'> & { id?: string }) => Promise<Task>
  onDeleteTask: (id: string) => Promise<void>
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

const ACT_TYPES = ["Call", "Email", "WhatsApp", "Demo Sent", "Proposal Sent", "Meeting", "Note", "Onboarding"]
const TASK_TYPES = ["Call Client", "Send Proposal", "Send Demo", "Follow Up", "Collect Payment", "Send Email", "Meeting"]

const fmtDate = (d: string) => {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const actMeta = (type: string) => ({
  Call:           { icon: Phone,          bg: "bg-blue-500/10 dark:bg-blue-500/15",     color: "text-blue-500" },
  Email:          { icon: Mail,           bg: "bg-purple-500/10 dark:bg-purple-500/15", color: "text-purple-500" },
  WhatsApp:       { icon: MessageCircle,  bg: "bg-green-500/10 dark:bg-green-500/15",   color: "text-green-500" },
  "Demo Sent":    { icon: ActIcon,        bg: "bg-teal-500/10 dark:bg-teal-500/15",     color: "text-teal-500" },
  "Proposal Sent":{ icon: FileText,       bg: "bg-orange-500/10 dark:bg-orange-500/15", color: "text-orange-500" },
  Meeting:        { icon: Calendar,       bg: "bg-orange-500/10 dark:bg-orange-500/15", color: "text-orange-500" },
  Onboarding:     { icon: CheckCircle,    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",color: "text-emerald-500" },
  Note:           { icon: Edit,           bg: "bg-gray-500/10 dark:bg-gray-500/15",     color: "text-gray-400" },
}[type] || { icon: ActIcon, bg: "bg-gray-500/10", color: "text-gray-400" })

const taskColor = (s: string) => ({
  Pending:     { bg: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-500/10" },
  "In Progress":{ bg: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-500/10" },
  Completed:   { bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-500/10" },
  Overdue:     { bg: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-500/10" },
}[s] || { bg: "bg-gray-100 text-gray-800 dark:bg-gray-800" })

export const ClientProfile: React.FC<ClientProfileProps> = ({
  lead,
  activities,
  tasks,
  onBack,
  onSaveActivity,
  onDeleteActivity,
  onSaveTask,
  onDeleteTask,
  fmtCurrency = fmtINR
}) => {
  const [tab, setTab] = useState<'timeline' | 'tasks' | 'files'>('timeline')
  const s = STAGES.find(x => x.id === lead.status) || STAGES[0]
  
  // Filter activities and tasks for this lead
  const leadActivities = activities.filter(a => a.leadId === lead.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const leadTasks = tasks.filter(t => t.leadId === lead.id)

  // Modals & Forms state
  const [isActModalOpen, setIsActModalOpen] = useState(false)
  const [actType, setActType] = useState("Call")
  const [actDesc, setActDesc] = useState("")
  const [actDuration, setActDuration] = useState("")

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [taskType, setTaskType] = useState("Call Client")
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDueDate, setTaskDueDate] = useState("")
  const [taskNotes, setTaskNotes] = useState("")

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!actDesc) return
    await onSaveActivity({
      leadId: lead.id,
      type: actType,
      description: actDesc,
      date: new Date().toISOString().split('T')[0],
      duration: actDuration
    })
    setIsActModalOpen(false)
    setActDesc("")
    setActDuration("")
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle) return
    await onSaveTask({
      leadId: lead.id,
      type: taskType,
      title: taskTitle,
      status: "Pending",
      dueDate: taskDueDate,
      notes: taskNotes
    })
    setIsTaskModalOpen(false)
    setTaskTitle("")
    setTaskDueDate("")
    setTaskNotes("")
  }

  const toggleTaskStatus = async (task: Task) => {
    const nextStatus = task.status === "Completed" ? "Pending" : "Completed"
    await onSaveTask({
      ...task,
      status: nextStatus
    })
  }

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Header back + Business profile header */}
      <div className="flex gap-4 items-start">
        <button
          onClick={onBack}
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-2xl cursor-pointer transition-all shadow-sm shrink-0"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg font-display shrink-0 shadow-sm"
                style={{ backgroundColor: s.hex }}
              >
                {lead.businessName[0]}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-extrabold font-display text-slate-900 dark:text-white truncate">
                  {lead.businessName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                    style={{ backgroundColor: s.hex + '15', color: s.hex }}
                  >
                    {s.label}
                  </span>
                  <span>·</span>
                  <span>{lead.industry}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><MapPin size={10} /> {lead.city}</span>
                </div>
              </div>
            </div>

            {/* Deal Value & Quick contacts */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated Value</p>
                <p className="text-lg font-black text-emerald-500 mt-0.5">{fmtCurrency(lead.dealValue)}</p>
              </div>
              <div className="flex gap-1.5 shrink-0 border-l border-slate-200 dark:border-slate-800/80 pl-4">
                <a
                  href={`tel:${lead.phone}`}
                  className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500/20 transition-all border border-transparent dark:border-blue-500/10"
                >
                  <Phone size={14} />
                </a>
                <a
                  href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center hover:bg-emerald-500/20 transition-all border border-transparent dark:border-emerald-500/10"
                >
                  <MessageCircle size={14} />
                </a>
                <a
                  href={`mailto:${lead.email}`}
                  className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center hover:bg-purple-500/20 transition-all border border-transparent dark:border-purple-500/10"
                >
                  <Mail size={14} />
                </a>
                {lead.website && (
                  <a
                    href={`https://${lead.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800/80 transition-all"
                  >
                    <Globe size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">Lead Metadata Profile</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["Contact Person", lead.contactPerson, User],
            ["Phone Number", lead.phone, Phone],
            ["Email Address", lead.email || "—", Mail],
            ["Source Origin", lead.source, Tag],
            ["Location City", lead.city, MapPin],
            ["Created Date", fmtDate(lead.createdDate), Calendar],
            ["Last Contact", lead.lastContact ? fmtDate(lead.lastContact) : "Never", Clock],
            ["Next Followup", lead.nextFollowUp ? fmtDate(lead.nextFollowUp) : "Not scheduled", Bell]
          ].map(([label, value, Icon]: any) => (
            <div key={label} className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1 font-semibold uppercase text-[9px] tracking-wide">
                <Icon size={11} />
                <span>{label}</span>
              </div>
              <p className="text-slate-800 dark:text-white font-extrabold truncate">{value}</p>
            </div>
          ))}
        </div>
        
        {lead.notes && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-1">
            <h4 className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wide">Deal Notes / Requirements</h4>
            <p className="text-slate-800 dark:text-slate-300 font-medium leading-relaxed">{lead.notes}</p>
          </div>
        )}
      </div>

      {/* Tab Navigators */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1.5 shrink-0">
        {[
          ['timeline', 'Timeline History', leadActivities.length],
          ['tasks', 'Task Checklist', leadTasks.length],
          ['files', 'Documents Vault', 3]
        ].map(([id, label, count]: any) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 font-bold transition-all border-b-2 relative -mb-[2px] cursor-pointer ${
              tab === id 
                ? 'border-orange-500 text-orange-500 dark:text-white dark:border-orange-500' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <span>{label}</span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold">
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}
      {/* 1. Timeline Tab */}
      {tab === 'timeline' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold font-display text-slate-800 dark:text-white text-sm">Activity Logs</h3>
            <button
              onClick={() => setIsActModalOpen(true)}
              className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-orange-500/10"
            >
              <Plus size={12} />
              <span>Log Activity</span>
            </button>
          </div>

          {leadActivities.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center text-slate-500 font-medium shadow-sm">
              <ActIcon size={24} className="mx-auto text-slate-400 mb-2" />
              <span>No activities logged for this lead.</span>
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 dark:border-slate-800 ml-3 py-1.5">
              {leadActivities.map(act => {
                const { icon: Icon, bg, color } = actMeta(act.type)
                return (
                  <div key={act.id} className="relative group">
                    {/* Circle icon marker on timeline */}
                    <div className={`absolute -left-[37px] top-1.5 w-7 h-7 rounded-lg ${bg} ${color} flex items-center justify-center border border-white dark:border-slate-950 z-10 shadow-sm`}>
                      <Icon size={12} />
                    </div>
                    
                    {/* Activity details panel */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm relative hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex justify-between items-start gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800 dark:text-white">{act.type}</span>
                          <span className="text-[10px] text-slate-400 font-medium">Logged on {fmtDate(act.date)}</span>
                          {act.duration && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-400 text-[9px] font-bold font-mono">
                              {act.duration}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{act.description}</p>
                      </div>

                      <button
                        onClick={() => onDeleteActivity(act.id)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all cursor-pointer border border-transparent dark:border-red-500/10"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Tasks Tab */}
      {tab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold font-display text-slate-800 dark:text-white text-sm">Pending Tasks Checklist</h3>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-orange-500/10"
            >
              <Plus size={12} />
              <span>Add Task</span>
            </button>
          </div>

          {leadTasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center text-slate-500 font-medium shadow-sm">
              <CheckCircle size={24} className="mx-auto text-slate-400 mb-2" />
              <span>No tasks scheduled for this lead.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {leadTasks.map(task => {
                const isCompleted = task.status === "Completed"
                const tc = taskColor(task.status)
                return (
                  <div
                    key={task.id}
                    className={`bg-white dark:bg-slate-900 border ${
                      isCompleted ? 'border-slate-100 dark:border-slate-800/40 bg-slate-50/40 dark:bg-slate-900/10' : 'border-slate-200 dark:border-slate-800/80 shadow-sm'
                    } rounded-2xl p-4 flex justify-between items-center gap-4 transition-all duration-200`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        className={`w-5 h-5 rounded-lg border-2 mt-0.5 cursor-pointer shrink-0 flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                            : 'border-slate-300 dark:border-slate-700 hover:border-orange-500'
                        }`}
                      >
                        {isCompleted && <CheckCircle size={12} />}
                      </button>
                      <div className="min-w-0">
                        <p className={`font-bold leading-snug ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}>
                          {task.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <span className={`px-2 py-0.5 rounded border text-[9px] ${tc.bg}`}>{task.status}</span>
                          <span>·</span>
                          <span>{task.type}</span>
                          {task.dueDate && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-0.5"><Clock size={10} /> {fmtDate(task.dueDate)}</span>
                            </>
                          )}
                        </div>
                        {task.notes && (
                          <p className="text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">{task.notes}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all cursor-pointer border border-transparent dark:border-red-500/10 shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. Files Tab */}
      {tab === 'files' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold font-display text-slate-800 dark:text-white text-sm">Documents Repository</h3>
            <button
              onClick={() => alert('Mock Upload: Client branding guidelines & specifications file uploaded successfully.')}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-orange-500/10"
            >
              <Upload size={12} />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { name: "Brand Guidelines (v1.2).pdf", size: "2.4 MB", date: "Jan 12, 2024" },
              { name: "Website Wireframe Redesign.fig", size: "12.8 MB", date: "Jan 15, 2024" },
              { name: "Retainer Proposal signed.docx", size: "412 KB", date: "Jan 18, 2024" }
            ].map((file, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-start gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer">
                <div className="p-2.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl shrink-0">
                  <FileText size={16} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 dark:text-white truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                    {file.size} · {file.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Activity Modal */}
      {isActModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsActModalOpen(false)} />
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative z-10 font-sans flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 p-5">
              <h3 className="font-extrabold font-display text-slate-800 dark:text-white text-sm">Log CRM Activity</h3>
              <button onClick={() => setIsActModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={16} /></button>
            </div>
            <form onSubmit={handleAddActivity} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Activity Type</label>
                  <select
                    value={actType}
                    onChange={e => setActType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white font-semibold"
                  >
                    {ACT_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Duration</label>
                  <input
                    type="text"
                    value={actDuration}
                    onChange={e => setActDuration(e.target.value)}
                    placeholder="e.g. 15 mins, 2 hours"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Description / Notes *</label>
                <textarea
                  value={actDesc}
                  onChange={e => setActDesc(e.target.value)}
                  placeholder="Detail what was discussed or accomplished in this interaction..."
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white transition-all resize-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 justify-end">
                <button
                  type="button"
                  onClick={() => setIsActModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-xl transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsTaskModalOpen(false)} />
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative z-10 font-sans flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 p-5">
              <h3 className="font-extrabold font-display text-slate-800 dark:text-white text-sm">Add Lead Task</h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={16} /></button>
            </div>
            <form onSubmit={handleAddTask} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Task Type</label>
                  <select
                    value={taskType}
                    onChange={e => setTaskType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white font-semibold"
                  >
                    {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={e => setTaskDueDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Task Title / Subject *</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="e.g. Call client to finalize price details"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Task Notes</label>
                <textarea
                  value={taskNotes}
                  onChange={e => setTaskNotes(e.target.value)}
                  placeholder="Additional task requirements or steps..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white transition-all resize-none"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 justify-end">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-xl transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
