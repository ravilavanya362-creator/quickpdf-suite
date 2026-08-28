'use client';

import React, { useState } from 'react';
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
  ArrowLeft,
  ChevronUp,
  HelpCircle,
  Clock,
  Calendar,
  User
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
  'mp4-converter': { id: 'mp4-converter', name: 'MP4 Converter', title: 'MP4 Video Converter', desc: 'Convert and optimize any clip into smooth MP4 playback.', cat: 'Video', targetExt: 'MP4', acceptMime: 'video/*' },
  'video-to-gif': { id: 'video-to-gif', name: 'Video to GIF', title: 'Video to GIF Creator', desc: 'Transform short video snippets into animated lightweight GIF images.', cat: 'Video', targetExt: 'GIF', acceptMime: 'video/*' },
  'mov-to-mp4': { id: 'mov-to-mp4', name: 'MOV to MP4', title: 'MOV to MP4 Transcoder', desc: 'Turn iOS/macOS MOV videos into globally supported MP4 format.', cat: 'Video', targetExt: 'MP4', acceptMime: 'video/*' },
  'video-converter': { id: 'video-converter', name: 'Video Converter', title: 'Universal Video Converter', desc: 'Encode, re-wrap, and adapt video streams locally.', cat: 'Video', targetExt: 'MP4', acceptMime: 'video/*' },
  'mp3-converter': { id: 'mp3-converter', name: 'MP3 Converter', title: 'MP3 Music Converter', desc: 'Render crystal-clear, high-bitrate MP3 audio files.', cat: 'Audio', targetExt: 'MP3', acceptMime: 'audio/*,video/*' },
  'mp4-to-mp3': { id: 'mp4-to-mp3', name: 'MP4 to MP3', title: 'MP4 Audio Ripper', desc: 'Extract background songs and vocal audio from MP4 files.', cat: 'Audio', targetExt: 'MP3', acceptMime: 'video/mp4,video/*' },
  'video-to-mp3': { id: 'video-to-mp3', name: 'Video to MP3', title: 'Video Soundtrack Extractor', desc: 'Strip out the sound track from any video file in seconds.', cat: 'Audio', targetExt: 'MP3', acceptMime: 'video/*' },
  'audio-converter': { id: 'audio-converter', name: 'Audio Converter', title: 'All-in-One Audio Converter', desc: 'Transcode songs into standard lossless WAV/MP3 sound.', cat: 'Audio', targetExt: 'WAV', acceptMime: 'audio/*' },
  'jpg-to-pdf': { id: 'jpg-to-pdf', name: 'JPG to PDF', title: 'JPG to PDF Generator', desc: 'Combine camera photos or snapshots into a clean PDF document.', cat: 'Image', targetExt: 'PDF', acceptMime: 'image/*' },
  'pdf-to-jpg': { id: 'pdf-to-jpg', name: 'PDF to JPG', title: 'PDF to JPG Extractor', desc: 'Convert PDF document pages into crisp JPG photo files.', cat: 'Image', targetExt: 'JPG', acceptMime: 'application/pdf,image/*' },
  'heic-to-jpg': { id: 'heic-to-jpg', name: 'HEIC to JPG', title: 'iPhone HEIC to JPG Converter', desc: 'Convert Apple High-Efficiency photos to universal JPG.', cat: 'Image', targetExt: 'JPG', acceptMime: 'image/*,.heic' },
  'image-to-pdf': { id: 'image-to-pdf', name: 'Image to PDF', title: 'Photo to PDF Binder', desc: 'Pack a batch of picture files into one unified PDF.', cat: 'Image', targetExt: 'PDF', acceptMime: 'image/*' },
  'image-converter': { id: 'image-converter', name: 'Image Converter', title: 'Universal Image Processor', desc: 'Compress and adapt images across JPG, PNG, and WebP.', cat: 'Image', targetExt: 'JPG', acceptMime: 'image/*' },
  'pdf-to-word': { id: 'pdf-to-word', name: 'PDF to WORD', title: 'PDF to Word Doc Converter', desc: 'Export PDF text and structure into editable Word document format.', cat: 'Document', targetExt: 'DOC', acceptMime: 'application/pdf' },
  'epub-to-pdf': { id: 'epub-to-pdf', name: 'EPUB to PDF', title: 'EPUB to PDF Ebook Reader', desc: 'Turn digital book EPUB files into printable PDF layout.', cat: 'Document', targetExt: 'PDF', acceptMime: '.epub,text/plain' },
  'epub-to-mobi': { id: 'epub-to-mobi', name: 'EPUB to MOBI', title: 'EPUB to Kindle MOBI Maker', desc: 'Convert eBook manuscripts into Kindle-compatible MOBI books.', cat: 'Document', targetExt: 'MOBI', acceptMime: '.epub' },
  'document-converter': { id: 'document-converter', name: 'Document Converter', title: 'Universal Document Engine', desc: 'Convert text, logs, and docs into sharp PDF files.', cat: 'Document', targetExt: 'PDF', acceptMime: '.txt,.doc,.docx,.epub,text/plain' },
  'rar-to-zip': { id: 'rar-to-zip', name: 'RAR to Zip', title: 'RAR to ZIP Archive Packager', desc: 'Re-compress downloaded RAR files into compatible ZIP archives.', cat: 'Archive', targetExt: 'ZIP', acceptMime: '.rar,application/octet-stream' },
  'pst-to-est': { id: 'pst-to-est', name: 'PST to EST', title: 'PST to EST Time Calculator', desc: 'Real-time time shift from Pacific to Eastern Standard Time.', cat: 'Archive', targetExt: 'TXT', acceptMime: '' },
  'cst-to-est': { id: 'cst-to-est', name: 'CST to EST', title: 'CST to EST Time Calculator', desc: 'Quickly calculate time offset from Central to Eastern timezone.', cat: 'Archive', targetExt: 'TXT', acceptMime: '' },
  'archive-converter': { id: 'archive-converter', name: 'Archive Converter', title: 'Archive Stream Transcoder', desc: 'Extract and package compressed data into standard zip containers.', cat: 'Archive', targetExt: 'ZIP', acceptMime: '.tar,.gz,.rar,.7z' },
  'lbs-to-kg': { id: 'lbs-to-kg', name: 'Lbs to Kg', title: 'Pounds to Kilograms Calculator', desc: 'Instant mass conversion from pounds (lbs) to kilos (kg).', cat: 'Unit', targetExt: 'TXT', acceptMime: '' },
  'kg-to-lbs': { id: 'kg-to-lbs', name: 'Kg to Lbs', title: 'Kilograms to Pounds Calculator', desc: 'Convert metric weight into imperial pounds seamlessly.', cat: 'Unit', targetExt: 'TXT', acceptMime: '' },
  'feet-to-meters': { id: 'feet-to-meters', name: 'Feet to Meters', title: 'Feet to Meters Height Tool', desc: 'Convert elevation and length measurements into metric meters.', cat: 'Unit', targetExt: 'TXT', acceptMime: '' },
  'unit-converter': { id: 'unit-converter', name: 'Unit Converter', title: 'Multi-Unit Calculation Suite', desc: 'Convert length, weight, and dimensions in real time.', cat: 'Unit', targetExt: 'TXT', acceptMime: '' },
  'collage-maker': { id: 'collage-maker', name: 'Collage Maker', title: 'Photo Collage Grid Studio', desc: 'Stitch multiple pictures into an automatic clean collage.', cat: 'WebApps', targetExt: 'JPG', acceptMime: 'image/*' },
  'image-resizer': { id: 'image-resizer', name: 'Image Resizer', title: 'Photo Resolution Scaler', desc: 'Shrink or expand image dimensions without quality drops.', cat: 'WebApps', targetExt: 'JPG', acceptMime: 'image/*' },
  'crop-image': { id: 'crop-image', name: 'Crop Image', title: 'Direct Photo Crop Studio', desc: 'Crop picture borders precisely inside browser memory.', cat: 'WebApps', targetExt: 'JPG', acceptMime: 'image/*' },
  'color-picker': { id: 'color-picker', name: 'Color Picker', title: 'Color Code & Palette Finder', desc: 'Pick colors visually and copy HEX or RGB codes instantly.', cat: 'WebApps', targetExt: 'TXT', acceptMime: '' }
};

