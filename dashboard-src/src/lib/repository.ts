import { supabase, isSupabaseConfigured } from './supabase'
import type { Lead, Task, Activity } from '../types'

// ─────────────────────────────────────────────────────────────
// SEED DATA FOR LOCAL STORAGE FALLBACK
// ─────────────────────────────────────────────────────────────
const todayStr = new Date().toISOString().split("T")[0]

const LEADS_SEED: Lead[] = [
  { id:"1", businessName:"Spice Garden Restaurant", contactPerson:"Rajesh Kumar",   phone:"+91 98765 43210", whatsapp:"+91 98765 43210", email:"rajesh@spicegarden.in",  website:"spicegarden.in",   googleBusiness:"", industry:"Restaurant",   city:"Mumbai",    notes:"Needs website redesign + Google Ads. Old WordPress site.",           dealValue:45000,  source:"Google Maps", status:"interested",     createdDate:"2024-01-10", lastContact:"2024-01-18", nextFollowUp:todayStr },
  { id:"2", businessName:"FitZone Gym",              contactPerson:"Priya Sharma",   phone:"+91 99887 76543", whatsapp:"+91 99887 76543", email:"priya@fitzone.in",        website:"",                 googleBusiness:"", industry:"Fitness",      city:"Delhi",     notes:"Full digital presence — website, SEO, Instagram ads.",               dealValue:75000,  source:"Cold Call",   status:"proposal_sent",  createdDate:"2024-01-05", lastContact:"2024-01-15", nextFollowUp:"2024-01-22" },
  { id:"3", businessName:"Elite Realty",             contactPerson:"Arun Mehta",     phone:"+91 77665 54321", whatsapp:"+91 77665 54321", email:"arun@eliterealty.in",     website:"eliterealty.in",   googleBusiness:"", industry:"Real Estate",  city:"Bangalore", notes:"Property portal website. Has budget. Decision maker.",               dealValue:120000, source:"Referral",    status:"negotiation",    createdDate:"2023-12-20", lastContact:"2024-01-12", nextFollowUp:"2024-01-24" },
  { id:"4", businessName:"Delhi Sweet House",        contactPerson:"Mohan Lal",      phone:"+91 88776 65432", whatsapp:"+91 88776 65432", email:"info@delhisweethouse.in", website:"",                 googleBusiness:"", industry:"Restaurant",   city:"Delhi",     notes:"Wants Facebook + Instagram ads for festivals.",                      dealValue:25000,  source:"WhatsApp",    status:"contacted",      createdDate:"2024-01-12", lastContact:"2024-01-14", nextFollowUp:"2024-01-20" },
  { id:"5", businessName:"MedCare Clinic",           contactPerson:"Dr. Sunita Patel",phone:"+91 99123 45678",whatsapp:"+91 99123 45678", email:"drpatel@medcare.in",      website:"medcare.in",       googleBusiness:"", industry:"Healthcare",   city:"Pune",      notes:"Booking system + SEO + Google My Business optimisation.",            dealValue:85000,  source:"Google Maps", status:"demo_sent",      createdDate:"2024-01-08", lastContact:"2024-01-16", nextFollowUp:"2024-01-23" },
  { id:"6", businessName:"LawPros Associates",       contactPerson:"Vikram Singh",   phone:"+91 90909 01234", whatsapp:"+91 90909 01234", email:"vikram@lawpros.in",       website:"",                 googleBusiness:"", industry:"Legal",        city:"Mumbai",    notes:"Professional website + local SEO for law firm.",                     dealValue:55000,  source:"Email",       status:"new_lead",       createdDate:"2024-01-17", lastContact:"",           nextFollowUp:"2024-01-22" },
  { id:"7", businessName:"TrendStyle Boutique",      contactPerson:"Neha Gupta",     phone:"+91 78901 23456", whatsapp:"+91 78901 23456", email:"neha@trendstyle.in",      website:"trendstyle.in",    googleBusiness:"", industry:"Retail",       city:"Jaipur",    notes:"E-commerce integration. Currently sells on Instagram.",              dealValue:40000,  source:"Social Media",status:"active_client",  createdDate:"2023-11-10", lastContact:"2024-01-18", nextFollowUp:"2024-02-01" },
  { id:"8", businessName:"GreenThumb Nursery",       contactPerson:"Ramesh Yadav",   phone:"+91 91234 56789", whatsapp:"+91 91234 56789", email:"ramesh@greenthumb.in",    website:"",                 googleBusiness:"", industry:"Retail",       city:"Hyderabad", notes:"Small nursery. Low budget. Wanted basic site.",                      dealValue:15000,  source:"Cold Call",   status:"lost",           createdDate:"2023-12-15", lastContact:"2024-01-05", nextFollowUp:"" },
]

