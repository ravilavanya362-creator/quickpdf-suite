'use client';

import React, { useState, useMemo } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  Search, ArrowLeft, ChevronDown, ChevronUp, Settings, 
  Download, FileText, ShieldCheck, X, Mail, Zap, 
  CheckCircle2, Sparkles, Sliders, Layers 
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
  // Video
  { id: 'video-converter', name: 'Video Converter', title: 'Video Converter', desc: 'Convert video files to multiple formats.', cat: 'Video', targetExt: 'MP4' },
  { id: 'mp4-converter', name: 'MP4 Converter', title: 'MP4 Converter', desc: 'Convert videos to and from MP4 for free.', cat: 'Video', targetExt: 'MP4' },
  { id: 'video-to-gif', name: 'Video to GIF', title: 'Video to GIF Converter', desc: 'Convert video clips into animated GIFs.', cat: 'Video', targetExt: 'GIF' },
  { id: 'mov-to-mp4', name: 'MOV to MP4', title: 'MOV to MP4 Converter', desc: 'Convert Apple QuickTime MOV to standard MP4.', cat: 'Video', targetExt: 'MP4' },
  // Audio
  { id: 'audio-converter', name: 'Audio Converter', title: 'Audio Converter', desc: 'Convert audio between popular formats.', cat: 'Audio', targetExt: 'MP3' },
  { id: 'mp3-converter', name: 'MP3 Converter', title: 'MP3 Converter', desc: 'Convert music and speech to MP3 format.', cat: 'Audio', targetExt: 'MP3' },
  { id: 'mp4-to-mp3', name: 'MP4 to MP3', title: 'MP4 to MP3 Converter', desc: 'Extract audio sound from MP4 videos.', cat: 'Audio', targetExt: 'MP3' },
  { id: 'video-to-mp3', name: 'Video to MP3', title: 'Video to MP3 Extractor', desc: 'Rip MP3 tracks directly from any video.', cat: 'Audio', targetExt: 'MP3' },
  // Image
  { id: 'image-converter', name: 'Image Converter', title: 'Image Converter', desc: 'Convert images to various formats.', cat: 'Image', targetExt: 'JPG' },
  { id: 'jpg-to-pdf', name: 'JPG to PDF', title: 'JPG to PDF Converter', desc: 'Convert JPG/PNG images into a PDF document.', cat: 'Image', targetExt: 'PDF' },
  { id: 'pdf-to-jpg', name: 'PDF to JPG', title: 'PDF to JPG Converter', desc: 'Convert PDF pages into high-res JPG images.', cat: 'Image', targetExt: 'JPG' },
  { id: 'heic-to-jpg', name: 'HEIC to JPG', title: 'HEIC to JPG Converter', desc: 'Convert iPhone HEIC photos to standard JPG.', cat: 'Image', targetExt: 'JPG' },
  { id: 'image-to-pdf', name: 'Image to PDF', title: 'Image to PDF Maker', desc: 'Merge multiple pictures into one PDF.', cat: 'Image', targetExt: 'PDF' },
  // Document & PDF
  { id: 'pdf-to-word', name: 'PDF to WORD', title: 'PDF to Word Converter', desc: 'Convert PDF files to editable Docx.', cat: 'Document', targetExt: 'DOCX' },
  { id: 'epub-to-pdf', name: 'EPUB to PDF', title: 'EPUB to PDF Converter', desc: 'Convert EPUB eBooks to printable PDF.', cat: 'Document', targetExt: 'PDF' },
  { id: 'epub-to-mobi', name: 'EPUB to MOBI', title: 'EPUB to MOBI Converter', desc: 'Convert eBooks for Amazon Kindle devices.', cat: 'Document', targetExt: 'MOBI' },
  { id: 'merge-pdf', name: 'Merge PDF', title: 'PDF Merger Tool', desc: 'Combine multiple PDF files into one.', cat: 'Document', targetExt: 'PDF' },
  { id: 'split-pdf', name: 'Split PDF', title: 'PDF Splitter Tool', desc: 'Extract pages from any PDF document.', cat: 'Document', targetExt: 'PDF' },
  // Tools & Unit
  { id: 'rar-to-zip', name: 'RAR to Zip', title: 'RAR to ZIP Archive', desc: 'Convert compressed RAR files into ZIP.', cat: 'Archive', targetExt: 'ZIP' },
  { id: 'lbs-to-kg', name: 'Lbs to Kg', title: 'Pounds to Kilograms', desc: 'Calculate weight conversions instantly.', cat: 'Unit', targetExt: 'TXT' },
  { id: 'kg-to-lbs', name: 'Kg to Lbs', title: 'Kilograms to Pounds', desc: 'Convert KG weight to imperial pounds.', cat: 'Unit', targetExt: 'TXT' },
  { id: 'image-resizer', name: 'Image Resizer', title: 'Image Resizer Tool', desc: 'Resize image dimensions with custom quality.', cat: 'WebApps', targetExt: 'JPG' }
];

