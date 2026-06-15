import { useState, useMemo } from 'react';
import { HistoryItem } from '../../types';
import { Trash2, Search, X } from 'lucide-react';

interface HistoryListProps {
  historyItems: HistoryItem[];
  onItemSelect: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
}

export function HistoryList({
  historyItems,
  onItemSelect,
  onDeleteItem,
  onClearHistory,
}: HistoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'GET' | 'POST' | 'PUT' | 'DELETE'>('ALL');

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'text-emerald-450 bg-emerald-500/10 border border-emerald-500/20';
      case 'POST':
        return 'text-amber-450 bg-amber-500/10 border border-amber-500/20';
      case 'PUT':
        return 'text-sky-400 bg-sky-500/10 border border-sky-500/20';
      case 'DELETE':
        return 'text-rose-450 bg-rose-500/10 border border-rose-500/20';
      case 'PATCH':
        return 'text-teal-400 bg-teal-500/10 border border-teal-500/20';
      default:
        return 'text-zinc-400 bg-zinc-500/10 border border-zinc-500/20';
    }
  };

  const getStatusColorClass = (status: number | null, error: string | null) => {
    if (error) return 'text-red-405';
    if (!status) return 'text-zinc-500';
    if (status >= 200 && status < 300) return 'text-emerald-455';
    if (status >= 300 && status < 400) return 'text-sky-400';
    if (status >= 400) return 'text-red-405';
    return 'text-zinc-400';
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Filter items based on search query and method filter
  const filteredItems = useMemo(() => {
    let items = historyItems;

    // 1. Method Filter
    if (methodFilter !== 'ALL') {
      items = items.filter((item) => item.method.toUpperCase() === methodFilter);
    }

    // 2. Search Text
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.url.toLowerCase().includes(q) ||
          item.method.toLowerCase().includes(q) ||
          (item.status_code && String(item.status_code).includes(q))
      );
    }

    return items;
  }, [historyItems, methodFilter, searchQuery]);

  // Group items by date
  const groups: Record<string, HistoryItem[]> = {};
  filteredItems.forEach((item) => {
    const dateStr = formatDate(item.fired_at);
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(item);
  });

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Search Input */}
      <div className="relative flex items-center shrink-0">
        <Search className="absolute left-2.5 w-3.5 h-3.5 text-zinc-650" />
        <input
          type="text"
          placeholder="Search history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 focus:outline-none rounded-md py-1.5 pl-8 pr-7 text-xs text-zinc-200 placeholder-zinc-700 transition-colors font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 p-0.5 text-zinc-500 hover:text-zinc-350 cursor-pointer rounded hover:bg-zinc-900 transition-colors"
            title="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Method Filter Pills */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5 shrink-0 select-none">
        {(['ALL', 'GET', 'POST', 'PUT', 'DELETE'] as const).map((method) => {
          const isSelected = methodFilter === method;
          let pillStyle = '';
          if (isSelected) {
            if (method === 'ALL') pillStyle = 'bg-orange-500/15 border-orange-500/40 text-orange-400 font-semibold';
            else if (method === 'GET') pillStyle = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-450 font-semibold';
            else if (method === 'POST') pillStyle = 'bg-amber-500/15 border-amber-500/40 text-amber-450 font-semibold';
            else if (method === 'PUT') pillStyle = 'bg-sky-500/15 border-sky-500/40 text-sky-400 font-semibold';
            else if (method === 'DELETE') pillStyle = 'bg-rose-500/15 border-rose-500/40 text-rose-405 font-semibold';
          } else {
            pillStyle = 'bg-zinc-950 hover:bg-zinc-900 border-zinc-850 text-zinc-555 hover:text-zinc-350 font-medium';
          }

          return (
            <button
              key={method}
              onClick={() => setMethodFilter(method)}
              className={`text-[9px] px-2.5 py-0.5 border rounded-full transition-all cursor-pointer shrink-0 ${pillStyle}`}
            >
              {method}
            </button>
          );
        })}
      </div>

      {/* Header Info Actions */}
      <div className="flex items-center justify-between text-[10px] text-zinc-550 select-none shrink-0 py-0.5 px-0.5">
        <span>{filteredItems.length} items logged</span>
        {historyItems.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-[9.5px] text-zinc-550 hover:text-red-405 flex items-center gap-1 transition-colors cursor-pointer font-medium"
          >
            <Trash2 className="w-2.5 h-2.5" /> Clear All
          </button>
        )}
      </div>

      {/* History Items List Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[calc(100vh-270px)] scrollbar-thin">
        {filteredItems.length === 0 ? (
          <div className="text-center text-zinc-650 py-12 text-xs italic">
            {searchQuery || methodFilter !== 'ALL' ? 'No matching logs found.' : 'No request history yet.'}
          </div>
        ) : (
          Object.keys(groups).map((date) => (
            <div key={date} className="space-y-1">
              {/* Date Header */}
              <div className="text-[9.5px] font-bold text-zinc-500 px-1 uppercase tracking-wider mb-1">
                {date}
              </div>

              {/* Grouped Items */}
              {groups[date].map((item) => (
                <div
                  key={item.id}
                  onClick={() => onItemSelect(item)}
                  className="group flex items-center justify-between p-2 rounded-md hover:bg-zinc-850/40 cursor-pointer border border-transparent hover:border-zinc-850 transition-all text-xs"
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    {/* Method & Status Line */}
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold uppercase shrink-0 ${getMethodBadgeClass(item.method)}`}>
                        {item.method}
                      </span>
                      <span className={`font-mono text-[10px] shrink-0 ${getStatusColorClass(item.status_code, item.error)}`}>
                        {item.error ? 'ERR' : item.status_code}
                      </span>
                      {item.duration_ms !== null && (
                        <span className="text-[9.5px] text-zinc-500 font-mono shrink-0">
                          {item.duration_ms}ms
                        </span>
                      )}
                      <span className="text-[9px] text-zinc-600 font-mono ml-auto shrink-0">
                        {formatTime(item.fired_at)}
                      </span>
                    </div>

                    {/* URL String */}
                    <div className="text-zinc-350 font-mono text-[9.5px] truncate pr-2 leading-normal">
                      {item.url}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="text-zinc-600 hover:text-red-405 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-850 transition-all self-center shrink-0 cursor-pointer"
                    title="Delete log"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
