'use client';

import React, { useState, useMemo } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  Search, ArrowLeft, ChevronDown, ChevronUp, Settings, 
  ShieldCheck, Download, FileText, Sparkles, X, Mail 
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  title: string;
  desc: string;
  cat: string;
  targetExt: string;
}

const ALL_TOOLS: Tool[] = [
  { id: 'jpg-to-pdf', name: 'JPG to PDF', title: 'JPG to PDF Converter', desc: 'Convert image files to PDF for free.', cat: 'PDF', targetExt: 'PDF' },
  { id: 'merge-pdf', name: 'Merge PDF', title: 'PDF Merger Tool', desc: 'Combine multiple PDF documents into a single file.', cat: 'PDF', targetExt: 'PDF' },
  { id: 'split-pdf', name: 'Split PDF', title: 'PDF Splitter', desc: 'Extract pages from PDF documents instantly.', cat: 'PDF', targetExt: 'PDF' },
  { id: 'compress-image', name: 'Image Compressor', title: 'Image Compressor', desc: 'Compress JPG and PNG images without quality loss.', cat: 'Image', targetExt: 'JPG' },
  { id: 'rotate-pdf', name: 'Rotate PDF', title: 'Rotate PDF Document', desc: 'Rotate PDF pages clockwise permanently.', cat: 'PDF', targetExt: 'PDF' },
  { id: 'png-to-jpg', name: 'PNG to JPG', title: 'PNG to JPG Converter', desc: 'Convert PNG images to JPG format.', cat: 'Image', targetExt: 'JPG' }
];

