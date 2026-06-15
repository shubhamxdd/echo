import React, { useState } from 'react';
import { Collection, SavedRequest } from '../../types';
import {
  Folder,
  FolderOpen,
  FileCode,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  FilePlus,
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
        return 'text-fuchsia-400 font-bold';
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
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-zinc-500 hover:text-zinc-300">
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </span>
            <span className="text-violet-400">
              {isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
            </span>
            <span className="text-xs font-medium truncate">{col.name}</span>
          </div>

          {/* Quick Actions (visible on hover) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onCreateRequest(col.id)}
              className="text-zinc-500 hover:text-violet-400 p-0.5 rounded hover:bg-zinc-800"
              title="Add request"
            >
              <FilePlus className="w-3 h-3" />
            </button>
            <button
              onClick={() => onCreateSubfolder(col.id)}
              className="text-zinc-500 hover:text-violet-400 p-0.5 rounded hover:bg-zinc-800"
              title="New sub-collection"
            >
              <FolderPlus className="w-3 h-3" />
            </button>
            <button
              onClick={() => onRenameFolder(col.id, col.name)}
              className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded hover:bg-zinc-800"
              title="Rename folder"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDeleteFolder(col.id)}
              className="text-zinc-500 hover:text-red-400 p-0.5 rounded hover:bg-zinc-800"
              title="Delete folder"
            >
              <Trash2 className="w-3 h-3" />
            </button>
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
                        ? 'bg-violet-950/20 text-violet-200 border-l-2 border-violet-500 font-medium'
                        : 'hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-200'
                    }`}
                    style={{ paddingLeft: `${(depth + 1) * 12 + 18}px` }}
                    onClick={() => onRequestSelect(req)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      <span className={`text-[10px] w-8 truncate font-mono ${getMethodBadgeClass(req.method)}`}>
                        {req.method}
                      </span>
                      <span className="text-xs truncate">{req.name}</span>
                    </div>

                    {/* Request Delete Action */}
                    <div
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onDeleteRequest(req.id)}
                        className="text-zinc-500 hover:text-red-400 p-0.5 rounded hover:bg-zinc-800"
                        title="Delete request"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
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
