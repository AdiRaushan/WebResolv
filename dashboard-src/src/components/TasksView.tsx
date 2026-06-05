import React, { useState, useMemo } from 'react'
import type { Task, Lead } from '../types'
import { CheckCircle, Clock, Trash2, Users, Tag } from 'lucide-react'

interface TasksViewProps {
  tasks: Task[]
  leads: Lead[]
  onSaveTask: (task: Task) => Promise<Task>
  onDeleteTask: (id: string) => Promise<void>
  onSelectLead: (lead: Lead) => void
}

const fmtDate = (d: string) => {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

const taskColor = (s: string) => ({
  Pending:     { bg: "bg-amber-15 text-amber-600 border-amber-500/10" },
  "In Progress":{ bg: "bg-blue-15 text-blue-600 border-blue-500/10" },
  Completed:   { bg: "bg-emerald-15 text-emerald-600 border-emerald-500/10" },
  Overdue:     { bg: "bg-red-15 text-red-600 border-red-500/10" },
}[s] || { bg: "bg-gray-100 text-gray-800" })

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  leads,
  onSaveTask,
  onDeleteTask,
  onSelectLead
}) => {
  const [filter, setFilter] = useState<string>('All')
  const todayStr = new Date().toISOString().split("T")[0]

  const mappedTasks = useMemo(() => {
    return tasks.map(t => {
      // Automatic Overdue flag update if task is not completed and past due date
      const isPastDue = t.dueDate && t.dueDate < todayStr
      const resolvedStatus = (t.status !== "Completed" && isPastDue) ? "Overdue" : t.status
      return {
        ...t,
        status: resolvedStatus,
        lead: leads.find(l => l.id === t.leadId)
      }
    })
  }, [tasks, leads, todayStr])

  const filteredTasks = useMemo(() => {
    if (filter === 'All') return mappedTasks
    return mappedTasks.filter(t => t.status === filter)
  }, [mappedTasks, filter])

  const toggleTaskStatus = async (task: Task) => {
    const nextStatus = task.status === "Completed" ? "Pending" : "Completed"
    await onSaveTask({
      ...task,
      status: nextStatus
    })
  }

  const counts = useMemo(() => {
    return {
      All: mappedTasks.length,
      Pending: mappedTasks.filter(t => t.status === 'Pending').length,
      "In Progress": mappedTasks.filter(t => t.status === 'In Progress').length,
      Completed: mappedTasks.filter(t => t.status === 'Completed').length,
      Overdue: mappedTasks.filter(t => t.status === 'Overdue').length
    }
  }, [mappedTasks])

  return (
    <div className="space-y-6 font-sans text-xs">
      <div>
        <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white leading-tight">
          CRM Tasks Manager
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Review follow-ups, payment collection schedules, and proposal checklists
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-fit flex-wrap gap-1">
        {(['All', 'Pending', 'In Progress', 'Completed', 'Overdue'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filter === tab 
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <span>{tab}</span>
            <span className="ml-1.5 opacity-60">({counts[tab]})</span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
            <CheckCircle size={32} className="text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">No tasks matching the selected filter</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isCompleted = task.status === "Completed"
            const tc = taskColor(task.status)
            return (
              <div
                key={task.id}
                className={`bg-white dark:bg-slate-900 border ${
                  isCompleted 
                    ? 'border-slate-100 dark:border-slate-800/40 bg-slate-50/40 dark:bg-slate-900/10' 
                    : 'border-slate-200 dark:border-slate-800/80 shadow-sm'
                } rounded-3xl p-4 flex justify-between items-center gap-4 transition-all duration-200`}
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
                      <span className="flex items-center gap-1"><Tag size={10} /> {task.type}</span>
                      {task.dueDate && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> {fmtDate(task.dueDate)}</span>
                        </>
                      )}
                      {task.lead && (
                        <>
                          <span>·</span>
                          <button
                            onClick={() => onSelectLead(task.lead!)}
                            className="flex items-center gap-1 text-orange-500 dark:text-orange-400 hover:underline font-bold"
                          >
                            <Users size={10} /> {task.lead.businessName}
                          </button>
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
          })
        )}
      </div>
    </div>
  )
}
