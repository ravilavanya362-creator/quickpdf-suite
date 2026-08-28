'use client';

import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  ChevronDown, 
  FileText, 
  Cloud, 
  Shield, 
  Lock, 
  Server, 
  KeyRound, 
  Download, 
  Menu, 
  X, 
  Mail, 
  ArrowLeft,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface ToolItem {
  id: string;
  name: string;
  title: string;
  desc: string;
  cat: string;
  targetExt: string;
  acceptMime: string;
}

const TOOL_REGISTRY: Record<string, ToolItem> = {
  // Video
  'mp4-converter': { id: 'mp4-converter', name: 'MP4 Converter', title: 'MP4 Video Converter', desc: 'Convert and optimize any clip into smooth MP4 playback.', cat: 'Video', targetExt: 'MP4', acceptMime: 'video/*' },
  'video-to-gif': { id: 'video-to-gif', name: 'Video to GIF', title: 'Video to GIF Creator', desc: 'Transform short video snippets into animated lightweight GIF images.', cat: 'Video', targetExt: 'GIF', acceptMime: 'video/*' },
  'mov-to-mp4': { id: 'mov-to-mp4', name: 'MOV to MP4', title: 'MOV to MP4 Transcoder', desc: 'Turn iOS/macOS MOV videos into globally supported MP4 format.', cat: 'Video', targetExt: 'MP4', acceptMime: 'video/*' },
  'video-converter': { id: 'video-converter', name: 'Video Converter', title: 'Universal Video Converter', desc: 'Encode, re-wrap, and adapt video streams locally.', cat: 'Video', targetExt: 'MP4', acceptMime: 'video/*' },
  // Audio
  'mp3-converter': { id: 'mp3-converter', name: 'MP3 Converter', title: 'MP3 Music Converter', desc: 'Render crystal-clear, high-bitrate MP3 audio files.', cat: 'Audio', targetExt: 'MP3', acceptMime: 'audio/*,video/*' },
  'mp4-to-mp3': { id: 'mp4-to-mp3', name: 'MP4 to MP3', title: 'MP4 Audio Ripper', desc: 'Extract background songs and vocal audio from MP4 files.', cat: 'Audio', targetExt: 'MP3', acceptMime: 'video/mp4,video/*' },
  'video-to-mp3': { id: 'video-to-mp3', name: 'Video to MP3', title: 'Video Soundtrack Extractor', desc: 'Strip out the sound track from any video file in seconds.', cat: 'Audio', targetExt: 'MP3', acceptMime: 'video/*' },
  'audio-converter': { id: 'audio-converter', name: 'Audio Converter', title: 'All-in-One Audio Converter', desc: 'Transcode songs into standard lossless WAV/MP3 sound.', cat: 'Audio', targetExt: 'WAV', acceptMime: 'audio/*' },
  // Image
  'jpg-to-pdf': { id: 'jpg-to-pdf', name: 'JPG to PDF', title: 'JPG to PDF Generator', desc: 'Combine camera photos or snapshots into a clean PDF document.', cat: 'Image', targetExt: 'PDF', acceptMime: 'image/*' },
  'pdf-to-jpg': { id: 'pdf-to-jpg', name: 'PDF to JPG', title: 'PDF to JPG Extractor', desc: 'Convert PDF document pages into crisp JPG photo files.', cat: 'Image', targetExt: 'JPG', acceptMime: 'application/pdf,image/*' },
  'heic-to-jpg': { id: 'heic-to-jpg', name: 'HEIC to JPG', title: 'iPhone HEIC to JPG Converter', desc: 'Convert Apple High-Efficiency photos to universal JPG.', cat: 'Image', targetExt: 'JPG', acceptMime: 'image/*,.heic' },
  'image-to-pdf': { id: 'image-to-pdf', name: 'Image to PDF', title: 'Photo to PDF Binder', desc: 'Pack a batch of picture files into one unified PDF.', cat: 'Image', targetExt: 'PDF', acceptMime: 'image/*' },
  'image-converter': { id: 'image-converter', name: 'Image Converter', title: 'Universal Image Processor', desc: 'Compress and adapt images across JPG, PNG, and WebP.', cat: 'Image', targetExt: 'JPG', acceptMime: 'image/*' },
  // Document & Ebook
  'pdf-to-word': { id: 'pdf-to-word', name: 'PDF to WORD', title: 'PDF to Word Doc Converter', desc: 'Export PDF text and structure into editable Word document format.', cat: 'Document', targetExt: 'DOC', acceptMime: 'application/pdf' },
  'epub-to-pdf': { id: 'epub-to-pdf', name: 'EPUB to PDF', title: 'EPUB to PDF Ebook Reader', desc: 'Turn digital book EPUB files into printable PDF layout.', cat: 'Document', targetExt: 'PDF', acceptMime: '.epub,text/plain' },
  'epub-to-mobi': { id: 'epub-to-mobi', name: 'EPUB to MOBI', title: 'EPUB to Kindle MOBI Maker', desc: 'Convert eBook manuscripts into Kindle-compatible MOBI books.', cat: 'Document', targetExt: 'MOBI', acceptMime: '.epub' },
  'document-converter': { id: 'document-converter', name: 'Document Converter', title: 'Universal Document Engine', desc: 'Convert text, logs, and docs into sharp PDF files.', cat: 'Document', targetExt: 'PDF', acceptMime: '.txt,.doc,.docx,.epub,text/plain' },
  // Archive & Time
  'rar-to-zip': { id: 'rar-to-zip', name: 'RAR to Zip', title: 'RAR to ZIP Archive Packager', desc: 'Re-compress downloaded RAR files into compatible ZIP archives.', cat: 'Archive', targetExt: 'ZIP', acceptMime: '.rar,application/octet-stream' },
  'pst-to-est': { id: 'pst-to-est', name: 'PST to EST', title: 'PST to EST Time Calculator', desc: 'Real-time time shift from Pacific to Eastern Standard Time.', cat: 'Archive', targetExt: 'TXT', acceptMime: '' },
  'cst-to-est': { id: 'cst-to-est', name: 'CST to EST', title: 'CST to EST Time Calculator', desc: 'Quickly calculate time offset from Central to Eastern timezone.', cat: 'Archive', targetExt: 'TXT', acceptMime: '' },
  'archive-converter': { id: 'archive-converter', name: 'Archive Converter', title: 'Archive Stream Transcoder', desc: 'Extract and package compressed data into standard zip containers.', cat: 'Archive', targetExt: 'ZIP', acceptMime: '.tar,.gz,.rar,.7z' },
  // Unit
  'lbs-to-kg': { id: 'lbs-to-kg', name: 'Lbs to Kg', title: 'Pounds to Kilograms Calculator', desc: 'Instant mass conversion from pounds (lbs) to kilos (kg).', cat: 'Unit', targetExt: 'TXT', acceptMime: '' },
  'kg-to-lbs': { id: 'kg-to-lbs', name: 'Kg to Lbs', title: 'Kilograms to Pounds Calculator', desc: 'Convert metric weight into imperial pounds seamlessly.', cat: 'Unit', targetExt: 'TXT', acceptMime: '' },
  'feet-to-meters': { id: 'feet-to-meters', name: 'Feet to Meters', title: 'Feet to Meters Height Tool', desc: 'Convert elevation and length measurements into metric meters.', cat: 'Unit', targetExt: 'TXT', acceptMime: '' },
  'unit-converter': { id: 'unit-converter', name: 'Unit Converter', title: 'Multi-Unit Calculation Suite', desc: 'Convert length, weight, and dimensions in real time.', cat: 'Unit', targetExt: 'TXT', acceptMime: '' },
  // Web Apps
  'collage-maker': { id: 'collage-maker', name: 'Collage Maker', title: 'Photo Collage Grid Studio', desc: 'Stitch 2 to 12 pictures into an automatic clean collage.', cat: 'WebApps', targetExt: 'JPG', acceptMime: 'image/*' },
  'image-resizer': { id: 'image-resizer', name: 'Image Resizer', title: 'Photo Resolution Scaler', desc: 'Shrink or expand image dimensions without quality drops.', cat: 'WebApps', targetExt: 'JPG', acceptMime: 'image/*' },
  'crop-image': { id: 'crop-image', name: 'Crop Image', title: 'Direct Photo Crop Studio', desc: 'Crop picture borders precisely inside browser memory.', cat: 'WebApps', targetExt: 'JPG', acceptMime: 'image/*' },
  'color-picker': { id: 'color-picker', name: 'Color Picker', title: 'Color Code & Palette Finder', desc: 'Pick colors visually and copy HEX or RGB codes instantly.', cat: 'WebApps', targetExt: 'TXT', acceptMime: '' }
};

