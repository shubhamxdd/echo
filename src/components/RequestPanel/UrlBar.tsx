
import { Send, Save, Code } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface UrlBarProps {
  method: string;
  onMethodChange: (method: string) => void;
  url: string;
  onUrlChange: (url: string) => void;
  onSend: () => void;
  onSave: () => void;
  loading: boolean;
  onCancel?: () => void;
  onGenerateCode?: () => void;
}

export function UrlBar({
  method,
  onMethodChange,
  url,
  onUrlChange,
  onSend,
  onSave,
  loading,
  onCancel,
  onGenerateCode,
}: UrlBarProps) {
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

  return (
    <div id="tour-urlbar" className="flex items-center gap-2 bg-zinc-900/40 p-2 rounded-lg border border-zinc-800 relative">
      {/* HTTP Method Dropdown */}
      <div className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-xs font-mono font-bold select-none cursor-pointer transition-colors hover:bg-zinc-900 w-24 justify-between h-8 ${getMethodColor(method)}`}
            >
              <span>{method}</span>
              <span className="text-[10px] text-zinc-500">▼</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-24 bg-zinc-950 border border-zinc-800 py-1">
            {methods.map((m) => (
              <DropdownMenuItem
                key={m}
                onClick={() => onMethodChange(m)}
                className={`w-full text-left px-3 py-1.5 text-xs font-mono font-bold cursor-pointer transition-colors ${getMethodColor(m)}`}
              >
                {m}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* URL Input */}
      <div className="flex-1 relative flex items-center">
        <Input
          type="text"
          value={url}
          placeholder="https://api.example.com/endpoint"
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSend();
            }
          }}
          className="w-full bg-zinc-950 border-zinc-800 focus-visible:border-orange-500/70 focus-visible:ring-orange-500/25 h-8 font-mono text-xs text-zinc-200 placeholder-zinc-700 transition-colors"
        />
      </div>

      {/* Actions (Code Snippet & Save) */}
      <div id="tour-actionsbar" className="flex items-center gap-2">
        {/* Code Snippet Button */}
        {onGenerateCode && (
          <Button
            onClick={onGenerateCode}
            variant="outline"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-950 border-zinc-800 hover:bg-zinc-900 rounded font-semibold text-zinc-300 transition-all select-none cursor-pointer h-8"
            title="Generate Code Snippet"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Code</span>
          </Button>
        )}

        {/* Save Button */}
        <Button
          onClick={onSave}
          variant="outline"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-950 border-zinc-800 hover:bg-zinc-900 rounded font-semibold text-zinc-300 transition-all select-none cursor-pointer h-8"
          title="Save configuration (Ctrl+S)"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save</span>
        </Button>
      </div>

      {/* Send / Cancel Button */}
      {loading ? (
        <Button
          onClick={onCancel}
          variant="destructive"
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded text-white bg-red-650 hover:bg-red-500/90 active:scale-98 transition-all select-none shadow cursor-pointer h-8"
          title="Abort Request"
        >
          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Cancel</span>
        </Button>
      ) : (
        <Button
          onClick={onSend}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded text-white bg-orange-600 hover:bg-orange-500/90 active:scale-98 transition-all select-none shadow cursor-pointer h-8 border-transparent"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </Button>
      )}
    </div>
  );
}
