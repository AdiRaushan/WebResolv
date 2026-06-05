export interface Lead {
  id: string
  businessName: string
  contactPerson: string
  phone: string
  whatsapp: string
  email: string
  website: string
  googleBusiness: string
  industry: string
  city: string
  notes: string
  dealValue: number
  source: string
  status: string
  createdDate: string
  lastContact: string
  nextFollowUp: string
  user_id?: string
}

export interface Task {
  id: string
  leadId: string
  type: string
  title: string
  status: string
  dueDate: string
  notes: string
  user_id?: string
}

export interface Activity {
  id: string
  leadId: string
  type: string
  description: string
  date: string
  duration?: string
  user_id?: string
}
