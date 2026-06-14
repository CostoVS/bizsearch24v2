"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  FileText, FilePlus, Download, Save, Sheet, Calculator, 
  BookOpen, Users, FolderPlus, Minimize2, Maximize2, X,
  Trash2, Copy, FileCode, Check, Eye, EyeOff, Plus, FileSpreadsheet,
  TrendingUp, BarChart3, Briefcase, PlusCircle, CheckCircle2, AlertCircle,
  FileCheck, ShieldCheck, Mail, Phone, Calendar, Landmark, MapPin, Award,
  Clock, ArrowRight, ArrowLeft
} from "lucide-react";

export default function ToolsDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [activeTool, setActiveTool] = useState<"word" | "pdf" | "excel" | "notepad" | "crm">("notepad");
  const [calcOpen, setCalcOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClient(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && isClient) {
      if (!user) {
         router.push("/login");
      } else if (user.plan !== "PREMIUM" && user.role !== "ADMIN") {
         router.push("/premium");
      }
    }
  }, [user, isLoading, router, isClient]);

  if (!isClient || isLoading || (!user) || (user.plan !== "PREMIUM" && user.role !== "ADMIN")) {
    return (
      <div className="min-h-screen py-20 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative pb-20">
      {/* Premium Header Banner */}
      <div className="bg-[#1e293b] border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
                  BizSearch24 Professional Workspace
                  <span className="bg-indigo-500/20 text-indigo-300 text-[9px] font-mono tracking-widest uppercase py-0.5 px-2.5 rounded-full border border-indigo-500/35">PREMIUM LICENCE</span>
                </h1>
                <p className="text-xs text-slate-400">Enterprise workspace tools, local state sandbox, and PDF generators.</p>
              </div>
            </div>
            
            <button 
              onClick={() => setCalcOpen(!calcOpen)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-md flex items-center transition-all self-start"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {calcOpen ? "Hide Calculator" : "Launch Calculator"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Quick Nav Tools Drawer Menu */}
          <div className="lg:col-span-1 border border-slate-200 bg-white rounded-2xl p-4.5 shadow-sm h-fit space-y-4">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block border-b border-slate-100 pb-2">CHOOSE WORKSPACE</span>
            <div className="space-y-1">
               <button onClick={() => setActiveTool('notepad')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${activeTool === 'notepad' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                 <BookOpen className="w-4 h-4"/> Multi-Note Workspace
               </button>
               <button onClick={() => setActiveTool('word')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${activeTool === 'word' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                 <FileText className="w-4 h-4"/> Document Writer Pro
               </button>
               <button onClick={() => setActiveTool('excel')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${activeTool === 'excel' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                 <Sheet className="w-4 h-4"/> Spreadsheet Powerhouse
               </button>
               <button onClick={() => setActiveTool('pdf')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${activeTool === 'pdf' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                 <FilePlus className="w-4 h-4"/> Premium Invoice & CV Builder
               </button>
               <button onClick={() => setActiveTool('crm')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${activeTool === 'crm' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                 <Users className="w-4 h-4"/> Enterprise CRM Boards
               </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-[11px] text-slate-500 leading-relaxed font-sans">
              <span className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Sandboxed Memory
              </span>
              Your documents are fully isolated and preserved in offline-first localStorage sandbox, ensuring data privacy and state security.
            </div>
          </div>
          
          {/* Main Action Content Center */}
          <div className="lg:col-span-4 border border-slate-200 bg-white rounded-3xl p-4 lg:p-6 shadow-sm min-h-[620px] flex flex-col justify-between">
            {activeTool === 'notepad' && <NotepadTool key={user.id} userId={user.id} />}
            {activeTool === 'word' && <WordTool key={user.id} userId={user.id} />}
            {activeTool === 'excel' && <ExcelTool key={user.id} userId={user.id} />}
            {activeTool === 'pdf' && <PdfTool key={user.id} userId={user.id} />}
            {activeTool === 'crm' && <CrmTool key={user.id} userId={user.id} />}
          </div>

        </div>
      </div>

      {calcOpen && <FloaterCalculator onClose={() => setCalcOpen(false)} />}
    </div>
  );
}

// ==================== NOTEPAD PRO MODULE ====================
function NotepadTool({ userId }: { userId: string }) {
  const [notes, setNotes] = useState<{id: string, title: string, text: string, date: string}[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`bs24_notes_${userId}`);
      if (saved) {
        try { return JSON.parse(saved); } catch(e){}
      }
    }
    return [
      { id: "note_1", title: "Business Expansion Draft", text: "# Expansion Strategic Plan\n\n- Hire local sales representatives in Pretoria and Johannesburg\n- Establish secure medical packaging supply chains\n- Increase directory listing sponsorship budgets.", date: new Date().toISOString() },
      { id: "note_2", title: "Meeting Minutes (Alpha Corp)", text: "Reviewed client pricing catalogs.\nKobus requested tiered pricing on bulk test kit solutions.", date: new Date().toISOString() }
    ];
  });
  
  const [activeId, setActiveId] = useState<string>(() => notes[0]?.id || "note_1");
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const save = (updatedNotes: typeof notes) => {
    setNotes(updatedNotes);
    localStorage.setItem(`bs24_notes_${userId}`, JSON.stringify(updatedNotes));
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  const addNote = () => {
    const id = "note_" + Date.now();
    const next = [{ id, title: "Untitled Notes Draft", text: "", date: new Date().toISOString() }, ...notes];
    setActiveId(id);
    save(next);
  };

  const deleteNote = (id: string) => {
    if (notes.length <= 1) {
      alert("Must keep at least 1 draft note.");
      return;
    }
    const next = notes.filter(n => n.id !== id);
    if (activeId === id) {
      setActiveId(next[0].id);
    }
    save(next);
  };

  const updateActiveText = (text: string) => {
    const next = notes.map(n => {
      if (n.id === activeId) {
        // Auto-extract first line as title if changed from default
        let title = n.title;
        if (text.trim().length > 0) {
          const firstLine = text.split("\n")[0].replace(/[#*`_]/g, "").trim();
          if (firstLine.length > 0 && firstLine.length < 35) {
            title = firstLine;
          }
        }
        return { ...n, text, title, date: new Date().toISOString() };
      }
      return n;
    });
    setNotes(next);
    localStorage.setItem(`bs24_notes_${userId}`, JSON.stringify(next));
  };

  const activeNote = notes.find(n => n.id === activeId) || notes[0];

  const wordCount = activeNote?.text ? activeNote.text.trim().split(/\s+/).filter(Boolean).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const copyToClipboard = () => {
    if (activeNote) {
      navigator.clipboard.writeText(activeNote.text);
      alert("Content copied to clipboard!");
    }
  };

  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.text.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col pt-2 select-text">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5 leading-none">
            <BookOpen className="w-5 h-5 text-indigo-600" /> Workspace Notepad Pro
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">Manage multiple drafts in localized sandboxed database.</p>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md font-bold flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Autosaved
            </span>
          )}
          <button onClick={addNote} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New Note
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 flex-1">
        
        {/* Notebook index side list */}
        <div className="md:col-span-1 border-r border-slate-100 pr-3 space-y-3.5">
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 transition"
          />
          
          <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
            {filteredNotes.map(note => (
              <div 
                key={note.id}
                onClick={() => setActiveId(note.id)}
                className={`p-2.5 rounded-xl text-left cursor-pointer transition relative group ${activeId === note.id ? 'bg-indigo-50 border border-indigo-100 text-indigo-950' : 'hover:bg-slate-50 text-slate-700'}`}
              >
                <div className="font-bold text-xs truncate pr-5">{note.title || "Untitled notes"}</div>
                <div className="text-[9px] text-slate-400 mt-1 font-mono">{new Date(note.date).toLocaleDateString()}</div>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} 
                  className="absolute right-2 top-2 p-1 text-slate-300 hover:text-rose-600 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Content sheet area */}
        <div className="md:col-span-3 flex flex-col justify-between">
          {activeNote ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                  <span>Words: <strong>{wordCount}</strong></span>
                  <span>|</span>
                  <span>Est: <strong>{readTime} min read</strong></span>
                </div>
                <button onClick={copyToClipboard} className="text-[10px] text-indigo-700 font-bold hover:bg-indigo-50 px-2 py-1 rounded transition flex items-center gap-1 bg-white border border-slate-100 mr-1 shadow-sm">
                  <Copy className="w-3 h-3" /> Copy Text
                </button>
              </div>
              <textarea
                value={activeNote.text}
                onChange={(e) => updateActiveText(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-2xl resize-none outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white min-h-[300px] font-mono text-sm bg-slate-50/50"
                placeholder="Type notes or markdown instructions here. Autosaves instantly..."
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">Select or create a draft to get started.</div>
          )}
        </div>

      </div>
    </div>
  );
}

// ==================== DOCUMENT WRITER PRO MODULE ====================
function WordTool({ userId }: { userId: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordDocument, setWordDocument] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`bs24_word_${userId}`);
      if (saved) return saved;
    }
    return "<h2>Surgical Mask bulk pricing proposal</h2><p>Prepared for Gauteng Health. Pricing scales strictly with volume. Standard ISO standards certifications attached.</p>";
  });
  
  const [margin, setMargin] = useState<"standard" | "compact" | "wide">("standard");
  const [fontFamily, setFontFamily] = useState<"sans" | "serif" | "mono">("sans");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editorRef.current && wordDocument) {
      editorRef.current.innerHTML = wordDocument;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setWordDocument(html);
      localStorage.setItem(`bs24_word_${userId}`, html);
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 800);
    }
  };

  const injectTemplate = (type: "proposal" | "nda" | "sla") => {
    let html = "";
    if (type === "proposal") {
      html = `<h2>BIZSEARCH24 MEDICAL PROPOSAL OUTLINE</h2>
              <p><strong>Prepared By:</strong> Vertex Medical Distributors</p>
              <p><strong>Proposed Solution:</strong> Provisioning sterilized personal protection gears to central municipal hospitals.</p>
              <blockquote>"Uncompromising grade-A healthcare standards, delivered right on demand."</blockquote>
              <ul>
                <li>Bulk Surgical Masks (Level Tier-3 certified)</li>
                <li>N95 Multi-filter Respirators</li>
              </ul>`;
    } else if (type === "nda") {
      html = `<h2>MUTUAL NON-DISCLOSURE AGREEMENT</h2>
              <p>This Mutual Non-Disclosure Agreement ("Agreement") is executed by the respective parties to secure the confidentiality of technical procurement metrics and manufacturer specifications logs.</p>
              <p><strong>1. Definitions Log:</strong> "Confidential information" shall define all bulk margins, direct contacts data, and SARS records.</p>`;
    } else {
      html = `<h2>SERVICE LEVEL AGREEMENT (SLA) Matrix</h2>
              <p><strong>Target Objective:</strong> Maintenance of over 99.5% delivery success index across major Gauteng clinics.</p>
              <ul>
                <li>High Priority Dispatch: Standard transit within 12 hours</li>
                <li>Refund Policy: 15% credits on transit intervals delayed over 48 hours</li>
              </ul>`;
    }
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
      save();
    }
  };

  const triggerCmd = (cmd: string, val: string = "") => {
    document.execCommand(cmd, false, val);
    save();
  };

  return (
    <div className="h-full flex flex-col pt-2 select-text">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5 leading-none">
            <FileText className="w-5 h-5 text-sky-600" /> Document Writer Pro
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">Compose formatted proposals, SLA agreements, or NDAs on-the-fly.</p>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-black mr-2">
              Saved✓
            </span>
          )}
          <button onClick={save} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1">
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>
        </div>
      </div>

      {/* Editor top toolbar controls */}
      <div className="bg-slate-50 border border-slate-200 mt-4 rounded-xl p-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button onClick={() => triggerCmd('bold')} className="p-1 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded text-xs font-bold shadow-sm">B</button>
          <button onClick={() => triggerCmd('italic')} className="p-1 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded text-xs italic shadow-sm">I</button>
          <button onClick={() => triggerCmd('underline')} className="p-1 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded text-xs underline shadow-sm">U</button>
          <button onClick={() => triggerCmd('insertUnorderedList')} className="p-1 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded text-xs shadow-sm">• List</button>
          <button onClick={() => triggerCmd('formatBlock', '<blockquote>')} className="p-1 px-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded text-xs shadow-sm">“ Quote</button>
          
          <span className="h-4 w-[1px] bg-slate-300 mx-1"></span>

          {/* Size picker */}
          <select 
            onChange={(e) => triggerCmd('fontSize', e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded p-1 outline-none font-bold"
          >
            <option value="3">Regular Size</option>
            <option value="5">Subheading size</option>
            <option value="7">Display title</option>
          </select>
        </div>

        {/* Templates injector */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] uppercase font-black text-slate-400 mr-1.5">TEMPLATES:</span>
          <button onClick={() => injectTemplate('proposal')} className="text-[10px] bg-slate-200/50 hover:bg-sky-55 text-sky-850 px-2 py-1 rounded font-bold transition">Proposal</button>
          <button onClick={() => injectTemplate('nda')} className="text-[10px] bg-slate-200/50 hover:bg-sky-55 text-sky-850 px-2 py-1 rounded font-bold transition">NDA</button>
          <button onClick={() => injectTemplate('sla')} className="text-[10px] bg-slate-200/50 hover:bg-sky-55 text-sky-850 px-2 py-1 rounded font-bold transition">SLA Matrix</button>
        </div>
      </div>

      {/* Margins/fonts tweak bar */}
      <div className="flex items-center gap-4 mt-3 px-1 text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-1.5">
          <span>Page Style:</span>
          <select 
            value={margin} 
            onChange={(e: any) => setMargin(e.target.value)}
            className="bg-transparent border border-slate-200 rounded px-1.5 py-0.5 outline-none font-bold text-slate-700"
          >
            <option value="standard">Standard Margins</option>
            <option value="compact">Compact narrow Margins</option>
            <option value="wide">Wide empty margins</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Typeface:</span>
          <select 
            value={fontFamily} 
            onChange={(e: any) => setFontFamily(e.target.value)}
            className="bg-transparent border border-slate-200 rounded px-1.5 py-0.5 outline-none font-bold text-slate-700"
          >
            <option value="sans">Modern Sans (Inter)</option>
            <option value="serif">Classic Serif (Georgia)</option>
            <option value="mono">Tech Mono (JetBrains)</option>
          </select>
        </div>
      </div>

      {/* Real sheet canvas style */}
      <div className="bg-slate-100 p-6 rounded-2xl border border-slate-250 mt-4 overflow-y-auto max-h-[500px]">
        <div 
          ref={editorRef}
          contentEditable 
          onBlur={save}
          className={`mx-auto bg-white min-h-[550px] shadow-lg rounded-sm border border-slate-200 outline-none prose max-w-none transition-all
            ${margin === 'standard' ? 'p-12' : margin === 'compact' ? 'p-6' : 'p-20'}
            ${fontFamily === 'sans' ? 'font-sans' : fontFamily === 'serif' ? 'font-serif' : 'font-mono text-sm'}
          `}
        />
      </div>
    </div>
  );
}

// ==================== EXCEL SPREADSHEET POWERHOUSE MODULE ====================
function ExcelTool({ userId }: { userId: string }) {
  const [rows, setRows] = useState(12);
  const [cols, setCols] = useState(8);
  const [data, setData] = useState<Record<string, string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`bs24_excel_${userId}`);
      if (saved) {
        try { return JSON.parse(saved); } catch(e){}
      }
    }
    return {
      "0-0": "Inventory Item", "0-1": "In-Stock Qty", "0-2": "Cost (R)", "0-3": "Active Asset Val (R)",
      "1-0": "Diagnostic Antigen Kits", "1-1": "140", "1-2": "75.00", "1-3": "=B2*C2",
      "2-0": "N95 Surgical Respirators", "2-1": "180", "2-2": "24.50", "2-3": "=B3*C3",
      "3-0": "High-Grade Infusion Pumps", "3-1": "15", "3-2": "3200.00", "3-3": "=B4*C4",
      "4-0": "Intensive Care Monitors", "4-1": "6", "4-2": "12500.00", "4-3": "=B5*C5",
      "5-0": "Aggregated Gross Value", "5-1": "", "5-2": "", "5-3": "=SUM(D2:D5)",
      "6-0": "Mean Asset Value", "6-1": "", "6-2": "", "6-3": "=AVG(D2:D5)"
    };
  });

  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [activeCellVal, setActiveCellVal] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Live Formula Execution System
  const evaluateCellFormula = (val: string, cells: Record<string, string>): string => {
    if (!val || typeof val !== 'string' || !val.startsWith('=')) return val;
    const formula = val.toUpperCase().slice(1).trim();
    
    // Coordinates lookup e.g. B2, D5
    const getCellValue = (ref: string): number => {
      const coords = ref.match(/^([A-Z])(\d+)$/);
      if (!coords) return 0;
      const colLetter = coords[1];
      const rowNum = parseInt(coords[2]) - 1; // 0-based
      const colIdx = colLetter.charCodeAt(0) - 65; // A = 0
      const key = `${rowNum}-${colIdx}`;
      const raw = cells[key] || "";
      if (raw.startsWith('=')) return 0; // Prevent cycle loops
      const num = parseFloat(raw);
      return isNaN(num) ? 0 : num;
    };

    try {
      // 1. Matches '=SUM(D2:D5)'
      const sumMatch = formula.match(/^SUM\(([A-Z]\d+):([A-Z]\d+)\)$/);
      if (sumMatch) {
        const start = sumMatch[1];
        const end = sumMatch[2];
        const startCol = start.charCodeAt(0) - 65;
        const startRow = parseInt(start.slice(1)) - 1;
        const endCol = end.charCodeAt(0) - 65;
        const endRow = parseInt(end.slice(1)) - 1;
        
        let sum = 0;
        for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
          for (let c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); c++) {
            const raw = cells[`${r}-${c}`] || "";
            if (!raw.startsWith('=')) {
              const num = parseFloat(raw);
              if (!isNaN(num)) sum += num;
            }
          }
        }
        return String(sum.toFixed(2));
      }

      // 2. Matches '=AVG(D2:D5)'
      const avgMatch = formula.match(/^AVG\(([A-Z]\d+):([A-Z]\d+)\)$/);
      if (avgMatch) {
        const start = avgMatch[1];
        const end = avgMatch[2];
        const startCol = start.charCodeAt(0) - 65;
        const startRow = parseInt(start.slice(1)) - 1;
        const endCol = end.charCodeAt(0) - 65;
        const endRow = parseInt(end.slice(1)) - 1;
        
        let sum = 0, count = 0;
        for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
          for (let c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); c++) {
            const raw = cells[`${r}-${c}`] || "";
            if (!raw.startsWith('=')) {
              const num = parseFloat(raw);
              if (!isNaN(num)) {
                sum += num;
                count++;
              }
            }
          }
        }
        return count > 0 ? String((sum / count).toFixed(2)) : "0";
      }

      // 3. Simple equation e.g. '=B2*C2' or '=A1+B1'
      let expr = formula;
      const refRegex = /[A-Z]\d+/g;
      expr = expr.replace(refRegex, (match) => String(getCellValue(match)));

      // Sanitize safe evaluation string
      const sanitized = expr.replace(/[^-()\d/*+.]/g, '');
      if (sanitized) {
        const result = new Function("return " + sanitized)();
        return typeof result === 'number' ? String(result.toFixed(2)) : String(result);
      }
    } catch(err) {
      return "#ERR!";
    }
    return "#VALUE!";
  };

  const updateCell = (r: number, c: number, val: string) => {
    const next = { ...data, [`${r}-${c}`]: val };
    setData(next);
    localStorage.setItem(`bs24_excel_${userId}`, JSON.stringify(next));
  };

  const handleCellBlur = (r: number, c: number) => {
    updateCell(r, c, activeCellVal);
    setActiveCell(null);
  };

  const handleCellFocus = (r: number, c: number) => {
    setActiveCell(`${r}-${c}`);
    setActiveCellVal(data[`${r}-${c}`] || "");
  };

  const loadTemplate = (type: string) => {
    if (type === 'budget') {
      setData({
        "0-0": "Expense Category", "0-1": "Allocated Rand (R)", "0-2": "Spent Rand (R)", "0-3": "Variant Balance (R)",
        "1-0": "Office Lease Rent", "1-1": "15000", "1-2": "15000", "1-3": "=B2-C2",
        "2-0": "Symmetric Fibre Net", "2-1": "1200", "2-2": "1350", "2-3": "=B3-C3",
        "3-0": "Logistical Despatches", "3-1": "8500", "3-2": "7400", "3-3": "=B4-C4",
        "4-0": "SAS Compliance Audits", "4-1": "5000", "4-2": "6000", "4-3": "=B5-C5",
        "5-0": "Totals Aggregations", "5-1": "=SUM(B2:B5)", "5-2": "=SUM(C2:C5)", "5-3": "=SUM(D2:D5)"
      });
    } else {
      setData({
        "0-0": "Product Line", "0-1": "Wholesale Price", "0-2": "Direct Cost Of Sale", "0-3": "Raw Margin %",
        "1-0": "Bulk Ad Sponsorships", "1-1": "25000", "1-2": "4500", "1-3": "=(B2-C2)/B2*100",
        "2-0": "Target Lead Enquiries", "2-1": "250", "2-2": "45", "2-3": "=(B3-C3)/B3*100",
        "3-0": "Legal Audits Suite", "3-1": "1500", "3-2": "120", "3-3": "=(B4-C4)/B4*100",
        "4-0": "Weighted Averages", "4-1": "=AVG(B2:B4)", "4-2": "=AVG(C2:C4)", "4-3": ""
      });
    }
  };

  const saveState = () => {
    localStorage.setItem(`bs24_excel_${userId}`, JSON.stringify(data));
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  const downloadCsv = () => {
    let csv = "";
    for (let r = 0; r < rows; r++) {
      let row = [];
      for (let c = 0; c < cols; c++) {
        const val = data[`${r}-${c}`] || "";
        const evaluated = val.startsWith('=') ? evaluateCellFormula(val, data) : val;
        row.push('"' + String(evaluated).replace(/"/g, '""') + '"');
      }
      csv += row.join(",") + "\n";
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "BizSearch24_Accounting_Sheet.csv";
    link.click();
  };

  return (
    <div className="h-full flex flex-col pt-2 select-text">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5 leading-none">
            <Sheet className="w-5 h-5 text-emerald-600" /> Spreadsheet Ledger Powerhouse
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">High-grade interactive model running sum, average, ratios, and formulas.</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 shrink-0">
          <button onClick={() => loadTemplate('budget')} className="text-[10px] bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-bold transition border border-slate-200">Budget Template</button>
          <button onClick={() => loadTemplate('margin')} className="text-[10px] bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-bold transition border border-slate-200">Margins Ratio</button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-1 flex-1">
          <span className="text-[10px] font-mono leading-none bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-1 rounded font-bold">fx Formula Bar</span>
          <input 
            type="text" 
            value={activeCell ? activeCellVal : "Click a cell to compose equations (e.g. '=B2*C2' or '=SUM(D2:D5)')"}
            disabled={!activeCell}
            onChange={(e) => activeCell && setActiveCellVal(e.target.value)}
            className="flex-grow bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-mono outline-none focus:border-indigo-500 text-slate-700 font-bold"
          />
        </div>
        
        <div className="flex items-center gap-1.5">
          <button onClick={saveState} className="bg-slate-150 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition">
            <Save className="w-3.5 h-3.5" /> {isSaving ? "Saved ✓" : "Save"}
          </button>
          <button onClick={downloadCsv} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow shadow-emerald-600/10">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Spreadsheet grid layout */}
      <div className="overflow-auto border border-slate-200 rounded-2xl p-0.5 mt-4 max-h-[420px] shadow-inner bg-slate-50">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-150/80">
              <th className="border border-slate-250 p-1.5 text-center font-mono text-[10px] bg-slate-200 text-slate-500 w-10"></th>
              {Array.from({ length: cols }).map((_, c) => (
                <th key={c} className="border border-slate-250 p-1.5 text-center font-mono text-[10px] bg-slate-200 text-slate-600 font-black">
                  {String.fromCharCode(65 + c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="bg-white hover:bg-slate-50/40">
                <td className="border border-slate-250 p-1 text-center font-mono text-[10px] bg-slate-100 text-slate-500 font-bold">
                  {r + 1}
                </td>
                {Array.from({ length: cols }).map((_, c) => {
                  const key = `${r}-${c}`;
                  const val = data[key] || "";
                  const isFormula = val.startsWith("=");
                  const isCurrentActive = activeCell === key;
                  
                  // Compute value on-the-fly if not editing
                  const displayValue = isFormula && !isCurrentActive ? evaluateCellFormula(val, data) : val;

                  return (
                    <td 
                      key={c} 
                      className={`border border-slate-200 p-0 m-0 transition-colors ${isFormula ? 'bg-indigo-50/20' : ''} ${isCurrentActive ? 'ring-2 ring-emerald-500 ring-inset bg-white' : ''}`}
                    >
                      <input 
                        type="text" 
                        value={isCurrentActive ? activeCellVal : displayValue}
                        onFocus={() => handleCellFocus(r, c)}
                        onBlur={() => handleCellBlur(r, c)}
                        onChange={(e) => setActiveCellVal(e.target.value)}
                        className={`w-full h-full p-2 outline-none bg-transparent min-w-[120px] font-sans ${isFormula && !isCurrentActive ? 'text-indigo-900 font-bold bg-indigo-50/10 font-mono text-[11px]' : 'text-slate-800'}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2.5 mt-3 justify-end text-[10px] font-bold text-slate-400 font-mono">
        <button onClick={() => setRows(r => r + 3)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">+ Rows</button>
        <button onClick={() => setCols(c => c + 1)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">+ Cols</button>
      </div>
    </div>
  );
}

// ==================== PREMIUM INVOICE & CV GENERATOR ====================
function PdfTool({ userId }: { userId: string }) {
  const [pdfType, setPdfType] = useState<"invoice" | "cv">("invoice");
  const [theme, setTheme] = useState<"slate" | "emerald" | "navy" | "aristocrat">("aristocrat");

  // Invoicing inputs
  const [invIssuer, setInvIssuer] = useState("Alpha Medical Distributors Co");
  const [invIssuerEmail, setInvIssuerEmail] = useState("billing@alphamed.co.za");
  const [invIssuerTel, setInvIssuerTel] = useState("+27 (0) 11 403 9823");
  const [invClient, setInvClient] = useState("Vanguard Central General Clinic");
  const [invNo, setInvNo] = useState("INV-2026-9041");
  const [invDate, setInvDate] = useState("2026-06-14");
  const [invTerms, setInvTerms] = useState("Payment due 14 days net. Bank: Standard Bank, Acc: 1048492023, Branch Code: 250655.");
  const [invItems, setInvItems] = useState<{desc: string, rate: number, qty: number}[]>([
    { desc: "Standard Ventilators Kit Packs", rate: 1250, qty: 5 },
    { desc: "ISO Sterile Rubber Gloves (Cases of 1000)", rate: 320, qty: 15 },
    { desc: "Disinfectant Antiseptic Fluid (litres)", rate: 85, qty: 50 },
  ]);

  // CV inputs
  const [cvName, setCvName] = useState("Nicholaus C. Chetty");
  const [cvTitle, setCvTitle] = useState("Senior Operations Analyst & Logistics Director");
  const [cvContact, setCvContact] = useState("nic@yourcorp.com | Johannesburg, South Africa | +27 82 455 1200");
  const [cvSummary, setCvSummary] = useState("Motivated senior supply-chain lead with 8+ years history navigating medical warehousing, shipping compliance matrix, and directory marketing analytics.");
  const [cvExp, setCvExp] = useState<{company: string, role: string, range: string, bullets: string}[]>([
    { company: "Vanguard Distributors Ltd", role: "Logistics Lead Director", range: "2023 - Present", bullets: "Slashed vendor SLA late-delivery rates by custom ERP reporting." },
    { company: "Medi-Quick South Africa Group", role: "Operations Specialist", range: "2019 - 2023", bullets: "Managed bulk container compliance pipelines under ISO regulations audits." }
  ]);
  const [cvEdu, setCvEdu] = useState("B.Com (Supply Chain Honors) - Univ of Witwatersrand, 2017");
  const [cvSkillMatrix, setCvSkillMatrix] = useState("Inventory Control, Negotiations, SAP ERP, Custom SARS Clearance, Audit Readiness");

  const addInvItem = () => setInvItems([...invItems, { desc: "New Procurement Item", rate: 100, qty: 1 }]);
  const removeInvItem = (i: number) => setInvItems(invItems.filter((_, idx) => idx !== i));
  const updateInvItem = (idx: number, field: string, val: any) => {
    setInvItems(invItems.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  };

  const addCvExp = () => setCvExp([...cvExp, { company: "Company Name", role: "Specialist", range: "Year - Year", bullets: "Briefly outline core logistics savings achievements." }]);
  const removeCvExp = (i: number) => setCvExp(cvExp.filter((_, idx) => idx !== i));
  const updateCvExp = (idx: number, field: string, val: any) => {
    setCvExp(cvExp.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  };

  // Invoice calculations
  const itemsSub = invItems.reduce((sum, item) => sum + (item.rate * item.qty), 0);
  const itemsVat = itemsSub * 0.15; // 15% South African VAT
  const itemsTotal = itemsSub + itemsVat;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const themeClasses = {
    slate: { border: "border-slate-800", bg: "bg-slate-800 text-white", accent: "text-slate-805", font: "font-sans" },
    emerald: { border: "border-emerald-600", bg: "bg-emerald-600 text-white", accent: "text-emerald-700", font: "font-sans" },
    navy: { border: "border-indigo-900", bg: "bg-indigo-950 text-white", accent: "text-indigo-800", font: "font-mono" },
    aristocrat: { border: "border-stone-800", bg: "bg-stone-900 text-amber-100", accent: "text-amber-800", font: "font-serif" },
  }[theme];

  return (
    <div className="h-full flex flex-col pt-2 print:p-0 print:m-0 select-text">
      
      {/* Controls panel: Hidden when printing */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5 leading-none">
            <FilePlus className="w-5 h-5 text-rose-600" /> Professional Document & PDF Creator
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">Generate print-ready Tax Invoices or business CV Resumes with dynamic billing math.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Document type trigger */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
            <button 
              onClick={() => setPdfType("invoice")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${pdfType === 'invoice' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Tax Invoice
            </button>
            <button 
              onClick={() => setPdfType("cv")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${pdfType === 'cv' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Professional CV
            </button>
          </div>

          <button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 shadow transition">
            <Download className="w-3.5 h-3.5" /> Print/Export PDF
          </button>
        </div>
      </div>

      {/* Aesthetic selectors: Hidden when printing */}
      <div className="flex items-center gap-2 mt-4 print:hidden text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">THEME PRESET:</span>
        {(["slate", "emerald", "navy", "aristocrat"] as const).map(color => (
          <button 
            key={color} 
            onClick={() => setTheme(color)}
            className={`px-3 py-0.5 rounded font-bold capitalize transition border ${theme === color ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'}`}
          >
            {color}
          </button>
        ))}
      </div>

      {/* Double Column workspace: Input left, live high fidelity sheet right */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-5 flex-1 min-h-[500px]">
        
        {/* LEFT COLUMN: Structured Input schema builders (Hidden during print exports) */}
        <div className="space-y-4 print:hidden border border-slate-150 p-4 rounded-2xl max-h-[520px] overflow-y-auto no-scrollbar bg-slate-50">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">EDIT DOCUMENT PARAMETERS</span>
          
          {pdfType === "invoice" ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Issuer Title</label>
                  <input type="text" value={invIssuer} onChange={e => setInvIssuer(e.target.value)} className="w-full text-xs p-2 bg-white border border-slate-250 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tel contact</label>
                  <input type="text" value={invIssuerTel} onChange={e => setInvIssuerTel(e.target.value)} className="w-full text-xs p-2 bg-white border border-slate-250 rounded-xl outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Billed Client</label>
                  <input type="text" value={invClient} onChange={e => setInvClient(e.target.value)} className="w-full text-xs p-2 bg-white border border-slate-250 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Invoice Number</label>
                  <input type="text" value={invNo} onChange={e => setInvNo(e.target.value)} className="w-full text-xs p-2 bg-white border border-slate-250 rounded-xl outline-none" />
                </div>
              </div>

              {/* Items array loop */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">ITEM LIST ({invItems.length})</span>
                  <button onClick={addInvItem} className="text-[9px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-1 px-2 rounded-md border border-indigo-200 transition">Add Line Item</button>
                </div>
                <div className="space-y-2 max-h-[160px] overflow-y-auto no-scrollbar">
                  {invItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 p-2 bg-white border border-slate-200 rounded-xl items-center">
                      <input type="text" value={item.desc} onChange={e => updateInvItem(idx, 'desc', e.target.value)} className="col-span-6 p-1 text-[11px] outline-none bg-slate-50 rounded" placeholder="Description" />
                      <input type="number" value={item.rate} onChange={e => updateInvItem(idx, 'rate', parseFloat(e.target.value) || 0)} className="col-span-3 p-1 text-[11px] outline-none bg-slate-50 rounded" placeholder="Rate" />
                      <input type="number" value={item.qty} onChange={e => updateInvItem(idx, 'qty', parseInt(e.target.value) || 1)} className="col-span-2 p-1 text-[11px] outline-none bg-slate-50 rounded text-center" placeholder="Qty" />
                      <button onClick={() => removeInvItem(idx)} className="col-span-1 text-rose-500 font-bold text-center">×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Remittance/Terms info</label>
                <textarea value={invTerms} onChange={e => setInvTerms(e.target.value)} className="w-full text-xs p-2 bg-white border border-slate-250 rounded-xl outline-none min-h-[50px] resize-none" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
                  <input type="text" value={cvName} onChange={e => setCvName(e.target.value)} className="w-full text-xs p-2 bg-white border border-slate-250 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Corporate Title</label>
                  <input type="text" value={cvTitle} onChange={e => setCvTitle(e.target.value)} className="w-full text-xs p-2 bg-white border border-slate-250 rounded-xl outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Contact coordinates</label>
                <input type="text" value={cvContact} onChange={e => setCvContact(e.target.value)} className="w-full text-xs p-2 bg-white border border-slate-250 rounded-xl outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Personal Professional Summary</label>
                <textarea value={cvSummary} onChange={e => setCvSummary(e.target.value)} className="w-full text-xs p-2 bg-white border border-slate-250 rounded-xl outline-none h-16 resize-none" />
              </div>

              {/* Experience chronologies */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">CHRONOLOGICAL EXPERIENCES ({cvExp.length})</span>
                  <button onClick={addCvExp} className="text-[9px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-1 px-2 rounded-md border border-indigo-200 transition">Add track</button>
                </div>
                <div className="space-y-2 max-h-[180px] overflow-y-auto no-scrollbar">
                  {cvExp.map((ex, idx) => (
                    <div key={idx} className="p-2 bg-white border border-slate-200 rounded-xl space-y-2">
                      <div className="grid grid-cols-3 gap-1.5">
                        <input type="text" value={ex.company} onChange={e => updateCvExp(idx, 'company', e.target.value)} className="text-[10px] bg-slate-50 p-1 rounded outline-none" placeholder="Company Name" />
                        <input type="text" value={ex.role} onChange={e => updateCvExp(idx, 'role', e.target.value)} className="text-[10px] bg-slate-50 p-1 rounded outline-none" placeholder="Role Title" />
                        <input type="text" value={ex.range} onChange={e => updateCvExp(idx, 'range', e.target.value)} className="text-[10px] bg-slate-50 p-1 rounded outline-none" placeholder="Years range" />
                      </div>
                      <textarea value={ex.bullets} onChange={e => updateCvExp(idx, 'bullets', e.target.value)} className="w-full text-[10px] bg-slate-50 p-1 rounded outline-none min-h-[35px] resize-none" placeholder="Primary achievements" />
                      <button onClick={() => removeCvExp(idx)} className="text-[9px] text-rose-500 hover:bg-rose-50 px-2 py-0.5 rounded font-bold">Delete Track</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Education Degrees</label>
                  <input type="text" value={cvEdu} onChange={e => setCvEdu(e.target.value)} className="w-full text-xs p-2 bg-white border border-slate-250 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Key skill competencies</label>
                  <input type="text" value={cvSkillMatrix} onChange={e => setCvSkillMatrix(e.target.value)} className="w-full text-xs p-2 bg-white border border-slate-250 rounded-xl outline-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: HIGH FIDELITY PAPER PREVIEW CANVAS */}
        <div id="print_area" className={`border border-slate-250 bg-slate-100 p-4 sm:p-8 rounded-2xl flex items-center justify-center min-h-[500px] overflow-y-auto max-h-[530px] print:border-0 print:p-0 print:bg-white print:max-h-none`}>
          
          <div className={`w-full max-w-lg bg-white rounded border p-6 sm:p-10 shadow-lg text-slate-900 border-t-[6px] tracking-tight print:shadow-none print:border-0 print:max-w-none print:p-0
            ${themeClasses.font}
            ${themeClasses.border}
          `}>
            
            {pdfType === 'invoice' ? (
              // INVOICE PREVIEW STYLE
              <div className="space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className={`text-[10px] font-black uppercase font-mono tracking-wider ${themeClasses.accent}`}>SARS Tax Invoice</span>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-950 uppercase mt-1 leading-none">{invIssuer}</h1>
                    <p className="text-[10px] text-slate-500 font-mono mt-2 leading-relaxed">
                      E: {invIssuerEmail}<br/>
                      T: {invIssuerTel}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Invoice Unique ID</span>
                    <div className="text-sm font-bold font-mono text-slate-905">{invNo}</div>
                    <div className="text-[9px] text-slate-400 mt-2 font-mono">Date: {invDate}</div>
                    <div className="mt-2 inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 text-[8px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">Unpaid / Term draft</div>
                  </div>
                </div>

                <div className="border-t border-b border-slate-200/60 py-3 text-xs leading-normal">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Billed To Client:</span>
                  <div className="font-bold text-slate-900 text-sm">{invClient}</div>
                  <span className="text-[9px] text-slate-500 font-mono">South Africa Procurement Pathway</span>
                </div>

                {/* Live item pricing grid */}
                <div className="space-y-2">
                  <div className="grid grid-cols-12 text-[9px] font-black border-b border-slate-300 pb-1.5 uppercase font-mono text-slate-400">
                    <span className="col-span-6">Description</span>
                    <span className="col-span-2 text-right">Rate</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-2 text-right">Total (ZAR)</span>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    {invItems.map((item, id) => (
                      <div key={id} className="grid grid-cols-12 py-2 text-slate-700 font-sans">
                        <span className="col-span-6 font-bold truncate pr-1" title={item.desc}>{item.desc}</span>
                        <span className="col-span-2 text-right font-mono">R{item.rate.toFixed(2)}</span>
                        <span className="col-span-2 text-center font-mono">{item.qty}</span>
                        <span className="col-span-2 text-right font-mono font-bold">R{(item.rate * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invoice calculations summation section */}
                <div className="border-t border-slate-200 pt-4 flex justify-end">
                  <div className="w-56 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal (ZAR):</span>
                      <span className="font-mono">R{itemsSub.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>VAT (15%):</span>
                      <span className="font-mono">R{itemsVat.toFixed(2)}</span>
                    </div>
                    <div className={`flex justify-between text-sm font-bold border-t border-slate-300 pt-2 ${themeClasses.accent}`}>
                      <span>Grand Total:</span>
                      <span className="font-mono">R{itemsTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Terms bank info footer */}
                <div className="border-t border-slate-100 pt-5 text-[9px] text-slate-400 leading-relaxed font-sans">
                  <span className="font-bold text-slate-650 block mb-1">REMITTANCE TERMS:</span>
                  <p>{invTerms}</p>
                </div>
              </div>
            ) : (
              // CV PREVIEW STYLE
              <div className="space-y-6 text-slate-800">
                <div className="border-b border-slate-205 pb-4">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight uppercase">{cvName}</h1>
                  <p className={`text-xs font-bold font-mono mt-1 ${themeClasses.accent}`}>{cvTitle}</p>
                  <p className="text-[9px] text-slate-400 font-mono mt-2 leading-none">{cvContact}</p>
                </div>

                <div className="space-y-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider font-mono ${themeClasses.accent}`}>Professional Biography</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">{cvSummary}</p>
                </div>

                <div className="space-y-3">
                  <span className={`text-[10px] font-black uppercase tracking-wider font-mono ${themeClasses.accent}`}>Employment Track</span>
                  <div className="space-y-3">
                    {cvExp.map((ex, id) => (
                      <div key={id} className="text-xs leading-normal">
                        <div className="flex justify-between font-bold text-slate-900 text-[11px]">
                          <span>{ex.company} — {ex.role}</span>
                          <span className="text-slate-400 text-[10px] font-mono">{ex.range}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 pl-3 border-l border-slate-200">{ex.bullets}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-105 pt-4 text-xs font-sans">
                  <div>
                    <span className={`text-[9px] font-black uppercase tracking-wider font-mono block mb-1 ${themeClasses.accent}`}>Education Matrix</span>
                    <p className="text-[10px] text-slate-500 font-bold leading-normal">{cvEdu}</p>
                  </div>
                  <div>
                    <span className={`text-[9px] font-black uppercase tracking-wider font-mono block mb-1 ${themeClasses.accent}`}>Core Competencies</span>
                    <p className="text-[10px] text-slate-500 italic leading-normal">{cvSkillMatrix}</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

// ==================== ENTERPRISE CRM PIPELINE MODULE ====================
function CrmTool({ userId }: { userId: string }) {
  const [leads, setLeads] = useState<{id: string; name: string; email: string; phone: string; company: string; status: "Intake" | "Contacted" | "Proposal Sent" | "Negotiating" | "Won & Active" | "Closed / Lost"; val: number; notes: string; priority: "Low" | "Medium" | "High" | "Critical"; logs: {date: string, action: string, text: string}[]}[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`bs24_crm_${userId}`);
      if (saved) {
        try { return JSON.parse(saved); } catch(e){}
      }
    }
    return [
      {
        id: "lead_1",
        name: "Lindiwe Dlamini",
        email: "lindiwe@gautengmed.org.za",
        phone: "011 555 9812",
        company: "Gauteng Healthcare Corp",
        status: "Negotiating",
        val: 85000,
        notes: "Highly interested in bulk procurement discounts. Awaiting formal quotation review.",
        priority: "High",
        logs: [
          { date: "2026-06-12", action: "Phone Call", text: "Discussed bulk sterile protective kits specifications. Strong buy signal." },
          { date: "2026-06-13", action: "Email Sent", text: "Dispatched initial catalog pricing spreadsheet and legal terms cover." }
        ]
      },
      {
        id: "lead_2",
        name: "Devon Meyer",
        email: "d.meyer@capeclinics.co.za",
        phone: "021 443 1190",
        company: "Cape Medical Clinics Group",
        status: "Proposal Sent",
        val: 125000,
        notes: "SLA draft submitted. Negotiating quarterly delivery milestones.",
        priority: "Critical",
        logs: [
          { date: "2026-06-10", action: "Meeting Minutes", text: "In-person intro presentation. Client requested tailored logistics SLAs." }
        ]
      },
      {
        id: "lead_3",
        name: "Sarah Jenkins",
        email: "sjenkins@dentalsupply.co.za",
        phone: "031 992 4810",
        company: "Apex Dental Supplies",
        status: "Won & Active",
        val: 45050,
        notes: "First bulk shipment verified. Set up quarterly automated delivery intervals.",
        priority: "Medium",
        logs: [
          { date: "2026-06-08", action: "Deal Closure", text: "PO received & first delivery verified." }
        ]
      }
    ];
  });

  const [activeLead, setActiveLead] = useState<typeof leads[0] | null>(null);
  const [newLogAction, setNewLogAction] = useState("Phone Call");
  const [newLogText, setNewLogText] = useState("");

  const save = (updated: typeof leads) => {
    setLeads(updated);
    localStorage.setItem(`bs24_crm_${userId}`, JSON.stringify(updated));
    if (activeLead) {
      const refreshedActive = updated.find(l => l.id === activeLead.id);
      if (refreshedActive) setActiveLead(refreshedActive);
    }
  };

  const addLead = () => {
    const next: typeof leads[0] = {
      id: "lead_" + Date.now(),
      name: "New Lead Intake",
      email: "client@yourdomain.co.za",
      phone: "+27 (0) 00 000 0000",
      company: "Enterprise Entity",
      status: "Intake",
      val: 20000,
      notes: "Newly integrated commercial contact via search directory index.",
      priority: "Medium",
      logs: []
    };
    save([next, ...leads]);
    setActiveLead(next);
  };

  const deleteLead = (id: string) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      save(leads.filter(l => l.id !== id));
      setActiveLead(null);
    }
  };

  const changeStatus = (leadId: string, dir: 'forward' | 'backward') => {
    const stages: typeof leads[0]['status'][] = ["Intake", "Contacted", "Proposal Sent", "Negotiating", "Won & Active", "Closed / Lost"];
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const currIdx = stages.indexOf(lead.status);
    let nextIdx = currIdx + (dir === 'forward' ? 1 : -1);
    
    if (nextIdx >= 0 && nextIdx < stages.length) {
      const nextStage = stages[nextIdx];
      const nextLeads = leads.map(l => l.id === leadId ? { ...l, status: nextStage } : l);
      save(nextLeads);
    }
  };

  const updateLeadField = (leadId: string, field: string, val: any) => {
    const nextLeads = leads.map(l => l.id === leadId ? { ...l, [field]: val } : l);
    save(nextLeads);
  };

  const addLog = () => {
    if (!activeLead || !newLogText.trim()) return;
    const log = {
      date: new Date().toISOString().substring(0, 10),
      action: newLogAction,
      text: newLogText.trim()
    };
    const nextLeads = leads.map(l => {
      if (l.id === activeLead.id) {
        return { ...l, logs: [log, ...l.logs] };
      }
      return l;
    });
    save(nextLeads);
    setNewLogText("");
  };

  // Pipeline metrics calculations
  const pipelineSum = leads.reduce((acc, l) => acc + (l.status !== 'Closed / Lost' ? l.val : 0), 0);
  const wonSum = leads.reduce((acc, l) => acc + (l.status === 'Won & Active' ? l.val : 0), 0);
  const winPercent = leads.length > 0 ? ((leads.filter(l => l.status === 'Won & Active').length / leads.length) * 100).toFixed(0) : "0";

  return (
    <div className="h-full flex flex-col pt-2 select-text">
      
      {/* Top action header and general diagnostics log */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5 leading-none">
            <Users className="w-5 h-5 text-amber-600" /> Enterprise CRM Boards
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">Natively manage, advance, and log customer contracts, logs, and valuations.</p>
        </div>
        <button onClick={addLead} className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow transition">
          <FolderPlus className="w-4 h-4" /> Add Corporate Lead
        </button>
      </div>

      {/* Modern Pipeline Analytics Mini Cards block */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-amber-50/40 border border-slate-200/60 rounded-2xl p-3 text-center">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 block">Active pipeline size</span>
          <span className="text-lg font-black font-mono text-amber-900 mt-1 block">R{pipelineSum.toLocaleString()}</span>
        </div>
        <div className="bg-emerald-50/40 border border-slate-200/60 rounded-2xl p-3 text-center">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 block">Won contracts value</span>
          <span className="text-lg font-black font-mono text-emerald-990 mt-1 block font-bold">R{wonSum.toLocaleString()}</span>
        </div>
        <div className="bg-indigo-50/40 border border-slate-200/60 rounded-2xl p-3 text-center">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 block">Win closing success</span>
          <span className="text-lg font-black font-mono text-indigo-900 mt-1 block">{winPercent}% Win-Rate</span>
        </div>
      </div>

      {/* Main CRM boards pipeline split layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-6 flex-1 items-start">
        
        {/* PIPELINE DASHBOARD (3 columns) */}
        <div className="xl:col-span-3 space-y-4 max-h-[380px] overflow-y-auto pr-1">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">ACTIVE CLIENT SHEETS</span>
          
          {leads.length === 0 ? (
            <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold">
              Pipeline boards currently empty. Click &quot;Add Corporate Lead&quot; above to seed.
            </div>
          ) : (
            <div className="space-y-2.5">
              {leads.map(lead => (
                <div 
                  key={lead.id}
                  onClick={() => setActiveLead(lead)}
                  className={`p-3.5 border rounded-2xl transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white relative group hover:border-slate-350 hover:shadow-sm
                    ${activeLead?.id === lead.id ? 'border-amber-500 bg-amber-50/15' : 'border-slate-200'}
                  `}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{lead.name}</span>
                      <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full font-mono">{lead.company}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono"><Mail className="w-3 h-3 text-slate-350" /> {lead.email}</span>
                      <span className="flex items-center gap-1 font-mono"><Phone className="w-3 h-3 text-slate-350" /> {lead.phone}</span>
                      <span className="font-bold bg-amber-50 border border-amber-100 text-amber-700 text-[9px] px-2 py-0.5 rounded uppercase">{lead.priority} Priority</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-auto select-none">
                    
                    {/* Progression flow action controls */}
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); changeStatus(lead.id, 'backward'); }}
                        className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded transition"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-bold text-indigo-900 uppercase font-mono px-2.5 bg-indigo-50 border border-indigo-100/50 py-0.5 rounded-md min-w-[100px] text-center">
                        {lead.status}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); changeStatus(lead.id, 'forward'); }}
                        className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded transition"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right pr-2 min-w-[90px]">
                      <span className="text-[9px] text-slate-400 uppercase font-mono block">Worth</span>
                      <strong className="text-sm font-black font-mono text-slate-800">R{lead.val.toLocaleString()}</strong>
                    </div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteLead(lead.id); }} 
                      className="p-1 text-slate-300 hover:text-rose-600 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LOG ROSTER & SIDEBAR (1 column) */}
        <div className="border border-slate-220 bg-slate-50/50 p-4 rounded-2xl min-h-[380px] flex flex-col justify-between">
          {activeLead ? (
            <div className="space-y-4 flex flex-col justify-between h-full">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                  <div>
                    <h3 className="font-bold text-xs text-slate-700 truncate">{activeLead.name} Details</h3>
                    <span className="text-[9px] text-slate-450 uppercase font-mono tracking-wider">{activeLead.company} Logistics</span>
                  </div>
                  <button onClick={() => setActiveLead(null)} className="text-slate-400 hover:text-slate-600">×</button>
                </div>

                {/* Edit inline field size or notes */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Deal value (R)</label>
                    <input 
                      type="number" 
                      value={activeLead.val} 
                      onChange={e => updateLeadField(activeLead.id, 'val', parseFloat(e.target.value) || 0)} 
                      className="w-full text-xs bg-white border border-slate-200 p-1.5 rounded-lg outline-none font-bold text-slate-800 font-mono" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Priority setting</label>
                    <select 
                      value={activeLead.priority} 
                      onChange={e => updateLeadField(activeLead.id, 'priority', e.target.value)} 
                      className="w-full text-xs bg-white border border-slate-200 p-1.5 rounded-lg outline-none font-bold text-slate-800"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Main Notes</label>
                  <textarea 
                    value={activeLead.notes} 
                    onChange={e => updateLeadField(activeLead.id, 'notes', e.target.value)} 
                    className="w-full text-xs bg-white border border-slate-200 p-1.5 rounded-lg outline-none min-h-[50px] resize-none text-slate-700 leading-normal" 
                  />
                </div>

                {/* Activity Interaction Logger logger */}
                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">LOG CLIENT ENGAGEMENT</span>
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-1.5">
                      {["Phone Call", "Email Sent", "Meeting Minutes", "SLA Negotiation", "Status Update"].map(act => (
                        <button 
                          key={act} 
                          onClick={() => setNewLogAction(act)}
                          className={`text-[9px] font-black py-1 px-1.5 rounded border transition uppercase ${newLogAction === act ? 'bg-indigo-600 text-white border-transparent' : 'bg-white border-slate-150 hover:bg-slate-100 text-slate-500'}`}
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <input 
                        type="text" 
                        value={newLogText} 
                        onChange={e => setNewLogText(e.target.value)} 
                        placeholder="e.g. Discussed medical inventory quotas..." 
                        className="flex-grow text-[11px] p-2 bg-white border border-slate-200 rounded-xl outline-none" 
                      />
                      <button onClick={addLog} className="bg-indigo-650 hover:bg-indigo-700 bg-indigo-600 text-white text-xs px-3 rounded-xl font-bold">Add</button>
                    </div>
                  </div>
                </div>

                {/* Log history list representation */}
                <div className="border-t border-slate-200 pt-3 max-h-[120px] overflow-y-auto no-scrollbar space-y-2">
                  <span className="text-[9px] font-black uppercase text-slate-450 block mb-1">CHRONOLOGICAL ENGAGEMENTS HISTORY</span>
                  {activeLead.logs.length === 0 ? (
                    <div className="text-[10px] text-slate-400 italic text-center py-2">No interaction history registered yet.</div>
                  ) : (
                    activeLead.logs.map((log, idx) => (
                      <div key={idx} className="bg-white p-2 rounded-xl border border-slate-150 text-[10px] space-y-1">
                        <div className="flex justify-between items-center text-[9px] text-indigo-800 font-bold font-mono">
                          <span>{log.action}</span>
                          <span className="text-slate-400">{log.date}</span>
                        </div>
                        <p className="text-slate-600 italic leading-snug">{log.text}</p>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-center p-4">
              <div className="space-y-1 text-slate-400">
                <AlertCircle className="w-6 h-6 mx-auto text-slate-350" />
                <p className="text-xs font-bold">No Lead Selected</p>
                <p className="text-[10px] text-slate-450 leading-relaxed font-sans">Click on any commercial active client sheet to inspect chronological activity history logging.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ==================== FLOATER CALCULATOR MODULE ====================
function FloaterCalculator({ onClose }: { onClose: () => void }) {
  const [val, setVal] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [operationLogs, setOperationLogs] = useState<string[]>([]);

  const calculateEquationValue = () => {
    try {
      const sanitized = val.replace(/[^-()\d/*+.]/g, ''); 
      if (sanitized) {
        const result = new Function("return " + sanitized)();
        const displayResult = typeof result === 'number' ? String(result) : "0";
        
        // Log operation on historical ribbon tape
        setOperationLogs(prev => [`${val} = ${displayResult}`, ...prev.slice(0, 4)]);
        setVal(displayResult);
      }
    } catch(e) {
      setVal("Error");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-68 bg-[#0f172a] border border-slate-700 shadow-2xl rounded-2xl overflow-hidden font-sans select-none">
      <div className="flex bg-[#020617] p-3.5 items-center justify-between">
        <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase ml-1.5 flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5 text-indigo-500" /> Professional Calculator
        </span>
        <div className="flex gap-1.5">
          <button onClick={() => setMinimized(!minimized)} className="p-1 hover:bg-slate-800 rounded-md text-slate-400 group transition">
            <Minimize2 className="w-3.5 h-3.5 group-hover:text-white" />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-rose-600/30 rounded-md text-slate-400 group transition">
            <X className="w-3.5 h-3.5 group-hover:text-rose-500" />
          </button>
        </div>
      </div>
      
      {!minimized && (
        <div className="p-4 space-y-3">
          
          {/* Operations tape memory list */}
          {operationLogs.length > 0 && (
            <div className="bg-slate-950 p-2 rounded-xl text-[9px] font-mono text-slate-500 space-y-0.5 text-right border border-slate-800">
              {operationLogs.map((log, idx) => (
                <div key={idx} className="truncate">{log}</div>
              ))}
            </div>
          )}

          <input 
            type="text" 
            value={val} 
            readOnly 
            className="w-full bg-slate-900 text-white p-3.5 text-right text-xl rounded-xl mb-1 border border-slate-800 font-mono tracking-widest outline-none shadow-inner" 
            placeholder="0" 
          />
          
          <div className="grid grid-cols-4 gap-2 text-xs">
            {['(', ')', 'C', '/'].map(btn => (
              <button 
                key={btn}
                onClick={() => {
                  if (btn === 'C') setVal("");
                  else setVal(v => v === "Error" ? btn : v + btn);
                }}
                className="bg-slate-850 hover:bg-slate-800 text-indigo-400 p-2.5 rounded-xl font-black font-mono transition"
              >
                {btn}
              </button>
            ))}

            {['7','8','9','*'].map(btn => (
              <button 
                key={btn}
                onClick={() => setVal(v => v === "Error" ? btn : v + btn)}
                className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-xl font-bold font-mono transition"
              >
                {btn}
              </button>
            ))}

            {['4','5','6','-'].map(btn => (
              <button 
                key={btn}
                onClick={() => setVal(v => v === "Error" ? btn : v + btn)}
                className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-xl font-bold font-mono transition"
              >
                {btn}
              </button>
            ))}

            {['1','2','3','+'].map(btn => (
              <button 
                key={btn}
                onClick={() => setVal(v => v === "Error" ? btn : v + btn)}
                className="bg-slate-800 hover:bg-slate-705 text-white p-2.5 rounded-xl font-bold font-mono transition"
              >
                {btn}
              </button>
            ))}

            {['0','.','+/-','='].map(btn => (
              <button 
                key={btn}
                onClick={() => {
                  if (btn === '=') calculateEquationValue();
                  else if (btn === '+/-') {
                    if (val && !val.startsWith('-')) setVal('-' + val);
                    else if (val && val.startsWith('-')) setVal(val.substring(1));
                  }
                  else setVal(v => v === "Error" ? btn : v + btn);
                }}
                className={`p-2.5 rounded-xl font-black font-mono transition
                  ${btn === '=' ? 'col-span-2 bg-[#4f46e5] text-white hover:bg-indigo-550' : 'bg-slate-800 hover:bg-slate-700 text-white'}
                `}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
