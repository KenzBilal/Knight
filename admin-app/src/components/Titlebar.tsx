import { Minus, Square, X } from 'lucide-react';

export function Titlebar() {
  const handleMinimize = () => window.electronAPI?.windowMinimize();
  const handleMaximize = () => window.electronAPI?.windowMaximize();
  const handleClose = () => window.electronAPI?.windowClose();

  return (
    <div className="h-9 bg-[#0a0a0a] border-b border-[#1a1a1a] flex items-center justify-between shrink-0 drag-region px-3 select-none">
      <div className="flex items-center gap-2 font-display text-[10px] tracking-[0.25em] text-[#555] uppercase">
        <span className="w-1.5 h-1.5 bg-[#e0e0e0] rounded-full"></span>
        Knight Admin
      </div>
      <div className="flex items-center no-drag h-full">
        <button onClick={handleMinimize} className="w-8 h-8 flex items-center justify-center text-[#555] hover:text-[#ccc] transition-colors">
          <Minus size={13} />
        </button>
        <button onClick={handleMaximize} className="w-8 h-8 flex items-center justify-center text-[#555] hover:text-[#ccc] transition-colors">
          <Square size={10} />
        </button>
        <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center text-[#555] hover:text-[#ff4444] transition-colors">
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
