import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { KeyValueEditor } from './KeyValueEditor';
import { Environment, KeyValueItem } from '../../types';
import { Plus, Trash2, ShieldAlert } from 'lucide-react';
import { useAlertDialog } from './AlertDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  environments: Environment[];
  onCreate: (name: string, variables: KeyValueItem[]) => Promise<string>;
  onUpdate: (id: string, name: string, variables: KeyValueItem[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function EnvironmentModal({
  isOpen,
  onClose,
  environments,
  onCreate,
  onUpdate,
  onDelete,
}: EnvironmentModalProps) {
  const { showAlert, showConfirm } = useAlertDialog();
  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editVariables, setEditVariables] = useState<KeyValueItem[]>([]);

  // Find currently selected environment
  const selectedEnv = environments.find((e) => e.id === selectedEnvId) || null;

  // Sync edits when selected environment changes
  useEffect(() => {
    if (selectedEnv) {
      setEditName(selectedEnv.name);
      setEditVariables(selectedEnv.variables.length > 0 ? selectedEnv.variables : [{ key: '', value: '', enabled: true }]);
    } else {
      setEditName('');
      setEditVariables([]);
    }
  }, [selectedEnvId, selectedEnv]);

  // Reset selected when closing or reopening
  useEffect(() => {
    if (isOpen && environments.length > 0 && !selectedEnvId) {
      setSelectedEnvId(environments[0].id);
    }
  }, [isOpen, environments, selectedEnvId]);

  const handleCreate = async () => {
    try {
      const newId = await onCreate('New Environment', [{ key: '', value: '', enabled: true }]);
      setSelectedEnvId(newId);
    } catch (err) {
      console.error('Failed to create env:', err);
    }
  };

  const handleSave = async () => {
    if (!selectedEnvId || !editName.trim()) return;
    try {
      // Clean variables (remove empty rows before saving)
      const cleanedVars = editVariables.filter((v) => v.key.trim() !== '' || v.value.trim() !== '');
      await onUpdate(selectedEnvId, editName.trim(), cleanedVars);
      await showAlert('Environment saved successfully!', 'Success', 'success');
    } catch (err) {
      console.error('Failed to save env:', err);
      await showAlert('Failed to save environment settings.', 'Save Failed');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await showConfirm(
      'Are you sure you want to delete this environment? This cannot be undone.',
      'Delete Environment'
    );
    if (!confirmed) return;
    try {
      await onDelete(id);
      if (selectedEnvId === id) {
        setSelectedEnvId(environments.length > 1 ? environments.filter((env) => env.id !== id)[0].id : null);
      }
    } catch (err) {
      console.error('Failed to delete env:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Environments">
      <div className="flex gap-4 h-[380px] min-h-[380px] select-none text-zinc-200">
        {/* Left pane - Environments list */}
        <div className="w-[180px] border-r border-zinc-800 pr-3 flex flex-col justify-between shrink-0">
          <div className="space-y-1 overflow-y-auto flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Environments</label>
            {environments.map((env) => (
              <div
                key={env.id}
                onClick={() => setSelectedEnvId(env.id)}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
                  selectedEnvId === env.id
                    ? 'bg-orange-950/20 text-orange-200 border-l-2 border-orange-500'
                    : 'hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="truncate flex-1 pr-1">{env.name}</span>
                <button
                  onClick={(e) => handleDelete(env.id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 rounded transition-all flex items-center justify-center shrink-0"
                  title="Delete Environment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {environments.length === 0 && (
              <div className="text-[11px] text-zinc-600 italic py-4">No environments.</div>
            )}
          </div>
          
          <Button
            onClick={handleCreate}
            variant="outline"
            className="w-full flex items-center justify-center gap-1.5 py-2 mt-2 border border-dashed border-zinc-800 hover:border-orange-500/40 text-xs text-zinc-400 hover:text-orange-400 rounded-md transition-colors cursor-pointer font-medium h-8"
          >
            <Plus className="w-3.5 h-3.5" /> New Environment
          </Button>
        </div>

        {/* Right pane - Environment details editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedEnv ? (
            <div className="flex-1 flex flex-col justify-between min-h-0">
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-zinc-400">Environment Name</label>
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus-visible:border-orange-500/70 focus-visible:ring-orange-500/25 h-8 text-xs text-zinc-200 font-medium font-sans"
                    placeholder="e.g. Production"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-zinc-400">Variables</label>
                  <KeyValueEditor
                    items={editVariables}
                    onChange={setEditVariables}
                    placeholderKey="Variable Name"
                    placeholderValue="Value"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 border-t border-zinc-800 pt-3 mt-4 shrink-0">
                <Button
                  onClick={handleSave}
                  disabled={!editName.trim()}
                  className="px-3.5 py-1.5 rounded-md text-xs bg-orange-600 hover:bg-orange-500 font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer h-8 border-transparent"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-600 py-12 gap-2">
              <ShieldAlert className="w-6 h-6 opacity-30" />
              <span className="text-xs italic">Select an environment from the list or click "New Environment" to begin defining variables.</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
