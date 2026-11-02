import React from 'react';

// Geometric shapes representing OSAD and OMAI (OXAD / OMAI visual language)
// O: Red Circle
// X: Blue Cross
// A: Green Triangle
// D: Orange/Amber Square
// M: Blue Double Arch (M)
// I: Red Bar (|)

export function GeoCircle({ className = 'w-6 h-6', strokeWidth = 3.5, color = '#DC2626' }: { className?: string; strokeWidth?: number; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
    </svg>
  );
}

export function GeoCross({ className = 'w-6 h-6', strokeWidth = 3.5, color = '#2563EB' }: { className?: string; strokeWidth?: number; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6L18 18M6 18L18 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export const GeoX = GeoCross;

export function GeoS({ className = 'w-6 h-6', strokeWidth = 3.5, color = '#2563EB' }: { className?: string; strokeWidth?: number; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17 7.5C16.5 5.5 14.5 4.5 12 4.5C9 4.5 7 6 7 8.5C7 11.5 17 11.5 17 15.5C17 18 15 19.5 12 19.5C9 19.5 7 18 6.5 16"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GeoTriangle({ className = 'w-6 h-6', strokeWidth = 3.5, color = '#16A34A' }: { className?: string; strokeWidth?: number; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4L21 19.5H3L12 4Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </svg>
  );
}

export function GeoSquare({ className = 'w-6 h-6', strokeWidth = 3.5, color = '#EA580C' }: { className?: string; strokeWidth?: number; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4.5" y="4.5" width="15" height="15" rx="1.5" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </svg>
  );
}

export function GeoM({ className = 'w-6 h-6', strokeWidth = 3.6, color = '#2563EB' }: { className?: string; strokeWidth?: number; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.5 19.5V5H19.5V19.5M12 5V19.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GeoArch({ className = 'w-6 h-6', strokeWidth = 3.5, color = '#2563EB' }: { className?: string; strokeWidth?: number; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 20V8C5 5.5 7.5 4 12 4C16.5 4 19 5.5 19 8V20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function GeoBar({ className = 'w-6 h-6', strokeWidth = 4, color = '#DC2626' }: { className?: string; strokeWidth?: number; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="4.5" x2="12" y2="19.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

/**
 * The iconic yellow OSAD - OMAI geometric stamp badge
 * reproducing the exact emblem from the celebrity merchandise patch
 */
export function OsadOmaiStampBadge({
  className = '',
  useX = true,
}: {
  className?: string;
  useX?: boolean;
}) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center bg-brand-yellow px-3 py-2 rounded-2xl border-3 border-black shadow-brutal select-none ${className}`}
      title="OSAD OMAI Emblem"
    >
      {/* Row 1: O X A D (Circle, Cross, Triangle, Square) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <GeoCircle className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3.8} color="#DC2626" />
        {useX ? (
          <GeoCross className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3.8} color="#2563EB" />
        ) : (
          <GeoS className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3.8} color="#2563EB" />
        )}
        <GeoTriangle className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3.8} color="#16A34A" />
        <GeoSquare className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3.8} color="#D97706" />
      </div>

      {/* Row 2: O M A I (Circle, M, Triangle, Bar) */}
      <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
        <GeoCircle className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3.8} color="#DC2626" />
        <GeoM className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3.8} color="#2563EB" />
        <GeoTriangle className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3.8} color="#16A34A" />
        <GeoBar className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={4} color="#DC2626" />
      </div>
    </div>
  );
}

// Export alias for backward compatibility
export const OxadOmaiStampBadge = OsadOmaiStampBadge;

/**
 * Playful mini cluster of geometric icons for inline decorations (O X A D)
 */
export function GeoCluster({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border-2 border-black shadow-brutal-xs ${className}`}>
      <GeoCircle className="w-3.5 h-3.5" strokeWidth={4} color="#DC2626" />
      <GeoCross className="w-3.5 h-3.5" strokeWidth={4} color="#2563EB" />
      <GeoTriangle className="w-3.5 h-3.5" strokeWidth={4} color="#16A34A" />
      <GeoSquare className="w-3.5 h-3.5" strokeWidth={4} color="#D97706" />
    </span>
  );
}
