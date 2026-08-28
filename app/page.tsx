'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  FileImage, 
  Files, 
  Scissors, 
  Minimize2, 
  ShieldCheck, 
  Download, 
  Trash2, 
  X, 
  Mail, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';

export default function QuickPDFSuite() {
  const [activeTab, setActiveTab] = useState<'jpg-to-pdf' | 'merge' | 'split' | 'compress'>('jpg-to-pdf');
  const [modalType, setModalType] = useState<string | null>(null);
  const [images, setImages] = useState<{ id: string; file: File; preview: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const convertImagesToPDF = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const imgObj of images) {
        const imageBytes = await imgObj.file.arrayBuffer();
        let image;
        if (imgObj.file.type === 'image/jpeg' || imgObj.file.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(imageBytes);
        } else if (imgObj.file.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          continue;
        }
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QuickPDF-${Date.now()}.pdf`;
      a.click();
    } catch (err) {
      alert('Error creating PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              Q
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">QuickPDF<span className="text-indigo-400">.</span></span>
          </div>
          <button 
            onClick={() => setModalType('contact')} 
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700 transition"
          >
            Contact
          </button>
        </div>
      </header>

      <section className="pt-8 pb-4 px-4 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side (No Server Uploads)
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Fast & Private PDF Tools
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Convert, merge, split, and compress documents instantly inside your browser.
        </p>
      </section>

      <main className="flex-1 max-w-md w-full mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl mb-6">
          <button 
            onClick={() => setActiveTab('jpg-to-pdf')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'jpg-to-pdf' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileImage className="w-4 h-4" /> JPG to PDF
          </button>
          <button 
            onClick={() => setActiveTab('merge')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'merge' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Files className="w-4 h-4" /> Merge PDF
          </button>
          <button 
            onClick={() => setActiveTab('split')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'split' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scissors className="w-4 h-4" /> Split PDF
          </button>
          <button 
            onClick={() => setActiveTab('compress')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'compress' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Minimize2 className="w-4 h-4" /> Compress
          </button>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl">
          {activeTab === 'jpg-to-pdf' && (
            <div>
              <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 block text-center transition">
                <FileImage className="w-8 h-8 text-indigo-400 mb-2 mx-auto" />
                <span className="text-sm font-bold text-white">Tap to Select Images</span>
                <span className="text-xs text-slate-500 mt-1">Supports JPG, PNG (Unlimited Files)</span>
                <input type="file" multiple accept="image/jpeg,image/png" onChange={handleImageUpload} className="hidden" />
              </label>

              {images.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400">{images.length} images selected</span>
                    <button onClick={() => setImages([])} className="text-xs text-rose-400">Clear all</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {images.map((img) => (
                      <div key={img.id} className="relative rounded-lg overflow-hidden border border-slate-700 aspect-square">
                        <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeImage(img.id)}
                          className="absolute top-1 right-1 bg-black/70 p-1 rounded-full text-rose-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={convertImagesToPDF} 
                    disabled={isProcessing}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
                  >
                    {isProcessing ? 'Generating PDF...' : 'Convert & Download PDF'} <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'merge' && (
            <div className="text-center py-6 text-slate-400 text-xs">
              <Files className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-200 mb-3">Merge multiple PDF documents</p>
              <label className="py-2.5 px-4 bg-slate-800 text-white rounded-lg cursor-pointer border border-slate-700 inline-block font-medium">
                Select PDFs
                <input type="file" multiple accept="application/pdf" className="hidden" />
              </label>
            </div>
          )}

          {activeTab === 'split' && (
            <div className="text-center py-6 text-slate-400 text-xs">
              <Scissors className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-200 mb-3">Extract specific PDF pages</p>
              <label className="py-2.5 px-4 bg-slate-800 text-white rounded-lg cursor-pointer border border-slate-700 inline-block font-medium">
                Select PDF
                <input type="file" accept="application/pdf" className="hidden" />
              </label>
            </div>
          )}

          {activeTab === 'compress' && (
            <div className="text-center py-6 text-slate-400 text-xs">
              <Minimize2 className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-200 mb-3">Compress image file sizes</p>
              <label className="py-2.5 px-4 bg-slate-800 text-white rounded-lg cursor-pointer border border-slate-700 inline-block font-medium">
                Select Image
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-6">
          <div className="bg-slate-900/40 border border-slate-800 p-2.5 rounded-xl text-center">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-white block">100% Private</span>
            <span className="text-[9px] text-slate-400">Zero uploads</span>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-2.5 rounded-xl text-center">
            <CheckCircle2 className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-white block">Instant</span>
            <span className="text-[9px] text-slate-400">Browser speed</span>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-2.5 rounded-xl text-center">
            <HelpCircle className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-white block">Free</span>
            <span className="text-[9px] text-slate-400">No limits</span>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-500 max-w-md mx-auto w-full border-t border-slate-800/80">
        <div className="flex justify-center gap-3 mb-2 text-slate-400">
          <button onClick={() => setModalType('privacy')} className="hover:underline">Privacy</button>
          <button onClick={() => setModalType('terms')} className="hover:underline">Terms</button>
          <button onClick={() => setModalType('about')} className="hover:underline">About</button>
          <button onClick={() => setModalType('disclaimer')} className="hover:underline">Disclaimer</button>
        </div>
        <p>© 2026 QuickPDF Suite. All rights reserved.</p>
      </footer>

      {modalType && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white capitalize">{modalType}</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {modalType === 'privacy' && 'Zero Data Collection: Files are processed 100% locally inside your browser and never sent to any server.'}
              {modalType === 'terms' && 'QuickPDF Suite is free to use. All processing occurs on the client device without warranties.'}
              {modalType === 'about' && 'QuickPDF is an ultra-fast, privacy-first PDF utility suite created for instant conversions.'}
              {modalType === 'disclaimer' && 'All document operations are performed on the user device. Ensure you retain backups of your files.'}
              {modalType === 'contact' && 'Support and feedback email: support@quickpdf.local'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

