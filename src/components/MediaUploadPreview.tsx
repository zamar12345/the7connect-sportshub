
import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaUploadPreviewProps {
  file: File | null;
  url: string | null;
  onRemove: () => void;
  uploadProgress: number;
}

export const MediaUploadPreview: React.FC<MediaUploadPreviewProps> = ({
  file,
  url,
  onRemove,
  uploadProgress,
}) => {
  const [error, setError] = useState<string | null>(null);
  
  if (!file && !url) return null;
  
  const isVideo = file?.type.startsWith('video/') || url?.match(/\.(mp4|webm|mov)$/i);
  
  // Display error if media couldn't be loaded
  const handleMediaError = () => {
    setError("Could not load media preview");
  };

  return (
    <div className="relative mt-4 rounded-lg overflow-hidden border border-border bg-accent/20">
      <Button 
        variant="destructive" 
        size="icon" 
        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full opacity-75 hover:opacity-100" 
        onClick={onRemove}
      >
        <X size={16} />
      </Button>
      
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-background/80 p-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Uploading... {uploadProgress}%</span>
          </div>
        </div>
      )}
      
      {error ? (
        <div className="flex items-center justify-center h-64 bg-muted p-4">
          <p className="text-muted-foreground">{error}</p>
        </div>
      ) : isVideo ? (
        <video 
          src={url || URL.createObjectURL(file)}
          controls
          className="max-h-96 max-w-full mx-auto"
          onError={handleMediaError}
        />
      ) : (
        <img 
          src={url || URL.createObjectURL(file)}
          alt="Upload preview" 
          className="max-h-96 max-w-full mx-auto"
          onError={handleMediaError}
        />
      )}
      
      <div className="p-2 text-xs text-muted-foreground">
        {file?.name} ({(file?.size / (1024 * 1024)).toFixed(2)}MB)
      </div>
    </div>
  );
};
