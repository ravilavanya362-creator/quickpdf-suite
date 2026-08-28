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
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. JPG to PDF State
  const [images, setImages] = useState<{ id: string; file: File; preview: string }[]>([]);

  // 2. Merge PDF State
  const [mergeFiles, setMergeFiles] = useState<{ id: string; file: File; name: string; size: string }[]>([]);

  // 3. Split PDF State
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitRange, setSplitRange] = useState('');
  const [splitTotalPages, setSplitTotalPages] = useState<number | null>(null);

  // 4. Compress Image State
  const [compressFile, setCompressFile] = useState<File | null>(null);
  const [compressQuality, setCompressQuality] = useState(70);
  const [compressedResultUrl, setCompressedResultUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<string>('');
  const [compressedSize, setCompressedSize] = useState<string>('');

  // TOOL 1: JPG to PDF Handler
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
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `QuickPDF-Images-${Date.now()}.pdf`);
    } catch (err) {
      alert('Error creating PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  // TOOL 2: Merge PDF Handler
  const handleMergeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      }));
      setMergeFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const mergePDFs = async () => {
    if (mergeFiles.length < 2) {
      alert('Please add at least 2 PDF files to merge.');
      return;
    }
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const fileObj of mergeFiles) {
        const fileBytes = await fileObj.file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedBytes = await mergedPdf.save();
      downloadBlob(new Blob([mergedBytes], { type: 'application/pdf' }), `Merged-${Date.now()}.pdf`);
    } catch (err) {
      alert('Failed to merge PDFs.');
    } finally {
      setIsProcessing(false);
    }
  };

  // TOOL 3: Split PDF Handler
  const handleSplitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSplitFile(file);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const doc = await PDFDocument.load(arrayBuffer);
        setSplitTotalPages(doc.getPageCount());
      } catch (err) {
        alert('Invalid PDF file.');
      }
    }
  };

  const splitPDF = async () => {
    if (!splitFile || !splitTotalPages) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await splitFile.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const newDoc = await PDFDocument.create();

      let pagesToExtract: number[] = [];
      if (!splitRange.trim()) {
        pagesToExtract = Array.from({ length: splitTotalPages }, (_, i) => i);
      } else {
        const parts = splitRange.split(',');
        for (const part of parts) {
          const trimmed = part.trim();
          if (trimmed.includes('-')) {
            const [start, end] = trimmed.split('-').map((n) => parseInt(n));
            if (!isNaN(start) && !isNaN(end)) {
              for (let i = Math.max(1, start); i <= Math.min(splitTotalPages, end); i++) {
                pagesToExtract.push(i - 1);
              }
            }
          } else {
            const pageNum = parseInt(trimmed);
            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= splitTotalPages) {
              pagesToExtract.push(pageNum - 1);
            }
          }
        }
      }

      const uniquePages = Array.from(new Set(pagesToExtract)).sort((a, b) => a - b);
      if (uniquePages.length === 0) {
        alert('Please enter valid page numbers.');
        setIsProcessing(false);
        return;
      }

      const copiedPages = await newDoc.copyPages(srcDoc, uniquePages);
      copiedPages.forEach((page) => newDoc.addPage(page));
      const newBytes = await newDoc.save();
      downloadBlob(new Blob([newBytes], { type: 'application/pdf' }), `Split-${Date.now()}.pdf`);
    } catch (err) {
      alert('Error splitting PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  // TOOL 4: Compress Image Handler
  const handleCompressUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCompressFile(file);
      setOriginalSize((file.size / 1024).toFixed(1) + ' KB');
      setCompressedResultUrl(null);
    }
  };

  const compressImageFile = () => {
    if (!compressFile) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.readAsDataURL(compressFile);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setCompressedSize((blob.size / 1024).toFixed(1) + ' KB');
              const url = URL.createObjectURL(blob);
              setCompressedResultUrl(url);
            }
            setIsProcessing(false);
          },
          'image/jpeg',
          compressQuality / 100
        );
      };
    };
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
              return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">Q</div>
            <span className="font-extrabold text-xl tracking-tight text-white">QuickPDF<span className="text-indigo-400">.</span></span>
          </div>
          <button onClick={() => setModalType('contact')} className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700">Contact</button>
        </div>
      </header>

      <section className="pt-8 pb-4 px-4 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side Privacy
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">Fast & Private PDF Tools</h1>
        <p className="text-slate-400 text-xs sm:text-sm">Convert, merge, split, and compress files locally in your browser.</p>
      </section>

      <main className="flex-1 max-w-md w-full mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl mb-6">
          <button onClick={() => setActiveTab('jpg-to-pdf')} className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${activeTab === 'jpg-to-pdf' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><FileImage className="w-4 h-4"/> JPG to PDF</button>
          <button onClick={() => setActiveTab('merge')} className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${activeTab === 'merge' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><Files className="w-4 h-4"/> Merge PDF</button>
          <button onClick={() => setActiveTab('split')} className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${activeTab === 'split' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><Scissors className="w-4 h-4"/> Split PDF</button>
          <button onClick={() => setActiveTab('compress')} className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${activeTab === 'compress' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><Minimize2 className="w-4 h-4"/> Compress</button>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl">
          {activeTab === 'jpg-to-pdf' && (
            <div>
              <label className="border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 block text-center">
                <FileImage className="w-8 h-8 text-indigo-400 mb-2 mx-auto" />
                <span className="text-sm font-bold text-white">Tap to Select Images</span>
                <span className="text-xs text-slate-500 mt-1">Supports JPG, PNG</span>
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
                        <button onClick={() => setImages(images.filter((i) => i.id !== img.id))} className="absolute top-1 right-1 bg-black/70 p-1 rounded-full text-rose-400"><Trash2 className="w-3 h-3"/></button>
                      </div>
                    ))}
                  </div>
                  <button onClick={convertImagesToPDF} disabled={isProcessing} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                    {isProcessing ? 'Generating PDF...' : 'Convert & Download PDF'} <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'merge' && (
            <div>
              <label className="border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 block text-center">
                <Files className="w-8 h-8 text-indigo-400 mb-2 mx-auto" />
                <span className="text-sm font-bold text-white">Select PDF Files</span>
                <span className="text-xs text-slate-500 mt-1">Select 2 or more PDF documents</span>
                <input type="file" multiple accept="application/pdf" onChange={handleMergeUpload} className="hidden" />
              </label>

              {mergeFiles.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400">{mergeFiles.length} files selected</span>
                    <button onClick={() => setMergeFiles([])} className="text-xs text-rose-400">Clear</button>
                  </div>
                  <div className="space-y-2 mb-4">
                    {mergeFiles.map((f) => (
                      <div key={f.id} className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                        <div className="truncate text-xs font-medium text-slate-300 max-w-[200px]">
                          {f.name} <span className="text-slate-500 block text-[10px]">{f.size}</span>
                        </div>
                        <button onClick={() => setMergeFiles(mergeFiles.filter((item) => item.id !== f.id))} className="text-rose-400 p-1"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                    ))}
                  </div>
                  <button onClick={mergePDFs} disabled={isProcessing || mergeFiles.length < 2} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                    {isProcessing ? 'Merging PDFs...' : 'Merge & Download PDF'} <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'split' && (
            <div>
              {!splitFile ? (
                <label className="border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 block text-center">
                  <Scissors className="w-8 h-8 text-indigo-400 mb-2 mx-auto" />
                  <span className="text-sm font-bold text-white">Select PDF to Split</span>
                  <span className="text-xs text-slate-500 mt-1">Upload single PDF file</span>
                  <input type="file" accept="application/pdf" onChange={handleSplitUpload} className="hidden" />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div>
                      <p className="text-xs font-semibold text-white truncate max-w-[200px]">{splitFile.name}</p>
                      <p className="text-[10px] text-indigo-400">Total Pages: {splitTotalPages || '...'}</p>
                    </div>
                    <button onClick={() => { setSplitFile(null); setSplitTotalPages(null); }} className="text-rose-400 text-xs">Remove</button>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Page Range (e.g. 1-3, 5)</label>
                    <input type="text" placeholder={`1-${splitTotalPages || 1}`} value={splitRange} onChange={(e) => setSplitRange(e.target.value)} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"/>
                  </div>
                  <button onClick={splitPDF} disabled={isProcessing} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                    {isProcessing ? 'Extracting...' : 'Extract & Download'} <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'compress' && (
            <div>
              {!compressFile ? (
                <label className="border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 block text-center">
                  <Minimize2 className="w-8 h-8 text-indigo-400 mb-2 mx-auto" />
                  <span className="text-sm font-bold text-white">Select Image to Compress</span>
                  <span className="text-xs text-slate-500 mt-1">JPG, PNG</span>
                  <input type="file" accept="image/jpeg,image/png" onChange={handleCompressUpload} className="hidden" />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="truncate max-w-[200px]">
                      <p className="text-xs font-semibold text-white truncate">{compressFile.name}</p>
                      <p className="text-[10px] text-slate-400">Original: {originalSize}</p>
                    </div>
                    <button onClick={() => { setCompressFile(null); setCompressedResultUrl(null); }} className="text-rose-400 text-xs">Remove</button>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span>Quality:</span>
                      <span className="text-indigo-400">{compressQuality}%</span>
                    </div>
                    <input type="range" min="10" max="90" value={compressQuality} onChange={(e) => setCompressQuality(Number(e.target.value))} className="w-full accent-indigo-500 cursor-pointer"/>
                  </div>
                  <button onClick={compressImageFile} disabled={isProcessing} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs">
                    {isProcessing ? 'Compressing...' : 'Compress Image'}
                  </button>
                  {compressedResultUrl && (
                    <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-center">
                      <p className="text-xs text-emerald-400 font-bold mb-2">Compressed: {compressedSize}</p>
                      <a href={compressedResultUrl} download={`compressed-${Date.now()}.jpg`} className="inline-flex items-center gap-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs">
                        Download Image <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}
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
              {modalType === 'privacy' && 'Zero Data Collection: Files are processed locally inside your browser.'}
              {modalType === 'terms' && 'QuickPDF Suite is free to use. All processing occurs on the client device.'}
              {modalType === 'about' && 'QuickPDF is an ultra-fast, privacy-first PDF utility suite.'}
              {modalType === 'disclaimer' && 'All document operations are performed on the user device.'}
              {modalType === 'contact' && 'Support and feedback email: support@quickpdf.local'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
