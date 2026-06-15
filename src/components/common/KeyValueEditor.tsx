import { useEffect } from 'react';
import { KeyValueItem } from '../../types';
import { Trash2, Plus } from 'lucide-react';

interface KeyValueEditorProps {
  items: KeyValueItem[];
  onChange: (items: KeyValueItem[]) => void;
  placeholderKey?: string;
  placeholderValue?: string;
}

export function KeyValueEditor({
  items,
  onChange,
  placeholderKey = 'Key',
  placeholderValue = 'Value',
}: KeyValueEditorProps) {
  // Ensure there's always at least one empty row
  useEffect(() => {
    if (items.length === 0) {
      onChange([{ key: '', value: '', enabled: true }]);
    } else {
      const lastItem = items[items.length - 1];
      if (lastItem.key !== '' || lastItem.value !== '') {
        onChange([...items, { key: '', value: '', enabled: true }]);
      }
    }
  }, [items, onChange]);

  const handleRowChange = (index: number, field: keyof KeyValueItem, val: any) => {
    const newItems = items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: val };
      }
      return item;
    });
    onChange(newItems);
  };

  const deleteRow = (index: number) => {
    if (items.length <= 1) {
      onChange([{ key: '', value: '', enabled: true }]);
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const addRow = () => {
    onChange([...items, { key: '', value: '', enabled: true }]);
  };

  return (
    <div className="w-full text-zinc-300 text-sm">
      <div className="grid grid-cols-[30px_2fr_2fr_40px] items-center border-b border-zinc-800 pb-2 mb-2 px-1 text-zinc-400 font-medium">
        <div></div>
        <div>Key</div>
        <div>Value</div>
        <div></div>
      </div>
      <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
        {items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-[30px_2fr_2fr_40px] items-center gap-2 px-1 py-0.5 group hover:bg-zinc-800/20 rounded-md transition-colors"
          >
            <input
              type="checkbox"
              checked={item.enabled}
              onChange={(e) => handleRowChange(index, 'enabled', e.target.checked)}
              className="w-3.5 h-3.5 accent-violet-500 rounded border-zinc-700 bg-zinc-900 cursor-pointer"
            />
            <input
              type="text"
              value={item.key}
              placeholder={placeholderKey}
              onChange={(e) => handleRowChange(index, 'key', e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-zinc-800 focus:border-violet-500 focus:outline-none py-1 px-1 text-zinc-200 placeholder-zinc-600 transition-all font-mono text-xs"
            />
            <input
              type="text"
              value={item.value}
              placeholder={placeholderValue}
              onChange={(e) => handleRowChange(index, 'value', e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-zinc-800 focus:border-violet-500 focus:outline-none py-1 px-1 text-zinc-200 placeholder-zinc-600 transition-all font-mono text-xs"
            />
            <button
              onClick={() => deleteRow(index)}
              className="text-zinc-600 hover:text-red-400 p-1 rounded transition-colors self-center flex items-center justify-center opacity-0 group-hover:opacity-100"
              title="Delete row"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addRow}
        className="mt-2 flex items-center gap-1.5 px-2.5 py-1 text-xs text-violet-400 hover:bg-violet-500/10 rounded-md transition-colors font-medium"
      >
        <Plus className="w-3 h-3" /> Add Row
      </button>
    </div>
  );
}
