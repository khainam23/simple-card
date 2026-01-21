import { useState } from 'react';
import { useApp } from '../AppContext';
import { Download, Upload, FileJson, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import './ExportImport.css';

const ExportImport = () => {
  const { folders, templates, flashcards, exportToJSON, importFromJSON, loadData } = useApp();
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleExportJSON = async () => {
    await exportToJSON();
  };

  const handleExportExcel = () => {
    // Prepare data for Excel
    const worksheetData = flashcards.map(card => {
      const folder = folders.find(f => f.id === card.folderId);
      const template = templates.find(t => t.id === card.templateId);
      
      return {
        'Folder': folder?.name || 'N/A',
        'Template': template?.name || 'Custom',
        ...card.fields,
        'Created': new Date(card.createdAt).toLocaleDateString('vi-VN'),
        'Last Reviewed': card.lastReviewed 
          ? new Date(card.lastReviewed).toLocaleDateString('vi-VN') 
          : 'Chưa học'
      };
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add flashcards sheet
    const ws = XLSX.utils.json_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(wb, ws, 'Flashcards');
    
    // Add folders sheet
    const foldersData = folders.map(f => ({
      'ID': f.id,
      'Name': f.name,
      'Parent ID': f.parentId || 'Root',
      'Created': new Date(f.createdAt).toLocaleDateString('vi-VN')
    }));
    const wsFolder = XLSX.utils.json_to_sheet(foldersData);
    XLSX.utils.book_append_sheet(wb, wsFolder, 'Folders');
    
    // Add templates sheet
    const templatesData = templates.map(t => ({
      'ID': t.id,
      'Name': t.name,
      'Fields': t.fields.map(f => f.name).join(', '),
      'Created': new Date(t.createdAt).toLocaleDateString('vi-VN')
    }));
    const wsTemplate = XLSX.utils.json_to_sheet(templatesData);
    XLSX.utils.book_append_sheet(wb, wsTemplate, 'Templates');
    
    // Download
    const fileName = `flashcards-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleImportJSON = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const result = await importFromJSON(file);
      setImportResult(result);
      
      if (result.success) {
        setTimeout(() => {
          setImportResult(null);
        }, 3000);
      }
    } catch (error) {
      setImportResult({ success: false, error: error.message });
    } finally {
      setImporting(false);
      event.target.value = ''; // Reset input
    }
  };

  const stats = {
    folders: folders.length,
    templates: templates.length,
    flashcards: flashcards.length,
    reviewed: flashcards.filter(c => c.lastReviewed).length
  };

  return (
    <div className="export-import">
      <div className="section-header">
        <h2>Export & Import Dữ Liệu</h2>
        <p className="text-secondary">
          Sao lưu và khôi phục dữ liệu flashcard của bạn
        </p>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'var(--gradient-primary)' }}>
            📁
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.folders}</div>
            <div className="stat-label">Folders</div>
          </div>
        </div>
        
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'var(--gradient-accent)' }}>
            📋
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.templates}</div>
            <div className="stat-label">Templates</div>
          </div>
        </div>
        
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'var(--gradient-hero)' }}>
            🎴
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.flashcards}</div>
            <div className="stat-label">Flashcards</div>
          </div>
        </div>
        
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            ✅
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.reviewed}</div>
            <div className="stat-label">Đã học</div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="export-section">
        <h3>📤 Export Dữ Liệu</h3>
        <p className="text-secondary">
          Xuất toàn bộ dữ liệu (folders, templates, flashcards) sang file
        </p>
        
        <div className="export-options">
          <div className="export-card card card-glass">
            <FileJson size={48} className="export-icon" />
            <h4>Export JSON</h4>
            <p>
              File JSON chứa toàn bộ dữ liệu. Phù hợp để sao lưu và khôi phục hoàn chỉnh.
            </p>
            <button className="btn btn-primary" onClick={handleExportJSON}>
              <Download size={18} />
              Tải JSON
            </button>
          </div>
          
          <div className="export-card card card-glass">
            <FileSpreadsheet size={48} className="export-icon" />
            <h4>Export Excel</h4>
            <p>
              File Excel (.xlsx) với nhiều sheet. Dễ xem và chỉnh sửa trong Excel/Google Sheets.
            </p>
            <button className="btn btn-primary" onClick={handleExportExcel}>
              <Download size={18} />
              Tải Excel
            </button>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="import-section">
        <h3>📥 Import Dữ Liệu</h3>
        <p className="text-secondary">
          Khôi phục dữ liệu từ file JSON đã export trước đó
        </p>
        
        <div className="import-area card">
          <div className="import-content">
            <Upload size={48} className="import-icon" />
            <h4>Import từ JSON</h4>
            <p>
              Chọn file JSON để khôi phục dữ liệu. 
              <strong className="text-warning"> Lưu ý: Dữ liệu hiện tại sẽ bị ghi đè!</strong>
            </p>
            
            <label className="btn btn-secondary">
              <Upload size={18} />
              Chọn file JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                style={{ display: 'none' }}
                disabled={importing}
              />
            </label>
            
            {importing && (
              <div className="import-status">
                <div className="animate-pulse">Đang import...</div>
              </div>
            )}
            
            {importResult && (
              <div className={`import-status ${importResult.success ? 'success' : 'error'}`}>
                {importResult.success ? (
                  <>
                    <CheckCircle size={20} />
                    <span>Import thành công!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={20} />
                    <span>Import thất bại: {importResult.error}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="info-section card card-glass">
        <h4>ℹ️ Thông Tin</h4>
        <ul>
          <li>Dữ liệu được lưu trữ vĩnh viễn trên trình duyệt (IndexedDB)</li>
          <li>Export định kỳ để sao lưu dữ liệu quan trọng</li>
          <li>File JSON có thể import lại để khôi phục dữ liệu</li>
          <li>File Excel chỉ để xem, không thể import lại</li>
          <li>Import sẽ ghi đè toàn bộ dữ liệu hiện tại</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportImport;
