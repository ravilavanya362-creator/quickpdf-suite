'use client';
import React, { useState, useMemo } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Search, ArrowLeft, FileImage, Files, Scissors, Minimize2, RotateCw, Lock, Download, ShieldCheck, Mail, X } from 'lucide-react';

const TOOLS = [
  { id: 'jpg-to-pdf', title: 'JPG to PDF', desc: 'Convert JPG/PNG to PDF', cat: 'PDF', icon: FileImage },
  { id: 'merge-pdf', title: 'Merge PDF', desc: 'Combine multiple PDF files', cat: 'PDF', icon: Files },
  { id: 'split-pdf', title: 'Split PDF', desc: 'Extract pages from PDF', cat: 'PDF', icon: Scissors },
  { id: 'compress-img', title: 'Compress Image', desc: 'Reduce image file size', cat: 'Image', icon: Minimize2 },
  { id: 'rotate-pdf', title: 'Rotate PDF', desc: 'Rotate PDF pages clockwise', cat: 'PDF', icon: RotateCw },
];

export default function Home() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [active, setActive] = useState<string | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [range, setRange] = useState('');
  const [quality, setQuality] = useState(65);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<string | null>(null);

  const filtered = useMemo(() => TOOLS.filter(t => 
    (t.title.toLowerCase().includes(q.toLowerCase()) || t.desc.toLowerCase().includes(q.toLowerCase())) &&
    (cat === 'All' || t.cat === cat)
  ), [q, cat]);

  const activeTool = TOOLS.find(t => t.id === active);

  const download = (bytes: Uint8Array | Blob, name: string) => {
    const blob = bytes instanceof Blob ? bytes : new Blob([bytes], { type: 'application/pdf' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  };

  const handleRun = async () => {
    if (!files?.length) return alert('Select files first');
    setLoading(true);
    try {
      if (active === 'jpg-to-pdf') {
        const pdf = await PDFDocument.create();
        for (let i = 0; i < files.length; i++) {
          const b = await files[i].arrayBuffer();
          const img = files[i].type.includes('png') ? await pdf.embedPng(b) : await pdf.embedJpg(b);
          const page = pdf.addPage([img.width, img.height]);
          page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        }
        download(await pdf.save(), 'converted.pdf');
      } else if (active === 'merge-pdf') {
        if (files.length < 2) return alert('Select 2+ files');
        const merged = await PDFDocument.create();
        for (let i = 0; i < files.length; i++) {
          const doc = await PDFDocument.load(await files[i].arrayBuffer());
          const pages = await merged.copyPages(doc, doc.getPageIndices());
          pages.forEach(p => merged.addPage(p));
        }
        download(await merged.save(), 'merged.pdf');
      } else if (active === 'split-pdf') {
        const doc = await PDFDocument.load(await files[0].arrayBuffer());
        const newDoc = await PDFDocument.create();
        const [s, e] = range.split('-').map(Number);
        const idx = [];
        for (let i = (s || 1) - 1; i < (e || s || 1); i++) { if (i < doc.getPageCount()) idx.push(i); }
        const pages = await newDoc.copyPages(doc, idx);
        pages.forEach(p => newDoc.addPage(p));
        download(await newDoc.save(), 'split.pdf');
      } else if (active === 'rotate-pdf') {
        const doc = await PDFDocument.load(await files[0].arrayBuffer());
        doc.getPages().forEach(p => p.setRotation({ type: 'degrees', angle: (p.getRotation().angle + 90) % 360 } as any));
        download(await doc.save(), 'rotated.pdf');
      } else if (active === 'compress-img') {
        const reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            canvas.getContext('2d')?.drawImage(img, 0, 0);
            canvas.toBlob(b => { if (b) download(b, 'compressed.jpg'); setLoading(false); }, 'image/jpeg', quality / 100);
          };
        };
        return;
      }
    } catch {
      alert('Error processing file.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans p-4">
      {/* Header */}
      <header className="flex justify-between items-center py-2 border-b border-slate-800 mb-6 max-w-4xl mx-auto w-full">
        <h1 onClick={() => { setActive(null); setFiles(null); }} className="text-xl font-bold cursor-pointer text-indigo-400">QuickPDF<span className="text-white">.</span></h1>
        <button onClick={() => setModal('contact')} className="text-xs bg-slate-800 px-3 py-1.5 rounded-full">Contact</button>
      </header>

      {/* Catalog / Search View */}
      {!activeTool ? (
        <main className="flex-1 max-w-4xl mx-auto w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold mb-2">Fast, Private PDF & Image Tools</h2>
            <p className="text-xs text-slate-400">Search and open any specific tool instantly.</p>
          </div>

          <div className="relative mb-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Search tool (e.g. JPG to PDF, Merge, Split)..." 
              value={q} 
              onChange={e => setQ(e.target.value)} 
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500" 
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {filtered.map(t => {
              const Icon = t.icon;
              return (
                <div key={t.id} onClick={() => { setActive(t.id); setFiles(null); }} className="bg-slate-900 border border-slate-800 p-4 rounded-xl cursor-pointer hover:border-indigo-500">
                  <Icon className="w-6 h-6 text-indigo-400 mb-2" />
                  <h3 className="text-sm font-bold">{t.title}</h3>
                  <p className="text-[10px] text-slate-400 mt-1">{t.desc}</p>
                </div>
              );
            })}
          </div>
        </main>
      ) : (
        /* Dedicated Tool View */
        <main className="flex-1 max-w-md mx-auto w-full">
          <button onClick={() => { setActive(null); setFiles(null); }} className="flex items-center gap-1.5 text-xs text-slate-400 mb-4 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tools
          </button>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center">
            <h2 className="text-xl font-bold mb-1">{activeTool.title}</h2>
            <p className="text-xs text-slate-400 mb-4">{activeTool.desc}</p>

            <label className="border-2 border-dashed border-slate-700 p-6 rounded-xl block cursor-pointer mb-4 bg-slate-950/40">
              <span className="text-xs font-bold text-indigo-400">{files?.length ? `${files.length} file(s) selected` : 'Select Files'}</span>
              <input type="file" multiple={active === 'jpg-to-pdf' || active === 'merge-pdf'} accept={active === 'compress-img' || active === 'jpg-to-pdf' ? 'image/*' : 'application/pdf'} onChange={e => setFiles(e.target.files)} className="hidden" />
            </label>

            {active === 'split-pdf' && (
              <input type="text" placeholder="Page range e.g. 1-2" value={range} onChange={e => setRange(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs mb-4" />
            )}

            {active === 'compress-img' && (
              <div className="mb-4 text-left bg-slate-950 p-3 rounded-lg">
                <div className="flex justify-between text-xs mb-1"><span>Quality:</span><span className="text-indigo-400">{quality}%</span></div>
                <input type="range" min="10" max="90" step="5" value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full accent-indigo-500 cursor-pointer" />
              </div>
            )}

            <button onClick={handleRun} disabled={loading || !files} className="w-full py-2.5 bg-indigo-600 font-bold rounded-xl text-xs flex items-center justify-center gap-2">
              {loading ? 'Processing...' : 'Download Result'} <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="py-6 text-center text-[10px] text-slate-500 max-w-md mx-auto w-full border-t border-slate-800">
        <div className="flex justify-center gap-3 mb-2 text-slate-400">
          <button onClick={() => setModal('privacy')} className="hover:underline">Privacy</button>
          <button onClick={() => setModal('terms')} className="hover:underline">Terms</button>
          <button onClick={() => setModal('about')} className="hover:underline">About</button>
        </div>
        <p>© 2026 QuickPDF. 100% Client-Side Processing.</p>
      </footer>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-sm w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm capitalize">{modal}</h3>
              <button onClick={() => setModal(null)}><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-300">
              {modal === 'privacy' && 'Zero Uploads: All files run in-browser locally on your hardware.'}
              {modal === 'terms' && 'Free to use for unlimited personal and commercial needs.'}
              {modal === 'about' && 'A modern, high-speed PDF toolkit inspired by iLovePDF and FreeConvert.'}
              {modal === 'contact' && 'Support: support@quickpdf.local'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

