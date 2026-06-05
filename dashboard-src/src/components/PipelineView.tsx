import React, { useState } from 'react'
import type { Lead } from '../types'
import { Calendar, Phone, MessageCircle } from 'lucide-react'

interface PipelineViewProps {
  leads: Lead[]
  onStatusChange: (id: string, status: string) => Promise<void>
  onSelectLead: (lead: Lead) => void
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

const fmtDate = (d: string) => {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
}

const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

export const PipelineView: React.FC<PipelineViewProps> = ({
  leads,
  onStatusChange,
  onSelectLead,
  fmtCurrency = fmtINR
}) => {
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)
  const [overColumn, setOverColumn] = useState<string | null>(null)
  const todayStr = new Date().toISOString().split("T")[0]

  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead)
  }

  const handleDragEnd = () => {
    setDraggedLead(null)
    setOverColumn(null)
  }

  const handleDrop = async (stageId: string) => {
    if (draggedLead && draggedLead.status !== stageId) {
      await onStatusChange(draggedLead.id, stageId)
    }
    setDraggedLead(null)
    setOverColumn(null)
  }

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white leading-tight">
          Sales & Deals Pipeline
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Drag and drop client cards to transition deal stages dynamically
        </p>
      </div>

      {/* Kanban Scroll Board */}
      <div className="overflow-x-auto pb-4 select-none scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <div className="flex gap-4 min-w-max pr-6">
          {STAGES.map(s => {
            const stageLeads = leads.filter(l => l.status === s.id)
            const stageValue = stageLeads.reduce((a, l) => a + (l.dealValue || 0), 0)
            const isOver = overColumn === s.id

            return (
              <div
                key={s.id}
                onDragOver={e => {
                  e.preventDefault()
                  setOverColumn(s.id)
                }}
                onDrop={() => handleDrop(s.id)}
                onDragLeave={() => setOverColumn(null)}
                className={`w-64 flex-shrink-0 rounded-3xl p-3 flex flex-col min-h-[500px] transition-all duration-200 border ${
                  isOver 
                    ? 'bg-orange-50/50 dark:bg-orange-500/5 border-orange-400 dark:border-orange-500/40 ring-2 ring-orange-500/10' 
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80'
                }`}
              >
                {/* Column Header */}
                <div className="px-2 pb-3 border-b border-slate-200/60 dark:border-slate-800/40 shrink-0 flex justify-between items-center mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.hex }} />
                      <span className="text-xs font-bold text-slate-800 dark:text-white font-display uppercase tracking-wider">{s.label}</span>
                    </div>
                    {stageLeads.length > 0 && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold font-mono">
                        {fmtCurrency(stageValue)}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 scrollbar-none">
                  {stageLeads.map(lead => {
                    const isOverdue = lead.nextFollowUp && lead.nextFollowUp < todayStr && !["lost", "completed"].includes(lead.status)
                    const isDragging = draggedLead?.id === lead.id

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={() => handleDragStart(lead)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onSelectLead(lead)}
                        className={`bg-white dark:bg-slate-900 border ${
                          isOverdue ? 'border-red-400 dark:border-red-500/30' : 'border-slate-200 dark:border-slate-850'
                        } rounded-2xl p-3.5 cursor-grab active:cursor-grabbing hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 shadow-sm ${
                          isDragging ? 'opacity-40 scale-95 border-dashed border-orange-400' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <p className="text-xs font-extrabold text-slate-800 dark:text-white leading-snug line-clamp-2">
                            {lead.businessName}
                          </p>
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center text-white font-black text-[9px] font-display shrink-0"
                            style={{ backgroundColor: s.hex }}
                          >
                            {lead.businessName[0]}
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-2">{lead.city || 'No City'}</p>

                        <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/40 pt-2 text-[10px]">
                          <span className="font-extrabold text-emerald-500">{fmtCurrency(lead.dealValue)}</span>
                          {lead.nextFollowUp && (
                            <span className={`flex items-center gap-1 font-bold ${isOverdue ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                              <Calendar size={10} className={isOverdue ? 'text-red-400' : 'text-slate-400'} />
                              <span>{fmtDate(lead.nextFollowUp)}</span>
                            </span>
                          )}
                        </div>

                        {/* Card bottom actions */}
                        <div className="flex gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/40">
                          <a
                            href={`tel:${lead.phone}`}
                            onClick={e => e.stopPropagation()}
                            className="flex-1 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500/20 transition-all"
                          >
                            <Phone size={10} />
                          </a>
                          <a
                            href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex-1 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center hover:bg-emerald-500/20 transition-all"
                          >
                            <MessageCircle size={10} />
                          </a>
                        </div>
                      </div>
                    )
                  })}
                  {stageLeads.length === 0 && (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800/60 rounded-2xl py-8 px-4 text-center text-[10px] text-slate-400 font-medium select-none">
                      Drag leads here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