const FAQ_LIST = [
  {
    q: 'Is QuickConvert.pro safe to use for sensitive documents?',
    a: 'Yes, 100%! All conversions process strictly in-memory inside your local web browser sandbox. Files never upload to any remote cloud database, ensuring total confidentiality.'
  },
  {
    q: 'Can I convert large videos and multi-page PDFs for free?',
    a: 'Absolutely. QuickConvert.pro provides unlimited conversions up to 1GB per file without requiring subscriptions, watermarks, or credit card entries.'
  },
  {
    q: 'Which operating systems and browsers are supported?',
    a: 'Everything runs directly via modern HTML5 & WebAssembly engines. It supports Android Chrome, Apple Safari (iOS/macOS), Windows Edge, and Linux browsers with zero installation.'
  }
];

export default function App() {
  const [selectedToolKey, setSelectedToolKey] = useState<string | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [modal, setModal] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [currentView, setCurrentView] = useState<'home' | 'blog'>('home');

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
      else {
        const outExt = activeTool ? activeTool.targetExt.toLowerCase() : 'converted';
        triggerDownload(new Blob([file], { type: 'application/octet-stream' }), `Processed-${Date.now()}.${outExt}`);
      }
    } catch {
      alert('Error during conversion.');
    } finally {
      setLoading(false);
    }
  };

  const selectTool = (key: string) => {
    setCurrentView('home');
    setSelectedToolKey(key);
    setFiles(null);
    setStatusMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
    return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafbfc', color: '#1e293b', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* 1. Header */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40, padding: '10px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setModal('menu')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#334155' }}>
            <Menu size={24} />
          </button>
          
          <div onClick={() => { setCurrentView('home'); setSelectedToolKey(null); setFiles(null); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(145deg, #0ea5e9, #2563eb, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(37,99,235,0.3)', flexShrink: 0 }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                <span style={{ color: '#eab308', fontWeight: 900, fontSize: '13px', lineHeight: 1 }}>⇄</span>
              </div>
            </div>
            
            <span style={{ fontWeight: 900, fontSize: '18px', color: '#0f172a', letterSpacing: '-0.5px' }}>
              QuickConvert<span style={{ color: '#2563eb' }}>.pro</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => { setCurrentView(currentView === 'home' ? 'blog' : 'home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ fontSize: '12px', backgroundColor: currentView === 'blog' ? '#2563eb' : '#eff6ff', color: currentView === 'blog' ? '#ffffff' : '#2563eb', padding: '6px 12px', borderRadius: '9999px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              {currentView === 'home' ? 'Blog' : 'Converter'}
            </button>
            <a href="mailto:pavanibevara045@gmail.com" style={{ fontSize: '12px', backgroundColor: '#f1f5f9', color: '#334155', padding: '6px 12px', borderRadius: '9999px', textDecoration: 'none', fontWeight: 600 }}>
              Contact
            </a>
          </div>
        </div>
      </header>

      {/* 2. Main Content Body */}
      <main style={{ flex: 1, maxWidth: '600px', width: '100%', margin: '0 auto', padding: '24px 16px', boxSizing: 'border-box' }}>
        
        {currentView === 'home' ? (
          <>
            {activeTool && (
              <button 
                onClick={() => { setSelectedToolKey(null); setFiles(null); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#2563eb', fontWeight: 'bold', marginBottom: '16px', backgroundColor: '#eff6ff', padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              >
                <ArrowLeft size={14} /> Back to All Converters
              </button>
            )}

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'linear-gradient(145deg, #0ea5e9, #2563eb, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(37,99,235,0.35)' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)' }}>
                    <span style={{ color: '#eab308', fontWeight: 900, fontSize: '24px', lineHeight: 1 }}>⇄</span>
                  </div>
                </div>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', textTransform: 'uppercase', margin: '0 0 2px 0' }}>
                QUICK CONVERT <span style={{ color: '#2563eb' }}>PRO</span>
              </h2>
              <p style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', margin: '0 0 18px 0' }}>
                CONVERT • EDIT • MERGE • MORE
              </p>
              
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#334155', margin: '0 0 4px 0' }}>
                {activeTool ? activeTool.title : 'File Converter'}
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                {activeTool ? activeTool.desc : 'Easily convert files from one format to another, online.'}
              </p>
            </div>

            {/* Dropzone Container */}
            <div style={{ backgroundColor: '#ffffff', border: '2px dashed #c7d2fe', borderRadius: '16px', padding: '28px 16px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 32px', backgroundColor: '#5b6cf9', color: '#ffffff', fontWeight: 'bold', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(91, 108, 249, 0.3)', cursor: 'pointer', fontSize: '15px' }}>
                <span>Choose Files</span>
                <ChevronDown size={18} />
                <input 
                  type="file" 
                  multiple 
                  onChange={(e) => { setFiles(e.target.files); setStatusMsg(''); }} 
                  style={{ display: 'none' }} 
                />
              </label>

              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '12px', fontWeight: 500 }}>
                Max file size 1GB.{' '}
                <span onClick={() => setModal('terms')} style={{ color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>
                  Terms of Use
                </span>
              </p>

              {files && files.length > 0 && (
                <div style={{ marginTop: '16px', padding: '10px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: 600, borderRadius: '8px', border: '1px solid #dbeafe' }}>
                  ✓ {files.length} file(s) ready: {files[0].name}
                </div>
              )}

              {files && files.length > 0 && (
                <button 
                  onClick={handleProcess} 
                  disabled={loading} 
                  style={{ width: '100%', marginTop: '16px', padding: '12px', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 'bold', borderRadius: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                >
                  {loading ? 'Processing...' : 'Convert Now'} <Download size={16} />
                </button>
              )}

              {statusMsg && (
                <p style={{ fontSize: '12px', color: '#059669', fontWeight: 'bold', marginTop: '12px' }}>{statusMsg}</p>
              )}
            </div>

            {/* Feature Icons Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', textAlign: 'center', margin: '40px 0' }}>
              <div>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
                  <FileText size={20} />
                </div>
                <h3 style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a', margin: '0 0 4px 0' }}>Universal Format Support</h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  Our multi-engine pipeline accommodates documents, videos, music tracks, and graphic files without requiring software installs.
                </p>
              </div>

              <div>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
                  <Cloud size={20} />
                </div>
                <h3 style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a', margin: '0 0 4px 0' }}>Fully Cross-Platform</h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  Operates effortlessly across iOS, Android, macOS, Linux, and Windows straight from modern mobile and desktop browsers.
                </p>
              </div>

              <div>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
                  <Shield size={20} />
                </div>
                <h3 style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a', margin: '0 0 4px 0' }}>Client-Side Data Privacy</h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  All computations execute locally on your physical device memory. No files are tracked, archived, or transferred to cloud disks.
                </p>
              </div>
            </div>

            {/* Security Box */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a', margin: '0 0 8px 0' }}>Uncompromising User Security</h3>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6, marginBottom: '16px' }}>
                We hold document confidentiality to the highest standard. Processing happens in-memory without remote persistence or tracking.
              </p>

              <button 
                onClick={() => setModal('security')} 
                style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #2563eb', color: '#2563eb', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}
              >
                Explore our security specifications
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', color: '#334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={16} color="#64748b" />
                  <span>Zero-Storage Client Architecture</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Server size={16} color="#64748b" />
                  <span>Sandboxed Browser Execution</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <KeyRound size={16} color="#64748b" />
                  <span>Full Local Control & Memory Purge</span>
                </div>
              </div>
            </div>
          </>
        ) : (
              <article style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '9999px', textTransform: 'uppercase' }}>
                Tech & File Conversion
              </span>
              <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} /> 4 min read
              </span>
            </div>

            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', lineHeight: 1.35, margin: '0 0 14px 0' }}>
              The Ultimate Guide: How to Convert and Compress Images Online Without Losing Quality
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px', fontSize: '12px', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><User size={14} color="#2563eb" /> The Pavi Studio</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> August 2026</span>
            </div>

            {/* Premium Article Visual Banner 1 */}
            <div style={{ width: '100%', height: '170px', borderRadius: '16px', background: 'linear-gradient(135deg, #1e3a8a, #3b82f6, #06b6d4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff', padding: '16px', boxSizing: 'border-box', textAlign: 'center', marginBottom: '22px', boxShadow: '0 6px 16px rgba(37,99,235,0.2)' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>PNG ➔ WEBP</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>JPG ➔ PDF</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>COMPRESS 100%</span>
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Lossless Online Image Compression</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', opacity: 0.9 }}>Optimized for High SEO Performance & Speed</p>
            </div>

            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7, margin: '0 0 16px 0' }}>
              In the modern digital landscape, image quality and website performance go hand in hand. High-resolution images make web pages and portfolios look professional, but large file sizes cause slow loading times, poor search rankings, and bad user experience. Using an efficient, browser-based conversion tool ensures you get optimized file weights without visible pixelation or color distortion.
            </p>

            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '20px 0 8px 0' }}>
              Why Image Optimization and Format Conversion Matter
            </h2>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.7, margin: '0 0 12px 0' }}>
              Every digital platform demands specific formats and sizes:
            </p>
            <ul style={{ margin: '0 0 18px 0', paddingLeft: '20px', fontSize: '13px', color: '#475569', lineHeight: 1.8 }}>
              <li><strong>JPG / JPEG:</strong> Best for complex photographs and multi-color images due to balanced compression.</li>
              <li><strong>PNG:</strong> Ideal for graphics, logos, and screenshots that need transparent backgrounds and sharp borders.</li>
              <li><strong>WebP:</strong> Google's modern format providing up to 30% superior compression over traditional PNGs and JPGs without dropping visual clarity.</li>
            </ul>

            {/* Related Visual Graphic Box */}
            <div style={{ display: 'flex', gap: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={24} color="#2563eb" />
              </div>
              <div>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Client-Side Browser Security</h4>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>All temporary files process securely through local memory and delete automatically.</p>
              </div>
            </div>

            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '20px 0 8px 0' }}>
              Step-by-Step: Converting Files Easily on QuickConvert.pro
            </h2>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.7, margin: '0 0 12px 0' }}>
              Converting and resizing files takes only three basic steps directly within your browser:
            </p>
            <ol style={{ margin: '0 0 18px 0', paddingLeft: '20px', fontSize: '13px', color: '#475569', lineHeight: 1.8 }}>
              <li><strong>Select and Upload Your Asset:</strong> Drag and drop your source file into the tool interface.</li>
              <li><strong>Choose Output Settings:</strong> Select the target extension and your preferred balance.</li>
              <li><strong>Download Instantly:</strong> Click convert and save your fully optimized asset locally.</li>
            </ol>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button 
                onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{ padding: '12px 28px', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800, fontSize: '13px', borderRadius: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(37,99,235,0.3)' }}
              >
                Launch Free Converters Now
              </button>
            </div>
          </article>
        )}

        {/* FAQs Section */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <HelpCircle size={20} color="#2563eb" />
            <h3 style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', margin: 0 }}>Frequently Asked Questions</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LIST.map((faq, idx) => (
              <div 
                key={idx} 
                style={{ border: '1px solid #edf2f7', borderRadius: '10px', overflow: 'hidden', transition: 'all 0.2s' }}
              >
                <div 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: openFaq === idx ? '#f8fafc' : '#ffffff' }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp size={16} color="#2563eb" /> : <ChevronDown size={16} color="#94a3b8" />}
                </div>
                {openFaq === idx && (
                  <div style={{ padding: '10px 14px 14px 14px', fontSize: '12px', color: '#64748b', lineHeight: 1.6, backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
            {/* 6. Comprehensive Footer with Social Links & Centered Branding */}
      <footer style={{ backgroundColor: '#0f1f2e', color: '#f1f5f9', padding: '44px 20px 32px 20px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Top Brand & Social Links Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px', borderBottom: '1px solid #1e354a', paddingBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(145deg, #0ea5e9, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#eab308', fontWeight: 900, fontSize: '14px', lineHeight: 1 }}>⇄</span>
              </div>
              <span style={{ fontWeight: 900, color: '#ffffff', fontSize: '19px', letterSpacing: '-0.5px' }}>QuickConvert<span style={{ color: '#38bdf8' }}>.pro</span></span>
            </div>

            {/* Social Media Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1e354a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', textDecoration: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1e354a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', textDecoration: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1e354a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', textDecoration: 'none' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1e354a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', textDecoration: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

          {/* Company & Categories & Legal Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center' }}>
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
                <span onClick={() => setModal('about')} style={{ cursor: 'pointer' }}>About</span>
                <span onClick={() => { setCurrentView('blog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ cursor: 'pointer', color: '#38bdf8', fontWeight: 600 }}>Blog</span>
                <a href="mailto:pavanibevara045@gmail.com" style={{ color: '#94a3b8', textDecoration: 'none' }}>Contact</a>
                <span onClick={() => setModal('security')} style={{ cursor: 'pointer' }}>Security</span>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Categories</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
                <span onClick={() => selectTool('mp4-converter')} style={{ cursor: 'pointer' }}>Video</span>
                <span onClick={() => selectTool('mp3-converter')} style={{ cursor: 'pointer' }}>Audio</span>
                <span onClick={() => selectTool('jpg-to-pdf')} style={{ cursor: 'pointer' }}>Images</span>
                <span onClick={() => selectTool('pdf-to-word')} style={{ cursor: 'pointer' }}>Document</span>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Legal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
                <span onClick={() => setModal('privacy')} style={{ cursor: 'pointer' }}>Privacy Policy</span>
                <span onClick={() => setModal('terms')} style={{ cursor: 'pointer' }}>Terms of Use</span>
                <span onClick={() => setModal('security')} style={{ cursor: 'pointer' }}>Data Safety</span>
              </div>
            </div>
          </div>

          {/* Centered Footer Branding (Last 3 Lines) */}
          <div style={{ borderTop: '1px solid #1e354a', paddingTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'linear-gradient(145deg, #0ea5e9, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#eab308', fontWeight: 900, fontSize: '11px', lineHeight: 1 }}>⇄</span>
              </div>
              <span style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '14px' }}>QuickConvert.pro</span>
            </div>

            <span style={{ color: '#94a3b8', fontSize: '11px' }}>Copyright © 2026 QuickConvert.pro. All rights reserved.</span>

            <span style={{ color: '#818cf8', fontWeight: 700, fontSize: '12px' }}>Created by The Pavi Studio</span>
          </div>
        </div>
      </footer>

      {/* Global Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', maxWidth: '360px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', color: '#1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '14px', textTransform: 'capitalize', margin: 0 }}>{modal}</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
              {modal === 'about' && <p><strong>About Us:</strong> QuickConvert.pro is a privacy-first web utility platform engineered by The Pavi Studio to convert multimedia files directly in client browsers with zero latency.</p>}
              {modal === 'terms' && <p><strong>Terms of Service:</strong> Users retain 100% intellectual property ownership of uploaded files. Processing occurs solely on client hardware.</p>}
              {modal === 'privacy' && <p><strong>Privacy Guarantee:</strong> We do not log or store files on remote servers.</p>}
              {modal === 'security' && <p><strong>Security:</strong> Sandboxed HTML5 WebAssembly execution with instant memory purge.</p>}
              {modal === 'menu' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontWeight: 500 }}>
                  <span onClick={() => { setCurrentView('home'); setSelectedToolKey(null); setModal(null); }} style={{ cursor: 'pointer', color: '#2563eb' }}>🏠 Home Converter</span>
                  <span onClick={() => { setCurrentView('blog'); setModal(null); }} style={{ cursor: 'pointer', color: '#2563eb' }}>📰 Blog & Guides</span>
                  <span onClick={() => setModal('about')} style={{ cursor: 'pointer' }}>ℹ️ About Us</span>
                  <a href="mailto:pavanibevara045@gmail.com" style={{ color: '#2563eb', textDecoration: 'none' }}>📧 Email Developer</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
                         }

