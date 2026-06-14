"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  FileText, FilePlus, Download, Save, Sheet, Calculator, 
  BookOpen, Users, FolderPlus, Minimize2, Maximize2, X
} from "lucide-react";

export default function ToolsDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [activeTool, setActiveTool] = useState<"word" | "pdf" | "excel" | "notepad" | "crm">("notepad");
  const [calcOpen, setCalcOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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
    return <div className="min-h-screen py-20 flex justify-center items-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 relative pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-display">BizSearch24 Tools</h1>
              <p className="text-sm text-slate-500">Premium business utilities & secure offline-first storage.</p>
            </div>
            
            <button 
              onClick={() => setCalcOpen(!calcOpen)}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-2 text-sm font-bold shadow-sm flex items-center transition-all self-start"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {calcOpen ? "Hide Calculator" : "Launch Calculator"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
          
          {/* Menu */}
          <div className="col-span-1 border border-slate-200 bg-white rounded-2xl p-3 shadow-sm h-fit">
            <div className="space-y-1">
               <button onClick={() => setActiveTool('notepad')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${activeTool === 'notepad' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                 <BookOpen className="w-5 h-5"/> Notepad
               </button>
               <button onClick={() => setActiveTool('word')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${activeTool === 'word' ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                 <FileText className="w-5 h-5"/> Document Writer
               </button>
               <button onClick={() => setActiveTool('excel')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${activeTool === 'excel' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                 <Sheet className="w-5 h-5"/> Spreadsheet
               </button>
               <button onClick={() => setActiveTool('pdf')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${activeTool === 'pdf' ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                 <FilePlus className="w-5 h-5"/> PDF Creator
               </button>
               <button onClick={() => setActiveTool('crm')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${activeTool === 'crm' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                 <Users className="w-5 h-5"/> Basic CRM
               </button>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="col-span-1 md:col-span-3 lg:col-span-4 border border-slate-200 bg-white rounded-2xl p-1 lg:p-6 shadow-sm min-h-[600px]">
            {activeTool === 'notepad' && <NotepadTool userId={user.id} />}
            {activeTool === 'word' && <WordTool userId={user.id} />}
            {activeTool === 'excel' && <ExcelTool userId={user.id} />}
            {activeTool === 'pdf' && <PdfTool userId={user.id} />}
            {activeTool === 'crm' && <CrmTool userId={user.id} />}
          </div>

        </div>
      </div>

      {calcOpen && <FloaterCalculator onClose={() => setCalcOpen(false)} />}
    </div>
  );
}

function NotepadTool({ userId }: { userId: string }) {
  const [text, setText] = useState("");
  
  useEffect(() => {
    const saved = localStorage.getItem(`bs24_notepad_${userId}`);
    if (saved) setText(saved);
  }, [userId]);

  const save = () => {
    localStorage.setItem(`bs24_notepad_${userId}`, text);
    const btn = document.getElementById('save_notepad_btn');
    if (btn) {
      btn.textContent = "Saved ✓";
      setTimeout(() => btn.textContent = "Save Locally", 2000);
    }
  };

  const downloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "BizSearch24_Notes.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="h-full flex flex-col pt-3 lg:pt-0">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4 px-4 lg:px-0">
        <h2 className="text-lg font-bold text-slate-800">Local Notepad</h2>
        <div className="flex gap-2">
          <button id="save_notepad_btn" onClick={save} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition">Save Locally</button>
          <button onClick={downloadTxt} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center"><Download className="w-3 h-3 mr-1" /> Download .txt</button>
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 w-full p-4 border border-slate-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-indigo-500 min-h-[500px] font-mono text-sm"
        placeholder="Type your secure notes here..."
      />
    </div>
  );
}

function WordTool({ userId }: { userId: string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  const saveHtml = () => {
    if (contentRef.current) {
       localStorage.setItem(`bs24_word_${userId}`, contentRef.current.innerHTML);
       const btn = document.getElementById('save_word_btn');
       if (btn) {
         btn.textContent = "Saved ✓";
         setTimeout(() => btn.textContent = "Save", 2000);
       }
    }
  };

  useEffect(() => {
    if (contentRef.current) {
      const saved = localStorage.getItem(`bs24_word_${userId}`);
      if (saved) contentRef.current.innerHTML = saved;
    }
  }, [userId]);

  const downloadDoc = () => {
    if (!contentRef.current) return;
    const content = contentRef.current.innerHTML;
    const preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Doc</title></head><body>";
    const postHtml = "</body></html>";
    const html = preHtml + content + postHtml;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'BizSearch24_Document.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exec = (cmd: string) => {
    document.execCommand(cmd, false, "");
  };

  return (
    <div className="h-full flex flex-col pt-3 lg:pt-0 pb-4 px-4 lg:px-0">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-800">Document Writer</h2>
        <div className="flex gap-2">
          <button id="save_word_btn" onClick={saveHtml} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition">Save</button>
          <button onClick={downloadDoc} className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center"><Download className="w-3 h-3 mr-1" /> Download .doc</button>
        </div>
      </div>
      
      <div className="border border-slate-300 rounded-t-xl bg-slate-100 p-2 flex flex-wrap gap-2">
         <button onClick={() => exec('bold')} className="p-1 px-3 bg-white rounded shadow-sm text-sm font-bold">B</button>
         <button onClick={() => exec('italic')} className="p-1 px-3 bg-white rounded shadow-sm text-sm font-italic italic">I</button>
         <button onClick={() => exec('underline')} className="p-1 px-3 bg-white rounded shadow-sm text-sm underline">U</button>
         <button onClick={() => exec('insertUnorderedList')} className="p-1 px-3 bg-white rounded shadow-sm text-sm">• List</button>
      </div>
      
      <div 
        ref={contentRef}
        contentEditable 
        className="flex-1 w-full p-8 border border-t-0 border-slate-300 rounded-b-xl min-h-[600px] outline-none shadow-inner bg-white prose max-w-none"
      />
    </div>
  );
}

function PdfTool({ userId }: { userId: string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  const savePdfState = () => {
    if (contentRef.current) {
       localStorage.setItem(`bs24_pdf_${userId}`, contentRef.current.innerHTML);
       const btn = document.getElementById('save_pdf_btn');
       if (btn) {
         btn.textContent = "Saved ✓";
         setTimeout(() => btn.textContent = "Save Draft", 2000);
       }
    }
  };

  useEffect(() => {
    if (contentRef.current) {
      const saved = localStorage.getItem(`bs24_pdf_${userId}`);
      if (saved) contentRef.current.innerHTML = saved;
    }
  }, [userId]);

  const downloadPdf = () => {
    if (typeof window !== "undefined") {
       window.print(); // Using browser print to PDF as native easiest, clean way
    }
  };

  return (
    <div className="h-full flex flex-col pt-3 lg:pt-0 pt-3 lg:pt-0 pb-4 px-4 lg:px-0">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-800">PDF Creator (Print-to-PDF)</h2>
        <div className="flex gap-2">
          <button id="save_pdf_btn" onClick={savePdfState} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition">Save Draft</button>
          <button onClick={downloadPdf} className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center print:hidden"><Download className="w-3 h-3 mr-1" /> Export PDF</button>
        </div>
      </div>
      
      <div 
        ref={contentRef}
        contentEditable 
        className="flex-1 w-full p-8 border border-slate-300 rounded-xl min-h-[600px] outline-none bg-white prose max-w-none shadow-sm print:border-0 print:p-0 print:shadow-none"
      />
    </div>
  );
}

function ExcelTool({ userId }: { userId: string }) {
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(6);
  const [data, setData] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem(`bs24_excel_${userId}`);
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch(e){}
    }
  }, [userId]);

  const updateCell = (r: number, c: number, val: string) => {
    const newData = {...data, [`${r}-${c}`]: val};
    setData(newData);
  };

  const save = () => {
     localStorage.setItem(`bs24_excel_${userId}`, JSON.stringify(data));
     const btn = document.getElementById('save_excel_btn');
     if (btn) {
       btn.textContent = "Saved ✓";
       setTimeout(() => btn.textContent = "Save", 2000);
     }
  };

  const downloadCsv = () => {
    let csv = "";
    for(let i=0; i<rows; i++){
      let row = [];
      for(let j=0; j<cols; j++){
         let cell = data[`${i}-${j}`] || "";
         row.push('"' + cell.replace(/"/g, '""') + '"');
      }
      csv += row.join(",") + "\n";
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "BizSearch24_Spreadsheet.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col pt-3 lg:pt-0 overflow-x-auto pb-4 px-4 lg:px-0">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4 min-w-max">
        <h2 className="text-lg font-bold text-slate-800">Basic Spreadsheet</h2>
        <div className="flex gap-2">
          <button onClick={() => setRows(r => r + 5)} className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+ Rows</button>
          <button onClick={() => setCols(c => c + 2)} className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+ Cols</button>
          <button id="save_excel_btn" onClick={save} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition">Save</button>
          <button onClick={downloadCsv} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center"><Download className="w-3 h-3 mr-1" /> Download .csv</button>
        </div>
      </div>
      
      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white select-none">
        <table className="w-full text-sm border-collapse">
          <tbody>
            {Array.from({length: rows}).map((_, rIdx) => (
               <tr key={rIdx}>
                 {Array.from({length: cols}).map((_, cIdx) => (
                   <td key={cIdx} className="border border-slate-200 p-0 m-0">
                     <input 
                       type="text" 
                       value={data[`${rIdx}-${cIdx}`] || ""}
                       onChange={(e) => updateCell(rIdx, cIdx, e.target.value)}
                       className="w-full h-full p-2 outline-none focus:ring-inset focus:ring-2 focus:ring-emerald-500 bg-transparent min-w-[120px]"
                     />
                   </td>
                 ))}
               </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CrmTool({ userId }: { userId: string }) {
  const [leads, setLeads] = useState<{id: string; name: string; email: string; phone: string; status: string; notes: string}[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`bs24_crm_${userId}`);
    if (saved) {
      try {
        setLeads(JSON.parse(saved));
      } catch(e){}
    }
  }, [userId]);

  const save = (updated: any) => {
    setLeads(updated);
    localStorage.setItem(`bs24_crm_${userId}`, JSON.stringify(updated));
  };

  const addLead = () => {
    save([...leads, {id: "lead_"+Date.now(), name: "", email: "", phone: "", status: "New", notes: ""}]);
  };

  const updateLead = (id: string, field: string, val: string) => {
    save(leads.map(l => l.id === id ? {...l, [field]: val} : l));
  };

  const deleteLead = (id: string) => {
    save(leads.filter(l => l.id !== id));
  };

  const downloadCsv = () => {
    let csv = "Name,Email,Phone,Status,Notes\n";
    leads.forEach(l => {
      csv += `"${l.name}","${l.email}","${l.phone}","${l.status}","${l.notes.replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "BizSearch24_CRM_Leads.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col pt-3 lg:pt-0 overflow-x-auto pb-4 px-4 lg:px-0">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4 min-w-[700px]">
        <h2 className="text-lg font-bold text-slate-800">Basic CRM Simulator</h2>
        <div className="flex gap-2">
          <button onClick={addLead} className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center"><FolderPlus className="w-3 h-3 mr-1" /> Add Lead</button>
          <button onClick={downloadCsv} className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center"><Download className="w-3 h-3 mr-1" /> Download CSV</button>
        </div>
      </div>
      
      <div className="space-y-3 min-w-[700px]">
        {leads.length === 0 && <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">No leads yet. Add one above.</div>}
        {leads.map(lead => (
           <div key={lead.id} className="grid grid-cols-6 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl items-center">
             <input type="text" className="col-span-1 p-2 text-sm rounded outline-none border border-slate-200 focus:border-amber-500" placeholder="Name" value={lead.name} onChange={e => updateLead(lead.id, 'name', e.target.value)} />
             <input type="text" className="col-span-1 p-2 text-sm rounded outline-none border border-slate-200 focus:border-amber-500" placeholder="Email" value={lead.email} onChange={e => updateLead(lead.id, 'email', e.target.value)} />
             <input type="text" className="col-span-1 p-2 text-sm rounded outline-none border border-slate-200 focus:border-amber-500" placeholder="Phone" value={lead.phone} onChange={e => updateLead(lead.id, 'phone', e.target.value)} />
             <select className="col-span-1 p-2 text-sm rounded outline-none border border-slate-200 focus:border-amber-500" value={lead.status} onChange={e => updateLead(lead.id, 'status', e.target.value)}>
               <option value="New">New</option>
               <option value="Contacted">Contacted</option>
               <option value="In Progress">In Progress</option>
               <option value="Closed">Closed</option>
             </select>
             <input type="text" className="col-span-1 p-2 text-sm rounded outline-none border border-slate-200 focus:border-amber-500" placeholder="Notes" value={lead.notes} onChange={e => updateLead(lead.id, 'notes', e.target.value)} />
             <button onClick={() => deleteLead(lead.id)} className="col-span-1 text-xs text-rose-500 font-bold hover:bg-rose-50 p-2 rounded justify-self-end">Remove</button>
           </div>
        ))}
      </div>
    </div>
  );
}

// Floater Calculator
function FloaterCalculator({ onClose }: { onClose: () => void }) {
   const [val, setVal] = useState("");
   const [minimized, setMinimized] = useState(false);

   const calc = () => {
      try {
         const evalStr = val.replace(/[^-()\d/*+.]/g, ''); 
         if (evalStr) {
           const result = new Function("return " + evalStr)();
           setVal(String(result));
         }
      } catch(e) {
         setVal("Error");
      }
   }

   return (
     <div className="fixed bottom-6 right-6 z-[100] w-64 bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden font-sans select-none">
       <div className="flex bg-slate-950 p-2 items-center justify-between cursor-move">
         <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase ml-2">Secure Calc</span>
         <div className="flex gap-1">
           <button onClick={() => setMinimized(!minimized)} className="p-1 hover:bg-slate-800 rounded text-slate-400 group"><Minimize2 className="w-3 h-3 group-hover:text-white" /></button>
           <button onClick={onClose} className="p-1 hover:bg-rose-500/20 rounded text-slate-400 group"><X className="w-3 h-3 group-hover:text-rose-500" /></button>
         </div>
       </div>
       {!minimized && (
         <div className="p-3">
           <input type="text" value={val} readOnly className="w-full bg-slate-800 text-white p-3 text-right text-lg rounded-xl mb-3 border border-slate-700 outline-none" placeholder="0" />
           <div className="grid grid-cols-4 gap-2">
              {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','.','+'].map(btn => (
                 <button 
                   key={btn}
                   onClick={() => {
                     if(btn === 'C') setVal("");
                     else setVal(v => v === "Error" ? btn : v + btn);
                   }}
                   className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg font-bold text-sm"
                 >{btn}</button>
              ))}
              <button 
                onClick={calc}
                className="col-span-4 bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg font-bold text-sm"
              >=</button>
           </div>
         </div>
       )}
     </div>
   );
}
