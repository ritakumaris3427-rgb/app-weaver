import { X, Loader2 } from 'lucide-react';
import { Attachment } from '@/types/chat';
import { Button } from '@/components/ui/button';

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
  isEditable?: boolean;
}

export function AttachmentPreview({ attachments, onRemove, isEditable = true }: AttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b border-border/30">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="relative group rounded-lg overflow-hidden bg-secondary/50 border border-border/50"
        >
          {attachment.type === 'image' ? (
            <div className="relative w-20 h-20">
              {attachment.isGenerating ? (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <img
                  src={attachment.url}
                  alt={attachment.name || 'Attachment'}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ) : (
            <div className="relative w-32 h-20">
              {attachment.isGenerating ? (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <video
                  src={attachment.url}
                  className="w-full h-full object-cover"
                  muted
                />
              )}
            </div>
          )}
          
          {isEditable && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 w-5 h-5 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(attachment.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
