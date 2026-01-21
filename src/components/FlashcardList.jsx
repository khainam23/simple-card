import { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Check,
  RotateCcw,
  LayoutTemplate,
  Folder,
  CheckCircle2
} from 'lucide-react';
import './FlashcardList.css';

const FlashcardList = ({ searchQuery }) => {
  const { 
    flashcards, 
    currentFolder, 
    folders,
    templates,
    createFlashcard, 
    updateFlashcard, 
    deleteFlashcard,
    markFlashcardReviewed,
    resetFlashcardReview
  } = useApp();
  
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [cardFields, setCardFields] = useState({});
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [viewMode, setViewMode] = useState('cards');

  // Filter and Sort flashcards
  const filteredCards = flashcards
    .filter(card => {
      const matchesFolder = currentFolder ? card.folderId === currentFolder.id : true;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return matchesFolder && Object.values(card.fields).some(value => 
          String(value).toLowerCase().includes(query)
        );
      }
      return matchesFolder;
    })
    .sort((a, b) => {
      // Thẻ chưa học (lastReviewed === null) lên trước
      if (a.lastReviewed === b.lastReviewed) return 0;
      if (a.lastReviewed === null) return -1;
      if (b.lastReviewed === null) return 1;
      // Cả hai đã học thì sắp xếp theo thời gian học (cũ nhất lên trước để ôn lại)
      return new Date(a.lastReviewed) - new Date(b.lastReviewed);
    });

  const handleOpenModal = (card = null) => {
    if (card) {
      setEditingCard(card);
      setCardFields(card.fields);
      setSelectedTemplate(card.templateId);
      setSelectedFolderId(card.folderId);
    } else {
      setEditingCard(null);
      setCardFields({});
      setSelectedTemplate(null);
      setSelectedFolderId(currentFolder ? currentFolder.id : (folders[0]?.id || ''));
    }
    setShowModal(true);
  };

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === parseInt(templateId));
    if (template) {
      const newFields = {};
      template.fields.forEach(field => {
        newFields[field.name] = '';
      });
      setCardFields(newFields);
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setCardFields({ ...cardFields, [fieldName]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFolderId) {
      alert('Vui lòng tạo ít nhất một folder');
      return;
    }
    const cardData = {
      folderId: parseInt(selectedFolderId),
      templateId: selectedTemplate ? parseInt(selectedTemplate) : null,
      fields: cardFields
    };
    if (editingCard) {
      await updateFlashcard(editingCard.id, cardData);
    } else {
      await createFlashcard(cardData);
    }
    setShowModal(false);
  };

  const toggleFlip = (cardId) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(cardId)) newFlipped.delete(cardId);
    else newFlipped.add(cardId);
    setFlippedCards(newFlipped);
  };

  const getFieldsForNewCard = () => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === parseInt(selectedTemplate));
      return template ? template.fields : [];
    }
    return [
      { name: 'Front', type: 'text', placeholder: 'Mặt trước...' },
      { name: 'Back', type: 'textarea', placeholder: 'Mặt sau...' }
    ];
  };

  return (
    <div className="flashcard-list">
      <div className="list-header">
        <div>
          <h2>{currentFolder ? currentFolder.name : 'Tất cả Flashcards'}</h2>
          <p className="text-secondary">{filteredCards.length} flashcards</p>
        </div>
        
        <div className="list-actions">
          <div className="view-toggle">
            <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('list')}>Danh sách</button>
            <button className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('cards')}>Thẻ lật</button>
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}><Plus size={18} /> Tạo Flashcard</button>
        </div>
      </div>

      {filteredCards.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có flashcard nào</p>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}><Plus size={18} /> Tạo flashcard đầu tiên</button>
        </div>
      ) : (
        <div className={`cards-container ${viewMode}`}>
          {filteredCards.map(card => {
            const isFlipped = flippedCards.has(card.id);
            const isReviewed = !!card.lastReviewed;
            const fieldEntries = Object.entries(card.fields);
            const frontField = fieldEntries[0];
            const backField = fieldEntries[1];

            return (
              <div key={card.id} className={`flashcard-item card ${isReviewed ? 'reviewed' : ''}`}>
                {isReviewed && (
                  <div className="reviewed-badge">
                    <CheckCircle2 size={14} />
                    Đã học
                  </div>
                )}
                
                {viewMode === 'cards' ? (
                  <div className={`flashcard-flip ${isFlipped ? 'flipped' : ''}`} onClick={() => toggleFlip(card.id)}>
                    <div className="flashcard-front">
                      <div className="flashcard-label">{frontField?.[0]}</div>
                      <div className="flashcard-content">{frontField?.[1]}</div>
                      <div className="flip-hint">Click để lật</div>
                    </div>
                    <div className="flashcard-back">
                      <div className="flashcard-label">{backField?.[0]}</div>
                      <div className="flashcard-content">{backField?.[1]}</div>
                      {fieldEntries.length > 2 && <div className="more-fields-hint">+{fieldEntries.length - 2} trường khác</div>}
                    </div>
                  </div>
                ) : (
                  <div className="flashcard-fields">
                    {fieldEntries.map(([key, value]) => (
                      <div key={key} className="field-item"><strong>{key}:</strong> {value}</div>
                    ))}
                  </div>
                )}
                
                <div className="flashcard-actions">
                  {isReviewed ? (
                    <button 
                      className="btn btn-ghost btn-sm text-warning" 
                      onClick={(e) => { e.stopPropagation(); resetFlashcardReview(card.id); }}
                      title="Quên (Học lại)"
                    >
                      <RotateCcw size={16} />
                      <span>Quên</span>
                    </button>
                  ) : (
                    <button 
                      className="btn btn-ghost btn-sm text-success" 
                      onClick={(e) => { e.stopPropagation(); markFlashcardReviewed(card.id); }}
                      title="Đánh dấu đã học"
                    >
                      <Check size={16} />
                      <span>Xong</span>
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleOpenModal(card); }}><Edit2 size={16} /></button>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); if(confirm('Xóa?')) deleteFlashcard(card.id); }}><Trash2 size={16} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal giữ nguyên logic cũ nhưng thêm style scroll */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <h3>{editingCard ? 'Chỉnh Sửa' : 'Tạo Mới'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="label">Folder</label>
                  <select className="input select" value={selectedFolderId} onChange={(e) => setSelectedFolderId(e.target.value)} required>
                    <option value="" disabled>-- Chọn --</option>
                    {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Template</label>
                  <select className="input select" value={selectedTemplate || ''} onChange={(e) => handleTemplateChange(e.target.value)}>
                    <option value="">Mặc định</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {getFieldsForNewCard().map((field, index) => (
                  <div key={index} className="form-group">
                    <label className="label">{field.name}</label>
                    {field.type === 'textarea' ? (
                      <textarea className="input textarea" value={cardFields[field.name] || ''} onChange={(e) => handleFieldChange(field.name, e.target.value)} required />
                    ) : (
                      <input type="text" className="input" value={cardFields[field.name] || ''} onChange={(e) => handleFieldChange(field.name, e.target.value)} required />
                    )}
                  </div>
                ))}
              </div>
              <div className="modal-actions" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editingCard ? 'Cập nhật' : 'Tạo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardList;
