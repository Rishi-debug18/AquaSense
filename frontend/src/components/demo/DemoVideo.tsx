import React, { useState } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, 
  ExternalLink, AlertCircle, RefreshCw, Film, Sparkles, CheckCircle2 
} from 'lucide-react';

interface DemoVideoProps {
  title: string;
  badgeLabel: string;
  youtubeUrl?: string;
  youtubeId?: string;
  googleDriveFileId?: string;
  directVideoUrl?: string;
  posterImage?: string;
  caption?: string;
  disclaimer?: string;
  aspectRatio?: '16:9' | '4:3' | 'custom';
  autoPlay?: boolean;
}

export const DemoVideo: React.FC<DemoVideoProps> = ({
  title,
  badgeLabel,
  youtubeUrl,
  youtubeId,
  googleDriveFileId,
  directVideoUrl,
  posterImage,
  caption,
  disclaimer,
  aspectRatio = '16:9',
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Helper to extract YouTube Video ID if a full URL is provided
  const extractYouTubeId = (urlOrId?: string): string => {
    if (!urlOrId) return '';
    if (urlOrId.length === 11 && !urlOrId.includes('/') && !urlOrId.includes('.')) {
      return urlOrId;
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = urlOrId.match(regExp);
    return (match && match[2].length === 11) ? match[2] : urlOrId;
  };

  const resolvedYouTubeId = extractYouTubeId(youtubeId || youtubeUrl);
  const isYouTube = Boolean(resolvedYouTubeId);

  // Compute embed and direct URLs
  let embedUrl = '';
  let directLink = '';
  let platformLabel = 'Video Link';

  if (isYouTube) {
    embedUrl = `https://www.youtube-nocookie.com/embed/${resolvedYouTubeId}?autoplay=${autoPlay ? 1 : 0}&rel=0&modestbranding=1`;
    directLink = youtubeUrl || `https://youtu.be/${resolvedYouTubeId}`;
    platformLabel = 'YouTube';
  } else if (googleDriveFileId) {
    embedUrl = `https://drive.google.com/file/d/${googleDriveFileId}/preview`;
    directLink = `https://drive.google.com/file/d/${googleDriveFileId}/view?usp=sharing`;
    platformLabel = 'Google Drive';
  } else if (directVideoUrl) {
    embedUrl = directVideoUrl;
    directLink = directVideoUrl;
    platformLabel = 'Direct Stream';
  }

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setReloadKey(prev => prev + 1);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-xl group">
      {/* Top Media Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent p-3.5 flex items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/40 backdrop-blur-md shadow-sm">
            <Film className="w-3 h-3 text-sky-400" />
            {badgeLabel}
          </span>
          <span className="text-xs font-bold text-white drop-shadow truncate hidden sm:inline">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {directLink && (
            <a
              href={directLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 text-[11px] font-medium flex items-center gap-1 backdrop-blur-md transition"
              title={`Open video on ${platformLabel}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{platformLabel}</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Video Presentation Canvas */}
      <div className="relative w-full aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
        {hasError ? (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-400" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">Video preview unavailable in frame</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Embedded playback restrictions may apply in some environments.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleRetry}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
              {directLink && (
                <a
                  href={directLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Watch on {platformLabel}
                </a>
              )}
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 text-slate-300 space-y-2">
                <RefreshCw className="w-7 h-7 text-sky-400 animate-spin" />
                <span className="text-xs font-mono">Loading AquaSense Demo Stream...</span>
              </div>
            )}

            <iframe
              key={reloadKey}
              src={embedUrl}
              title={title}
              className="w-full h-full border-0 relative z-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          </>
        )}
      </div>

      {/* Bottom Technical Caption & Disclaimer */}
      {(caption || disclaimer) && (
        <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 text-xs space-y-1">
          {caption && (
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>{caption}</span>
            </div>
          )}
          {disclaimer && (
            <p className="text-[10px] text-amber-300/90 font-mono italic leading-tight">
              {disclaimer}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
