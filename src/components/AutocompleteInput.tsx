"use client";

import { useState, useRef, useEffect } from 'react';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
}

export function AutocompleteInput({
  value,
  onChange,
  suggestions,
  placeholder,
  className = '',
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);
    if (v.trim().length === 0) {
      setOpen(false);
      return;
    }
    const f = suggestions.filter(s =>
      s.toLowerCase().includes(v.toLowerCase())
    );
    setFiltered(f);
    setOpen(f.length > 0);
  };

  const handleSelect = (s: string) => {
    onChange(s);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => {
          if (value.trim() && filtered.length > 0) setOpen(true);
        }}
        placeholder={placeholder}
        className={`w-full p-2 border rounded focus:ring-2 focus:ring-cofer-500 outline-none ${className}`}
        autoComplete="off"
      />
      {open && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto text-sm">
          {filtered.map(s => (
            <li
              key={s}
              onMouseDown={() => handleSelect(s)}
              className="px-3 py-2 cursor-pointer hover:bg-cofer-50 hover:text-cofer-700 transition-colors"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
