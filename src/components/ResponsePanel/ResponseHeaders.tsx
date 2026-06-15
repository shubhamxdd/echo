import { useState } from 'react';
import { KeyValueItem } from '../../types';
import { Copy, Check, Search } from 'lucide-react';

interface ResponseHeadersProps {
  headers: KeyValueItem[];
}

export function ResponseHeaders({ headers }: ResponseHeadersProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const filteredHeaders = headers.filter(
    (h) =>
      h.key.toLowerCase().includes(filterQuery.toLowerCase()) ||
      h.value.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-2 text-xs">
      {/* Headers Filter Search */}
      {headers.length > 0 && (
        <div className="relative flex items-center max-w-xs">
          <Search className="absolute left-2 w-3 h-3 text-zinc-650" />
          <input
            type="text"
            placeholder="Search headers..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 focus:outline-none rounded py-1 pl-7 pr-3 text-[11px] text-zinc-350 placeholder-zinc-700 transition-colors font-mono"
          />
        </div>
      )}

      {/* Headers Grid */}
      <div className="flex-1 overflow-y-auto border border-zinc-800 rounded-lg bg-zinc-950/20 max-h-[220px]">
        {filteredHeaders.length === 0 ? (
          <div className="text-center text-zinc-650 py-6 italic">
            No headers found.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {filteredHeaders.map((header) => (
              <div
                key={header.key}
                className="group flex items-start gap-4 p-2 hover:bg-zinc-800/10 font-mono text-[11px]"
              >
                <div className="w-1/3 text-orange-400 font-semibold select-all truncate break-all">
                  {header.key}
                </div>
                <div className="flex-1 text-zinc-300 select-all break-all whitespace-pre-wrap">
                  {header.value}
                </div>
                <button
                  onClick={() => handleCopy(header.key, header.value)}
                  className="text-zinc-600 hover:text-zinc-350 p-0.5 rounded transition-all opacity-0 group-hover:opacity-100 hover:bg-zinc-800 self-center"
                  title="Copy header value"
                >
                  {copiedKey === header.key ? (
                    <Check className="w-3.5 h-3.5 text-emerald-450" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
