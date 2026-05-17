'use client';

import { useEffect, useState } from 'react';
import { Download, Loader2, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

type DownloadItem = {
  id: string;
  title: string;
  fileSize: number;
  createdAt: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DownloadHistory() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [redownloadingId, setRedownloadingId] = useState<string | null>(null);

  const fetchDownloads = async () => {
    try {
      const res = await fetch('/api/downloads');
      const data = await res.json();
      if (res.ok) {
        setDownloads(data.downloads ?? []);
      }
    } catch (error) {
      console.error('Failed to fetch downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloads();
  }, []);

  const handleRedownload = async (id: string, title: string) => {
    setRedownloadingId(id);
    try {
      const res = await fetch(`/api/downloads/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch PDF');
      }
      const { pdfData } = await res.json();
      
      // Create download link
      const link = document.createElement('a');
      link.href = pdfData;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Re-download error:', error);
      toast.error('Failed to download PDF');
    } finally {
      setRedownloadingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading downloads...</span>
        </CardContent>
      </Card>
    );
  }

  if (downloads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Download History</CardTitle>
          <CardDescription>Your downloaded PDFs will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6 text-muted-foreground">
            <Download className="h-10 w-10 mb-2 opacity-50" />
            <p>No downloads yet</p>
            <p className="text-sm">Generate PDFs in the template builder to see them here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Download History</CardTitle>
            <CardDescription>
              {downloads.length} document{downloads.length !== 1 ? 's' : ''} downloaded
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchDownloads}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {downloads.map((d) => (
            <div key={d.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{d.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(d.fileSize)} · {formatDate(d.createdAt)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRedownload(d.id, d.title)}
                disabled={redownloadingId === d.id}
              >
                {redownloadingId === d.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