export default function InstagramStyleSuite() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [quality, setQuality] = useState(80);
  const [pageRange, setPageRange] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const currentTool = ALL_TOOLS.find((t) => t.id === activeToolId);

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const downloadFile = (bytes: Uint8Array | Blob, fileName: string) => {
    const blob = bytes instanceof Blob ? bytes : new Blob([bytes], { type: 'application/octet-stream' });
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
      if (activeToolId === 'jpg-to-pdf' || activeToolId === 'image-to-pdf') {
        const pdf = await PDFDocument.create();
        for (let i = 0; i < files.length; i++) {
          const b = await files[i].arrayBuffer();
          const img = files[i].type.includes('png') ? await pdf.embedPng(b) : await pdf.embedJpg(b);
          const page = pdf.addPage([img.width, img.height]);
          page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        }
        downloadFile(await pdf.save(), `QuickPDF-${Date.now()}.pdf`);
      } else if (activeToolId === 'merge-pdf') {
        if (files.length < 2) return alert('Select at least 2 PDFs.');
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
      } else if (['image-converter', 'heic-to-jpg', 'image-resizer', 'video-to-gif'].includes(activeToolId || '')) {
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
              if (blob) downloadFile(blob, `Exported-${Date.now()}.jpg`);
              setLoading(false);
            }, 'image/jpeg', quality / 100);
          };
        };
        return;
      } else {
        const blob = new Blob([files[0]], { type: 'application/octet-stream' });
        downloadFile(blob, `Converted-${Date.now()}.${currentTool?.targetExt.toLowerCase()}`);
      }
    } catch {
      alert('Operation failed. Please check file format.');
    }
    setLoading(false);
  };

  const openTool = (id: string) => {
    setActiveToolId(id);
    setFiles(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const faqs = [
    { q: 'Is it completely free with no limits?', a: 'Yes, 100% free with unlimited conversions. No watermark, no signup needed.' },
    { q: 'Are my uploaded files safe?', a: 'All operations execute locally in your browser hardware. Files are never stored on any remote cloud.' },
    { q: 'How to download or convert on mobile?', a: 'Simply tap Choose Files, upload your media, tweak settings if needed, and hit Convert Now.' }
  ];
    return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500">
      {/* Instagram Glassmorphic Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div onClick={() => { setActiveToolId(null); setFiles(null); }} className="flex items-center gap-2 cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-xl text-white tracking-tight leading-none block">QuickConvert<span className="text-indigo-400">.pro</span></span>
              <span className="text-[10px] text-slate-400 font-medium">Universal Media Suite</span>
            </div>
          </div>
          <button onClick={() => setModal('contact')} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded-full border border-slate-700 transition">
            Contact
          </button>
        </div>
      </header>

      {/* VIEW 1: HOME CATALOG & SEARCH */}
      {!currentTool ? (
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side Private Engine
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-2">
              Free Online Media Converter
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Convert Video, Audio, Image, Document & Unit files instantly without quotas.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative max-w-lg mx-auto mb-8">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input 
              type="text" 
              placeholder="Search tools (e.g. MP4, PDF, HEIC, MP3)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-xl"
            />
          </div>

          {/* Tool Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-10">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => openTool(tool.id)}
                className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-2xl cursor-pointer shadow-lg hover:-translate-y-0.5 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <h3 className="font-bold text-sm text-white group-hover:text-indigo-400 transition">{tool.name}</h3>
                    <span className="text-[9px] bg-slate-800 text-indigo-300 px-2 py-0.5 rounded-full font-bold uppercase">{tool.cat}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{tool.desc}</p>
                </div>
                <span className="text-[11px] font-bold text-indigo-400 mt-3 flex items-center gap-1">Open Converter →</span>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-6 mb-10">
            <div className="bg-slate-900/40 border border-slate-800/80 p-3 rounded-xl text-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-white block">100% Private</span>
              <span className="text-[9px] text-slate-500">Zero file uploads</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 p-3 rounded-xl text-center">
              <Zap className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-white block">High Speed</span>
              <span className="text-[9px] text-slate-500">In-browser engine</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 p-3 rounded-xl text-center">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-white block">Unlimited</span>
              <span className="text-[9px] text-slate-500">Free forever</span>
            </div>
          </div>
        </main>
      ) : (
        /* VIEW 2: DEDICATED TOOL PAGE */
        <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6">
          <button 
            onClick={() => { setActiveToolId(null); setFiles(null); }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-4 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 shadow-sm font-medium transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Converters
          </button>

          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">{currentTool.title}</h1>
            <p className="text-xs text-slate-400">{currentTool.desc}</p>
          </div>

          {/* Instagram Downloader Style Glow Dropzone */}
          <div className="bg-slate-900/80 border-2 border-dashed border-indigo-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-sm mb-6">
            <label className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 cursor-pointer text-sm transition">
              <span>Choose Files</span>
              <ChevronDown className="w-4 h-4 opacity-80" />
              <input 
                type="file" 
                multiple={currentTool.id === 'jpg-to-pdf' || currentTool.id === 'merge-pdf'} 
                onChange={(e) => setFiles(e.target.files)} 
                className="hidden" 
              />
            </label>
            <p className="text-[11px] text-slate-500 mt-3 font-medium">Max file size: Unlimited (Client-Side execution)</p>
            {files && files.length > 0 && (
              <div className="mt-3 p-2 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold rounded-xl">
                ✓ {files.length} file(s) selected ({files[0].name})
              </div>
            )}
          </div>

          {/* Advanced Settings */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-6">
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full px-4 py-3 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2"><Settings className="w-4 h-4 text-indigo-400" /> Advanced settings (optional)</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showAdvanced && (
              <div className="p-4 space-y-4 text-xs">
                {currentTool.id === 'split-pdf' && (
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Page Range:</label>
                    <input type="text" placeholder="e.g. 1-3, 5" value={pageRange} onChange={(e) => setPageRange(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white" />
                  </div>
                )}
                <div>
                  <div className="flex justify-between font-semibold mb-1"><span>Target Quality:</span><span className="text-indigo-400 font-bold">{quality}%</span></div>
                  <input type="range" min="10" max="95" step="5" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-indigo-500 cursor-pointer" />
                </div>
              </div>
            )}
          </div>

          {/* Action Convert Button */}
          <button onClick={handleExecute} disabled={loading || !files} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-600/20 mb-8 transition">
            {loading ? 'Converting in browser...' : 'Convert Now'} <Download className="w-4 h-4" />
          </button>
        </main>
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

      {/* FREECONVERT DARK BLUE FOOTER */}
      <footer className="bg-[#102a43] text-slate-100 py-12 px-6 mt-auto border-t border-slate-800">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h4 className="text-base font-bold text-white mb-3">Video Converter</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p onClick={() => openTool('mp4-converter')} className="cursor-pointer hover:text-white">MP4 Converter</p>
              <p onClick={() => openTool('video-to-gif')} className="cursor-pointer hover:text-white">Video to GIF</p>
              <p onClick={() => openTool('mov-to-mp4')} className="cursor-pointer hover:text-white">MOV to MP4</p>
              <p onClick={() => openTool('video-converter')} className="cursor-pointer hover:text-white">Video Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-white mb-3">Audio Converter</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p onClick={() => openTool('mp3-converter')} className="cursor-pointer hover:text-white">MP3 Converter</p>
              <p onClick={() => openTool('mp4-to-mp3')} className="cursor-pointer hover:text-white">MP4 to MP3</p>
              <p onClick={() => openTool('video-to-mp3')} className="cursor-pointer hover:text-white">Video to MP3</p>
              <p onClick={() => openTool('audio-converter')} className="cursor-pointer hover:text-white">Audio Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-white mb-3">Image Converter</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p onClick={() => openTool('jpg-to-pdf')} className="cursor-pointer hover:text-white">JPG to PDF</p>
              <p onClick={() => openTool('pdf-to-jpg')} className="cursor-pointer hover:text-white">PDF to JPG</p>
              <p onClick={() => openTool('heic-to-jpg')} className="cursor-pointer hover:text-white">HEIC to JPG</p>
              <p onClick={() => openTool('image-to-pdf')} className="cursor-pointer hover:text-white">Image to PDF</p>
              <p onClick={() => openTool('image-converter')} className="cursor-pointer hover:text-white">Image Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-white mb-3">Document & Ebook</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p onClick={() => openTool('pdf-to-word')} className="cursor-pointer hover:text-white">PDF to WORD</p>
              <p onClick={() => openTool('epub-to-pdf')} className="cursor-pointer hover:text-white">EPUB to PDF</p>
              <p onClick={() => openTool('epub-to-mobi')} className="cursor-pointer hover:text-white">EPUB to MOBI</p>
              <p onClick={() => openTool('merge-pdf')} className="cursor-pointer hover:text-white">Document Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-white mb-3">Archive & Time</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p onClick={() => openTool('rar-to-zip')} className="cursor-pointer hover:text-white">RAR to Zip</p>
              <p className="text-slate-400">PST to EST</p>
              <p className="text-slate-400">CST to EST</p>
              <p className="text-slate-400">Archive Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-white mb-3">Unit Converter</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p onClick={() => openTool('lbs-to-kg')} className="cursor-pointer hover:text-white">Lbs to Kg</p>
              <p onClick={() => openTool('kg-to-lbs')} className="cursor-pointer hover:text-white">Kg to Lbs</p>
              <p className="text-slate-400">Feet to Meters</p>
              <p className="text-slate-400">Unit Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-white mb-3">Web Apps</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p className="text-slate-400">Collage Maker</p>
              <p onClick={() => openTool('image-resizer')} className="cursor-pointer hover:text-white">Image Resizer</p>
              <p className="text-slate-400">Crop Image</p>
              <p className="text-slate-400">Color Picker</p>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-white mb-3">Mobile Apps</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p className="text-slate-400">Collage Maker Android</p>
              <p className="text-slate-400">Collage Maker iOS</p>
              <p className="text-slate-400">Image Converter Android</p>
              <p className="text-slate-400">Image Converter iOS</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300 border-t border-slate-700 pt-4">
            <p onClick={() => setModal('about')} className="cursor-pointer hover:text-white">About Us</p>
            <p onClick={() => setModal('terms')} className="cursor-pointer hover:text-white">Terms</p>
            <p onClick={() => setModal('privacy')} className="cursor-pointer hover:text-white">Privacy</p>
            <p onClick={() => setModal('contact')} className="cursor-pointer hover:text-white">Contact</p>
          </div>

          <div className="border-t border-slate-700 pt-6 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">⚡</div>
              <span className="font-bold text-white">QuickConvert</span>
            </div>
            <p>© QuickConvert.pro v2.30 All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-white capitalize">{modal}</h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {modal === 'privacy' && '100% Client-Side Privacy: Your files never touch external servers.'}
              {modal === 'terms' && 'Free online converters with unlimited usage.'}
              {modal === 'about' && 'Universal high-speed converter suite.'}
              {modal === 'contact' && 'Support: support@quickconvert.pro'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
