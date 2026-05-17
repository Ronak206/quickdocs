"use client";

import { useState, useEffect } from "react";
import { pdf } from "@react-pdf/renderer";
import { PDFDocument } from "./PDFDocument";
import type { TemplateElement } from "./types";

interface PDFPreviewModalProps {
  title: string;
  elements: TemplateElement[];
  pageSize?: "A4" | "Letter" | "Legal";
  orientation?: "portrait" | "landscape";
  open: boolean;
  onClose: () => void;
}

export function PDFPreviewModal({ 
  title, 
  elements, 
  pageSize = "A4", 
  orientation = "portrait",
  open, 
  onClose 
}: PDFPreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let objectUrl: string | null = null;

    const generate = async () => {
      setLoading(true);
      setError(null);
      try {
        const blob = await pdf(
          <PDFDocument 
            title={title} 
            elements={elements} 
            pageSize={pageSize}
            orientation={orientation}
          />
        ).toBlob();
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (err) {
        console.error("Preview failed:", err);
        setError("Failed to generate PDF preview");
      } finally {
        setLoading(false);
      }
    };

    generate();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setPdfUrl(null);
      setError(null);
    };
  }, [open, elements, title, pageSize, orientation]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col w-full max-w-4xl h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-sm text-gray-900 dark:text-white">
            {title} — PDF Preview
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg leading-none p-1"
          >
            ✕
          </button>
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
