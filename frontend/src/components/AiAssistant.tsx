import { Bot, Send, Sparkles, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { api, shouldUseDemoFallback, unwrap } from '../services/api';

interface Message { role: 'assistant' | 'user'; content: string; }

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Hi! I can narrow your room search. What is your monthly budget and preferred area?' }]);
  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || busy) return;
    setMessages((current) => [...current, { role: 'user', content: question }]);
    setInput(''); setBusy(true);
    try {
      const response = await api.post('/ai/chat', { message: question, messages });
      const data = unwrap<{ message?: string; reply?: string }>(response.data);
      setMessages((current) => [...current, { role: 'assistant', content: data.reply || data.message || 'I found a few options you can explore in search.' }]);
    } catch (error) {
      const fallback = shouldUseDemoFallback(error) ? 'Thanks — I’d start with a budget filter and rooms within 2 km. Open Search to compare available options.' : 'I could not reach the assistant just now. Please try again.';
      setMessages((current) => [...current, { role: 'assistant', content: fallback }]);
    } finally { setBusy(false); }
  };
  return <div className="fixed bottom-4 right-4 z-50">
    {open && <section className="mb-3 flex w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" aria-label="AI room assistant"><header className="flex items-center justify-between bg-ink px-4 py-3 text-white"><span className="inline-flex items-center gap-2 text-sm font-bold"><span className="grid size-7 place-items-center rounded-lg bg-brand-500"><Bot size={16} /></span> Room assistant</span><button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-white/10" aria-label="Close room assistant"><X size={18} /></button></header><div className="hide-scrollbar max-h-72 min-h-48 space-y-3 overflow-y-auto bg-slate-50 p-3">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}>{message.role === 'assistant' && <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700"><Bot size={13} /></span>}<p className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-5 ${message.role === 'user' ? 'bg-brand-600 text-white' : 'bg-white text-slate-700 shadow-sm'}`}>{message.content}</p>{message.role === 'user' && <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-slate-200 text-slate-600"><UserRound size={13} /></span>}</div>)}{busy && <p className="text-xs font-medium text-slate-500">Assistant is thinking…</p>}</div><form onSubmit={send} className="flex gap-2 border-t p-3"><input value={input} onChange={(event) => setInput(event.target.value)} className="field !min-h-10 flex-1 !py-2" placeholder="Tell me what you need" aria-label="Message room assistant" /><button disabled={busy} className="btn-primary !min-h-10 !px-3" aria-label="Send message"><Send size={17} /></button></form></section>}
    <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Close room assistant' : 'Open room assistant'} className="btn-primary rounded-full !px-4 shadow-lift"><Sparkles size={18} /> <span className="hidden sm:inline">Need help?</span></button>
  </div>;
}