const TASKS_SEED: Task[] = [
  { id:"t1", leadId:"1", type:"Call Client",   title:"Follow-up call with Rajesh re: website pricing",      status:"Pending",     dueDate:todayStr,     notes:"Discuss revised package options" },
  { id:"t2", leadId:"2", type:"Send Proposal", title:"Revised proposal for FitZone — include retainer",     status:"Overdue",     dueDate:"2024-01-18", notes:"Add monthly retainer pricing" },
  { id:"t3", leadId:"3", type:"Meeting",       title:"Video call with Elite Realty — final negotiation",    status:"Pending",     dueDate:"2024-01-24", notes:"" },
  { id:"t4", leadId:"5", type:"Follow Up",     title:"Check demo feedback from MedCare Clinic",             status:"Pending",     dueDate:"2024-01-23", notes:"" },
  { id:"t5", leadId:"4", type:"Send Demo",     title:"Prepare sample social media plan for Delhi Sweet House",status:"In Progress",dueDate:"2024-01-21", notes:"" },
  { id:"t6", leadId:"7", type:"Collect Payment","title":"Collect January payment from TrendStyle",          status:"Pending",     dueDate:"2024-02-01", notes:"₹8,000 invoice" },
]

const ACTS_SEED: Activity[] = [
  { id:"a1", leadId:"1", type:"Call",          description:"Discovery call. Discussed website redesign needs + Google Ads.",     date:"2024-01-18", duration:"15 mins" },
  { id:"a2", leadId:"2", type:"Email",         description:"Sent full digital marketing proposal.",                              date:"2024-01-15" },
  { id:"a3", leadId:"3", type:"WhatsApp",      description:"Client requesting 10% discount. Negotiations ongoing.",              date:"2024-01-12" },
  { id:"a4", leadId:"5", type:"Demo Sent",     description:"Sent demo website link + SEO audit report.",                        date:"2024-01-16" },
  { id:"a5", leadId:"1", type:"WhatsApp",      description:"Sent portfolio examples via WhatsApp.",                             date:"2024-01-16" },
  { id:"a6", leadId:"2", type:"Call",          description:"Discussed proposal. Partner approval needed.",                      date:"2024-01-14", duration:"22 mins" },
  { id:"a7", leadId:"7", type:"Onboarding",    description:"Website onboarding complete. Project is live.",                     date:"2023-11-15" },
  { id:"a8", leadId:"6", type:"Email",         description:"Cold email sent about web design services.",                        date:"2024-01-17" },
]

// ─────────────────────────────────────────────────────────────
// LOCAL STORAGE STORAGE HELPERS
// ─────────────────────────────────────────────────────────────
const loadLocal = <T>(key: string, defaults: T[]): T[] => {
  const data = localStorage.getItem(key)
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaults))
    return defaults
  }
  try {
    return JSON.parse(data)
  } catch {
    return defaults
  }
}

const saveLocal = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data))
}

// ─────────────────────────────────────────────────────────────
// DATA TRANSFORMERS FOR SUPABASE (camelCase <-> snake_case)
// ─────────────────────────────────────────────────────────────
const mapLeadToDb = (l: Partial<Lead>) => ({
  id: l.id,
  business_name: l.businessName,
  contact_person: l.contactPerson,
  phone: l.phone,
  whatsapp: l.whatsapp,
  email: l.email,
  website: l.website,
  google_business: l.googleBusiness,
  industry: l.industry,
  city: l.city,
  notes: l.notes,
  deal_value: l.dealValue,
  source: l.source,
  status: l.status,
  created_date: l.createdDate,
  last_contact: l.lastContact || null,
  next_follow_up: l.nextFollowUp || null,
})

