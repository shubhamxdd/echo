import { HistoryItem } from '../../types';
import { Trash2 } from 'lucide-react';

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
  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
      case 'POST':
        return 'text-amber-400 bg-amber-500/10 border border-amber-500/20';
      case 'PUT':
        return 'text-sky-400 bg-sky-500/10 border border-sky-500/20';
      case 'DELETE':
        return 'text-rose-400 bg-rose-500/10 border border-rose-500/20';
      case 'PATCH':
        return 'text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20';
      default:
        return 'text-zinc-400 bg-zinc-500/10 border border-zinc-500/20';
    }
  };

  const getStatusColorClass = (status: number | null, error: string | null) => {
    if (error) return 'text-red-400';
    if (!status) return 'text-zinc-500';
    if (status >= 200 && status < 300) return 'text-emerald-400';
    if (status >= 300 && status < 400) return 'text-sky-400';
    if (status >= 400) return 'text-red-400';
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

  // Group items by date
  const groups: Record<string, HistoryItem[]> = {};
  historyItems.forEach((item) => {
    const dateStr = formatDate(item.fired_at);
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(item);
  });

  return (
    <div className="flex flex-col h-full">
      {/* Clear All Header */}
      {historyItems.length > 0 && (
        <div className="flex justify-end mb-2">
          <button
            onClick={onClearHistory}
            className="text-[10px] text-zinc-500 hover:text-red-400 flex items-center gap-1 py-1 px-2 rounded hover:bg-zinc-800/40 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Clear History
          </button>
        </div>
      )}

      {/* History Items Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[calc(100vh-220px)]">
        {historyItems.length === 0 ? (
          <div className="text-center text-zinc-600 py-8 text-xs italic">
            No request history yet. Fired requests will be logged here.
          </div>
        ) : (
          Object.keys(groups).map((date) => (
            <div key={date} className="space-y-1">
              {/* Date Header */}
              <div className="text-[10px] font-semibold text-zinc-500 px-1 uppercase tracking-wider mb-1">
                {date}
              </div>

              {/* Grouped Items */}
              {groups[date].map((item) => (
                <div
                  key={item.id}
                  onClick={() => onItemSelect(item)}
                  className="group flex items-center justify-between p-2 rounded-md hover:bg-zinc-800/40 cursor-pointer border border-transparent hover:border-zinc-800 transition-all text-xs"
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    {/* Method & Status Line */}
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold uppercase ${getMethodBadgeClass(item.method)}`}>
                        {item.method}
                      </span>
                      <span className={`font-mono text-[10px] ${getStatusColorClass(item.status_code, item.error)}`}>
                        {item.error ? 'ERR' : item.status_code}
                      </span>
                      {item.duration_ms !== null && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {item.duration_ms}ms
                        </span>
                      )}
                      <span className="text-[9px] text-zinc-600 font-mono ml-auto">
                        {formatTime(item.fired_at)}
                      </span>
                    </div>

                    {/* URL String */}
                    <div className="text-zinc-300 font-mono text-[10px] truncate pr-2">
                      {item.url}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="text-zinc-600 hover:text-red-400 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-800 transition-all self-center"
                    title="Delete item"
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