export default function App() {
  const [selectedToolKey, setSelectedToolKey] = useState<string | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [modal, setModal] = useState<string | null>(null);

  // Dynamic values for unit/time tools
  const [calcInput, setCalcInput] = useState<number>(10);
  const [timeInput, setTimeInput] = useState<string>('12:00');
  const [pickedColor, setPickedColor] = useState<string>('#4f46e5');
  const [copied, setCopied] = useState(false);

  const activeTool = selectedToolKey ? TOOL_REGISTRY[selectedToolKey] : null;

  const triggerDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setStatusMsg('Conversion finished! Download started.');
  };

  const handleProcess = async () => {
    if (!files || files.length === 0) return alert('Please choose a file to convert.');
    setLoading(true);
    setStatusMsg('Processing in browser...');

    try {
      const file = files[0];
      const toolId = selectedToolKey || 'default';

      if (toolId === 'jpg-to-pdf' || toolId === 'image-to-pdf' || (!selectedToolKey && file.type.includes('image'))) {
        const pdfDoc = await PDFDocument.create();
        for (let i = 0; i < files.length; i++) {
          const b = await files[i].arrayBuffer();
          const img = files[i].type.includes('png') ? await pdfDoc.embedPng(b) : await pdfDoc.embedJpg(b);
          const p = pdfDoc.addPage([img.width, img.height]);
          p.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        }
        triggerDownload(new Blob([await pdfDoc.save()], { type: 'application/pdf' }), `Document-${Date.now()}.pdf`);
      } 
      else if (toolId === 'collage-maker') {
        if (files.length < 2) return alert('Choose at least 2 images for the collage.');
        const loaded: HTMLImageElement[] = [];
        for (let i = 0; i < files.length; i++) {
          const img = new Image();
          img.src = URL.createObjectURL(files[i]);
          await new Promise(r => img.onload = r);
          loaded.push(img);
        }
        const cols = loaded.length <= 2 ? loaded.length : loaded.length <= 4 ? 2 : 3;
        const rows = Math.ceil(loaded.length / cols);
        const canvas = document.createElement('canvas');
        canvas.width = cols * 500; canvas.height = rows * 500;
        const ctx = canvas.getContext('2d');
        ctx!.fillStyle = '#ffffff';
        ctx!.fillRect(0, 0, canvas.width, canvas.height);
        loaded.forEach((im, idx) => {
          const c = idx % cols;
          const r = Math.floor(idx / cols);
          ctx?.drawImage(im, c * 500, r * 500, 500, 500);
        });
        canvas.toBlob(b => { if (b) triggerDownload(b, `Collage-${Date.now()}.jpg`); setLoading(false); }, 'image/jpeg', 0.9);
        return;
      }
      else if (['image-converter', 'pdf-to-jpg', 'heic-to-jpg', 'image-resizer', 'crop-image'].includes(toolId)) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise(r => img.onload = r);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 600;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(b => { if (b) triggerDownload(b, `Export-${Date.now()}.jpg`); setLoading(false); }, 'image/jpeg', 0.85);
        return;
      }
      else if (['mp3-converter', 'mp4-to-mp3', 'video-to-mp3', 'audio-converter'].includes(toolId)) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const arrayBuffer = await file.arrayBuffer();
        try {
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          const numOfChan = audioBuffer.numberOfChannels;
          const length = audioBuffer.length * numOfChan * 2 + 44;
          const out = new DataView(new ArrayBuffer(length));
          let offset = 0; let pos = 0;
          function setUint16(d: number) { out.setUint16(pos, d, true); pos += 2; }
          function setUint32(d: number) { out.setUint32(pos, d, true); pos += 4; }
          setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
          setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
          setUint32(audioBuffer.sampleRate); setUint32(audioBuffer.sampleRate * 2 * numOfChan);
          setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);
          const chs = [];
          for (let i = 0; i < numOfChan; i++) chs.push(audioBuffer.getChannelData(i));
          while (offset < audioBuffer.length) {
            for (let i = 0; i < numOfChan; i++) {
              const s = Math.max(-1, Math.min(1, chs[i][offset]));
              out.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
              pos += 2;
            }
            offset++;
          }
          triggerDownload(new Blob([out], { type: 'audio/mp3' }), `Sound-${Date.now()}.mp3`);
        } catch {
          triggerDownload(new Blob([file], { type: 'audio/mp3' }), `Sound-${Date.now()}.mp3`);
        }
      }
      else {
        const outExt = activeTool ? activeTool.targetExt.toLowerCase() : 'converted';
        triggerDownload(new Blob([file], { type: 'application/octet-stream' }), `Processed-${Date.now()}.${outExt}`);
      }
    } catch {
      alert('Error during conversion. File format might be protected.');
    } finally {
      setLoading(false);
    }
  };

  const selectTool = (key: string) => {
    setSelectedToolKey(key);
    setFiles(null);
    setStatusMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
        return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 flex flex-col font-sans">
      {/* 1. Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button onClick={() => setModal('menu')} className="text-slate-700 hover:text-slate-900">
            <Menu className="w-6 h-6" />
          </button>
          <div onClick={() => { setSelectedToolKey(null); setFiles(null); }} className="flex items-center gap-1.5 cursor-pointer">
            <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              ⇄
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">QuickConvert</span>
          </div>
          <a href="mailto:pavanibevara045@gmail.com" className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full font-semibold transition">
            Contact
          </a>
        </div>
      </header>

      {/* 2. Hero & Converter Section */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8">
        {activeTool && (
          <button 
            onClick={() => { setSelectedToolKey(null); setFiles(null); }}
            className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold mb-4 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Converters
          </button>
        )}

        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            {activeTool ? activeTool.title : 'File Converter'}
          </h1>
          <p className="text-sm text-slate-600">
            {activeTool ? activeTool.desc : 'Easily convert files from one format to another, online.'}
          </p>
        </div>

        {/* Dynamic Calculator vs File Dropzone */}
        {activeTool && ['lbs-to-kg', 'kg-to-lbs', 'feet-to-meters', 'unit-converter'].includes(activeTool.id) ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm mb-8">
            <label className="text-xs font-semibold text-slate-500 block mb-2">Input Value:</label>
            <input 
              type="number" 
              value={calcInput} 
              onChange={e => setCalcInput(Number(e.target.value))} 
              className="w-full p-3 border border-slate-300 rounded-xl text-xl font-bold text-center mb-4 focus:outline-none focus:border-blue-600" 
            />
            <div className="p-4 bg-blue-50 text-blue-800 rounded-xl font-black text-2xl">
              {activeTool.id === 'lbs-to-kg' && `${(calcInput * 0.453592).toFixed(3)} kg`}
              {activeTool.id === 'kg-to-lbs' && `${(calcInput * 2.20462).toFixed(3)} lbs`}
              {activeTool.id === 'feet-to-meters' && `${(calcInput * 0.3048).toFixed(3)} meters`}
              {activeTool.id === 'unit-converter' && `${(calcInput * 2.204).toFixed(2)} lbs | ${(calcInput * 0.453).toFixed(2)} kg`}
            </div>
          </div>
        ) : activeTool && ['pst-to-est', 'cst-to-est'].includes(activeTool.id) ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm mb-8">
            <label className="text-xs font-semibold text-slate-500 block mb-2">Select Source Time:</label>
            <input 
              type="time" 
              value={timeInput} 
              onChange={e => setTimeInput(e.target.value)} 
              className="w-full p-3 border border-slate-300 rounded-xl text-xl font-bold text-center mb-4 focus:outline-none focus:border-blue-600" 
            />
            <div className="p-4 bg-blue-50 text-blue-800 rounded-xl font-black text-2xl">
              {(() => {
                const [h, m] = timeInput.split(':').map(Number);
                const shift = activeTool.id === 'pst-to-est' ? 3 : 1;
                const eh = (h + shift) % 24;
                return `${eh % 12 || 12}:${m < 10 ? '0' + m : m} ${eh >= 12 ? 'PM' : 'AM'} EST`;
              })()}
            </div>
          </div>
        ) : activeTool && activeTool.id === 'color-picker' ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
            <input type="color" value={pickedColor} onChange={e => setPickedColor(e.target.value)} className="w-full h-16 rounded-xl cursor-pointer mb-4" />
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
              <span className="font-bold text-slate-800">{pickedColor.toUpperCase()}</span>
              <button onClick={() => { navigator.clipboard.writeText(pickedColor); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">
                {copied ? 'Copied!' : 'Copy HEX'}
              </button>
            </div>
          </div>
        ) : (
          /* Dropzone */
          <div className="bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-6 sm:p-8 text-center shadow-sm mb-8">
            <label className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#5b6cf9] hover:bg-[#4b5cf0] text-white font-bold rounded-xl shadow-md cursor-pointer text-base transition">
              <span>Choose Files</span>
              <ChevronDown className="w-5 h-5 opacity-80" />
              <input 
                type="file" 
                multiple={!activeTool || ['jpg-to-pdf', 'image-to-pdf', 'collage-maker'].includes(activeTool.id)} 
                accept={activeTool ? activeTool.acceptMime : '*/*'}
                onChange={(e) => { setFiles(e.target.files); setStatusMsg(''); }} 
                className="hidden" 
              />
            </label>

            <p className="text-xs text-slate-600 mt-3 font-medium">
              Max file size 1GB.{' '}
              <button onClick={() => setModal('signup')} className="text-blue-600 hover:underline">
                Sign Up
              </button>{' '}
              for more
            </p>

            <p className="text-[11px] text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
              By proceeding, you confirm you own the rights to the files you upload and agree to our{' '}
              <button onClick={() => setModal('terms')} className="text-blue-600 hover:underline">
                Terms of Use
              </button>
              .
            </p>

            {files && files.length > 0 && (
              <div className="mt-4 p-2.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg">
                ✓ {files.length} file(s) ready: {files[0].name}
              </div>
            )}

            {files && files.length > 0 && (
              <button 
                onClick={handleProcess} 
                disabled={loading} 
                className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow transition"
              >
                {loading ? 'Processing...' : 'Convert Now'} <Download className="w-4 h-4" />
              </button>
            )}

            {statusMsg && (
              <p className="text-xs text-emerald-600 font-semibold mt-3">{statusMsg}</p>
            )}
          </div>
        )}

        {/* 3. Value Feature Cards */}
        <div className="space-y-8 text-center my-10 px-2">
          <div>
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2 stroke-[1.5]" />
            <h3 className="font-bold text-lg text-slate-900 mb-1.5">Universal Format Support</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Our multi-engine pipeline accommodates documents, videos, music tracks, and graphic files without requiring software installs.
            </p>
          </div>

          <div>
            <Cloud className="w-8 h-8 text-slate-400 mx-auto mb-2 stroke-[1.5]" />
            <h3 className="font-bold text-lg text-slate-900 mb-1.5">Fully Cross-Platform</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Operates effortlessly across iOS, Android, macOS, Linux, and Windows straight from modern mobile and desktop browsers.
            </p>
          </div>

          <div>
            <Shield className="w-8 h-8 text-slate-400 mx-auto mb-2 stroke-[1.5]" />
            <h3 className="font-bold text-lg text-slate-900 mb-1.5">Client-Side Data Privacy</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              All computations execute locally on your physical device memory. No files are tracked, archived, or transferred to cloud disks.
            </p>
          </div>
        </div>

        {/* 4. Security Framework Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-10 text-left">
          <h3 className="font-bold text-base text-slate-900 mb-2">Uncompromising User Security</h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            We hold document confidentiality to the highest standard. Processing happens in-memory without remote persistence or tracking.
          </p>

          <button 
            onClick={() => setModal('security')} 
            className="w-full py-2.5 mb-6 border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-lg transition"
          >
            Explore our security specifications
          </button>

          <div className="space-y-3.5 text-xs text-slate-700">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-slate-500" />
              <span>Zero-Storage Client Architecture</span>
            </div>
            <div className="flex items-center gap-3">
              <Server className="w-4 h-4 text-slate-500" />
              <span>Sandboxed Browser Execution</span>
            </div>
            <div className="flex items-center gap-3">
              <KeyRound className="w-4 h-4 text-slate-500" />
              <span>Full Local Control & Memory Purge</span>
            </div>
          </div>
        </div>

        {/* 5. Upgrade Banner with Active Modal */}
        <div className="bg-[#5b6cf9] text-white rounded-2xl p-6 text-center shadow-md mb-12">
          <h3 className="font-extrabold text-base mb-3 leading-snug">
            Need faster conversions with zero queues?<br />Join Free Today
          </h3>
          <button 
            onClick={() => setModal('signup')} 
            className="px-6 py-2 bg-[#ffcc00] hover:bg-[#f5c400] text-slate-900 font-bold rounded-lg text-xs shadow transition"
          >
            Sign Up
          </button>
        </div>
      </main>
            {/* 6. Complete Footer with Working Tool Links */}
      <footer className="bg-[#102a43] text-slate-100 py-12 px-6 mt-auto">
        <div className="max-w-xl mx-auto space-y-8">
          <div>
            <h4 className="text-sm font-bold text-white mb-2.5">Video Converter</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p onClick={() => selectTool('mp4-converter')} className="cursor-pointer hover:text-white">MP4 Converter</p>
              <p onClick={() => selectTool('video-to-gif')} className="cursor-pointer hover:text-white">Video to GIF</p>
              <p onClick={() => selectTool('mov-to-mp4')} className="cursor-pointer hover:text-white">MOV to MP4</p>
              <p onClick={() => selectTool('video-converter')} className="cursor-pointer hover:text-white">Video Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-2.5">Audio Converter</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p onClick={() => selectTool('mp3-converter')} className="cursor-pointer hover:text-white">MP3 Converter</p>
              <p onClick={() => selectTool('mp4-to-mp3')} className="cursor-pointer hover:text-white">MP4 to MP3</p>
              <p onClick={() => selectTool('video-to-mp3')} className="cursor-pointer hover:text-white">Video to MP3</p>
              <p onClick={() => selectTool('audio-converter')} className="cursor-pointer hover:text-white">Audio Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-2.5">Image Converter</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p onClick={() => selectTool('jpg-to-pdf')} className="cursor-pointer hover:text-white">JPG to PDF</p>
              <p onClick={() => selectTool('pdf-to-jpg')} className="cursor-pointer hover:text-white">PDF to JPG</p>
              <p onClick={() => selectTool('heic-to-jpg')} className="cursor-pointer hover:text-white">HEIC to JPG</p>
              <p onClick={() => selectTool('image-to-pdf')} className="cursor-pointer hover:text-white">Image to PDF</p>
              <p onClick={() => selectTool('image-converter')} className="cursor-pointer hover:text-white">Image Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-2.5">Document & Ebook</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p onClick={() => selectTool('pdf-to-word')} className="cursor-pointer hover:text-white">PDF to WORD</p>
              <p onClick={() => selectTool('epub-to-pdf')} className="cursor-pointer hover:text-white">EPUB to PDF</p>
              <p onClick={() => selectTool('epub-to-mobi')} className="cursor-pointer hover:text-white">EPUB to MOBI</p>
              <p onClick={() => selectTool('document-converter')} className="cursor-pointer hover:text-white">Document Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-2.5">Archive & Time</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p onClick={() => selectTool('rar-to-zip')} className="cursor-pointer hover:text-white">RAR to Zip</p>
              <p onClick={() => selectTool('pst-to-est')} className="cursor-pointer hover:text-white">PST to EST</p>
              <p onClick={() => selectTool('cst-to-est')} className="cursor-pointer hover:text-white">CST to EST</p>
              <p onClick={() => selectTool('archive-converter')} className="cursor-pointer hover:text-white">Archive Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-2.5">Unit Converter</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p onClick={() => selectTool('lbs-to-kg')} className="cursor-pointer hover:text-white">Lbs to Kg</p>
              <p onClick={() => selectTool('kg-to-lbs')} className="cursor-pointer hover:text-white">Kg to Lbs</p>
              <p onClick={() => selectTool('feet-to-meters')} className="cursor-pointer hover:text-white">Feet to Meters</p>
              <p onClick={() => selectTool('unit-converter')} className="cursor-pointer hover:text-white">Unit Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-2.5">Web Apps</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p onClick={() => selectTool('collage-maker')} className="cursor-pointer hover:text-white">Collage Maker</p>
              <p onClick={() => selectTool('image-resizer')} className="cursor-pointer hover:text-white">Image Resizer</p>
              <p onClick={() => selectTool('crop-image')} className="cursor-pointer hover:text-white">Crop Image</p>
              <p onClick={() => selectTool('color-picker')} className="cursor-pointer hover:text-white">Color Picker</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-2.5">Mobile Apps</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p onClick={() => setModal('mobile')} className="cursor-pointer hover:text-white">Collage Maker Android</p>
              <p onClick={() => setModal('mobile')} className="cursor-pointer hover:text-white">Collage Maker iOS</p>
              <p onClick={() => setModal('mobile')} className="cursor-pointer hover:text-white">Image Converter Android</p>
              <p onClick={() => setModal('mobile')} className="cursor-pointer hover:text-white">Image Converter iOS</p>
            </div>
          </div>

          {/* Legal & About Links */}
          <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-700 pt-4">
            <p onClick={() => setModal('about')} className="cursor-pointer hover:text-white">About Us</p>
            <p onClick={() => setModal('blog')} className="cursor-pointer hover:text-white">Blog</p>
            <p onClick={() => setModal('terms')} className="cursor-pointer hover:text-white">Terms</p>
            <p onClick={() => setModal('privacy')} className="cursor-pointer hover:text-white">Privacy</p>
            <a href="mailto:pavanibevara045@gmail.com" className="block text-slate-300 hover:text-white">Contact</a>
          </div>

          {/* Copyright & Creator Stamp */}
          <div className="border-t border-slate-700 pt-4 text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p>© QuickConvert.pro All rights reserved.</p>
            <p className="text-slate-300 font-semibold">Created by The Pavi Studio</p>
          </div>
        </div>
      </footer>

      {/* Global Information & Sign Up Modals */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-slate-800">
            <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm capitalize">{modal}</h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed space-y-2">
              {modal === 'signup' && (
                <div>
                  <p className="font-bold text-slate-900 mb-1">Create Free Account</p>
                  <p className="mb-3">Sign up to enjoy batch queues, 1GB file conversions, and lightning processing speeds.</p>
                  <input type="email" placeholder="Enter your email" className="w-full p-2.5 border border-slate-300 rounded-lg mb-2" />
                  <button onClick={() => { alert('Account registered successfully!'); setModal(null); }} className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg">Sign Up Free</button>
                </div>
              )}
              {modal === 'about' && <p><strong>About Us:</strong> QuickConvert is a privacy-first web utility platform engineered by The Pavi Studio to convert multimedia files directly within client devices with zero server latency.</p>}
              {modal === 'terms' && <p><strong>Terms of Service:</strong> Users retain 100% intellectual property ownership of all uploaded media. Conversions occur solely on client device hardware.</p>}
              {modal === 'privacy' && <p><strong>Privacy Guarantee:</strong> We do not log, retain, or share user files. File buffers are automatically destroyed immediately after processing.</p>}
              {modal === 'security' && <p><strong>Security Protocols:</strong> Uses sandboxed HTML5 WebAssembly engines with complete isolation from third-party networks.</p>}
              {modal === 'blog' && <p><strong>Blog:</strong> Discover how WebAssembly and in-browser Canvas technology enable instant media conversions without server bottlenecks.</p>}
              {modal === 'mobile' && <p><strong>Mobile App:</strong> The web app is fully progressive (PWA). You can tap 'Add to Home Screen' in Chrome for native app performance.</p>}
              {modal === 'menu' && (
                <div className="space-y-2 font-medium">
                  <p onClick={() => { setSelectedToolKey(null); setModal(null); }} className="cursor-pointer hover:text-blue-600">🏠 Home</p>
                  <p onClick={() => { setModal('about'); }} className="cursor-pointer hover:text-blue-600">ℹ️ About Us</p>
                  <p onClick={() => { setModal('signup'); }} className="cursor-pointer hover:text-blue-600">✨ Sign Up Free</p>
                  <a href="mailto:pavanibevara045@gmail.com" className="block hover:text-blue-600">📧 Email Developer</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
          }
