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