const mapLeadFromDb = (db: any): Lead => ({
  id: db.id,
  businessName: db.business_name,
  contactPerson: db.contact_person,
  phone: db.phone || '',
  whatsapp: db.whatsapp || '',
  email: db.email || '',
  website: db.website || '',
  googleBusiness: db.google_business || '',
  industry: db.industry || 'Other',
  city: db.city || '',
  notes: db.notes || '',
  dealValue: Number(db.deal_value || 0),
  source: db.source || 'Other',
  status: db.status || 'new_lead',
  createdDate: db.created_date,
  lastContact: db.last_contact || '',
  nextFollowUp: db.next_follow_up || '',
})

const mapTaskToDb = (t: Partial<Task>) => ({
  id: t.id,
  lead_id: t.leadId,
  type: t.type,
  title: t.title,
  status: t.status,
  due_date: t.dueDate || null,
  notes: t.notes,
})

const mapTaskFromDb = (db: any): Task => ({
  id: db.id,
  leadId: db.lead_id,
  type: db.type,
  title: db.title,
  status: db.status || 'Pending',
  dueDate: db.due_date || '',
  notes: db.notes || '',
})

const mapActivityToDb = (a: Partial<Activity>) => ({
  id: a.id,
  lead_id: a.leadId,
  type: a.type,
  description: a.description,
  date: a.date,
  duration: a.duration,
})

const mapActivityFromDb = (db: any): Activity => ({
  id: db.id,
  leadId: db.lead_id,
  type: db.type,
  description: db.description || '',
  date: db.date,
  duration: db.duration || '',
})

