import React, { useState, useMemo } from 'react'
import type { Lead } from '../types'
import { 
  Search, Plus, MapPin, DollarSign, Phone, Calendar, 
  Edit, Mail, MessageCircle, Users, X
} from 'lucide-react'

interface LeadsViewProps {
  leads: Lead[]
  onSelectLead: (lead: Lead) => void
  onSaveLead: (lead: Omit<Lead, 'id'> & { id?: string }) => Promise<Lead>
  onDeleteLead: (id: string) => Promise<void>
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
const SOURCES = ["Cold Call", "WhatsApp", "Email", "Google Maps", "Referral", "Website", "Social Media", "Other"]
const INDUSTRIES = ["Restaurant", "Retail", "Healthcare", "Real Estate", "Education", "Fitness", "Legal", "Hospitality", "E-commerce", "Construction", "Beauty & Wellness", "Finance", "Other"]

const fmtDate = (d: string) => {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const daysAgo = (d: string) => {
  if (!d) return null
  const diff = new Date().getTime() - new Date(d).getTime()
  return Math.floor(diff / 86400000)
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  onSelectLead,
  onSaveLead,
  onDeleteLead,
  fmtCurrency = fmtINR
}) => {
  const isUSD = fmtCurrency(100).includes('$')
  const [q, setQ] = useState("")
  const [st, setSt] = useState("")
  const [ind, setInd] = useState("")
  const [src, setSrc] = useState("")
  
  // Dialog State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  
  // Form Fields
  const [businessName, setBusinessName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [email, setEmail] = useState("")
  const [website, setWebsite] = useState("")
  const [googleBusiness, setGoogleBusiness] = useState("")
  const [industry, setIndustry] = useState("Other")
  const [city, setCity] = useState("")
  const [dealValue, setDealValue] = useState(0)
  const [source, setSource] = useState("Other")
  const [status, setStatus] = useState("new_lead")
  const [nextFollowUp, setNextFollowUp] = useState("")
  const [notes, setNotes] = useState("")
  const [lastContact, setLastContact] = useState("")

  const openAddModal = () => {
    setEditingLead(null)
    setBusinessName("")
    setContactPerson("")
    setPhone("")
    setWhatsapp("")
    setEmail("")
    setWebsite("")
    setGoogleBusiness("")
    setIndustry("Other")
    setCity("")
    setDealValue(0)
    setSource("Other")
    setStatus("new_lead")
    setNextFollowUp("")
    setNotes("")
    setLastContact("")
    setIsModalOpen(true)
  }

  const openEditModal = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingLead(lead)
    setBusinessName(lead.businessName)
    setContactPerson(lead.contactPerson)
    setPhone(lead.phone)
    setWhatsapp(lead.whatsapp)
    setEmail(lead.email)
    setWebsite(lead.website)
    setGoogleBusiness(lead.googleBusiness)
    setIndustry(lead.industry)
    setCity(lead.city)
    setDealValue(lead.dealValue)
    setSource(lead.source)
    setStatus(lead.status)
    setNextFollowUp(lead.nextFollowUp)
    setNotes(lead.notes)
    setLastContact(lead.lastContact || "")
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessName || !contactPerson) return

    const payload = {
      businessName,
      contactPerson,
      phone,
      whatsapp,
      email,
      website,
      googleBusiness,
      industry,
      city,
      dealValue: Number(dealValue || 0),
      source,
      status,
      nextFollowUp,
      notes,
      lastContact,
      createdDate: editingLead ? editingLead.createdDate : new Date().toISOString().split('T')[0],
      ...(editingLead ? { id: editingLead.id } : {})
    }

    await onSaveLead(payload)
    setIsModalOpen(false)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to permanently delete this lead?")) {
      await onDeleteLead(id)
      setIsModalOpen(false)
    }
  }

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const query = q.toLowerCase()
      const matchesSearch = 
        !q ||
        l.businessName.toLowerCase().includes(query) ||
        l.contactPerson.toLowerCase().includes(query) ||
        l.city.toLowerCase().includes(query)
      const matchesStage = !st || l.status === st
      const matchesIndustry = !ind || l.industry === ind
      const matchesSource = !src || l.source === src

      return matchesSearch && matchesStage && matchesIndustry && matchesSource
    })
  }, [leads, q, st, ind, src])

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white leading-tight">
            Client Leads Manager
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {filteredLeads.length} of {leads.length} leads matching filters
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-lg shadow-orange-500/15 cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Client Lead</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col md:flex-row gap-3 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by company name, contact, city..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-2xl py-2.5 pl-10 pr-4 text-sm outline-none text-slate-800 dark:text-white transition-all focus:ring-2 focus:ring-orange-500/10"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 shrink-0">
          <select
            value={st}
            onChange={e => setSt(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 px-3 text-xs outline-none text-slate-700 dark:text-slate-200 transition-all font-semibold"
          >
            <option value="">All Stages</option>
            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <select
            value={ind}
            onChange={e => setInd(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 px-3 text-xs outline-none text-slate-700 dark:text-slate-200 transition-all font-semibold"
          >
            <option value="">All Industries</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <select
            value={src}
            onChange={e => setSrc(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 px-3 text-xs outline-none text-slate-700 dark:text-slate-200 transition-all font-semibold"
          >
            <option value="">All Sources</option>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Grid of Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeads.map(lead => {
          const s = STAGES.find(x => x.id === lead.status) || STAGES[0]
          const da = daysAgo(lead.lastContact)
          const isOverdue = lead.nextFollowUp && new Date(lead.nextFollowUp) < new Date() && !["lost", "completed"].includes(lead.status)

          return (
            <div
              key={lead.id}
              onClick={() => onSelectLead(lead)}
              className={`bg-white dark:bg-slate-900 border ${isOverdue ? 'border-red-400 dark:border-red-500/30' : 'border-slate-200 dark:border-slate-800'} rounded-3xl p-5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 relative flex flex-col justify-between group`}
            >
              {/* Overdue indicator bar */}
              {isOverdue && (
                <div className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full bg-red-500" />
              )}

              <div>
                {/* Company header */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm font-display shrink-0 shadow-sm"
                      style={{ backgroundColor: s.hex }}
                    >
                      {lead.businessName[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors truncate pr-1">
                        {lead.businessName}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">{lead.contactPerson}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => openEditModal(lead, e)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 rounded-xl transition-all cursor-pointer border border-transparent dark:border-slate-800"
                  >
                    <Edit size={12} />
                  </button>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: s.hex + '18', color: s.hex }}
                  >
                    {s.label}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 uppercase tracking-wider">
                    {lead.industry}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 uppercase tracking-wider">
                    {lead.source}
                  </span>
                </div>

                {/* Details list */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-slate-100 dark:border-slate-800/50 pt-4 mb-4 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <MapPin size={12} className="text-slate-400" />
                    <span className="font-semibold truncate">{lead.city || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
                    <DollarSign size={12} />
                    <span>{fmtCurrency(lead.dealValue)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Phone size={12} className="text-slate-400" />
                    <span className="font-semibold">{lead.phone ? lead.phone.slice(-10) : '—'}</span>
                  </div>
                  {lead.nextFollowUp && (
                    <div className={`flex items-center gap-1.5 font-bold ${isOverdue ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                      <Calendar size={12} className={isOverdue ? 'text-red-400' : 'text-slate-400'} />
                      <span>{isOverdue ? 'Overdue' : fmtDate(lead.nextFollowUp)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer action anchors */}
              <div className="border-t border-slate-100 dark:border-slate-800/50 pt-3 flex justify-between items-center text-[10px] text-slate-400">
                <span className="font-medium">
                  {da !== null ? (da === 0 ? "Contacted today" : `Last contact ${da}d ago`) : "Never contacted"}
                </span>
                <div className="flex gap-1.5">
                  <a
                    href={`tel:${lead.phone}`}
                    onClick={e => e.stopPropagation()}
                    className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500/20 transition-all border border-transparent dark:border-blue-500/10"
                  >
                    <Phone size={12} />
                  </a>
                  <a
                    href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center hover:bg-emerald-500/20 transition-all border border-transparent dark:border-emerald-500/10"
                  >
                    <MessageCircle size={12} />
                  </a>
                  <a
                    href={`mailto:${lead.email}`}
                    onClick={e => e.stopPropagation()}
                    className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center hover:bg-purple-500/20 transition-all border border-transparent dark:border-purple-500/10"
                  >
                    <Mail size={12} />
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredLeads.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
          <Users size={32} className="text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">No CRM leads found matching filters</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative z-10 max-h-[90vh] flex flex-col font-sans">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 p-5 shrink-0">
              <h3 className="font-extrabold font-display text-slate-800 dark:text-white text-base">
                {editingLead ? 'Edit Lead Parameters' : 'Add New Lead to CRM'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-all"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Business Name *</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="e.g. FitZone Gym"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Contact Person *</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 99887 76543"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">WhatsApp Number</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    placeholder="+91 99887 76543"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="priya@fitzone.in"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Website</label>
                  <input
                    type="text"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="fitzone.in"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Industry</label>
                  <select
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white font-semibold"
                  >
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Delhi"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Deal Value ({isUSD ? 'USD' : 'INR'})</label>
                  <input
                    type="number"
                    value={dealValue}
                    onChange={e => setDealValue(Number(e.target.value))}
                    placeholder="75000"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Source</label>
                  <select
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white font-semibold"
                  >
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white font-semibold"
                  >
                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Follow-up Date</label>
                  <input
                    type="date"
                    value={nextFollowUp}
                    onChange={e => setNextFollowUp(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Lead Profile Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Provide background information, digital needs, deal status, etc..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-xl p-2.5 outline-none text-slate-800 dark:text-white transition-all resize-none"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                {editingLead && (
                  <button
                    type="button"
                    onClick={(e) => handleDelete(editingLead.id, e)}
                    className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 font-bold rounded-xl transition-all cursor-pointer mr-auto"
                  >
                    Delete Lead
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-xl transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                >
                  {editingLead ? 'Save Changes' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
