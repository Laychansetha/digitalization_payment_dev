'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Building2 } from 'lucide-react';

interface BankItem {
  id: string;
  name: string;
  code?: string;
}

interface SearchableBankSelectProps {
  banks: BankItem[];
  value: string;
  onChange: (bankName: string) => void;
}

export default function SearchableBankSelect({ banks, value, onChange }: SearchableBankSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) || (b.code && b.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div ref={containerRef} className="relative w-full text-xs">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2.5 text-white flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-colors"
      >
        <div className="flex items-center gap-2 truncate">
          <Building2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className={value ? 'font-bold text-white' : 'text-slate-400 font-normal'}>
            {value || 'Select Commercial Bank...'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-[#141c2f] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden space-y-1 p-2 max-h-60 flex flex-col">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bank name (e.g. ABA, ACLEDA)..."
              className="w-full bg-[#1e293b] border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-44 space-y-1 pt-1">
            {filteredBanks.length === 0 ? (
              <div className="p-3 text-center text-slate-500 text-[11px]">
                No banks match &quot;{search}&quot;. Add it in Admin Settings.
              </div>
            ) : (
              filteredBanks.map((bank) => (
                <div
                  key={bank.id}
                  onClick={() => {
                    onChange(bank.name);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`p-2 rounded-lg cursor-pointer flex items-center justify-between hover:bg-emerald-500/20 text-xs transition-colors ${
                    value === bank.name ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{bank.name}</span>
                  </div>
                  {value === bank.name && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
