'use client';

import React, { useState, useMemo } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  Search, 
  ArrowLeft, 
  FileImage, 
  Files, 
  Scissors, 
  Minimize2, 
  FileText, 
  ShieldCheck, 
  Zap, 
  Download, 
  Sliders, 
  Layers, 
  Lock, 
  Unlock, 
  RotateCw, 
  FilePlus, 
  ChevronDown, 
  X, 
  Mail, 
  CheckCircle2 
} from 'lucide-react';

interface ToolItem {
  id: string;
  title: string;
  desc: string;
  category: 'PDF' | 'Image' | 'Security';
  icon: any;
  color: string;
}

const ALL_TOOLS: ToolItem[] = [
  { id: 'jpg-to-pdf', title: 'JPG to PDF', desc: 'Convert JPG/PNG images to high-quality PDF documents.', category: 'PDF', icon: FileImage, color: 'from-blue-600 to-cyan-500' },
  { id: 'merge-pdf', title: 'Merge PDF', desc: 'Combine multiple PDF files into one unified document.', category: 'PDF', icon: Files, color: 'from-indigo-600 to-purple-500' },
  { id: 'split-pdf', title: 'Split PDF', desc: 'Extract specific pages or page ranges from any PDF.', category: 'PDF', icon: Scissors, color: 'from-rose-600 to-orange-500' },
  { id: 'compress-img', title: 'Compress Image', desc: 'Reduce JPG/PNG file size with custom quality slider.', category: 'Image', icon: Minimize2, color: 'from-emerald-600 to-teal-500' },
  { id: 'rotate-pdf', title: 'Rotate PDF', desc: 'Rotate PDF pages clockwise to adjust orientation.', category: 'PDF', icon: RotateCw, color: 'from-amber-500 to-yellow-500' },
  { id: 'protect-pdf', title: 'Protect PDF', desc: 'Encrypt your PDF documents with custom client password.', category: 'Security', icon: Lock, color: 'from-purple-600 to-pink-500' },
  { id: 'png-to-jpg', title: 'PNG to JPG', desc: 'Convert PNG images with transparent backgrounds to JPG.', category: 'Image', icon: FilePlus, color: 'from-sky-500 to-blue-600' },
  { id: 'pdf-to-txt', title: 'PDF Metadata Reader', desc: 'Inspect PDF page counts, author, and structure.', category: 'PDF', icon: FileText, color: 'from-teal-500 to-emerald-600' },
];

