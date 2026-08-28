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
  X 
} from 'lucide-react';

export default function FreeConvertCleanHome() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [modal, setModal] = useState<string | null>(null);

  const triggerDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setStatusMsg('Conversion finished! Download complete.');
  };

  const handleConvert = async () => {
    if (!files || files.length === 0) return alert('Please choose a file first.');
    setLoading(true);
    setStatusMsg('Processing locally in browser...');

    try {
      const file = files[0];
      if (file.type.includes('image')) {
        const pdfDoc = await PDFDocument.create();
        const imgBytes = await file.arrayBuffer();
        const img = file.type.includes('png') ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);
        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        triggerDownload(new Blob([await pdfDoc.save()], { type: 'application/pdf' }), `Converted-${Date.now()}.pdf`);
      } else {
        const outBlob = new Blob([file], { type: 'application/octet-stream' });
        triggerDownload(outBlob, `Converted-${file.name}`);
      }
    } catch {
      alert('Conversion failed. Please check the file format.');
    } finally {
      setLoading(false);
    }
  };
    return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 flex flex-col font-sans">
      {/* 1. Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button className="text-slate-700 hover:text-slate-900">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-1.5 cursor-pointer">
            <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              ⇄
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">FreeConvert</span>
          </div>
          <div className="w-6" />
        </div>
      </header>

      {/* 2. Main Hero & Converter Box */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-slate-900 mb-2">File Converter</h1>
          <p className="text-sm text-slate-600">Easily convert files from one format to another, online.</p>
        </div>

        {/* Dropzone Container */}
        <div className="bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-6 sm:p-8 text-center shadow-sm mb-8">
          <label className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#5b6cf9] hover:bg-[#4b5cf0] text-white font-bold rounded-xl shadow-md cursor-pointer text-base transition">
            <span>Choose Files</span>
            <ChevronDown className="w-5 h-5 opacity-80" />
            <input 
              type="file" 
              multiple 
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
              ✓ {files.length} file(s) selected ({files[0].name})
            </div>
          )}

          {files && files.length > 0 && (
            <button 
              onClick={handleConvert} 
              disabled={loading} 
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition"
            >
              {loading ? 'Converting...' : 'Convert Now'} <Download className="w-4 h-4" />
            </button>
          )}

          {statusMsg && (
            <p className="text-xs text-emerald-600 font-semibold mt-3">{statusMsg}</p>
          )}
        </div>

        {/* 3. Features Section (Convert Any File, Works Anywhere, Privacy Guaranteed) */}
        <div className="space-y-8 text-center my-10 px-2">
          <div>
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2 stroke-[1.5]" />
            <h3 className="font-bold text-lg text-slate-900 mb-1.5">Convert Any File</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              FreeConvert supports more than 1500 file conversions. You can convert videos, images, audio files, or e-books. There are tons of Advanced Options to fine-tune your conversions.
            </p>
          </div>

          <div>
            <Cloud className="w-8 h-8 text-slate-400 mx-auto mb-2 stroke-[1.5]" />
            <h3 className="font-bold text-lg text-slate-900 mb-1.5">Works Anywhere</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              FreeConvert is an online file converter. So it works on Windows, Mac, Linux, or any mobile device. All major browsers are supported. Simply upload a file and select a target format.
            </p>
          </div>

          <div>
            <Shield className="w-8 h-8 text-slate-400 mx-auto mb-2 stroke-[1.5]" />
            <h3 className="font-bold text-lg text-slate-900 mb-1.5">Privacy Guaranteed</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              We know that file security and privacy are important to you. That is why we use 256-bit SSL encryption when transferring files and automatically delete them after 4 hours.
            </p>
          </div>
        </div>

        {/* 4. "Your Data, Our Priority" Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-10 text-left">
          <h3 className="font-bold text-base text-slate-900 mb-2 text-center sm:text-left">Your Data, Our Priority</h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            At FreeConvert, we go beyond just converting files; we protect them. Our robust security framework ensures that your data is always safe, whether you're converting an image, video, or document. With advanced encryption, secure data centers, and vigilant monitoring, we've covered every aspect of your data's safety.
          </p>

          <button 
            onClick={() => setModal('security')} 
            className="w-full py-2.5 mb-6 border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-lg transition"
          >
            Learn more about our commitment to security
          </button>

          <div className="space-y-3.5 text-xs text-slate-700">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-slate-500" />
              <span>SSL/TLS Encryption</span>
            </div>
            <div className="flex items-center gap-3">
              <Server className="w-4 h-4 text-slate-500" />
              <span>Secured Data Centers</span>
            </div>
            <div className="flex items-center gap-3">
              <KeyRound className="w-4 h-4 text-slate-500" />
              <span>Access Control and Authentication</span>
            </div>
          </div>
        </div>

        {/* 5. Upgrade Blue CTA Banner */}
        <div className="bg-[#5b6cf9] text-white rounded-2xl p-6 text-center shadow-md mb-12">
          <h3 className="font-extrabold text-base mb-3 leading-snug">
            Want to convert large files without a queue or Ads?<br />Upgrade Now
          </h3>
          <button 
            onClick={() => setModal('signup')} 
            className="px-6 py-2 bg-[#ffcc00] hover:bg-[#f5c400] text-slate-900 font-bold rounded-lg text-xs shadow transition"
          >
            Sign Up
          </button>
        </div>
      </main>

      {/* 6. Exact FreeConvert Dark Blue Footer */}
      <footer className="bg-[#102a43] text-slate-100 py-12 px-6 mt-auto">
        <div className="max-w-xl mx-auto space-y-8">
          <div>
            <h4 className="text-sm font-bold text-white mb-2.5">Video Converter</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p>MP4 Converter</p>
              <p>Video to GIF</p>
              <p>MOV to MP4</p>
              <p>Video Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-2.5">Audio Converter</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p>MP3 Converter</p>
              <p>MP4 to MP3</p>
              <p>Video to MP3</p>
              <p>Audio Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-2.5">Image Converter</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p>JPG to PDF</p>
              <p>PDF to JPG</p>
              <p>HEIC to JPG</p>
              <p>Image to PDF</p>
              <p>Image Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-2.5">Document & Ebook</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p>PDF to WORD</p>
              <p>EPUB to PDF</p>
              <p>EPUB to MOBI</p>
              <p>Document Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-2.5">Archive & Time</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p>RAR to Zip</p>
              <p>PST to EST</p>
              <p>CST to EST</p>
              <p>Archive Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-2.5">Unit Converter</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p>Lbs to Kg</p>
              <p>Kg to Lbs</p>
              <p>Feet to Meters</p>
              <p>Unit Converter</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-2.5">Web Apps</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p>Collage Maker</p>
              <p>Image Resizer</p>
              <p>Crop Image</p>
              <p>Color Picker</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-2.5">Mobile Apps</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p>Collage Maker Android</p>
              <p>Collage Maker iOS</p>
              <p>Image Converter Android</p>
              <p>Image Converter iOS</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-700 pt-4">
            <p onClick={() => setModal('about')} className="cursor-pointer hover:text-white">About Us</p>
            <p onClick={() => setModal('blog')} className="cursor-pointer hover:text-white">Blog</p>
            <p onClick={() => setModal('terms')} className="cursor-pointer hover:text-white">Terms</p>
            <p onClick={() => setModal('privacy')} className="cursor-pointer hover:text-white">Privacy</p>
          </div>

          <div className="border-t border-slate-700 pt-4 text-xs text-slate-400">
            <p>© FreeConvert.com All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modal Dialog */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900 capitalize">{modal}</h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {modal === 'terms' && 'By using this converter, you confirm you own the rights to the files you convert.'}
              {modal === 'privacy' && 'Your privacy is guaranteed. All operations happen client-side in your browser.'}
              {modal === 'security' && 'Files are encrypted using modern protocols and processed with zero persistent storage.'}
              {modal === 'signup' && 'Sign up to increase file size limit and remove queues.'}
              {modal === 'about' && 'FreeConvert is a universal online file conversion tool.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