export default function FreeConvertStyleSuite() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [quality, setQuality] = useState(75);
  const [pageRange, setPageRange] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<string | null>(null);

  const currentTool = ALL_TOOLS.find((t) => t.id === activeToolId);

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const downloadFile = (bytes: Uint8Array | Blob, fileName: string) => {
    const blob = bytes instanceof Blob ? bytes : new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExecute = async () => {
    if (!files || files.length === 0) return alert('Please upload files first.');
    setLoading(true);
    try {
      if (activeToolId === 'jpg-to-pdf') {
        const pdf = await PDFDocument.create();
        for (let i = 0; i < files.length; i++) {
          const b = await files[i].arrayBuffer();
          const img = files[i].type.includes('png') ? await pdf.embedPng(b) : await pdf.embedJpg(b);
          const page = pdf.addPage([img.width, img.height]);
          page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        }
        downloadFile(await pdf.save(), `Converted-${Date.now()}.pdf`);
      } else if (activeToolId === 'merge-pdf') {
        if (files.length < 2) return alert('Select at least 2 PDF files.');
        const merged = await PDFDocument.create();
        for (let i = 0; i < files.length; i++) {
          const doc = await PDFDocument.load(await files[i].arrayBuffer());
          const pages = await merged.copyPages(doc, doc.getPageIndices());
          pages.forEach((p) => merged.addPage(p));
        }
        downloadFile(await merged.save(), `Merged-${Date.now()}.pdf`);
      } else if (activeToolId === 'split-pdf') {
        const doc = await PDFDocument.load(await files[0].arrayBuffer());
        const newDoc = await PDFDocument.create();
        const [start, end] = pageRange.split('-').map(Number);
        const idx = [];
        const count = doc.getPageCount();
        for (let i = (start || 1) - 1; i < (end || start || 1); i++) {
          if (i >= 0 && i < count) idx.push(i);
        }
        const pages = await newDoc.copyPages(doc, idx);
        pages.forEach((p) => newDoc.addPage(p));
        downloadFile(await newDoc.save(), `Split-${Date.now()}.pdf`);
      } else if (activeToolId === 'compress-image' || activeToolId === 'png-to-jpg') {
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
                if (blob) downloadFile(blob, `Compressed-${Date.now()}.jpg`);
                setLoading(false);
              },
              'image/jpeg',
              quality / 100
            );
          };
        };
        return;
      } else if (activeToolId === 'rotate-pdf') {
        const doc = await PDFDocument.load(await files[0].arrayBuffer());
        doc.getPages().forEach((p) => p.setRotation({ type: 'degrees', angle: (p.getRotation().angle + 90) % 360 } as any));
        downloadFile(await doc.save(), `Rotated-${Date.now()}.pdf`);
      }
    } catch {
      alert('Operation failed.');
    }
    setLoading(false);
  };
    return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div onClick={() => { setActiveToolId(null); setFiles(null); }} className="flex items-center gap-2 cursor-pointer">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm">⇄</div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">FreeConvert<span className="text-blue-600">.pro</span></span>
          </div>
          <button onClick={() => setModal('contact')} className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md font-semibold">Contact</button>
        </div>
      </header>

      {!currentTool ? (
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">Free Online File Converter</h1>
            <p className="text-xs sm:text-sm text-slate-500">Convert PDFs and images privately on your browser.</p>
          </div>
          <div className="relative max-w-lg mx-auto mb-8">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input type="text" placeholder="Search tools..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 shadow-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-10">
            {filteredTools.map((tool) => (
              <div key={tool.id} onClick={() => { setActiveToolId(tool.id); setFiles(null); }} className="bg-white border border-slate-200 p-4 rounded-xl hover:border-blue-500 cursor-pointer shadow-sm">
                <h3 className="font-bold text-sm text-slate-900 mb-1">{tool.name}</h3>
                <p className="text-[11px] text-slate-500">{tool.desc}</p>
                <span className="text-[11px] font-bold text-blue-600 mt-3 block">Open Converter →</span>
              </div>
            ))}
          </div>
        </main>
      ) : (
        <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6">
          <button onClick={() => { setActiveToolId(null); setFiles(null); }} className="inline-flex items-center gap-1.5 text-xs text-slate-600 mb-4 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm font-medium">
            <ArrowLeft className="w-3.5 h-3.5" /> All Converters
          </button>
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">{currentTool.title}</h1>
            <p className="text-xs text-slate-500">{currentTool.desc}</p>
          </div>
          <div className="bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-6 text-center shadow-sm mb-6">
            <label className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md cursor-pointer text-sm">
              <span>Choose Files</span>
              <ChevronDown className="w-4 h-4 opacity-80" />
              <input type="file" multiple={currentTool.id === 'jpg-to-pdf' || currentTool.id === 'merge-pdf'} accept={currentTool.cat === 'Image' || currentTool.id === 'jpg-to-pdf' ? 'image/*' : 'application/pdf'} onChange={(e) => setFiles(e.target.files)} className="hidden" />
            </label>
            <p className="text-[11px] text-slate-400 mt-3">Max file size: Unlimited (Client-side)</p>
            {files && files.length > 0 && <div className="mt-3 p-2 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg">✓ {files.length} file(s) selected</div>}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-6">
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-2"><Settings className="w-4 h-4 text-slate-500" /> Advanced settings (optional)</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showAdvanced && (
              <div className="p-4 space-y-4 text-xs">
                {currentTool.id === 'split-pdf' && (
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Page Range:</label>
                    <input type="text" placeholder="e.g. 1-3, 5" value={pageRange} onChange={(e) => setPageRange(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-xs" />
                  </div>
                )}
                {(currentTool.id === 'compress-image' || currentTool.id === 'png-to-jpg') && (
                  <div>
                    <div className="flex justify-between font-semibold mb-1"><span>Compression Quality:</span><span className="text-blue-600 font-bold">{quality}%</span></div>
                    <input type="range" min="10" max="95" step="5" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
                  </div>
                )}
              </div>
            )}
          </div>
          <button onClick={handleExecute} disabled={loading || !files} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-md mb-10">
            {loading ? 'Converting...' : 'Convert Now'} <Download className="w-4 h-4" />
          </button>
        </main>
      )}

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 max-w-4xl mx-auto w-full px-4 mt-auto">
        <div className="flex justify-center gap-4 mb-2 text-slate-600 text-[11px]">
          <button onClick={() => setModal('privacy')} className="hover:underline">Privacy</button>
          <button onClick={() => setModal('terms')} className="hover:underline">Terms</button>
          <button onClick={() => setModal('contact')} className="hover:underline">Contact</button>
        </div>
        <p className="text-[10px] text-slate-400">© 2026 FreeConvert Suite. Unlimited Client-Side Tools.</p>
      </footer>

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl">
            <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900 capitalize">{modal}</h3>
              <button onClick={() => setModal(null)}><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {modal === 'privacy' && '100% Client-Side: Files never touch remote servers.'}
              {modal === 'terms' && 'Free for unlimited conversions.'}
              {modal === 'contact' && 'Support: support@freeconvert.local'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