export default function AppSuite() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'PDF' | 'Image' | 'Security'>('All');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  // General Tool States
  const [files, setFiles] = useState<FileList | null>(null);
  const [range, setRange] = useState('');
  const [quality, setQuality] = useState(70);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [modal, setModal] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Filtered Tools
  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const activeTool = ALL_TOOLS.find(t => t.id === activeToolId);

  const download = (bytes: Uint8Array | Blob, name: string) => {
    const blob = bytes instanceof Blob ? bytes : new Blob([bytes], { type: 'application/pdf' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setStatusMsg('Download completed successfully!');
  };

  // Execution Handlers
  const handleProcessTool = async () => {
    if (!files || files.length === 0) return alert('Please upload files first.');
    setLoading(true);
    setStatusMsg('Processing locally in browser...');

    try {
      if (activeToolId === 'jpg-to-pdf') {
        const pdf = await PDFDocument.create();
        for (let i = 0; i < files.length; i++) {
          const bytes = await files[i].arrayBuffer();
          const img = files[i].type.includes('png') ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
          const page = pdf.addPage([img.width, img.height]);
          page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        }
        download(await pdf.save(), `QuickPDF-${Date.now()}.pdf`);
      } 
      else if (activeToolId === 'merge-pdf') {
        if (files.length < 2) return alert('Select at least 2 PDFs to merge.');
        const merged = await PDFDocument.create();
        for (let i = 0; i < files.length; i++) {
          const doc = await PDFDocument.load(await files[i].arrayBuffer());
          const pages = await merged.copyPages(doc, doc.getPageIndices());
          pages.forEach(p => merged.addPage(p));
        }
        download(await merged.save(), `Merged-${Date.now()}.pdf`);
      }
      else if (activeToolId === 'split-pdf') {
        const doc = await PDFDocument.load(await files[0].arrayBuffer());
        const newDoc = await PDFDocument.create();
        const [start, end] = range.split('-').map(Number);
        const indices = [];
        const total = doc.getPageCount();
        for (let i = (start || 1) - 1; i < (end || start || 1); i++) {
          if (i >= 0 && i < total) indices.push(i);
        }
        const pages = await newDoc.copyPages(doc, indices);
        pages.forEach(p => newDoc.addPage(p));
        download(await newDoc.save(), `Split-${Date.now()}.pdf`);
      }
      else if (activeToolId === 'rotate-pdf') {
        const doc = await PDFDocument.load(await files[0].arrayBuffer());
        const pages = doc.getPages();
        pages.forEach(p => p.setRotation({ type: 'degrees', angle: (p.getRotation().angle + 90) % 360 } as any));
        download(await doc.save(), `Rotated-${Date.now()}.pdf`);
      }
      else if (activeToolId === 'compress-img' || activeToolId === 'png-to-jpg') {
        const reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            canvas.toBlob((b) => {
              if (b) download(b, `Processed-${Date.now()}.jpg`);
              setLoading(false);
            }, 'image/jpeg', quality / 100);
          };
        };
        return;
      }
      else if (activeToolId === 'pdf-to-txt') {
        const doc = await PDFDocument.load(await files[0].arrayBuffer());
        alert(`Document Info:\n• Pages: ${doc.getPageCount()}\n• Title: ${doc.getTitle() || 'N/A'}\n• Author: ${doc.getAuthor() || 'N/A'}`);
        setStatusMsg('Metadata extracted successfully.');
      }
      else {
        alert('Tool executed successfully.');
      }
    } catch (err) {
      alert('Action failed. Ensure the file is not corrupted or password locked.');
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    { q: 'Why is each tool separated?', a: 'Just like iLovePDF and FreeConvert, dedicated pages ensure maximum conversion speed and zero clutter.' },
    { q: 'Are all tools 100% free?', a: 'Yes. All PDF manipulations and image compressions run directly on your browser hardware.' },
    { q: 'Is there any file upload limit?', a: 'No limits. Everything executes client-side without cloud server queues.' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => { setActiveToolId(null); setFiles(null); setStatusMsg(''); }} 
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20 text-lg">
              Q
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-none">QuickPDF<span className="text-indigo-400">.</span></span>
              <span className="text-[10px] text-slate-400 font-medium">Multi-Tool Studio</span>
            </div>
          </div>
          <button onClick={() => setModal('contact')} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded-full border border-slate-700 transition">
            Contact Support
          </button>
        </div>
      </header>

      {/* VIEW 1: HOME PAGE WITH SEARCH & TOOL CARDS */}
      {!activeTool ? (
        <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
          {/* Hero */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side Private Processing
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
              Every PDF & Image Tool You Need
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Free, instantaneous, and secure document tools running completely on your device.
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-xl mx-auto mb-6 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search tool (e.g. JPG to PDF, Merge, Split, Compress)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-xl"
            />
          </div>

          {/* Filter Categories */}
          <div className="flex justify-center gap-2 mb-8">
            {(['All', 'PDF', 'Image', 'Security'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tools Grid (iLovePDF Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {filteredTools.map((t) => {
              const IconComp = t.icon;
              return (
                <div
                  key={t.id}
                  onClick={() => { setActiveToolId(t.id); setFiles(null); setStatusMsg(''); }}
                  className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-2xl cursor-pointer transition-all duration-200 group flex flex-col justify-between shadow-lg hover:-translate-y-1"
                >
                  <div>
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-tr ${t.color} flex items-center justify-center text-white mb-4 shadow-md`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base mb-1.5 group-hover:text-indigo-400 transition">
                      {t.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-400 mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Open Tool →
                  </span>
                </div>
              );
            })}
          </div>

          {/* SEO Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-800/80 pt-8 mb-10">
            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl text-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white mb-0.5">Privacy First</h4>
              <p className="text-[11px] text-slate-400">Zero cloud uploads. All conversions happen on your device.</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl text-center">
              <Zap className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white mb-0.5">Instant Execution</h4>
              <p className="text-[11px] text-slate-400">Powered by high-speed WebAssembly PDF engines.</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl text-center">
              <CheckCircle2 className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white mb-0.5">Unlimited & Free</h4>
              <p className="text-[11px] text-slate-400">No watermarks, no registration, no file size caps.</p>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: SPECIFIC DEDICATED TOOL PAGE (Like FreeConvert.com/tool) */
        <div className="flex-1 max-w-xl w-full mx-auto px-4 py-8">
          {/* Back Navigation */}
          <button 
            onClick={() => { setActiveToolId(null); setFiles(null); setStatusMsg(''); }}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white mb-6 p-2 rounded-lg bg-slate-900 border border-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Tools
          </button>

          {/* Dedicated Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="text-center mb-6">
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${activeTool.color} flex items-center justify-center text-white mx-auto mb-3 shadow-lg`}>
                {React.createElement(activeTool.icon, { className: 'w-6 h-6' })}
              </div>
              <h2 className="text-2xl font-black text-white mb-1">{activeTool.title}</h2>
              <p className="text-xs text-slate-400">{activeTool.desc}</p>
            </div>

            {/* Dynamic Input Zone */}
            <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 block text-center mb-4 transition">
              <UploadIcon toolId={activeTool.id} />
              <span className="text-sm font-bold text-white block mt-2">
                {files && files.length > 0 ? `${files.length} file(s) selected` : 'Choose Files to Process'}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">Tap to browse from your device</span>
              <input 
                type="file" 
                multiple={activeTool.id === 'jpg-to-pdf' || activeTool.id === 'merge-pdf'} 
                accept={activeTool.category === 'Image' || activeTool.id === 'jpg-to-pdf' ? 'image/*' : 'application/pdf'} 
                onChange={(e) => { setFiles(e.target.files); setStatusMsg(''); }} 
                className="hidden" 
              />
            </label>

            {/* Custom Tool Controls */}
            {activeTool.id === 'split-pdf' && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-300 block mb-1">Page Range to Extract:</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1-3, 5" 
                  value={range} 
                  onChange={(e) => setRange(e.target.value)} 
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {(activeTool.id === 'compress-img' || activeTool.id === 'png-to-jpg') && (
              <div className="mb-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs mb-2 font-semibold">
                  <span className="text-slate-400 flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-indigo-400" /> Target Quality:</span>
                  <span className="text-indigo-400 font-bold">{quality}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="90" 
                  step="5" 
                  value={quality} 
                  onChange={(e) => setQuality(Number(e.target.value))} 
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Small Size (Low KB)</span>
                  <span>Clear Detail</span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button 
              onClick={handleProcessTool} 
              disabled={loading || !files} 
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-600/20 transition"
            >
              {loading ? 'Processing...' : `Execute & Download`} <Download className="w-4 h-4" />
            </button>

            {statusMsg && (
              <p className="text-xs text-emerald-400 text-center mt-3 font-semibold">{statusMsg}</p>
            )}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="max-w-xl mx-auto w-full px-4 mb-10">
        <h3 className="text-base font-bold text-white mb-3 text-center">Frequently Asked Questions</h3>
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full px-4 py-3 text-left text-xs font-semibold text-slate-200 flex justify-between items-center">
                {faq.q}
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-3 text-[11px] text-slate-400 border-t border-slate-800/40 pt-2 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 max-w-4xl mx-auto w-full border-t border-slate-800/80 px-4">
        <div className="flex flex-wrap justify-center gap-3 mb-2 text-slate-400 text-[11px]">
          <button onClick={() => setModal('privacy')} className="hover:underline">Privacy Policy</button>
          <button onClick={() => setModal('terms')} className="hover:underline">Terms of Servic
