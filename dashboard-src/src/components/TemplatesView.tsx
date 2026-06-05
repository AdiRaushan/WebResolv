import React, { useState } from 'react'
import { Copy, Check, MessageCircle, Mail } from 'lucide-react'

const EMAIL_TEMPLATES = [
  { id: 1, name: "Follow Up 1",       subject: "Following up on our conversation",           body: "Hi {name},\n\nI wanted to follow up on our recent conversation about improving {business}'s online presence.\n\nI have some ideas ready that could make a real difference. Would you have 15 minutes for a quick call this week?\n\nBest,\nArjun" },
  { id: 2, name: "Follow Up 2",       subject: "Quick check-in — {business}",               body: "Hi {name},\n\nJust a quick follow-up on the proposal I sent over. Any questions or concerns I can help with?\n\nHappy to adjust the package to better fit your needs.\n\nArjun" },
  { id: 3, name: "Demo Reminder",     subject: "Your website demo is ready 🎨",             body: "Hi {name},\n\nYour custom website demo is now ready!\n\nYou can view it here: {link}\n\nLet me know what you think. Happy to make any changes you like.\n\nArjun" },
  { id: 4, name: "Proposal Reminder", subject: "Proposal for {business} — any questions?",  body: "Hi {name},\n\nI sent over the proposal earlier this week. Just checking you received it and if there's anything you'd like to discuss.\n\nHappy to jump on a quick call.\n\nArjun" },
  { id: 5, name: "Payment Reminder",  subject: "Invoice reminder — {invoice}",              body: "Hi {name},\n\nFriendly reminder that invoice {invoice} is now due.\n\nYou can pay via bank transfer or UPI. Let me know if you need payment details.\n\nThank you!\nArjun" },
]

const WA_TEMPLATES = [
  { id: 1, name: "First Contact",    message: "Hi {name}! 👋 I'm Arjun, a web designer & digital marketer in Delhi.\n\nI noticed {business} could benefit from a stronger online presence — better website, Google rankings, and targeted ads.\n\nWould you be open to a quick 10-min call? I'd love to show you what's possible. 🚀" },
  { id: 2, name: "Demo Sent",        message: "Hi {name}! 🎨 Your website demo is ready!\n\nCheck it out: {link}\n\nThis is just a starting point — we can change colours, layout, and content to match exactly what you want. Let me know your thoughts!" },
  { id: 3, name: "Proposal Sent",    message: "Hi {name}! I've sent a detailed proposal for {business} to your email.\n\nIt covers the website, SEO, and ads — with clear pricing.\n\nFeel free to WhatsApp me any questions directly. Looking forward to working together! 🙌" },
  { id: 4, name: "Follow Up",        message: "Hi {name}! Just checking in on the proposal for {business}. 😊\n\nAny thoughts or questions? I'm happy to adjust the package to better fit your budget.\n\nAlso available for a quick call if easier. 📞" },
  { id: 5, name: "Payment Reminder", message: "Hi {name}! 🙏 Friendly reminder — payment for {service} is due.\n\nYou can pay via UPI or bank transfer. Let me know if you need any details.\n\nThank you!" },
]

export const TemplatesView: React.FC = () => {
  const [platform, setPlatform] = useState<'wa' | 'email'>('wa')
  const [copiedId, setCopiedId] = useState<number | null>(null)
  
  // Replacer Fields
  const [clientName, setClientName] = useState("Rajesh Kumar")
  const [businessName, setBusinessName] = useState("Spice Garden Restaurant")
  const [demoLink, setDemoLink] = useState("demo.webresolv.in/spicegarden")
  const [invoiceId, setInvoiceId] = useState("WR-2026-004")
  const [serviceName, setServiceName] = useState("Website Design & SEO")

  const replacePlaceholders = (text: string) => {
    return text
      .replace(/{name}/g, clientName)
      .replace(/{business}/g, businessName)
      .replace(/{link}/g, demoLink)
      .replace(/{invoice}/g, invoiceId)
      .replace(/{service}/g, serviceName)
  }

  const copyToClipboard = (id: number, text: string) => {
    const formatted = replacePlaceholders(text)
    navigator.clipboard.writeText(formatted).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  return (
    <div className="space-y-6 font-sans text-xs">
      <div>
        <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white leading-tight">
          CRM Communications Templates
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Copy pre-made, personalized outreach templates for WhatsApp and email campaigns
        </p>
      </div>

      {/* Placeholders Configurator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
          Dynamic Template Fields (Auto-Replaced in Copy Output)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="space-y-1">
            <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-xl p-2 outline-none text-slate-800 dark:text-white transition-all font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-xl p-2 outline-none text-slate-800 dark:text-white transition-all font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Demo Link</label>
            <input
              type="text"
              value={demoLink}
              onChange={e => setDemoLink(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-xl p-2 outline-none text-slate-800 dark:text-white transition-all font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Invoice ID</label>
            <input
              type="text"
              value={invoiceId}
              onChange={e => setInvoiceId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-xl p-2 outline-none text-slate-800 dark:text-white transition-all font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Service Name</label>
            <input
              type="text"
              value={serviceName}
              onChange={e => setServiceName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 rounded-xl p-2 outline-none text-slate-800 dark:text-white transition-all font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Platform Switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setPlatform('wa')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            platform === 'wa'
              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <MessageCircle size={14} className={platform === 'wa' ? 'text-emerald-500' : ''} />
          <span>WhatsApp Messages</span>
        </button>
        <button
          onClick={() => setPlatform('email')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            platform === 'email'
              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Mail size={14} className={platform === 'email' ? 'text-orange-500' : ''} />
          <span>Email Templates</span>
        </button>
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platform === 'wa' ? (
          WA_TEMPLATES.map(t => {
            const preview = replacePlaceholders(t.message)
            const isCopied = copiedId === t.id
            return (
              <div key={t.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
                    <h4 className="font-bold text-slate-800 dark:text-white font-display text-xs">{t.name}</h4>
                    <button
                      onClick={() => copyToClipboard(t.id, t.message)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                        isCopied 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-800 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {isCopied ? <Check size={10} /> : <Copy size={10} />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40 font-mono text-[10px] whitespace-pre-wrap select-all">
                    {preview}
                  </pre>
                </div>
              </div>
            )
          })
        ) : (
          EMAIL_TEMPLATES.map(t => {
            const preview = replacePlaceholders(t.body)
            const subjPreview = replacePlaceholders(t.subject)
            const isCopied = copiedId === t.id
            const fullOutput = `Subject: ${subjPreview}\n\n${preview}`
            return (
              <div key={t.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
                    <h4 className="font-bold text-slate-800 dark:text-white font-display text-xs">{t.name}</h4>
                    <button
                      onClick={() => copyToClipboard(t.id, fullOutput)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                        isCopied 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-800 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {isCopied ? <Check size={10} /> : <Copy size={10} />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/40">
                      <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mr-2">Subject:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{subjPreview}</span>
                    </div>
                    <pre className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40 font-mono text-[10px] whitespace-pre-wrap select-all">
                      {preview}
                    </pre>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
