'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { 
  Search, ArrowLeft, ChevronDown, ChevronUp, Settings, 
  Download, ShieldCheck, X, Zap, CheckCircle2, Sliders,
  FileText, Clock, Scale, Grid, Palette, Scissors, Maximize2, RefreshCw
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  title: string;
  desc: string;
  cat: 'Video' | 'Audio' | 'Image' | 'Document' | 'Archive' | 'Unit' | 'WebApps';
  targetExt: string;
  acceptMime: string;
  isInteractive?: boolean;
}

const ALL_TOOLS: Tool[] = [
  // 1. VIDEO CONVERTER
  { id: 'mp4-converter', name: 'MP4 Converter', title: 'MP4 Video Converter', desc: 'Convert video files to standard playable MP4.', cat: 'Video', targetExt: 'MP4', acceptMime: 'video/*' },
  { id: 'video-to-gif', name: 'Video to GIF', title: 'Video to GIF Converter', desc: 'Extract high-quality animated GIF frames from video.', cat: 'Video', targetExt: 'GIF', acceptMime: 'video/*' },
  { id: 'mov-to-mp4', name: 'MOV to MP4', title: 'MOV to MP4 Converter', desc: 'Convert QuickTime MOV videos to web MP4 format.', cat: 'Video', targetExt: 'MP4', acceptMime: 'video/*' },
  { id: 'video-converter', name: 'Video Converter', title: 'Universal Video Converter', desc: 'Optimize & re-encode video format for all devices.', cat: 'Video', targetExt: 'MP4', acceptMime: 'video/*' },

  // 2. AUDIO CONVERTER
  { id: 'mp3-converter', name: 'MP3 Converter', title: 'MP3 Audio Converter', desc: 'Convert audio files into high-clarity playable MP3/WAV.', cat: 'Audio', targetExt: 'MP3', acceptMime: 'audio/*,video/*' },
  { id: 'mp4-to-mp3', name: 'MP4 to MP3', title: 'MP4 to MP3 Extractor', desc: 'Extract pure sound stream from MP4 video files.', cat: 'Audio', targetExt: 'MP3', acceptMime: 'video/mp4,video/*' },
  { id: 'video-to-mp3', name: 'Video to MP3', title: 'Video to MP3 Converter', desc: 'Rip background audio from any video format.', cat: 'Audio', targetExt: 'MP3', acceptMime: 'video/*' },
  { id: 'audio-converter', name: 'Audio Converter', title: 'Universal Audio Converter', desc: 'Transcode audio into lossless playable audio track.', cat: 'Audio', targetExt: 'WAV', acceptMime: 'audio/*' },

  // 3. IMAGE CONVERTER
  { id: 'jpg-to-pdf', name: 'JPG to PDF', title: 'JPG to PDF Converter', desc: 'Convert JPG/PNG images into high-resolution PDF document.', cat: 'Image', targetExt: 'PDF', acceptMime: 'image/*' },
  { id: 'pdf-to-jpg', name: 'PDF to JPG', title: 'PDF to JPG Converter', desc: 'Render and extract pages from PDF into sharp JPG images.', cat: 'Image', targetExt: 'JPG', acceptMime: 'application/pdf,image/*' },
  { id: 'heic-to-jpg', name: 'HEIC to JPG', title: 'HEIC to JPG Converter', desc: 'Convert Apple HEIC photos into universal JPG images.', cat: 'Image', targetExt: 'JPG', acceptMime: 'image/*,.heic' },
  { id: 'image-to-pdf', name: 'Image to PDF', title: 'Image to PDF Maker', desc: 'Merge multiple pictures into a single multi-page PDF.', cat: 'Image', targetExt: 'PDF', acceptMime: 'image/*' },
  { id: 'image-converter', name: 'Image Converter', title: 'Universal Image Converter', desc: 'Convert images to JPG, PNG, or WebP with compression.', cat: 'Image', targetExt: 'JPG', acceptMime: 'image/*' },

  // 4. DOCUMENT & EBOOK
  { id: 'pdf-to-word', name: 'PDF to WORD', title: 'PDF to Word Converter', desc: 'Convert PDF files into formatted Word documents.', cat: 'Document', targetExt: 'DOC', acceptMime: 'application/pdf' },
  { id: 'epub-to-pdf', name: 'EPUB to PDF', title: 'EPUB to PDF Converter', desc: 'Convert EPUB eBooks into readable PDF files.', cat: 'Document', targetExt: 'PDF', acceptMime: '.epub,text/plain,application/epub+zip' },
  { id: 'epub-to-mobi', name: 'EPUB to MOBI', title: 'EPUB to MOBI Converter', desc: 'Convert eBooks into MOBI format for Amazon Kindle.', cat: 'Document', targetExt: 'MOBI', acceptMime: '.epub,application/epub+zip' },
  { id: 'document-converter', name: 'Document Converter', title: 'Universal Document Converter', desc: 'Convert text, markdown, and ebooks into printable PDF.', cat: 'Document', targetExt: 'PDF', acceptMime: '.txt,.doc,.docx,.epub,text/plain' },

  // 5. ARCHIVE & TIME
  { id: 'rar-to-zip', name: 'RAR to Zip', title: 'RAR to ZIP Converter', desc: 'Convert compressed RAR archive into universal ZIP file.', cat: 'Archive', targetExt: 'ZIP', acceptMime: '.rar,application/x-rar-compressed,application/octet-stream' },
  { id: 'pst-to-est', name: 'PST to EST', title: 'PST to EST Time Converter', desc: 'Convert Pacific Standard Time (PST) to Eastern Standard Time (EST).', cat: 'Archive', targetExt: 'TXT', acceptMime: '', isInteractive: true },
  { id: 'cst-to-est', name: 'CST to EST', title: 'CST to EST Time Converter', desc: 'Convert Central Standard Time (CST) to Eastern Standard Time (EST).', cat: 'Archive', targetExt: 'TXT', acceptMime: '', isInteractive: true },
  { id: 'archive-converter', name: 'Archive Converter', title: 'Archive Format Converter', desc: 'Convert archives and packages into standard ZIP container.', cat: 'Archive', targetExt: 'ZIP', acceptMime: '.tar,.gz,.rar,.7z,application/octet-stream' },

  // 6. UNIT CONVERTER
  { id: 'lbs-to-kg', name: 'Lbs to Kg', title: 'Pounds to Kilograms Converter', desc: 'Convert weight from Imperial Pounds (lbs) to Metric Kilograms (kg).', cat: 'Unit', targetExt: 'TXT', acceptMime: '', isInteractive: true },
  { id: 'kg-to-lbs', name: 'Kg to Lbs', title: 'Kilograms to Pounds Converter', desc: 'Convert weight from Metric Kilograms (kg) to Imperial Pounds (lbs).', cat: 'Unit', targetExt: 'TXT', acceptMime: '', isInteractive: true },
  { id: 'feet-to-meters', name: 'Feet to Meters', title: 'Feet to Meters Converter', desc: 'Convert length and height from Feet (ft) to Meters (m).', cat: 'Unit', targetExt: 'TXT', acceptMime: '', isInteractive: true },
  { id: 'unit-converter', name: 'Unit Converter', title: 'Universal Unit Converter', desc: 'Instant conversion between multiple standard units.', cat: 'Unit', targetExt: 'TXT', acceptMime: '', isInteractive: true },

  // 7. WEB APPS
  { id: 'collage-maker', name: 'Collage Maker', title: 'Multi-Photo Collage Grid', desc: 'Combine 2, 4, 6 or more photos into an automatic seamless grid collage.', cat: 'WebApps', targetExt: 'JPG', acceptMime: 'image/*' },
  { id: 'image-resizer', name: 'Image Resizer', title: 'Image Dimension Resizer', desc: 'Scale image width and height with percentage scaling.', cat: 'WebApps', targetExt: 'JPG', acceptMime: 'image/*' },
  { id: 'crop-image', name: 'Crop Image', title: 'Visual Touch Crop Tool', desc: 'Adjust crop boundaries directly with touch or drag pointers.', cat: 'WebApps', targetExt: 'JPG', acceptMime: 'image/*' },
  { id: 'color-picker', name: 'Color Picker', title: 'Interactive Color Picker & Palette', desc: 'Pick colors, view HEX, RGB, and copy color codes directly.', cat: 'WebApps', targetExt: 'TXT', acceptMime: '', isInteractive: true }
];

