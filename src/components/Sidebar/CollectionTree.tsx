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
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

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
        return 'text-emerald-450 font-bold';
      case 'POST':
        return 'text-amber-450 font-bold';
      case 'PUT':
        return 'text-sky-400 font-bold';
      case 'DELETE':
        return 'text-rose-455 font-bold';
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
          className="group flex items-center justify-between py-1.5 hover:bg-zinc-800/40 rounded-md cursor-pointer transition-all px-2 text-zinc-300 hover:text-zinc-150"
          style={{ paddingLeft: `${depth * 12 + 6}px` }}
          onClick={() => toggleExpand(col.id)}
        >
          <div className="flex items-center gap-1.5 overflow-hidden flex-1 min-w-0">
            <span className="text-zinc-500 hover:text-zinc-350 shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </span>
            <span className="text-orange-500 shrink-0">
              {isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
            </span>
            <span className="text-xs font-semibold truncate leading-none pt-0.5">{col.name}</span>
          </div>

          {/* Options Dropdown Trigger Button */}
          <div
            className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all ml-2 relative shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer flex items-center justify-center border border-transparent hover:border-zinc-700/50"
                  title="Options"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300">
                <DropdownMenuItem
                  onClick={() => onCreateRequest(col.id)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FilePlus className="w-3.5 h-3.5 text-orange-500" />
                  <span>Add Request</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={() => onCreateSubfolder(col.id)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-orange-500" />
                  <span>New Sub-collection</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={() => onExportFolder(col.id)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-orange-500" />
                  <span>Export Collection</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={() => onRenameFolder(col.id, col.name)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Rename Folder</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={() => onDuplicateFolder?.(col.id)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-orange-500" />
                  <span>Duplicate Collection</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="border-t border-zinc-850" />
                
                <DropdownMenuItem
                  onClick={() => onDeleteFolder(col.id)}
                  className="flex items-center gap-2 cursor-pointer text-rose-450 focus:text-rose-450 hover:text-rose-350 hover:bg-zinc-850 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Folder</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                        : 'hover:bg-zinc-850/30 text-zinc-400 hover:text-zinc-200'
                    }`}
                    style={{ paddingLeft: `${(depth + 1) * 12 + 18}px` }}
                    onClick={() => onRequestSelect(req)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                      <span className={`text-[10px] w-8 truncate font-mono shrink-0 ${getMethodBadgeClass(req.method)}`}>
                        {req.method}
                      </span>
                      <span className="text-xs truncate">{req.name}</span>
                    </div>

                    {/* Request Actions Options Dropdown Button */}
                    <div
                      className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all ml-2 relative shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-350 transition-colors cursor-pointer flex items-center justify-center border border-transparent hover:border-zinc-700/50"
                            title="Options"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300">
                          <DropdownMenuItem
                            onClick={() => onMoveRequest?.(req.id, req.collection_id)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <FolderInput className="w-3.5 h-3.5 text-orange-500" />
                            <span>Move Request</span>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => onDuplicateRequest?.(req.id)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5 text-orange-500" />
                            <span>Duplicate Request</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="border-t border-zinc-850" />

                          <DropdownMenuItem
                            onClick={() => onDeleteRequest(req.id)}
                            className="flex items-center gap-2 cursor-pointer text-rose-455 focus:text-rose-455 hover:text-rose-350 hover:bg-zinc-850 font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Request</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}

            {/* Empty State for Expanded Folder */}
            {!hasChildren && (
              <div
                className="py-1 text-[10px] text-zinc-605 italic"
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
        <div className="text-center text-zinc-650 py-8 text-xs italic">
          No collections created. Create one above!
        </div>
      ) : (
        collections.map((col) => renderNode(col, 0))
      )}
    </div>
  );
}
