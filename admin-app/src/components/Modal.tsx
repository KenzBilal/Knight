import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}

export function Modal({ isOpen, onClose, title, children, width = '480px' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl shadow-2xl overflow-hidden"
        style={{ width, maxHeight: '80vh' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <h3 className="text-sm font-medium text-[#e0e0e0]">{title}</h3>
          <button onClick={onClose} className="text-[#555] hover:text-[#aaa] transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 60px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
