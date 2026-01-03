"use client";

import { useState } from 'react';

interface VideoPlayerProps {
  url: string;
  name: string;
  isPublicLink?: boolean;
}

export default function VideoPlayer({ url, name, isPublicLink = false }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);

  // Detect video type
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  const isVimeo = url.includes('vimeo.com');

  // Convert URLs to embed format
  let embedUrl = url;
  let iframeType: 'youtube' | 'vimeo' | 'html5' = 'html5';

  if (isYouTube) {
    iframeType = 'youtube';
    const videoId = url.includes('youtu.be') ? url.split('/').pop() : new URLSearchParams(new URL(url).search).get('v');
    embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;
  } else if (isVimeo) {
    iframeType = 'vimeo';
    const videoId = url.split('/').pop();
    embedUrl = `https://player.vimeo.com/video/${videoId}`;
  }

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <div className="relative w-full pt-[56.25%]">
        {iframeType === 'youtube' || iframeType === 'vimeo' ? (
          <iframe
            src={embedUrl}
            title={name}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <video
            src={url}
            title={name}
            className="absolute inset-0 w-full h-full bg-black"
            controls
            controlsList="nodownload"
          />
        )}
      </div>
    </div>
  );
}
