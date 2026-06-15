
interface StatusBarProps {
  status: number;
  statusText: string;
  duration: number;
  size: number;
  loading: boolean;
}

export function StatusBar({
  status,
  statusText,
  duration,
  size,
  loading,
}: StatusBarProps) {
  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (code >= 300 && code < 400) return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
    if (code >= 400) return 'text-red-400 bg-red-500/10 border-red-500/20';
    return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium py-1">
        <span className="w-3.5 h-3.5 border-2 border-zinc-700 border-t-violet-500 rounded-full animate-spin" />
        <span>Sending request...</span>
      </div>
    );
  }

  if (status === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 text-xs font-mono select-none py-1">
      {/* HTTP Status Code */}
      <div className={`px-2 py-0.5 rounded border text-[11px] font-bold ${getStatusColor(status)}`}>
        {status} {statusText}
      </div>

      {/* Request Duration */}
      <div className="text-zinc-400">
        Time: <span className="text-zinc-200 font-medium">{duration} ms</span>
      </div>

      {/* Content Size */}
      <div className="text-zinc-400">
        Size: <span className="text-zinc-200 font-medium">{formatSize(size)}</span>
      </div>
    </div>
  );
}
