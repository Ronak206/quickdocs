"use client";

import { useState, useEffect, useCallback } from "react";
import type { TemplateElement } from "./types";

interface PDFPreviewModalProps {
  title: string;
  elements: TemplateElement[];
  pageSize?: "A4" | "Letter" | "Legal";
  orientation?: "portrait" | "landscape";
  open: boolean;
  onClose: () => void;
}

// Helper function to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export function PDFPreviewModal({ 
  title, 
  elements, 
  pageSize = "A4", 
  orientation = "portrait",
  open, 
  onClose 
}: PDFPreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePDF = useCallback(async () => {
    if (!open) return;
    
    setLoading(true);
    setError(null);
    setPdfBlob(null);
    
    let objectUrl: string | null = null;

    try {
      // Dynamic imports for browser-only modules
      const [{ pdf }, { PDFDocument }] = await Promise.all([
        import('@react-pdf/renderer').then(mod => ({ pdf: mod.pdf })),
        import('./PDFDocument').then(mod => ({ PDFDocument: mod.PDFDocument })),
      ]);

      const blob = await pdf(
        <PDFDocument 
          title={title} 
          elements={elements} 
          pageSize={pageSize}
          orientation={orientation}
        />
      ).toBlob();
      
      setPdfBlob(blob);
      objectUrl = URL.createObjectURL(blob);
      setPdfUrl(objectUrl);
    } catch (err) {
      console.error("Preview failed:", err);
      setError(err instanceof Error ? err.message : "Failed to generate PDF preview");
    } finally {
      setLoading(false);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [open, elements, title, pageSize, orientation]);

  useEffect(() => {
    if (open) {
      const cleanup = generatePDF();
      return () => {
        cleanup?.then(fn => fn?.());
      };
    } else {
      setPdfUrl(null);
      setPdfBlob(null);
      setError(null);
    }
  }, [open, generatePDF]);

  const handleDownload = async () => {
    if (!pdfBlob) return;
    
    setDownloading(true);
    
    try {
      // Convert to base64 for saving to downloads
      const base64 = await blobToBase64(pdfBlob);

      // Save to downloads table (this counts towards the limit)
      const response = await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'document',
          fileSize: pdfBlob.size,
          pdfData: base64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          alert(errorData.error || 'PDF limit reached for this month. Please upgrade your plan.');
          return;
        }
        console.error('Failed to save download:', errorData);
      }

      // Trigger the actual browser download
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'document'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('PDF downloaded successfully!');
    } catch (downloadError) {
      console.error('Download error:', downloadError);
      alert('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col w-full max-w-4xl h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-sm text-gray-900 dark:text-white">
            {title} — PDF Preview
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={!pdfBlob || downloading}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
            >
              {downloading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg leading-none p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* PDF iframe viewer */}
        <div className="flex-1 overflow-hidden rounded-b-xl bg-gray-100 dark:bg-gray-800">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <svg className="animate-spin w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rendering PDF...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3 text-red-500">
                <p className="text-sm">{error}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          )}
          
          {pdfUrl && !loading && !error && (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-none"
              title="PDF Preview"
            />
          )}
        </div>

      </div>
    </div>
  );
}
