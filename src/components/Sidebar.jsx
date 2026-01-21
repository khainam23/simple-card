import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { 
  Folder, 
  FolderPlus, 
  ChevronRight, 
  ChevronDown, 
  MoreVertical,
  Edit2,
  Trash2,
  FolderOpen
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const { 
    folders, 
    currentFolder, 
    setCurrentFolder, 
    createFolder, 
    updateFolder, 
    deleteFolder 
  } = useApp();
  
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParent, setNewFolderParent] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const handleFolderSelect = (folder) => {
    setCurrentFolder(folder);
    navigate('/app/flashcards');
  };

  // Toggle folder expansion
  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Build folder tree
  const buildFolderTree = (parentId = null, level = 0) => {
    return folders
      .filter(f => f.parentId === parentId)
      .map(folder => {
        const hasChildren = folders.some(f => f.parentId === folder.id);
        const isExpanded = expandedFolders.has(folder.id);
        const isActive = currentFolder?.id === folder.id;

        return (
          <div key={folder.id} className="folder-item-wrapper">
            <div 
              className={`folder-item ${isActive ? 'active' : ''}`}
              style={{ paddingLeft: `${level * 20 + 12}px` }}
            >
              <button 
                className="folder-toggle"
                onClick={() => toggleFolder(folder.id)}
                disabled={!hasChildren}
              >
                {hasChildren ? (
                  isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                ) : (
                  <span style={{ width: 16 }} />
                )}
              </button>
              
              <button 
                className="folder-name"
                onClick={() => handleFolderSelect(folder)}
              >
                {isActive ? <FolderOpen size={18} /> : <Folder size={18} />}
                <span>{folder.name}</span>
              </button>
              
              <button 
                className="folder-menu"
                onClick={(e) => {
                  e.stopPropagation();
                  setContextMenu(contextMenu?.id === folder.id ? null : folder);
                }}
              >
                <MoreVertical size={16} />
              </button>
              
              {contextMenu?.id === folder.id && (
                <div className="context-menu">
                  <button onClick={() => {
                    setNewFolderParent(folder.id);
                    setShowNewFolderModal(true);
                    setContextMenu(null);
                  }}>
                    <FolderPlus size={16} />
                    Thêm folder con
                  </button>
                  <button onClick={() => {
                    setEditingFolder(folder);
                    setNewFolderName(folder.name);
                    setContextMenu(null);
                  }}>
                    <Edit2 size={16} />
                    Đổi tên
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm(`Xóa folder "${folder.name}" và tất cả nội dung?`)) {
                        deleteFolder(folder.id);
                      }
                      setContextMenu(null);
                    }}
                    className="danger"
                  >
                    <Trash2 size={16} />
                    Xóa
                  </button>
                </div>
              )}
            </div>
            
            {hasChildren && isExpanded && buildFolderTree(folder.id, level + 1)}
          </div>
        );
      });
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    await createFolder({
      name: newFolderName.trim(),
      parentId: newFolderParent
    });
    
    setNewFolderName('');
    setNewFolderParent(null);
    setShowNewFolderModal(false);
    
    // Expand parent folder if creating subfolder
    if (newFolderParent) {
      setExpandedFolders(new Set([...expandedFolders, newFolderParent]));
    }
  };

  const handleUpdateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim() || !editingFolder) return;
    
    await updateFolder(editingFolder.id, { name: newFolderName.trim() });
    setEditingFolder(null);
    setNewFolderName('');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Folders</h3>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => {
            setNewFolderParent(null);
            setShowNewFolderModal(true);
          }}
        >
          <FolderPlus size={16} />
          Tạo mới
        </button>
      </div>
      
      <div className="folder-tree">
        <button 
          className={`folder-item ${!currentFolder ? 'active' : ''}`}
          onClick={() => handleFolderSelect(null)}
        >
          <Folder size={18} />
          <span>Tất cả Flashcards</span>
        </button>
        
        {buildFolderTree()}
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="modal-overlay" onClick={() => setShowNewFolderModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Tạo Folder Mới</h3>
            <form onSubmit={handleCreateFolder}>
              <div className="form-group">
                <label className="label">Tên folder</label>
                <input 
                  type="text"
                  className="input"
                  placeholder="Nhập tên folder..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowNewFolderModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Folder Modal */}
      {editingFolder && (
        <div className="modal-overlay" onClick={() => setEditingFolder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Đổi Tên Folder</h3>
            <form onSubmit={handleUpdateFolder}>
              <div className="form-group">
                <label className="label">Tên folder</label>
                <input 
                  type="text"
                  className="input"
                  placeholder="Nhập tên folder..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setEditingFolder(null)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
