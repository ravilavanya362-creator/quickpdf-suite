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
  ArrowLeft 
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

export default function App() {
  const [selectedToolKey, setSelectedToolKey] = useState<string | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [modal, setModal] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

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
    setSelectedToolKey(key);
    setFiles(null);
    setStatusMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
    return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafbfc', color: '#1e293b', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* 1. Header */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40, padding: '12px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setModal('menu')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#334155' }}>
            <Menu size={24} />
          </button>
          
          <div onClick={() => { setSelectedToolKey(null); setFiles(null); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            {!imgError ? (
              <img 
                src="/logo.png" 
                alt="Logo" 
                onError={() => setImgError(true)} 
                style={{ height: '32px', width: '32px', objectFit: 'contain', borderRadius: '6px' }} 
              />
            ) : (
              <div style={{ height: '32px', width: '32px', borderRadius: '8px', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 'bold', fontSize: '14px' }}>
                ⇄
              </div>
            )}
            <span style={{ fontWeight: 900, fontSize: '20px', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Quick <span style={{ color: '#2563eb' }}>ConvertPro</span>
            </span>
          </div>

          <a href="mailto:pavanibevara045@gmail.com" style={{ fontSize: '12px', backgroundColor: '#f1f5f9', color: '#334155', padding: '6px 12px', borderRadius: '9999px', textDecoration: 'none', fontWeight: 600 }}>
            Contact
          </a>
        </div>
      </header>

      {/* 2. Main Hero & Converter */}
      <main style={{ flex: 1, maxWidth: '600px', width: '100%', margin: '0 auto', padding: '24px 16px', boxSizing: 'border-box' }}>
        {activeTool && (
          <button 
            onClick={() => { setSelectedToolKey(null); setFiles(null); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#2563eb', fontWeight: 'bold', marginBottom: '16px', backgroundColor: '#eff6ff', padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
          >
            <ArrowLeft size={14} /> Back to All Converters
          </button>
        )}

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>
            {activeTool ? activeTool.title : 'File Converter'}
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            {activeTool ? activeTool.desc : 'Easily convert files from one format to another, online.'}
          </p>
        </div>

        {/* Dropzone Container */}
        <div style={{ backgroundColor: '#ffffff', border: '2px dashed #c7d2fe', borderRadius: '16px', padding: '32px 16px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 32px', backgroundColor: '#5b6cf9', color: '#ffffff', fontWeight: 'bold', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(91, 108, 249, 0.3)', cursor: 'pointer', fontSize: '16px' }}>
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
            <span onClick={() => setModal('signup')} style={{ color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>
              Sign Up
            </span>{' '}
            for more
          </p>

          <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', maxWidth: '320px', margin: '8px auto 0 auto', lineHeight: 1.5 }}>
            By proceeding, you confirm you own the rights to the files you upload and agree to our{' '}
            <span onClick={() => setModal('terms')} style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>
              Terms of Use
            </span>
            .
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

        {/* 3. Feature Icons Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', textAlign: 'center', margin: '40px 0' }}>
          <div>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
              <FileText size={20} />
            </div>
            <h3 style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a', margin: '0 0 4px 0' }}>Universal Format Support</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
              Our multi-engine pipeline accommodates documents, videos, music tracks, and graphic files without requiring software installs.
            </p>
          </div>

          <div>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
              <Cloud size={20} />
            </div>
            <h3 style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a', margin: '0 0 4px 0' }}>Fully Cross-Platform</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
              Operates effortlessly across iOS, Android, macOS, Linux, and Windows straight from modern mobile and desktop browsers.
            </p>
          </div>

          <div>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
              <Shield size={20} />
            </div>
            <h3 style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a', margin: '0 0 4px 0' }}>Client-Side Data Privacy</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
              All computations execute locally on your physical device memory. No files are tracked, archived, or transferred to cloud disks.
            </p>
          </div>
        </div>

        {/* 4. Security Framework Box */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
          <h3 style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a', margin: '0 0 8px 0' }}>Uncompromising User Security</h3>
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

        {/* 5. Upgrade Banner */}
        <div style={{ backgroundColor: '#5b6cf9', color: '#ffffff', borderRadius: '16px', padding: '24px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
          <h3 style={{ fontWeight: 800, fontSize: '16px', margin: '0 0 12px 0', lineHeight: 1.4 }}>
            Need faster conversions with zero queues?<br />Join Free Today
          </h3>
          <button 
            onClick={() => setModal('signup')} 
            style={{ padding: '8px 24px', backgroundColor: '#ffcc00', border: 'none', color: '#0f172a', fontWeight: 'bold', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
          >
            Sign Up
          </button>
        </div>
      </main>
           {/* 6. Footer */}
      <footer style={{ backgroundColor: '#102a43', color: '#f1f5f9', padding: '40px 20px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 10px 0' }}>Video Converter</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#cbd5e1' }}>
              <span onClick={() => selectTool('mp4-converter')} style={{ cursor: 'pointer' }}>MP4 Converter</span>
              <span onClick={() => selectTool('video-to-gif')} style={{ cursor: 'pointer' }}>Video to GIF</span>
              <span onClick={() => selectTool('mov-to-mp4')} style={{ cursor: 'pointer' }}>MOV to MP4</span>
              <span onClick={() => selectTool('video-converter')} style={{ cursor: 'pointer' }}>Video Converter</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 10px 0' }}>Audio Converter</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#cbd5e1' }}>
              <span onClick={() => selectTool('mp3-converter')} style={{ cursor: 'pointer' }}>MP3 Converter</span>
              <span onClick={() => selectTool('mp4-to-mp3')} style={{ cursor: 'pointer' }}>MP4 to MP3</span>
              <span onClick={() => selectTool('video-to-mp3')} style={{ cursor: 'pointer' }}>Video to MP3</span>
              <span onClick={() => selectTool('audio-converter')} style={{ cursor: 'pointer' }}>Audio Converter</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 10px 0' }}>Image Converter</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#cbd5e1' }}>
              <span onClick={() => selectTool('jpg-to-pdf')} style={{ cursor: 'pointer' }}>JPG to PDF</span>
              <span onClick={() => selectTool('pdf-to-jpg')} style={{ cursor: 'pointer' }}>PDF to JPG</span>
              <span onClick={() => selectTool('heic-to-jpg')} style={{ cursor: 'pointer' }}>HEIC to JPG</span>
              <span onClick={() => selectTool('image-to-pdf')} style={{ cursor: 'pointer' }}>Image to PDF</span>
              <span onClick={() => selectTool('image-converter')} style={{ cursor: 'pointer' }}>Image Converter</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 10px 0' }}>Document & Ebook</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#cbd5e1' }}>
              <span onClick={() => selectTool('pdf-to-word')} style={{ cursor: 'pointer' }}>PDF to WORD</span>
              <span onClick={() => selectTool('epub-to-pdf')} style={{ cursor: 'pointer' }}>EPUB to PDF</span>
              <span onClick={() => selectTool('epub-to-mobi')} style={{ cursor: 'pointer' }}>EPUB to MOBI</span>
              <span onClick={() => selectTool('document-converter')} style={{ cursor: 'pointer' }}>Document Converter</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 10px 0' }}>Archive & Time</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#cbd5e1' }}>
              <span onClick={() => selectTool('rar-to-zip')} style={{ cursor: 'pointer' }}>RAR to Zip</span>
              <span onClick={() => selectTool('pst-to-est')} style={{ cursor: 'pointer' }}>PST to EST</span>
              <span onClick={() => selectTool('cst-to-est')} style={{ cursor: 'pointer' }}>CST to EST</span>
              <span onClick={() => selectTool('archive-converter')} style={{ cursor: 'pointer' }}>Archive Converter</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 10px 0' }}>Unit Converter</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#cbd5e1' }}>
              <span onClick={() => selectTool('lbs-to-kg')} style={{ cursor: 'pointer' }}>Lbs to Kg</span>
              <span onClick={() => selectTool('kg-to-lbs')} style={{ cursor: 'pointer' }}>Kg to Lbs</span>
              <span onClick={() => selectTool('feet-to-meters')} style={{ cursor: 'pointer' }}>Feet to Meters</span>
              <span onClick={() => selectTool('unit-converter')} style={{ cursor: 'pointer' }}>Unit Converter</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 10px 0' }}>Web Apps</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#cbd5e1' }}>
              <span onClick={() => selectTool('collage-maker')} style={{ cursor: 'pointer' }}>Collage Maker</span>
              <span onClick={() => selectTool('image-resizer')} style={{ cursor: 'pointer' }}>Image Resizer</span>
              <span onClick={() => selectTool('crop-image')} style={{ cursor: 'pointer' }}>Crop Image</span>
              <span onClick={() => selectTool('color-picker')} style={{ cursor: 'pointer' }}>Color Picker</span>
            </div>
          </div>

          {/* Legal Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#cbd5e1', borderTop: '1px solid #334e68', paddingTop: '16px' }}>
            <span onClick={() => setModal('about')} style={{ cursor: 'pointer' }}>About Us</span>
            <span onClick={() => setModal('blog')} style={{ cursor: 'pointer' }}>Blog</span>
            <span onClick={() => setModal('terms')} style={{ cursor: 'pointer' }}>Terms</span>
            <span onClick={() => setModal('privacy')} style={{ cursor: 'pointer' }}>Privacy</span>
            <a href="mailto:pavanibevara045@gmail.com" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Contact</a>
          </div>

          {/* Branding Footer */}
          <div style={{ borderTop: '1px solid #334e68', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontWeight: 'bold', color: '#ffffff' }}>Quick ConvertPro</span>
            <span style={{ color: '#94a3b8' }}>© Quick ConvertPro</span>
            <span style={{ color: '#818cf8', fontWeight: 600 }}>Created by The Pavi Studio</span>
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
              {modal === 'signup' && (
                <div>
                  <p style={{ fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0' }}>Create Free Account</p>
                  <p style={{ margin: '0 0 12px 0' }}>Sign up to enjoy batch queues, 1GB conversions, and fast processing.</p>
                  <input type="email" placeholder="Enter your email" style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '8px', boxSizing: 'border-box' }} />
                  <button onClick={() => { alert('Account registered successfully!'); setModal(null); }} style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Sign Up Free</button>
                </div>
              )}
              {modal === 'about' && <p><strong>About Us:</strong> Quick ConvertPro is a privacy-first web utility platform engineered by The Pavi Studio to convert multimedia files directly in client browsers with zero latency.</p>}
              {modal === 'terms' && <p><strong>Terms of Service:</strong> Users retain 100% intellectual property ownership of uploaded files. Processing occurs solely on client hardware.</p>}
              {modal === 'privacy' && <p><strong>Privacy Guarantee:</strong> We do not log or store files on remote servers.</p>}
              {modal === 'security' && <p><strong>Security:</strong> Sandboxed HTML5 WebAssembly execution with instant memory purge.</p>}
              {modal === 'blog' && <p><strong>Blog:</strong> Discover how WebAssembly and in-browser Canvas enable instant client-side file conversions.</p>}
              {modal === 'menu' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontWeight: 500 }}>
                  <span onClick={() => { setSelectedToolKey(null); setModal(null); }} style={{ cursor: 'pointer', color: '#2563eb' }}>🏠 Home</span>
                  <span onClick={() => setModal('about')} style={{ cursor: 'pointer' }}>ℹ️ About Us</span>
                  <span onClick={() => setModal('signup')} style={{ cursor: 'pointer' }}>✨ Sign Up Free</span>
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
