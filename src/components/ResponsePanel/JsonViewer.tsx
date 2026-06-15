import { useState, useMemo, useEffect } from 'react';
import { JsonView, darkStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { Copy, Check, FileJson, FileText, Search } from 'lucide-react';

const filterJsonObject = (obj: any, query: string): any => {
  if (!query) return obj;
  const lowerQuery = query.toLowerCase();

  if (Array.isArray(obj)) {
    return obj
      .map((item) => filterJsonObject(item, query))
      .filter(
        (item) =>
          item !== undefined &&
          item !== null &&
          (typeof item !== 'object' || Object.keys(item).length > 0)
      );
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: any = {};
    let hasMatch = false;

    for (const key in obj) {
      const keyMatches = key.toLowerCase().includes(lowerQuery);
      const val = obj[key];

      if (keyMatches) {
        result[key] = val;
        hasMatch = true;
      } else {
        const filteredVal = filterJsonObject(val, query);
        if (
          filteredVal !== undefined &&
          filteredVal !== null &&
          (typeof filteredVal !== 'object' ||
            Object.keys(filteredVal).length > 0 ||
            Array.isArray(filteredVal))
        ) {
          result[key] = filteredVal;
          hasMatch = true;
        }
      }
    }
    return hasMatch ? result : null;
  }

  if (String(obj).toLowerCase().includes(lowerQuery)) {
    return obj;
  }
  return null;
};

interface JsonViewerProps {
  body: string;
}

export function JsonViewer({ body }: JsonViewerProps) {
  const [viewMode, setViewMode] = useState<'pretty' | 'raw'>('pretty');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if body is valid JSON and parse it
  const { isJson, parsedJson } = useMemo(() => {
    if (!body || body.trim() === '') {
      return { isJson: false, parsedJson: null };
    }
    try {
      const parsed = JSON.parse(body);
      return { isJson: typeof parsed === 'object' && parsed !== null, parsedJson: parsed };
    } catch (e) {
      return { isJson: false, parsedJson: null };
    }
  }, [body]);

  // Adjust default viewMode if body is not valid JSON
  useEffect(() => {
    if (!isJson) {
      setViewMode('raw');
      setSearchQuery('');
    } else {
      setViewMode('pretty');
    }
  }, [body, isJson]);

  const filteredJson = useMemo(() => {
    if (!searchQuery.trim() || !parsedJson) return parsedJson;
    return filterJsonObject(parsedJson, searchQuery.trim()) || {};
  }, [parsedJson, searchQuery]);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col h-full gap-2 overflow-hidden text-xs">
      {/* Top Menu: Selector & Copy */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {isJson && (
              <button
                onClick={() => setViewMode('pretty')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors select-none ${
                  viewMode === 'pretty'
                    ? 'bg-orange-500/15 text-orange-300 font-medium'
                    : 'bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>Pretty JSON</span>
              </button>
            )}
            <button
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors select-none ${
                viewMode === 'raw'
                  ? 'bg-orange-500/15 text-orange-300 font-medium'
                  : 'bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-555 hover:text-zinc-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Raw Text</span>
            </button>
          </div>

          {/* Search box */}
          {isJson && viewMode === 'pretty' && (
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 w-3 h-3 text-zinc-600" />
              <input
                type="text"
                placeholder="Filter JSON tree..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-950 border border-zinc-850 focus:border-orange-500/70 focus:outline-none rounded py-1 pl-8 pr-3 text-[10px] text-zinc-300 placeholder-zinc-700 transition-colors w-40 font-mono"
              />
            </div>
          )}
        </div>

        {body && (
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded font-semibold text-zinc-400 hover:text-zinc-200 transition-all select-none"
            title="Copy entire response body"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-450" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Body</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Viewer Panel */}
      <div className="flex-1 overflow-auto border border-zinc-800 rounded-lg bg-zinc-950/40 p-3 min-h-[120px] font-mono text-xs select-text">
        {!body || body.trim() === '' ? (
          <div className="text-zinc-600 italic text-center py-12">
            No Response Body
          </div>
        ) : viewMode === 'pretty' && isJson ? (
          <div className="react-json-view-lite-dark">
            <JsonView
              data={filteredJson}
              shouldExpandNode={() => true}
              style={{
                ...darkStyles,
                container: 'bg-transparent text-zinc-350 leading-relaxed word-break-all',
                label: 'text-orange-400 font-semibold',
                stringValue: 'text-emerald-450 font-normal',
                numberValue: 'text-amber-450',
                booleanValue: 'text-sky-400 font-bold',
                nullValue: 'text-zinc-550 italic',
              }}
            />
          </div>
        ) : (
          <pre className="text-zinc-300 whitespace-pre-wrap break-all leading-relaxed font-mono select-all">
            {body}
          </pre>
        )}
      </div>
    </div>
  );
}
