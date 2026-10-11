import React from 'react';
import { ImagesBadge } from './ImagesBadge';

export function ImagesBadgeDemo() {
  return (
    <div className="flex h-[10rem] w-full items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800">
      <ImagesBadge
        text="Spring 2026 • 42 Enrolled Students"
        images={[
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
        ]}
      />
    </div>
  );
}

export default ImagesBadgeDemo;