// ─────────────────────────────────────────────────────────────
// REPOSITORY INTERFACE IMPLEMENTATION
// ─────────────────────────────────────────────────────────────
export const repository = {
  // --- LEADS ---
  async getLeads(): Promise<Lead[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('leads').select('*').order('created_date', { ascending: false })
      if (error) {
        console.error('Supabase fetch error, falling back to Local Storage', error)
        return loadLocal('wr_leads', LEADS_SEED)
      }
      return (data || []).map(mapLeadFromDb)
    }
    return loadLocal('wr_leads', LEADS_SEED)
  },

  async saveLead(lead: Omit<Lead, 'id'> & { id?: string }): Promise<Lead> {
    if (isSupabaseConfigured && supabase) {
      const dbObj = mapLeadToDb(lead)
      if (lead.id) {
        // Update
        const { data, error } = await supabase.from('leads').update(dbObj).eq('id', lead.id).select().single()
        if (!error && data) return mapLeadFromDb(data)
        console.error('Supabase update failed, falling back to Local Storage', error)
      } else {
        // Insert
        const { data, error } = await supabase.from('leads').insert(dbObj).select().single()
        if (!error && data) return mapLeadFromDb(data)
        console.error('Supabase insert failed, falling back to Local Storage', error)
      }
    }

    // Local Storage Fallback
    const localLeads = loadLocal('wr_leads', LEADS_SEED)
    if (lead.id) {
      const idx = localLeads.findIndex(l => l.id === lead.id)
      if (idx !== -1) {
        const updated = { ...localLeads[idx], ...lead } as Lead
        localLeads[idx] = updated
        saveLocal('wr_leads', localLeads)
        return updated
      }
    }
    const newLead: Lead = {
      ...lead,
      id: Math.random().toString(36).substr(2, 9),
      createdDate: lead.createdDate || new Date().toISOString().split('T')[0],
      dealValue: Number(lead.dealValue || 0)
    } as Lead
    localLeads.unshift(newLead)
    saveLocal('wr_leads', localLeads)
    return newLead
  },

  async updateLeadStatus(id: string, status: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('leads').update({ status }).eq('id', id)
      if (!error) return
      console.error('Supabase status update failed, falling back to Local Storage', error)
    }
    const localLeads = loadLocal('wr_leads', LEADS_SEED)
    const idx = localLeads.findIndex(l => l.id === id)
    if (idx !== -1) {
      localLeads[idx].status = status
      saveLocal('wr_leads', localLeads)
    }
  },

  async deleteLead(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('leads').delete().eq('id', id)
      if (!error) return
      console.error('Supabase delete failed, falling back to Local Storage', error)
    }
    let localLeads = loadLocal('wr_leads', LEADS_SEED)
    localLeads = localLeads.filter(l => l.id !== id)
    saveLocal('wr_leads', localLeads)
  },

  // --- TASKS ---
  async getTasks(): Promise<Task[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('tasks').select('*')
      if (error) {
        console.error('Supabase tasks fetch error, falling back to Local Storage', error)
        return loadLocal('wr_tasks', TASKS_SEED)
      }
      return (data || []).map(mapTaskFromDb)
    }
    return loadLocal('wr_tasks', TASKS_SEED)
  },

  async saveTask(task: Omit<Task, 'id'> & { id?: string }): Promise<Task> {
    if (isSupabaseConfigured && supabase) {
      const dbObj = mapTaskToDb(task)
      if (task.id) {
        const { data, error } = await supabase.from('tasks').update(dbObj).eq('id', task.id).select().single()
        if (!error && data) return mapTaskFromDb(data)
        console.error('Supabase task update failed, falling back to Local Storage', error)
      } else {
        const { data, error } = await supabase.from('tasks').insert(dbObj).select().single()
        if (!error && data) return mapTaskFromDb(data)
        console.error('Supabase task insert failed, falling back to Local Storage', error)
      }
    }

    // Local Storage Fallback
    const localTasks = loadLocal('wr_tasks', TASKS_SEED)
    if (task.id) {
      const idx = localTasks.findIndex(t => t.id === task.id)
      if (idx !== -1) {
        const updated = { ...localTasks[idx], ...task } as Task
        localTasks[idx] = updated
        saveLocal('wr_tasks', localTasks)
        return updated
      }
    }
    const newTask: Task = {
      ...task,
      id: 't_' + Math.random().toString(36).substr(2, 9)
    } as Task
    localTasks.push(newTask)
    saveLocal('wr_tasks', localTasks)
    return newTask
  },

  async deleteTask(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (!error) return
      console.error('Supabase task delete failed, falling back to Local Storage', error)
    }
    let localTasks = loadLocal('wr_tasks', TASKS_SEED)
    localTasks = localTasks.filter(t => t.id !== id)
    saveLocal('wr_tasks', localTasks)
  },

  // --- ACTIVITIES ---
  async getActivities(): Promise<Activity[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('activities').select('*')
      if (error) {
        console.error('Supabase activities fetch error, falling back to Local Storage', error)
        return loadLocal('wr_activities', ACTS_SEED)
      }
      return (data || []).map(mapActivityFromDb)
    }
    return loadLocal('wr_activities', ACTS_SEED)
  },

  async saveActivity(activity: Omit<Activity, 'id'> & { id?: string }): Promise<Activity> {
    if (isSupabaseConfigured && supabase) {
      const dbObj = mapActivityToDb(activity)
      if (activity.id) {
        const { data, error } = await supabase.from('activities').update(dbObj).eq('id', activity.id).select().single()
        if (!error && data) return mapActivityFromDb(data)
        console.error('Supabase activity update failed, falling back to Local Storage', error)
      } else {
        const { data, error } = await supabase.from('activities').insert(dbObj).select().single()
        if (!error && data) return mapActivityFromDb(data)
        console.error('Supabase activity insert failed, falling back to Local Storage', error)
      }
    }

    // Local Storage Fallback
    const localActs = loadLocal('wr_activities', ACTS_SEED)
    if (activity.id) {
      const idx = localActs.findIndex(a => a.id === activity.id)
      if (idx !== -1) {
        const updated = { ...localActs[idx], ...activity } as Activity
        localActs[idx] = updated
        saveLocal('wr_activities', localActs)
        return updated
      }
    }
    const newAct: Activity = {
      ...activity,
      id: 'a_' + Math.random().toString(36).substr(2, 9),
      date: activity.date || new Date().toISOString().split('T')[0]
    } as Activity
    localActs.push(newAct)
    saveLocal('wr_activities', localActs)
    return newAct
  },

  async deleteActivity(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('activities').delete().eq('id', id)
      if (!error) return
      console.error('Supabase activity delete failed, falling back to Local Storage', error)
    }
    let localActs = loadLocal('wr_activities', ACTS_SEED)
    localActs = localActs.filter(a => a.id !== id)
    saveLocal('wr_activities', localActs)
  },

  // --- MOCK DATABASE FACTORY RESET ---
  async resetLocalStorage(): Promise<void> {
    localStorage.setItem('wr_leads', JSON.stringify(LEADS_SEED))
    localStorage.setItem('wr_tasks', JSON.stringify(TASKS_SEED))
    localStorage.setItem('wr_activities', JSON.stringify(ACTS_SEED))
  }
}
