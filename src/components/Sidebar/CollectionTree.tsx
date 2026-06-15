import { useState } from 'react';
import { Collection, SavedRequest } from '../../types';
import {
  Folder,
  FolderOpen,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  FilePlus,
  Download,
  FolderInput,
  Copy,
} from 'lucide-react';

interface CollectionTreeProps {
  collections: Collection[];
  activeRequestId: string | null;
  onRequestSelect: (req: SavedRequest) => void;
  onCreateSubfolder: (parentId: string) => void;
  onCreateRequest: (collectionId: string) => void;
  onRenameFolder: (id: string, currentName: string) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onExportFolder: (id: string) => void;
  onMoveRequest?: (requestId: string, currentCollectionId: string) => void;
  onMoveRequestDirect?: (requestId: string, targetCollectionId: string) => void;
  onDuplicateFolder?: (id: string) => void;
  onDuplicateRequest?: (id: string) => void;
}

export function CollectionTree({
  collections,
  activeRequestId,
  onRequestSelect,
  onCreateSubfolder,
  onCreateRequest,
  onRenameFolder,
  onDeleteFolder,
  onDeleteRequest,
  onExportFolder,
  onMoveRequest,
  onMoveRequestDirect,
  onDuplicateFolder,
  onDuplicateRequest,
}: CollectionTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'text-emerald-400 font-bold';
      case 'POST':
        return 'text-amber-400 font-bold';
      case 'PUT':
        return 'text-sky-400 font-bold';
      case 'DELETE':
        return 'text-rose-400 font-bold';
      case 'PATCH':
        return 'text-teal-400 font-bold';
      default:
        return 'text-zinc-400 font-bold';
    }
  };

  const renderNode = (col: Collection, depth: number = 0) => {
    const isExpanded = expanded[col.id] || false;
    const hasChildren = (col.children && col.children.length > 0) || (col.requests && col.requests.length > 0);

    return (
      <div key={col.id} className="select-none">
        {/* Collection Folder Row */}
        <div
          className="group flex items-center justify-between py-1.5 hover:bg-zinc-800/40 rounded-md cursor-pointer transition-colors px-2 text-zinc-300 hover:text-zinc-100"
          style={{ paddingLeft: `${depth * 12 + 6}px` }}
          onClick={() => toggleExpand(col.id)}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }}
          onDrop={async (e) => {
            e.preventDefault();
            const reqId = e.dataTransfer.getData('text/plain');
            const sourceColId = e.dataTransfer.getData('sourceCollectionId');
            if (reqId && sourceColId !== col.id) {
              await onMoveRequestDirect?.(reqId, col.id);
            }
          }}
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-zinc-500 hover:text-zinc-300">
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </span>
            <span className="text-orange-400">
              {isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
            </span>
            <span className="text-xs font-medium truncate">{col.name}</span>
          </div>

          {/* Quick Actions (visible on hover) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2" onClick={(e) => e.stopPropagation()}>
            <div className="relative group/tooltip">
              <button
                onClick={() => onCreateRequest(col.id)}
                className="text-zinc-500 hover:text-orange-400 p-0.5 rounded hover:bg-zinc-800 cursor-pointer"
              >
                <FilePlus className="w-3 h-3" />
              </button>
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 bg-zinc-950 text-zinc-200 text-[9px] rounded shadow-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50 border border-zinc-800 font-medium">
                Add request
              </span>
            </div>

            <div className="relative group/tooltip">
              <button
                onClick={() => onCreateSubfolder(col.id)}
                className="text-zinc-500 hover:text-orange-400 p-0.5 rounded hover:bg-zinc-800 cursor-pointer"
              >
                <FolderPlus className="w-3 h-3" />
              </button>
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 bg-zinc-950 text-zinc-200 text-[9px] rounded shadow-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50 border border-zinc-800 font-medium">
                New sub-collection
              </span>
            </div>

            <div className="relative group/tooltip">
              <button
                onClick={() => onExportFolder(col.id)}
                className="text-zinc-500 hover:text-orange-400 p-0.5 rounded hover:bg-zinc-800 cursor-pointer"
              >
                <Download className="w-3 h-3" />
              </button>
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 bg-zinc-950 text-zinc-200 text-[9px] rounded shadow-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50 border border-zinc-800 font-medium">
                Export collection
              </span>
            </div>

            <div className="relative group/tooltip">
              <button
                onClick={() => onRenameFolder(col.id, col.name)}
                className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded hover:bg-zinc-800 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 bg-zinc-950 text-zinc-200 text-[9px] rounded shadow-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50 border border-zinc-800 font-medium">
                Rename folder
              </span>
            </div>

            <div className="relative group/tooltip">
              <button
                onClick={() => onDuplicateFolder?.(col.id)}
                className="text-zinc-500 hover:text-orange-400 p-0.5 rounded hover:bg-zinc-800 cursor-pointer flex items-center justify-center"
              >
                <Copy className="w-3 h-3" />
              </button>
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 bg-zinc-950 text-zinc-200 text-[9px] rounded shadow-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50 border border-zinc-800 font-medium">
                Duplicate collection
              </span>
            </div>

            <div className="relative group/tooltip">
              <button
                onClick={() => onDeleteFolder(col.id)}
                className="text-zinc-500 hover:text-red-400 p-0.5 rounded hover:bg-zinc-800 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 bg-zinc-950 text-zinc-200 text-[9px] rounded shadow-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50 border border-zinc-800 font-medium">
                Delete folder
              </span>
            </div>
          </div>
        </div>

        {/* Folder Contents */}
        {isExpanded && (
          <div className="mt-0.5 space-y-0.5">
            {/* Sub-folders */}
            {col.children && col.children.map((subcol) => renderNode(subcol, depth + 1))}

            {/* Requests */}
            {col.requests &&
              col.requests.map((req) => {
                const isActive = activeRequestId === req.id;
                return (
                  <div
                    key={req.id}
                    className={`group flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer transition-all ${
                      isActive
                        ? 'bg-orange-950/20 text-orange-200 border-l-2 border-orange-500 font-medium'
                        : 'hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-200'
                    }`}
                    style={{ paddingLeft: `${(depth + 1) * 12 + 18}px` }}
                    onClick={() => onRequestSelect(req)}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', req.id);
                      e.dataTransfer.setData('sourceCollectionId', req.collection_id);
                    }}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      <span className={`text-[10px] w-8 truncate font-mono ${getMethodBadgeClass(req.method)}`}>
                        {req.method}
                      </span>
                      <span className="text-xs truncate">{req.name}</span>
                    </div>

                    {/* Request Actions */}
                    <div
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative group/tooltip">
                        <button
                          onClick={() => onMoveRequest?.(req.id, req.collection_id)}
                          className="text-zinc-500 hover:text-orange-400 p-0.5 rounded hover:bg-zinc-800 cursor-pointer flex items-center justify-center"
                        >
                          <FolderInput className="w-3 h-3" />
                        </button>
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 bg-zinc-950 text-zinc-200 text-[9px] rounded shadow-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50 border border-zinc-800 font-medium">
                          Move Request
                        </span>
                      </div>

                      <div className="relative group/tooltip">
                        <button
                          onClick={() => onDuplicateRequest?.(req.id)}
                          className="text-zinc-500 hover:text-orange-400 p-0.5 rounded hover:bg-zinc-800 cursor-pointer flex items-center justify-center"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 bg-zinc-950 text-zinc-200 text-[9px] rounded shadow-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50 border border-zinc-800 font-medium">
                          Duplicate Request
                        </span>
                      </div>

                      <div className="relative group/tooltip">
                        <button
                          onClick={() => onDeleteRequest(req.id)}
                          className="text-zinc-500 hover:text-red-400 p-0.5 rounded hover:bg-zinc-800 cursor-pointer flex items-center justify-center"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 bg-zinc-950 text-zinc-200 text-[9px] rounded shadow-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50 border border-zinc-800 font-medium">
                          Delete Request
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            
            {/* Empty State for Expanded Folder */}
            {!hasChildren && (
              <div 
                className="py-1 text-[10px] text-zinc-600 italic"
                style={{ paddingLeft: `${(depth + 1) * 12 + 18}px` }}
              >
                Empty collection
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {collections.length === 0 ? (
        <div className="text-center text-zinc-600 py-8 text-xs italic">
          No collections created. Create one above!
        </div>
      ) : (
        collections.map((col) => renderNode(col, 0))
      )}
    </div>
  );
}
