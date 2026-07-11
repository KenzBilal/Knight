import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }: SearchInputProps) {
  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg pl-9 pr-8 py-2 text-sm text-[#e0e0e0] placeholder:text-[#444] focus:border-[#333] focus:bg-[#111] outline-none transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888]"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
