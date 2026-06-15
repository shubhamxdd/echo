import { useState } from 'react';
import { Collection, SavedRequest, HistoryItem } from '../../types';
import { CollectionTree } from './CollectionTree';
import { HistoryList } from './HistoryList';
import { FolderPlus, Search, History, FolderOpen, Upload, HelpCircle } from 'lucide-react';

interface SidebarProps {
  collections: Collection[];
  historyItems: HistoryItem[];
  activeRequestId: string | null;
  onRequestSelect: (req: SavedRequest) => void;
  onHistorySelect: (item: HistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
  onCreateCollectionClick: () => void;
  onCreateSubfolder: (parentId: string) => void;
  onCreateRequest: (collectionId: string) => void;
  onRenameFolder: (id: string, currentName: string) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onExportFolder: (id: string) => void;
  onImportCollection: (data: any) => void;
  onHelpClick: () => void;
  onMoveRequest?: (requestId: string, currentCollectionId: string) => void;
  onMoveRequestDirect?: (requestId: string, targetCollectionId: string) => void;
  onDuplicateFolder?: (id: string) => void;
  onDuplicateRequest?: (id: string) => void;
}

export function Sidebar({
  collections,
  historyItems,
  activeRequestId,
  onRequestSelect,
  onHistorySelect,
  onDeleteHistoryItem,
  onClearHistory,
  onCreateCollectionClick,
  onCreateSubfolder,
  onCreateRequest,
  onRenameFolder,
  onDeleteFolder,
  onDeleteRequest,
  onExportFolder,
  onImportCollection,
  onHelpClick,
  onMoveRequest,
  onMoveRequestDirect,
  onDuplicateFolder,
  onDuplicateRequest,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'collections' | 'history'>('collections');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering helper for Collections
  const filterCollections = (cols: Collection[], query: string): Collection[] => {
    if (!query) return cols;
    const lowerQuery = query.toLowerCase();

    return cols
      .map((col) => {
        // Filter sub-folders
        const filteredChildren = col.children ? filterCollections(col.children, query) : [];
        
        // Filter requests
        const filteredRequests = col.requests
          ? col.requests.filter(
              (r) =>
                r.name.toLowerCase().includes(lowerQuery) ||
                r.url.toLowerCase().includes(lowerQuery) ||
                r.method.toLowerCase().includes(lowerQuery)
            )
          : [];

        // Match collection itself
        const colMatches = col.name.toLowerCase().includes(lowerQuery);

        if (colMatches || filteredChildren.length > 0 || filteredRequests.length > 0) {
          const matchedCol: Collection = {
            ...col,
            children: filteredChildren,
            requests: filteredRequests,
          };
          return matchedCol;
        }
        return null;
      })
      .filter((c): c is Collection => c !== null);
  };

  // Filtering helper for History
  const filterHistory = (items: HistoryItem[], query: string): HistoryItem[] => {
    if (!query) return items;
    const lowerQuery = query.toLowerCase();
    return items.filter(
      (item) =>
        item.url.toLowerCase().includes(lowerQuery) ||
        item.method.toLowerCase().includes(lowerQuery) ||
        (item.status_code && String(item.status_code).includes(lowerQuery))
    );
  };

  const filteredCollections = filterCollections(collections, searchQuery);
  const filteredHistory = filterHistory(historyItems, searchQuery);

  return (
    <div className="w-[280px] bg-zinc-900 border-r border-zinc-800 flex flex-col h-full overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-600 rounded-md flex items-center justify-center font-bold text-sm text-white">
            E
          </div>
          <span className="font-semibold text-xs tracking-wide text-zinc-100">Echo</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Help Button */}
          <button
            onClick={onHelpClick}
            className="text-zinc-400 hover:text-orange-405 p-1.5 rounded-md hover:bg-zinc-850 transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Import Button */}
          <label
            className="text-zinc-400 hover:text-orange-405 p-1.5 rounded-md hover:bg-zinc-850 transition-colors cursor-pointer"
            title="Import collection"
          >
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const parsed = JSON.parse(event.target?.result as string);
                    onImportCollection(parsed);
                  } catch (err) {
                    alert('Invalid JSON file');
                  }
                };
                reader.readAsText(file);
                e.target.value = ''; // Reset
              }}
              className="hidden"
            />
          </label>

          {/* Create Collection */}
          <button
            onClick={onCreateCollectionClick}
            className="text-zinc-400 hover:text-orange-400 p-1.5 rounded-md hover:bg-zinc-850 transition-colors"
            title="Create new collection"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex px-3 pt-2 pb-1 bg-zinc-900/50">
        <button
          onClick={() => setActiveTab('collections')}
          className={`flex-1 py-1.5 text-center text-xs flex items-center justify-center gap-1.5 rounded-md transition-all font-medium ${
            activeTab === 'collections'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/50 shadow'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Collections
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-1.5 text-center text-xs flex items-center justify-center gap-1.5 rounded-md transition-all font-medium ${
            activeTab === 'history'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/50 shadow'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          History
        </button>
      </div>

      {/* Search Input */}
      <div className="px-3 py-2">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-zinc-650" />
          <input
            type="text"
            placeholder={activeTab === 'collections' ? 'Filter collections...' : 'Filter history...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 focus:outline-none rounded-md py-1.5 pl-8 pr-3 text-xs text-zinc-200 placeholder-zinc-700 transition-colors"
          />
        </div>
      </div>

      {/* Scrollable Tree/List Area */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {activeTab === 'collections' ? (
          <CollectionTree
            collections={filteredCollections}
            activeRequestId={activeRequestId}
            onRequestSelect={onRequestSelect}
            onCreateSubfolder={onCreateSubfolder}
            onCreateRequest={onCreateRequest}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
            onDeleteRequest={onDeleteRequest}
            onExportFolder={onExportFolder}
            onMoveRequest={onMoveRequest}
            onMoveRequestDirect={onMoveRequestDirect}
            onDuplicateFolder={onDuplicateFolder}
            onDuplicateRequest={onDuplicateRequest}
          />
        ) : (
          <HistoryList
            historyItems={filteredHistory}
            onItemSelect={onHistorySelect}
            onDeleteItem={onDeleteHistoryItem}
            onClearHistory={onClearHistory}
          />
        )}
      </div>
    </div>
  );
}