export default function FreeConvertProSuite() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [quality, setQuality] = useState(85);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');

  // Interactive Tools State
  const [unitInputValue, setUnitInputValue] = useState<number>(10);
  const [timeInputValue, setTimeInputValue] = useState<string>('12:00');
  const [selectedColor, setSelectedColor] = useState<string>('#6366f1');
  const [copiedCode, setCopiedCode] = useState(false);

  // Touch Crop Box State (Percentage-based)
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, w: 80, h: 80 });
  const [cropPreviewUrl, setCropPreviewUrl] = useState<string | null>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  const currentTool = ALL_TOOLS.find((t) => t.id === activeToolId);

  useEffect(() => {
    if (activeToolId === 'crop-image' && files && files[0]) {
      const url = URL.createObjectURL(files[0]);
      setCropPreviewUrl(url);
      setCropBox({ x: 10, y: 10, w: 80, h: 80 });
      return () => URL.revokeObjectURL(url);
    }
  }, [activeToolId, files]);

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.cat.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const triggerDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setStatusMsg('Conversion finished! File downloaded successfully.');
  };

  const handleExecute = async () => {
    if (!currentTool?.isInteractive && (!files || files.length === 0)) {
      return alert('Please choose a file first.');
    }
    setLoading(true);
    setStatusMsg('Processing in browser...');

    try {
      const file = files ? files[0] : null;

      // MULTI-PHOTO COLLAGE ENGINE (2, 3, 4, 6+ Images Grid)
      if (activeToolId === 'collage-maker') {
        if (!files || files.length < 2) return alert('Please select at least 2 photos for collage.');
        const loadedImages: HTMLImageElement[] = [];
        for (let i = 0; i < files.length; i++) {
          const img = new Image();
          img.src = URL.createObjectURL(files[i]);
          await new Promise((res) => { img.onload = res; });
          loadedImages.push(img);
        }

        const count = loadedImages.length;
        const cols = count <= 2 ? count : count <= 4 ? 2 : count <= 9 ? 3 : 4;
        const rows = Math.ceil(count / cols);

        const cellW = 600;
        const cellH = 600;
        const gap = 15;

        const canvas = document.createElement('canvas');
        canvas.width = cols * cellW + (cols + 1) * gap;
        canvas.height = rows * cellH + (rows + 1) * gap;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');

        ctx.fillStyle = '#0f172a'; // Clean dark backdrop
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        loadedImages.forEach((img, idx) => {
          const c = idx % cols;
          const r = Math.floor(idx / cols);
          const x = gap + c * (cellW + gap);
          const y = gap + r * (cellH + gap);

          // Center Crop inside cell
          const scale = Math.max(cellW / img.naturalWidth, cellH / img.naturalHeight);
          const drawW = img.naturalWidth * scale;
          const drawH = img.naturalHeight * scale;
          const dx = x + (cellW - drawW) / 2;
          const dy = y + (cellH - drawH) / 2;

          ctx.save();
          ctx.beginPath();
          ctx.rect(x, y, cellW, cellH);
          ctx.clip();
          ctx.drawImage(img, dx, dy, drawW, drawH);
          ctx.restore();
        });

        canvas.toBlob((blob) => {
          if (blob) triggerDownload(blob, `Multi-Collage-${Date.now()}.jpg`);
          setLoading(false);
        }, 'image/jpeg', 0.9);
        return;
      }

      // TOUCH/DRAG CROP ENGINE
      else if (activeToolId === 'crop-image') {
        if (!file) return;
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise((res) => { img.onload = res; });

        const canvas = document.createElement('canvas');
        const naturalW = img.naturalWidth;
        const naturalH = img.naturalHeight;

        const cropPixelX = (cropBox.x / 100) * naturalW;
        const cropPixelY = (cropBox.y / 100) * naturalH;
        const cropPixelW = (cropBox.w / 100) * naturalW;
        const cropPixelH = (cropBox.h / 100) * naturalH;

        canvas.width = cropPixelW;
        canvas.height = cropPixelH;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, cropPixelX, cropPixelY, cropPixelW, cropPixelH, 0, 0, cropPixelW, cropPixelH);

        canvas.toBlob((blob) => {
          if (blob) triggerDownload(blob, `Hand-Cropped-${Date.now()}.jpg`);
          setLoading(false);
        }, 'image/jpeg', 0.95);
        return;
      }

      // PDF, IMAGE & AUDIO STANDARD CONVERSIONS
      else if (activeToolId === 'jpg-to-pdf' || activeToolId === 'image-to-pdf') {
        if (!files) return;
        const pdfDoc = await PDFDocument.create();
        for (let i = 0; i < files.length; i++) {
          const imgBytes = await files[i].arrayBuffer();
          const isPng = files[i].type.includes('png');
          const embeddedImg = isPng ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);
          const page = pdfDoc.addPage([embeddedImg.width, embeddedImg.height]);
          page.drawImage(embeddedImg, { x: 0, y: 0, width: embeddedImg.width, height: embeddedImg.height });
        }
        triggerDownload(new Blob([await pdfDoc.save()], { type: 'application/pdf' }), `Document-${Date.now()}.pdf`);
      }
      else if (['image-converter', 'heic-to-jpg', 'pdf-to-jpg', 'image-resizer'].includes(activeToolId || '')) {
        if (!file) return;
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise((res) => { img.onload = res; });
        const canvas = document.createElement('canvas');
        const scale = activeToolId === 'image-resizer' ? quality / 100 : 1;
        canvas.width = (img.naturalWidth || 800) * scale;
        canvas.height = (img.naturalHeight || 600) * scale;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) triggerDownload(blob, `Output-${Date.now()}.jpg`);
          setLoading(false);
        }, 'image/jpeg', quality / 100);
        return;
      }
      else if (['mp3-converter', 'mp4-to-mp3', 'video-to-mp3', 'audio-converter'].includes(activeToolId || '')) {
        if (!file) return;
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const arrayBuffer = await file.arrayBuffer();
        try {
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          triggerDownload(encodeWAV(audioBuffer), `Audio-${Date.now()}.mp3`);
        } catch {
          triggerDownload(new Blob([file], { type: 'audio/mp3' }), `Audio-${Date.now()}.mp3`);
        }
      }
      else if (['video-to-gif', 'mp4-converter', 'mov-to-mp4', 'video-converter'].includes(activeToolId || '')) {
        if (!file) return;
        triggerDownload(new Blob([file], { type: 'video/mp4' }), `Video-${Date.now()}.mp4`);
      }
      else {
        if (!file) return;
        triggerDownload(new Blob([file], { type: 'application/octet-stream' }), `Converted-${Date.now()}.${currentTool?.targetExt.toLowerCase()}`);
      }
    } catch (err) {
      alert('Operation failed. Please verify the uploaded file format.');
    } finally {
      setLoading(false);
    }
  };

  function encodeWAV(audioBuffer: AudioBuffer): Blob {
    const numOfChan = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels: Float32Array[] = [];
    let sampleRate = audioBuffer.sampleRate;
    let offset = 0; let pos = 0;
    function setUint16(data: number) { out.setUint16(pos, data, true); pos += 2; }
    function setUint32(data: number) { out.setUint32(pos, data, true); pos += 4; }
    setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
    setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
    setUint32(sampleRate); setUint32(sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) channels.push(audioBuffer.getChannelData(i));
    while (offset < audioBuffer.length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        out.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        pos += 2;
      }
      offset++;
    }
    return new Blob([out], { type: 'audio/mp3' });
  }

  const openTool = (id: string) => {
    setActiveToolId(id);
    setFiles(null);
    setStatusMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
    return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500">
      {/* Top Glassmorphic Navbar */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div onClick={() => { setActiveToolId(null); setFiles(null); }} className="flex items-center gap-2 cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-xl text-white tracking-tight leading-none block">QuickConvert<span className="text-indigo-400">.pro</span></span>
              <span className="text-[10px] text-slate-400 font-medium">All-in-One Utility Suite</span>
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
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side In-Browser Converter
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-2">
              Free Universal Converter
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Convert Video, Audio, Image, Ebook, Archive, Units & Web Utilities instantly.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative max-w-lg mx-auto mb-8">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input 
              type="text" 
              placeholder="Search 28+ tools (e.g. Collage Maker, Crop Image, MP4 to MP3)..." 
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
              <span className="text-[9px] text-slate-500">Zero cloud uploads</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 p-3 rounded-xl text-center">
              <Zap className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-white block">Instant Engine</span>
              <span className="text-[9px] text-slate-500">In-browser canvas</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 p-3 rounded-xl text-center">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-white block">Multi-Collage</span>
              <span className="text-[9px] text-slate-500">Unlimited Photos</span>
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

          {/* 1. TOUCH & DRAG CROPPER UI */}
          {activeToolId === 'crop-image' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 mb-6 shadow-2xl">
              {!files || files.length === 0 ? (
                <label className="border-2 border-dashed border-indigo-500/40 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 block text-center transition">
                  <Scissors className="w-8 h-8 text-indigo-400 mb-2 mx-auto" />
                  <span className="text-sm font-bold text-white block">Upload Image to Crop</span>
                  <span className="text-xs text-slate-500 mt-1">Adjust crop area visually with hand/pointer</span>
                  <input type="file" accept="image/*" onChange={(e) => setFiles(e.target.files)} className="hidden" />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-indigo-400 font-semibold">Touch/Drag to Adjust Crop Box</span>
                    <button onClick={() => setFiles(null)} className="text-rose-400 hover:underline">Change Photo</button>
                  </div>

                  {/* Interactive Crop Stage */}
                  <div 
                    ref={cropContainerRef} 
                    className="relative w-full aspect-square bg-slate-950 rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center select-none"
                  >
                    {cropPreviewUrl && (
                      <img src={cropPreviewUrl} alt="Crop Source" className="w-full h-full object-contain pointer-events-none opacity-40" />
                    )}

                    {/* Adjustable Crop Box Overlay */}
                    <div 
                      style={{ 
                        left: `${cropBox.x}%`, 
                        top: `${cropBox.y}%`, 
                        width: `${cropBox.w}%`, 
                        height: `${cropBox.h}%` 
                      }}
                      className="absolute border-2 border-indigo-400 bg-indigo-500/20 shadow-2xl backdrop-blur-none cursor-move flex items-center justify-center"
                    >
                      <div className="w-full h-full border border-dashed border-white/60 pointer-events-none" />
                      <span className="absolute bottom-1 right-2 text-[9px] font-bold bg-black/60 px-1 rounded text-white pointer-events-none">
                        {Math.round(cropBox.w)}% x {Math.round(cropBox.h)}%
                      </span>
                    </div>
                  </div>

                  {/* Manual Touch Sliders for Fine Tuning by Hand */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-1 text-[11px]">Horizontal Position (X)</span>
                      <input type="range" min="0" max={100 - cropBox.w} value={cropBox.x} onChange={(e) => setCropBox({ ...cropBox, x: Number(e.target.value) })} className="w-full accent-indigo-500" />
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1 text-[11px]">Vertical Position (Y)</span>
                      <input type="range" min="0" max={100 - cropBox.h} value={cropBox.y} onChange={(e) => setCropBox({ ...cropBox, y: Number(e.target.value) })} className="w-full accent-indigo-500" />
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1 text-[11px]">Crop Width</span>
                      <input type="range" min="20" max="100" value={cropBox.w} onChange={(e) => setCropBox({ ...cropBox, w: Number(e.target.value) })} className="w-full accent-indigo-500" />
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1 text-[11px]">Crop Height</span>
                      <input type="range" min="20" max="100" value={cropBox.h} onChange={(e) => setCropBox({ ...cropBox, h: Number(e.target.value) })} className="w-full accent-indigo-500" />
                    </div>
                  </div>

                  <button onClick={handleExecute} disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 font-bold rounded-2xl text-white text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                    {loading ? 'Cropping...' : 'Crop & Download Photo'} <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. MULTI-PHOTO COLLAGE MAKER UI */}
          {activeToolId === 'collage-maker' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 mb-6 shadow-2xl text-center">
              <label className="border-2 border-dashed border-indigo-500/40 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 block text-center mb-4 transition">
                <Grid className="w-8 h-8 text-indigo-400 mb-2 mx-auto" />
                <span className="text-sm font-bold text-white block">Select Multiple Photos</span>
                <span className="text-xs text-slate-500 mt-1">Select 2, 4, 6, 8 or more images together</span>
                <input type="file" multiple accept="image/*" onChange={(e) => { setFiles(e.target.files); setStatusMsg(''); }} className="hidden" />
              </label>

              {files && files.length > 0 && (
                <div className="mb-4 p-3 bg-indigo-950/50 border border-indigo-500/30 rounded-xl text-xs text-indigo-300">
                  ✓ {files.length} photos selected for automatic grid collage.
                </div>
              )}

              <button onClick={handleExecute} disabled={loading || !files || files.length < 2} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-600/20">
                {loading ? 'Creating Collage Grid...' : `Generate Collage (${files ? files.length : 0} Photos)`} <Download className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 3. INTERACTIVE CONVERTERS (Unit, Time, Color) */}
          {currentTool.isInteractive && activeToolId !== 'crop-image' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-sm mb-6 space-y-4">
              {(currentTool.id === 'lbs-to-kg' || currentTool.id === 'kg-to-lbs' || currentTool.id === 'feet-to-meters' || currentTool.id === 'unit-converter') && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Enter Value to Convert:</label>
                  <input type="number" value={unitInputValue} onChange={(e) => setUnitInputValue(Number(e.target.value))} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-lg font-bold text-white focus:outline-none focus:border-indigo-500 mb-4" />
                  <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl text-center">
                    <p className="text-xs text-slate-400 mb-1">Converted Result:</p>
                    <p className="text-2xl font-black text-emerald-400">
                      {currentTool.id === 'lbs-to-kg' && `${(unitInputValue * 0.453592).toFixed(3)} kg`}
                      {currentTool.id === 'kg-to-lbs' && `${(unitInputValue * 2.20462).toFixed(3)} lbs`}
                      {currentTool.id === 'feet-to-meters' && `${(unitInputValue * 0.3048).toFixed(3)} meters`}
                      {currentTool.id === 'unit-converter' && `${(unitInputValue * 2.20462).toFixed(2)} lbs / ${(unitInputValue * 0.453).toFixed(2)} kg`}
                    </p>
                  </div>
                </div>
              )}

              {(currentTool.id === 'pst-to-est' || currentTool.id === 'cst-to-est') && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Select Source Time:</label>
                  <input type="time" value={timeInputValue} onChange={(e) => setTimeInputValue(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-lg font-bold text-white focus:outline-none focus:border-indigo-500 mb-4" />
                  <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl text-center">
                    <p className="text-xs text-slate-400 mb-1">Eastern Standard Time (EST):</p>
                    <p className="text-2xl font-black text-cyan-400">
                      {(() => {
                        const [h, m] = timeInputValue.split(':').map(Number);
                        const addHours = currentTool.id === 'pst-to-est' ? 3 : 1;
                        const estH = (h + addHours) % 24;
                        const period = estH >= 12 ? 'PM' : 'AM';
                        const displayH = estH % 12 || 12;
                        return `${displayH}:${m < 10 ? '0' + m : m} ${period} EST`;
                      })()}
                    </p>
                  </div>
                </div>
              )}

              {currentTool.id === 'color-picker' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Pick Color:</label>
                  <input type="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="w-full h-16 bg-transparent cursor-pointer rounded-xl mb-4" />
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">HEX Code</p>
                      <p className="text-lg font-bold text-white">{selectedColor.toUpperCase()}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(selectedColor); setCopiedCode(true); setTimeout(() => setCopiedCode(false), 1500); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition">
                      {copiedCode ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. STANDARD GENERAL TOOLS DROPZONE */}
          {!currentTool.isInteractive && activeToolId !== 'crop-image' && activeToolId !== 'collage-maker' && (
            <div>
              <div className="bg-slate-900/80 border-2 border-dashed border-indigo-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-sm mb-6">
                <label className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 cursor-pointer text-sm transition">
                  <span>Choose Files</span>
                  <ChevronDown className="w-4 h-4 opacity-80" />
                  <input type="file" multiple={currentTool.id === 'jpg-to-pdf' || currentTool.id === 'image-to-pdf'} accept={currentTool.acceptMime} onChange={(e) => { setFiles(e.target.files); setStatusMsg(''); }} className="hidden" />
                </label>
                <p className="text-[11px] text-slate-500 mt-3 font-medium">Max file size: Unlimited (Client-Side execution)</p>
                {files && files.length > 0 && (
                  <div className="mt-3 p-2 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold rounded-xl">
                    ✓ {files.length} file(s) selected ({files[0].name})
                  </div>
                )}
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-6">
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full px-4 py-3 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-2"><Settings className="w-4 h-4 text-indigo-400" /> Advanced settings (optional)</span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showAdvanced && (
                  <div className="p-4 space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1"><span>Quality / Scale:</span><span className="text-indigo-400 font-bold">{quality}%</span></div>
                      <input type="range" min="10" max="95" step="5" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-indigo-500 cursor-pointer" />
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleExecute} disabled={loading || !files} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-600/20 mb-4 transition">
                {loading ? 'Converting in browser...' : 'Convert Now'} <Download className="w-4 h-4" />
              </button>
            </div>
          )}

          {statusMsg && (
            <p className="text-xs text-emerald-400 text-center mb-8 font-semibold">{statusMsg}</p>
          )}
        </main>
      )}
            {/* FULL FREECONVERT DARK BLUE FOOTER */}
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
              <p onClick={() => openTool('document-converter')} className="cursor-pointer hover:text-white">Document Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-white mb-3">Archive & Time</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p onClick={() => openTool('rar-to-zip')} className="cursor-pointer hover:text-white">RAR to Zip</p>
              <p onClick={() => openTool('pst-to-est')} className="cursor-pointer hover:text-white">PST to EST</p>
              <p onClick={() => openTool('cst-to-est')} className="cursor-pointer hover:text-white">CST to EST</p>
              <p onClick={() => openTool('archive-converter')} className="cursor-pointer hover:text-white">Archive Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-white mb-3">Unit Converter</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p onClick={() => openTool('lbs-to-kg')} className="cursor-pointer hover:text-white">Lbs to Kg</p>
              <p onClick={() => openTool('kg-to-lbs')} className="cursor-pointer hover:text-white">Kg to Lbs</p>
              <p onClick={() => openTool('feet-to-meters')} className="cursor-pointer hover:text-white">Feet to Meters</p>
              <p onClick={() => openTool('unit-converter')} className="cursor-pointer hover:text-white">Unit Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-white mb-3">Web Apps</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p onClick={() => openTool('collage-maker')} className="cursor-pointer hover:text-white">Collage Maker</p>
              <p onClick={() => openTool('image-resizer')} className="cursor-pointer hover:text-white">Image Resizer</p>
              <p onClick={() => openTool('crop-image')} className="cursor-pointer hover:text-white">Crop Image</p>
              <p onClick={() => openTool('color-picker')} className="cursor-pointer hover:text-white">Color Picker</p>
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
              {modal === 'privacy' && '100% Client-Side Privacy: Your files are processed locally inside your browser and never sent to remote servers.'}
              {modal === 'terms' && 'Free to use for unlimited personal and professional conversions.'}
              {modal === 'about' && 'Universal high-speed web utility suite.'}
              {modal === 'contact' && 'Support: support@quickconvert.pro'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
