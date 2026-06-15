import { useState } from 'react';
import { KeyValueEditor } from '../common/KeyValueEditor';
import { KeyValueItem } from '../../types';
import { FileText } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css';

const highlightJson = (code: string) => {
  try {
    return Prism.highlight(code, Prism.languages.json, 'json');
  } catch (e) {
    return code;
  }
};

interface BodyEditorProps {
  bodyType: 'none' | 'raw' | 'json' | 'form';
  onBodyTypeChange: (type: 'none' | 'raw' | 'json' | 'form') => void;
  body: string;
  onBodyChange: (body: string) => void;
}

export function BodyEditor({
  bodyType,
  onBodyTypeChange,
  body,
  onBodyChange,
}: BodyEditorProps) {
  const [formatError, setFormatError] = useState<string | null>(null);

  const handleFormatJson = () => {
    try {
      if (!body || body.trim() === '') return;
      const parsed = JSON.parse(body);
      onBodyChange(JSON.stringify(parsed, null, 2));
      setFormatError(null);
    } catch (e: any) {
      setFormatError('Invalid JSON');
      setTimeout(() => setFormatError(null), 3000);
    }
  };
  const handleFormChange = (newItems: KeyValueItem[]) => {
    onBodyChange(JSON.stringify(newItems));
  };

  const getFormItems = (): KeyValueItem[] => {
    try {
      if (!body) return [];
      const parsed = JSON.parse(body);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  const bodyOptions = [
    { type: 'none', label: 'None' },
    { type: 'raw', label: 'Raw Text' },
    { type: 'json', label: 'JSON' },
    { type: 'form', label: 'Form URL Encoded' },
  ];

  return (
    <div className="flex flex-col gap-3 text-zinc-300 text-xs py-1">
      {/* Body Type Selectors */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex gap-2">
          {bodyOptions.map((opt) => (
            <button
              key={opt.type}
              onClick={() => {
                onBodyTypeChange(opt.type as any);
                if (opt.type === 'form' && !body.startsWith('[')) {
                  onBodyChange(JSON.stringify([{ key: '', value: '', enabled: true }]));
                } else if (opt.type === 'none') {
                  onBodyChange('');
                }
              }}
              className={`px-2.5 py-1.5 rounded-md border text-xs transition-colors select-none ${
                bodyType === opt.type
                  ? 'bg-orange-500/10 border-orange-500 text-orange-350 font-medium'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {bodyType === 'json' && (
          <div className="flex items-center gap-2 pr-1">
            {formatError && (
              <span className="text-[10px] text-red-400 font-mono animate-pulse">
                {formatError}
              </span>
            )}
            <button
              onClick={handleFormatJson}
              className="text-[10px] text-orange-400 hover:text-orange-350 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 px-2 py-1 rounded transition-colors font-medium cursor-pointer"
            >
              Format JSON
            </button>
          </div>
        )}
      </div>

      {/* Editor Details depending on Type */}
      <div className="flex-1 min-h-[160px] flex flex-col">
        {bodyType === 'none' && (
          <div className="flex-1 bg-zinc-900/10 border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center text-zinc-550 gap-1 py-8">
            <FileText className="w-5 h-5 opacity-40 mb-1" />
            <span>This request does not send a body payload.</span>
          </div>
        )}

        {(bodyType === 'raw' || bodyType === 'json') && (
          <div className="flex-1 min-h-[160px] w-full bg-zinc-950 border border-zinc-800 focus-within:border-orange-500/70 rounded-lg overflow-auto font-mono text-xs">
            <Editor
              value={body}
              onValueChange={onBodyChange}
              highlight={bodyType === 'json' ? highlightJson : (code) => code}
              padding={12}
              insertSpaces={true}
              tabSize={2}
              placeholder={
                bodyType === 'json'
                  ? '{\n  "key": "value"\n}'
                  : 'Enter raw request body here...'
              }
              style={{
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: 12,
                minHeight: '160px',
                color: 'var(--zinc-100)',
              }}
              textareaClassName="focus:outline-none w-full h-full min-h-[160px] bg-transparent resize-y"
              preClassName="min-h-[160px] pointer-events-none"
            />
          </div>
        )}

        {bodyType === 'form' && (
          <div className="bg-zinc-950/20 p-2 rounded-lg border border-zinc-800 flex-1">
            <KeyValueEditor
              items={getFormItems()}
              onChange={handleFormChange}
              placeholderKey="Form Key"
              placeholderValue="Form Value"
            />
          </div>
        )}
      </div>
    </div>
  );
}
