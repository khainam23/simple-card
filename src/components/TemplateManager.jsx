import { useState } from 'react';
import { useApp } from '../AppContext';
import { Plus, Edit2, Trash2, LayoutTemplate, GripVertical, X } from 'lucide-react';
import './TemplateManager.css';

const TemplateManager = () => {
  const { templates, createTemplate, updateTemplate, deleteTemplate } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templateFields, setTemplateFields] = useState([
    { name: '', type: 'text', placeholder: '' }
  ]);

  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateName(template.name);
      setTemplateFields([...template.fields]);
    } else {
      setEditingTemplate(null);
      setTemplateName('');
      setTemplateFields([{ name: '', type: 'text', placeholder: '' }]);
    }
    setShowModal(true);
  };

  const handleAddField = () => {
    if (templateFields.length >= 5) {
      alert('Tối đa 5 trường cho mỗi template');
      return;
    }
    setTemplateFields([...templateFields, { name: '', type: 'text', placeholder: '' }]);
  };

  const handleRemoveField = (index) => {
    if (templateFields.length <= 1) {
      alert('Template phải có ít nhất 1 trường');
      return;
    }
    setTemplateFields(templateFields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, field, value) => {
    const newFields = [...templateFields];
    newFields[index][field] = value;
    setTemplateFields(newFields);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!templateName.trim()) {
      alert('Vui lòng nhập tên template');
      return;
    }

    if (templateFields.some(f => !f.name.trim())) {
      alert('Vui lòng nhập tên cho tất cả các trường');
      return;
    }

    const templateData = {
      name: templateName.trim(),
      fields: templateFields.map(f => ({
        name: f.name.trim(),
        type: f.type,
        placeholder: f.placeholder.trim()
      }))
    };

    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, templateData);
    } else {
      await createTemplate(templateData);
    }

    setShowModal(false);
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateFields([{ name: '', type: 'text', placeholder: '' }]);
  };

  const handleDelete = async (templateId) => {
    if (confirm('Xóa template này? Các flashcard sử dụng template này sẽ không bị ảnh hưởng.')) {
      await deleteTemplate(templateId);
    }
  };

  return (
    <div className="template-manager">
      <div className="manager-header">
        <div>
          <h2>Quản Lý Templates</h2>
          <p className="text-secondary">
            Tạo template để tái sử dụng cấu trúc flashcard. Tối đa 5 trường/template.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Tạo Template
        </button>
      </div>

      <div className="templates-grid">
        {templates.length === 0 ? (
          <div className="empty-state">
            <LayoutTemplate size={48} />
            <p>Chưa có template nào</p>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              <Plus size={18} />
              Tạo template đầu tiên
            </button>
          </div>
        ) : (
          templates.map(template => (
            <div key={template.id} className="template-card card">
              <div className="template-header">
                <div className="template-icon">
                  <LayoutTemplate size={24} />
                </div>
                <h3>{template.name}</h3>
              </div>
              
              <div className="template-fields-preview">
                <p className="text-secondary">{template.fields.length} trường:</p>
                <ul>
                  {template.fields.map((field, index) => (
                    <li key={index}>
                      <span className="field-name">{field.name}</span>
                      <span className="field-type badge">{field.type}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="template-actions">
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleOpenModal(template)}
                >
                  <Edit2 size={16} />
                  Chỉnh sửa
                </button>
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDelete(template.id)}
                >
                  <Trash2 size={16} />
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <h3>{editingTemplate ? 'Chỉnh Sửa Template' : 'Tạo Template Mới'}</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Tên Template</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ví dụ: Học Tiếng Anh, Lịch Sử, Toán Học..."
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <div className="label-with-action">
                  <label className="label">Các Trường ({templateFields.length}/5)</label>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={handleAddField}
                    disabled={templateFields.length >= 5}
                  >
                    <Plus size={14} />
                    Thêm trường
                  </button>
                </div>

                <div className="fields-list">
                  {templateFields.map((field, index) => (
                    <div key={index} className="field-editor card">
                      <div className="field-editor-header">
                        <GripVertical size={16} className="text-tertiary" />
                        <span className="field-number">Trường {index + 1}</span>
                        {templateFields.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => handleRemoveField(index)}
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>

                      <div className="field-editor-body">
                        <div className="form-row">
                          <div className="form-col">
                            <label className="label">Tên trường</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Ví dụ: Question, Answer, Note..."
                              value={field.name}
                              onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-col">
                            <label className="label">Loại</label>
                            <select
                              className="input select"
                              value={field.type}
                              onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                            >
                              <option value="text">Text</option>
                              <option value="textarea">Textarea</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-col">
                          <label className="label">Placeholder (tùy chọn)</label>
                          <input
                            type="text"
                            className="input"
                            placeholder="Văn bản gợi ý..."
                            value={field.placeholder}
                            onChange={(e) => handleFieldChange(index, 'placeholder', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTemplate ? 'Cập nhật' : 'Tạo Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
