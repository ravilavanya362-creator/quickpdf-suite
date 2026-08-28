'use client';
import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function Home() {
  const [tab, setTab] = useState<'jpg' | 'merge' | 'split' | 'compress'>('jpg');
  const [files, setFiles] = useState<FileList | null>(null);
  const [range, setRange] = useState('');
  const [quality, setQuality] = useState(60);
  const [loading, setLoading] = useState(false);

  const download = (bytes: Uint8Array, name: string) => {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  };

  const handleJpgToPdf = async () => {
    if (!files?.length) return;
    setLoading(true);
    const pdf = await PDFDocument.create();
    for (let i = 0; i < files.length; i++) {
      const bytes = await files[i].arrayBuffer();
      const img = files[i].type.includes('png') ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
      const page = pdf.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
    download(await pdf.save(), 'images.pdf');
    setLoading(false);
  };

  const handleMerge = async () => {
    if (!files || files.length < 2) return alert('Select 2+ PDFs');
    setLoading(true);
    const merged = await PDFDocument.create();
    for (let i = 0; i < files.length; i++) {
      const doc = await PDFDocument.load(await files[i].arrayBuffer());
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }
    download(await merged.save(), 'merged.pdf');
    setLoading(false);
  };

  const handleSplit = async () => {
    if (!files?.length) return;
    setLoading(true);
    const doc = await PDFDocument.load(await files[0].arrayBuffer());
    const newDoc = await PDFDocument.create();
    const [start, end] = range.split('-').map(Number);
    const indices = [];
    for (let i = (start || 1) - 1; i < (end || start || 1); i++) {
      if (i < doc.getPageCount()) indices.push(i);
    }
    const pages = await newDoc.copyPages(doc, indices);
    pages.forEach(p => newDoc.addPage(p));
    download(await newDoc.save(), 'split.pdf');
    setLoading(false);
  };

  const handleCompress = () => {
    if (!files?.length) return;
    setLoading(true);
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
        canvas.toBlob((blob) => {
          if (!blob) return;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `compressed-${quality}pct.jpg`;
          a.click();
          setLoading(false);
        }, 'image/jpeg', quality / 100);
      };
    };
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 flex flex-col items-center max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-indigo-400">QuickPDF Suite</h1>
      
      {/* 2x2 Tabs */}
      <div className="grid grid-cols-2 gap-2 w-full mb-6">
        <button onClick={() => setTab('jpg')} className={`p-2 rounded font-bold text-xs ${tab === 'jpg' ? 'bg-indigo-600' : 'bg-slate-800'}`}>JPG to PDF</button>
        <button onClick={() => setTab('merge')} className={`p-2 rounded font-bold text-xs ${tab === 'merge' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Merge PDF</button>
        <button onClick={() => setTab('split')} className={`p-2 rounded font-bold text-xs ${tab === 'split' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Split PDF</button>
        <button onClick={() => setTab('compress')} className={`p-2 rounded font-bold text-xs ${tab === 'compress' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Compress</button>
      </div>

      <div className="w-full bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
        {tab === 'jpg' && <>
          <input type="file" multiple accept="image/*" onChange={e => setFiles(e.target.files)} className="mb-4 text-xs w-full" />
          <button onClick={handleJpgToPdf} disabled={loading} className="w-full py-2 bg-indigo-600 rounded font-bold text-xs">{loading ? 'Processing...' : 'Convert to PDF'}</button>
        </>}
        
        {tab === 'merge' && <>
          <input type="file" multiple accept="application/pdf" onChange={e => setFiles(e.target.files)} className="mb-4 text-xs w-full" />
          <button onClick={handleMerge} disabled={loading} className="w-full py-2 bg-indigo-600 rounded font-bold text-xs">{loading ? 'Merging...' : 'Merge PDFs'}</button>
        </>}
        
        {tab === 'split' && <>
          <input type="file" accept="application/pdf" onChange={e => setFiles(e.target.files)} className="mb-2 text-xs w-full" />
          <input type="text" placeholder="e.g. 1-2" value={range} onChange={e => setRange(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-700 rounded mb-4 text-xs" />
          <button onClick={handleSplit} disabled={loading} className="w-full py-2 bg-indigo-600 rounded font-bold text-xs">{loading ? 'Splitting...' : 'Extract Pages'}</button>
        </>}
        
        {tab === 'compress' && <>
          <input type="file" accept="image/*" onChange={e => setFiles(e.target.files)} className="mb-4 text-xs w-full" />
          
          {/* Quality Compression Scale */}
          <div className="mb-4 text-left bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Compression Quality:</span>
              <span className="text-indigo-400 font-bold">{quality}%</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="90" 
              step="5"
              value={quality} 
              onChange={e => setQuality(Number(e.target.value))} 
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>High Compression (Low KB)</span>
              <span>High Quality</span>
            </div>
          </div>

          <button onClick={handleCompress} disabled={loading} className="w-full py-2 bg-indigo-600 rounded font-bold text-xs">
            {loading ? 'Compressing...' : `Compress Image (${quality}%)`}
          </button>
        </>}
      </div>
      
      <p className="text-[10px] text-slate-500 mt-6">© 2026 QuickPDF. 100% Client-Side Secure.</p>
    </main>
  );
}
'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  FileImage, 
  Files, 
  Scissors, 
  Minimize2, 
  ShieldCheck, 
  Zap, 
  Download, 
  Trash2, 
  ChevronDown, 
  X, 
  Mail, 
  CheckCircle2, 
  Sliders 
} from 'lucide-react';

export default function QuickPDFSuite() {
  const [tab, setTab] = useState<'jpg' | 'merge' | 'split' | 'compress'>('jpg');
  const [files, setFiles] = useState<FileList | null>(null);
  const [range, setRange] = useState('');
  const [quality, setQuality] = useState(65);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const download = (bytes: Uint8Array | Blob, name: string) => {
    const blob = bytes instanceof Blob ? bytes : new Blob([bytes], { type: 'application/pdf' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  };

  const handleJpgToPdf = async () => {
    if (!files?.length) return;
    setLoading(true);
    try {
      const pdf = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        const bytes = await files[i].arrayBuffer();
        const img = files[i].type.includes('png') ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
        const page = pdf.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      download(await pdf.save(), `QuickPDF-Images-${Date.now()}.pdf`);
    } catch {
      alert('Conversion failed. Check image format.');
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async () => {
    if (!files || files.length < 2) return alert('Please select at least 2 PDF files');
    setLoading(true);
    try {
      const merged = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        const doc = await PDFDocument.load(await files[i].arrayBuffer());
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      download(await merged.save(), `Merged-Document-${Date.now()}.pdf`);
    } catch {
      alert('Merge failed. Ensure files are valid PDFs.');
    } finally {
      setLoading(false);
    }
  };

  const handleSplit = async () => {
    if (!files?.length) return;
    setLoading(true);
    try {
      const doc = await PDFDocument.load(await files[0].arrayBuffer());
      const newDoc = await PDFDocument.create();
      const [start, end] = range.split('-').map(Number);
      const indices: number[] = [];
      const total = doc.getPageCount();
      for (let i = (start || 1) - 1; i < (end || start || 1); i++) {
        if (i >= 0 && i < total) indices.push(i);
      }
      const pages = await newDoc.copyPages(doc, indices);
      pages.forEach((p) => newDoc.addPage(p));
      download(await newDoc.save(), `Split-Pages-${Date.now()}.pdf`);
    } catch {
      alert('Failed to split PDF. Check page numbers.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompress = () => {
    if (!files?.length) return;
    setLoading(true);
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
        canvas.toBlob(
          (blob) => {
            if (blob) download(blob, `Compressed-${quality}pct-${Date.now()}.jpg`);
            setLoading(false);
          },
          'image/jpeg',
          quality / 100
        );
      };
    };
  };

  const faqs = [
    { q: 'Is my data secure?', a: 'Yes, 100%. All processing happens locally on your browser. Files never touch any cloud or server.' },
    { q: 'Are there any usage limits?', a: 'No limits. You can convert, merge, split, and compress unlimited files for free.' },
    { q: 'How does image compression work?', a: 'The built-in quality slider uses browser canvas rendering to optimize file size without server lag.' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20 text-lg">
              Q
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-none">QuickPDF<span className="text-indigo-400">.</span></span>
              <span className="text-[10px] text-slate-400 font-medium">Pro Utility Suite</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModal('contact')} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded-full border border-slate-700 transition">
              Contact
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-8 pb-4 px-4 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side Privacy
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Professional PDF Toolkit
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          High-performance in-browser tools to convert, merge, extract, and compress files instantly.
        </p>
      </section>

      {/* Tool Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pb-10">
        {/* 2x2 Responsive Buttons */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl mb-6 shadow-inner">
          <button onClick={() => setTab('jpg')} className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${tab === 'jpg' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
            <FileImage className="w-4 h-4" /> JPG to PDF
          </button>
          <button onClick={() => setTab('merge')} className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${tab === 'merge' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
            <Files className="w-4 h-4" /> Merge PDF
          </button>
          <button onClick={() => setTab('split')} className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${tab === 'split' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
            <Scissors className="w-4 h-4" /> Split PDF
          </button>
          <button onClick={() => setTab('compress')} className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${tab === 'compress' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
            <Minimize2 className="w-4 h-4" /> Compress
          </button>
        </div>

        {/* Dynamic Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-sm">
          {tab === 'jpg' && (
            <div>
              <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 block text-center mb-4 transition">
                <FileImage className="w-8 h-8 text-indigo-400 mb-2 mx-auto" />
                <span className="text-sm font-bold text-white block">Choose Images</span>
                <span className="text-[11px] text-slate-500 mt-0.5">JPG, PNG (Multi-select enabled)</span>
                <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} className="hidden" />
              </label>
              {files && files.length > 0 && <p className="text-xs text-indigo-400 font-semibold mb-3 text-center">{files.length} images selected</p>}
              <button onClick={handleJpgToPdf} disabled={loading || !files} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-indigo-600/20 transition">
                {loading ? 'Processing...' : 'Convert & Download PDF'} <Download className="w-4 h-4" />
              </button>
            </div>
          )}

          {tab === 'merge' && (
            <div>
              <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 block text-center mb-4 transition">
                <Files className="w-8 h-8 text-indigo-400 mb-2 mx-auto" />
                <span className="text-sm font-bold text-white block">Select Multiple PDFs</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Combine 2 or more files</span>
                <input type="file" multiple accept="application/pdf" onChange={(e) => setFiles(e.target.files)} className="hidden" />
              </label>
              {files && files.length > 0 && <p className="text-xs text-indigo-400 font-semibold mb-3 text-center">{files.length} files queued</p>}
              <button onClick={handleMerge} disabled={loading || !files} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-indigo-600/20 transition">
                {loading ? 'Merging Files...' : 'Merge & Download PDF'} <Download className="w-4 h-4" />
              </button>
            </div>
          )}

          {tab === 'split' && (
            <div>
              <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 block text-center mb-3 transition">
                <Scissors className="w-7 h-7 text-indigo-400 mb-1.5 mx-auto" />
                <span className="text-sm font-bold text-white block">Upload PDF</span>
                <input type="file" accept="application/pdf" onChange={(e) => setFiles(e.target.files)} className="hidden" />
              </label>
              {files && files[0] && <p className="text-xs text-indigo-400 mb-3 truncate text-center">{files[0].name}</p>}
              <div className="mb-4">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Page Range to Extract:</label>
                <input type="text" placeholder="e.g. 1-3, 5" value={range} onChange={(e) => setRange(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
              </div>
              <button onClick={handleSplit} disabled={loading || !files} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-indigo-600/20 transition">
                {loading ? 'Extracting Pages...' : 'Extract & Download'} <Download className="w-4 h-4" />
              </button>
            </div>
          )}

          {tab === 'compress' && (
            <div>
              <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 block text-center mb-3 transition">
                <Minimize2 className="w-7 h-7 text-indigo-400 mb-1.5 mx-auto" />
                <span className="text-sm font-bold text-white block">Select Image to Compress</span>
                <input type="file" accept="image/*" onChange={(e) => setFiles(e.target.files)} className="hidden" />
              </label>
              {files && files[0] && <p className="text-xs text-indigo-400 mb-3 truncate text-center">{files[0].name}</p>}
              
              <div className="mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-slate-400 flex items-center gap-1"><Sliders className="w-3 h-3 text-indigo-400" /> Quality Level:</span>
                  <span className="text-indigo-400">{quality}%</span>
                </div>
                <input type="range" min="10" max="90" step="5" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-indigo-500 cursor-pointer" />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Small File (Low KB)</span>
                  <span>High Clarity</span>
                </div>
              </div>

              <button onClick={handleCompress} disabled={loading || !files} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-indigo-600/20 transition">
                {loading ? 'Compressing...' : `Compress & Download (${quality}%)`} <Download className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-3 gap-2 mt-6">
          <div className="bg-slate-900/40 border border-slate-800/80 p-3 rounded-xl text-center">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-white block">Client-Side</span>
            <span className="text-[9px] text-slate-500">Zero file uploads</span>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 p-3 rounded-xl text-center">
            <Zap className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-white block">Fast Build</span>
            <span className="text-[9px] text-slate-500">Instant generation</span>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 p-3 rounded-xl text-center">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-white block">Unlimited</span>
            <span className="text-[9px] text-slate-500">Free forever</span>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="mt-8 border-t border-slate-800/80 pt-6">
          <h2 className="text-base font-bold text-white mb-3 text-center">Frequently Asked Questions</h2>
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
      </main>

      {/* Footer & Legal Modals */}
      <footer className="py-6 text-center text-xs text-slate-500 max-w-md mx-auto w-full border-t border-slate-800/80">
        <div className="flex flex-wrap justify-center gap-3 mb-2 text-slate-400 text-[11px]">
          <button onClick={() => setModal('privacy')} className="hover:underline">Privacy Policy</button>
          <button onClick={() => setModal('terms')} className="hover:underline">Terms of Service</button>
          <button onClick={() => setModal('about')} className="hover:underline">About Us</button>
          <button onClick={() => setModal('disclaimer')} className="hover:underline">Disclaimer</button>
          <button onClick={() => setModal('contact')} className="hover:underline">Contact</button>
        </div>
        <p className="text-[10px] text-slate-600">© 2026 QuickPDF Suite. All rights reserved.</p>
      </footer>

      {/* Global Policy Modals */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white capitalize text-sm">{modal.replace('-', ' ')}</h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              {modal === 'privacy' && <p><strong>Zero Data Retention:</strong> All file conversions, page splits, and compressions run purely within your client browser. No file or personal metadata is uploaded or stored on external servers.</p>}
              {modal === 'terms' && <p><strong>Terms:</strong> QuickPDF Suite provides free, unlimited document utilities. You retain full ownership of all processed assets.</p>}
              {modal === 'about' && <p><strong>About Us:</strong> QuickPDF is an open-source, client-side toolkit designed for lightning-fast conversions without account signups or quotas.</p>}
              {modal === 'disclaimer' && <p><strong>Disclaimer:</strong> This tool operates client-side as-is without cloud backups. Always keep original copies of critical documents.</p>}
              {modal === 'contact' && (
                <div>
                  <p className="mb-2">For suggestions, bug reports, and feedback:</p>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-indigo-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> support@quickpdf.local
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

