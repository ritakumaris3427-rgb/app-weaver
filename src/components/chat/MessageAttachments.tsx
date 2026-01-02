import { useState } from 'react';
import { Attachment } from '@/types/chat';
import { Loader2, Play, Pause, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface MessageAttachmentsProps {
  attachments: Attachment[];
}

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  const [expandedMedia, setExpandedMedia] = useState<Attachment | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  if (!attachments || attachments.length === 0) return null;

  const handleVideoClick = (id: string, videoEl: HTMLVideoElement) => {
    if (playingVideo === id) {
      videoEl.pause();
      setPlayingVideo(null);
    } else {
      videoEl.play();
      setPlayingVideo(id);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-3 mt-3">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="relative group rounded-xl overflow-hidden bg-secondary/30 border border-border/30"
          >
            {attachment.isGenerating ? (
              <div className="w-64 h-48 flex flex-col items-center justify-center gap-2 bg-secondary/50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">
                  Generating {attachment.type}...
                </span>
              </div>
            ) : attachment.type === 'image' ? (
              <div className="relative">
                <img
                  src={attachment.url}
                  alt={attachment.name || 'Generated image'}
                  className="max-w-xs max-h-64 object-contain cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => setExpandedMedia(attachment)}
                />
                <button
                  className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setExpandedMedia(attachment)}
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <video
                  src={attachment.url}
                  className="max-w-sm max-h-64 object-contain cursor-pointer"
                  loop
                  playsInline
                  onClick={(e) => handleVideoClick(attachment.id, e.currentTarget)}
                />
                <button
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    const video = e.currentTarget.previousElementSibling as HTMLVideoElement;
                    handleVideoClick(attachment.id, video);
                  }}
                >
                  {playingVideo === attachment.id ? (
                    <Pause className="w-12 h-12 text-white" />
                  ) : (
                    <Play className="w-12 h-12 text-white" />
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={!!expandedMedia} onOpenChange={() => setExpandedMedia(null)}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          {expandedMedia?.type === 'image' && (
            <img
              src={expandedMedia.url}
              alt={expandedMedia.name || 'Expanded image'}
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
