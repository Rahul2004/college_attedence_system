import React from 'react';

/**
 * ImagesBadge Component (Tailwind CSS + React)
 * Displays a sleek, interactive pill badge with text and overlapping avatar preview images.
 * 
 * @param {string} text - The label text for the badge
 * @param {string[]} images - Array of image URLs to display
 * @param {string} [className] - Optional extra Tailwind class names
 * @param {function} [onClick] - Optional click handler
 */
export function ImagesBadge({ text, images = [], className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`group inline-flex items-center gap-2.5 rounded-full border border-slate-700/60 bg-slate-900/80 px-3.5 py-1.5 text-xs text-slate-200 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-800/90 hover:shadow-indigo-500/10 cursor-pointer select-none ${className}`}
    >
      {/* Overlapping Images Avatar Stack */}
      {images.length > 0 && (
        <div className="flex -space-x-2 overflow-hidden py-0.5">
          {images.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`badge-thumb-${idx}`}
              className="inline-block h-5 w-5 rounded-full object-cover ring-2 ring-slate-900 transition-transform duration-200 ease-out group-hover:scale-110 group-hover:-translate-y-0.5"
              style={{ zIndex: images.length - idx }}
            />
          ))}
        </div>
      )}

      {/* Badge Text */}
      <span className="font-medium tracking-tight text-slate-200 group-hover:text-white transition-colors">
        {text}
      </span>

      {/* Subtle Arrow Chevron Indicator */}
      <span className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all text-[11px] font-bold">
        →
      </span>
    </div>
  );
}

export default ImagesBadge;
