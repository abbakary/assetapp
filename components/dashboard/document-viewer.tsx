'use client';

import { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Download, Loader, AlertCircle, Eye } from 'lucide-react';
import type { Document } from '@/lib/types';

interface DocumentViewerProps {
  document: Document | null;
  fileData?: string; // Base64 or data URL
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

export function DocumentViewer({ document, fileData, isOpen, onClose, onDownload }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setZoom(100);
    setImageLoaded(false);
    setError(null);
  }, [document]);

  if (!isOpen || !document) return null;

  const isPDF = document.name.toLowerCase().endsWith('.pdf');
  const isImage = ['photo'].includes(document.type) || /\.(jpg|jpeg|png|gif|webp)$/i.test(document.name);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const handleDownload = () => {
    if (fileData) {
      const link = document.createElement('a');
      link.href = fileData;
      link.download = document.name;
      link.click();
    }
    onDownload?.();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Eye className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="font-bold truncate">{document.name}</h2>
              <p className="text-xs text-muted-foreground">
                {document.type.toUpperCase()} • {document.size}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            {(isPDF || isImage) && (
              <>
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className="p-2 hover:bg-secondary rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-xs font-medium w-10 text-center">{zoom}%</span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className="p-2 hover:bg-secondary rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <div className="h-6 w-px bg-border mx-1" />
              </>
            )}
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-secondary rounded-md transition-colors"
              title="Download document"
            >
              <Download className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-md transition-colors" title="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Viewer Area */}
        <div className="flex-1 overflow-auto bg-secondary/10 flex items-center justify-center p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading document...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center gap-3 p-6 max-w-md">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <p className="text-sm text-muted-foreground text-center">{error}</p>
            </div>
          )}

          {!isLoading && !error && isImage && fileData && (
            <div className="flex items-center justify-center w-full h-full">
              <img
                src={fileData}
                alt={document.name}
                onLoad={() => setImageLoaded(true)}
                onError={() => setError('Failed to load image')}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  transform: `scale(${zoom / 100})`,
                  objectFit: 'contain',
                  opacity: imageLoaded ? 1 : 0,
                }}
                className="transition-opacity duration-300"
              />
            </div>
          )}

          {!isLoading && !error && isPDF && (
            <div className="max-w-2xl text-center space-y-4 p-8 bg-card rounded-lg border border-border">
              <AlertCircle className="h-12 w-12 text-amber-400 mx-auto" />
              <div>
                <h3 className="font-semibold mb-2">PDF Viewer</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  PDF documents will be displayed here in production using a dedicated PDF viewer library (PDF.js).
                </p>
                <div className="bg-secondary/50 rounded p-4 text-xs text-muted-foreground space-y-2 text-left">
                  <p>
                    <span className="font-mono">File: {document.name}</span>
                  </p>
                  <p>
                    <span className="font-mono">Size: {document.size}</span>
                  </p>
                  <p>
                    <span className="font-mono">Uploaded: {document.uploadDate}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </div>
          )}

          {!isLoading && !error && !isImage && !isPDF && (
            <div className="max-w-2xl text-center space-y-4 p-8 bg-card rounded-lg border border-border">
              <AlertCircle className="h-12 w-12 text-amber-400 mx-auto" />
              <div>
                <h3 className="font-semibold mb-2">Document Preview</h3>
                <p className="text-sm text-muted-foreground">
                  Preview not available for this document type. Please download to view.
                </p>
                <div className="bg-secondary/50 rounded p-4 text-xs text-muted-foreground space-y-2 text-left mt-4">
                  <p>
                    <span className="font-mono">Type: {document.type}</span>
                  </p>
                  <p>
                    <span className="font-mono">File: {document.name}</span>
                  </p>
                  <p>
                    <span className="font-mono">Size: {document.size}</span>
                  </p>
                  <p>
                    <span className="font-mono">Linked Asset: {document.assetId}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download {document.type}
              </button>
            </div>
          )}

          {!isLoading && !error && !fileData && (
            <div className="max-w-2xl text-center space-y-4 p-8 bg-card rounded-lg border border-border">
              <AlertCircle className="h-12 w-12 text-amber-400 mx-auto" />
              <div>
                <h3 className="font-semibold mb-2">Document Not Available</h3>
                <p className="text-sm text-muted-foreground">
                  The document data is not available. This may happen if the document was not properly uploaded or the cache was cleared.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-secondary/30 flex-shrink-0 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Asset:</span>
              <span className="font-medium">{document.assetId}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
