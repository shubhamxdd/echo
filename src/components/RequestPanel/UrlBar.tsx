import { useState } from 'react';
import { Send, Save } from 'lucide-react';

interface UrlBarProps {
  method: string;
  onMethodChange: (method: string) => void;
  url: string;
  onUrlChange: (url: string) => void;
  onSend: () => void;
  onSave: () => void;
  loading: boolean;
}

export function UrlBar({
  method,
  onMethodChange,
  url,
  onUrlChange,
  onSend,
  onSave,
  loading,
}: UrlBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  const getMethodColor = (m: string) => {
    switch (m.toUpperCase()) {
      case 'GET': return 'text-emerald-400';
      case 'POST': return 'text-amber-400';
      case 'PUT': return 'text-sky-400';
      case 'DELETE': return 'text-rose-400';
      case 'PATCH': return 'text-teal-400';
      default: return 'text-zinc-400';
    }
  };

  const handleMethodSelect = (m: string) => {
    onMethodChange(m);
    setDropdownOpen(false);
  };

  return (
    <div className="flex items-center gap-2 bg-zinc-900/40 p-2 rounded-lg border border-zinc-800 relative">
      {/* HTTP Method Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-xs font-mono font-bold select-none cursor-pointer transition-colors hover:bg-zinc-900 w-24 justify-between ${getMethodColor(method)}`}
        >
          <span>{method}</span>
          <span className="text-[10px] text-zinc-500">▼</span>
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 mt-1 z-30 w-24 bg-zinc-950 border border-zinc-800 rounded-md shadow-xl py-1">
            {methods.map((m) => (
              <button
                key={m}
                onClick={() => handleMethodSelect(m)}
                className={`w-full text-left px-3 py-1.5 text-xs font-mono font-bold hover:bg-zinc-900 transition-colors ${getMethodColor(m)}`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* URL Input */}
      <div className="flex-1 relative flex items-center">
        <input
          type="text"
          value={url}
          placeholder="https://api.example.com/endpoint"
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSend();
            }
          }}
          className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 focus:outline-none rounded py-1.5 px-3 text-xs font-mono text-zinc-200 placeholder-zinc-700 transition-colors"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={onSave}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded font-semibold text-zinc-300 transition-all select-none"
        title="Save configuration (Ctrl+S)"
      >
        <Save className="w-3.5 h-3.5" />
        <span>Save</span>
      </button>

      {/* Send Button */}
      <button
        onClick={onSend}
        disabled={loading}
        className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded text-white transition-all select-none shadow ${
          loading
            ? 'bg-amber-600 cursor-not-allowed hover:bg-amber-600'
            : 'bg-orange-600 hover:bg-orange-500 active:scale-98 cursor-pointer'
        }`}
      >
        {loading ? (
          <>
            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Sending</span>
          </>
        ) : (
          <>
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </>
        )}
      </button>
    </div>
  );
}
