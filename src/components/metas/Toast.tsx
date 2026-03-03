import { useEffect } from 'react';
import { X } from 'lucide-react';
import type React from 'react';

interface Props {
  message: string;
  icon?: React.ReactNode;
  onClose: () => void;
}

export default function Toast({ message, icon, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 3800);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-fade-in-up pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 bg-[#2d5a3d] text-white pl-4 pr-3 py-3.5 rounded-2xl shadow-2xl max-w-[340px]">
        {icon && (
          <span className="flex-shrink-0 leading-none">{icon}</span>
        )}
        <p className="text-sm font-medium truncate flex-1">{message}</p>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
