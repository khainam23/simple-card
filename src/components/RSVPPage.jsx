import { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../AppContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  ChevronLeft, 
  Zap,
  CheckCircle2,
  Filter
} from 'lucide-react';
import './RSVPPage.css';

const RSVPPage = () => {
  const { flashcards, folders, currentFolder } = useApp();
  
  // Configuration State
  const [source, setSource] = useState('all'); // 'all', 'folder', 'selected'
  const [selectedFolderId, setSelectedFolderId] = useState(currentFolder?.id || '');
  const [selectedCardIds, setSelectedCardIds] = useState(new Set());
  const [wpm, setWpm] = useState(300);
  const [showAllFields, setShowAllFields] = useState(true);
  const [bgMode, setBgMode] = useState('fixed'); // 'fixed', 'random', 'cycle'
  const [multiWord, setMultiWord] = useState(false);
  const [wordsPerStep, setWordsPerStep] = useState(1);
  const [splitWords, setSplitWords] = useState(true);
  
  // Execution State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeWords, setActiveWords] = useState([]);
  const [bgColor, setBgColor] = useState('var(--color-bg-primary)');
  const [isConfiguring, setIsConfiguring] = useState(true);
  
  const timerRef = useRef(null);
  
  // Filter cards based on source
  const cardsToLearn = useMemo(() => {
    if (source === 'all') {
      return flashcards;
    } else if (source === 'folder') {
      return flashcards.filter(fc => fc.folderId == selectedFolderId);
    } else if (source === 'selected') {
      return flashcards.filter(fc => selectedCardIds.has(fc.id));
    }
    return [];
  }, [source, flashcards, selectedFolderId, selectedCardIds]);
  
  // Extract words/phrases from cards
  const allContent = useMemo(() => {
    return cardsToLearn.flatMap(card => {
      let fields = [];
      if (showAllFields) {
        fields = Object.values(card.fields || {}).filter(v => typeof v === 'string' && v.trim() !== '');
      } else {
        const firstField = Object.values(card.fields || {})[0];
        if (firstField) fields = [firstField];
      }

      if (splitWords) {
        return fields.flatMap(f => f.split(/\s+/).filter(w => w.length > 0));
      }
      return fields;
    });
  }, [cardsToLearn, showAllFields, splitWords]);

  // Handle Play/Pause
  useEffect(() => {
    if (isPlaying && currentIndex < allContent.length) {
      const interval = (60 / wpm) * 1000;
      
      timerRef.current = setTimeout(() => {
        const nextIndex = multiWord ? currentIndex + wordsPerStep : currentIndex + 1;
        
        if (nextIndex >= allContent.length) {
          setIsPlaying(false);
        } else {
          setCurrentIndex(nextIndex);
          
          // Background Color Logic
          if (bgMode === 'random') {
            setBgColor(`hsl(${Math.random() * 360}, 30%, 20%)`);
          } else if (bgMode === 'cycle') {
            setBgColor(`hsl(${(nextIndex * 20) % 360}, 30%, 20%)`);
          }
        }
      }, interval);
    } else {
      clearTimeout(timerRef.current);
    }
    
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, currentIndex, wpm, allContent, multiWord, wordsPerStep, bgMode]);

  useEffect(() => {
    if (multiWord) {
      setActiveWords(allContent.slice(currentIndex, currentIndex + wordsPerStep));
    } else {
      setActiveWords([allContent[currentIndex]]);
    }
  }, [currentIndex, allContent, multiWord, wordsPerStep]);

  const toggleCardSelection = (id) => {
    const newSelection = new Set(selectedCardIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedCardIds(newSelection);
  };

  const handleStart = () => {
    if (allContent.length > 0) {
      setIsConfiguring(false);
      setIsPlaying(true);
      setCurrentIndex(0);
    } else {
      alert('Không có nội dung để học. Vui lòng kiểm tra lại lựa chọn.');
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  if (isConfiguring) {
    return (
      <div className="rsvp-config">
        <div className="config-header">
          <Zap size={24} className="text-primary" />
          <h2>Cấu hình RSVP Speed Reading</h2>
        </div>
        
        <div className="config-grid">
          {/* Nguồn dữ liệu */}
          <div className="config-section">
            <h3><Filter size={18} /> Nguồn dữ liệu</h3>
            <div className="radio-group">
              <label className={`radio-item ${source === 'all' ? 'active' : ''}`}>
                <input type="radio" value="all" checked={source === 'all'} onChange={() => setSource('all')} />
                Tất cả từ ({flashcards.length})
              </label>
              <label className={`radio-item ${source === 'folder' ? 'active' : ''}`}>
                <input type="radio" value="folder" checked={source === 'folder'} onChange={() => setSource('folder')} />
                Theo Folder
              </label>
              <label className={`radio-item ${source === 'selected' ? 'active' : ''}`}>
                <input type="radio" value="selected" checked={source === 'selected'} onChange={() => setSource('selected')} />
                Tùy chọn
              </label>
            </div>
            
            {source === 'folder' && (
              <select 
                className="input mt-2"
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
              >
                <option value="">Chọn folder...</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            )}
            
            {source === 'selected' && (
              <div className="card-selector">
                {flashcards.map(card => (
                  <div 
                    key={card.id} 
                    className={`selectable-card ${selectedCardIds.has(card.id) ? 'selected' : ''}`}
                    onClick={() => toggleCardSelection(card.id)}
                  >
                    {selectedCardIds.has(card.id) && <CheckCircle2 size={14} />}
                    <span>{Object.values(card.fields || {})[0]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cấu hình hiển thị */}
          <div className="config-section">
            <h3><Settings size={18} /> Hiển thị & Tốc độ</h3>
            
            <div className="form-group">
              <label className="label">Tốc độ (WPM: {wpm})</label>
              <input 
                type="range" 
                min="50" 
                max="1000" 
                step="10" 
                value={wpm} 
                onChange={(e) => setWpm(parseInt(e.target.value))}
                className="range-input"
              />
              <div className="range-labels">
                <span>Chậm</span>
                <span>Nhanh</span>
              </div>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-item">
                <input type="checkbox" checked={showAllFields} onChange={(e) => setShowAllFields(e.target.checked)} />
                Hiển thị tất cả các trường thông tin
              </label>
              <label className="checkbox-item">
                <input type="checkbox" checked={splitWords} onChange={(e) => setSplitWords(e.target.checked)} />
                Tách nội dung thành từng từ
              </label>
              <label className="checkbox-item">
                <input type="checkbox" checked={multiWord} onChange={(e) => setMultiWord(e.target.checked)} />
                Hiển thị nhiều từ cùng lúc
              </label>
            </div>

            {multiWord && (
              <div className="form-group">
                <label className="label">Số từ mỗi lần: {wordsPerStep}</label>
                <input 
                  type="number" 
                  min="2" 
                  max="10" 
                  value={wordsPerStep} 
                  onChange={(e) => setWordsPerStep(parseInt(e.target.value))}
                  className="input"
                />
              </div>
            )}
          </div>

          {/* Màu nền */}
          <div className="config-section">
            <h3>Màu nền</h3>
            <div className="radio-group horizontal">
              <label className={`radio-item ${bgMode === 'fixed' ? 'active' : ''}`}>
                <input type="radio" value="fixed" checked={bgMode === 'fixed'} onChange={() => setBgMode('fixed')} />
                Cố định
              </label>
              <label className={`radio-item ${bgMode === 'random' ? 'active' : ''}`}>
                <input type="radio" value="random" checked={bgMode === 'random'} onChange={() => setBgMode('random')} />
                Ngẫu nhiên
              </label>
              <label className={`radio-item ${bgMode === 'cycle' ? 'active' : ''}`}>
                <input type="radio" value="cycle" checked={bgMode === 'cycle'} onChange={() => setBgMode('cycle')} />
                Chu kỳ
              </label>
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-lg start-btn" onClick={handleStart}>
          <Play size={20} /> Bắt đầu học
        </button>
      </div>
    );
  }

  return (
    <div className="rsvp-player" style={{ backgroundColor: bgMode === 'fixed' ? 'var(--color-bg-primary)' : bgColor }}>
      <button className="back-btn" onClick={() => setIsConfiguring(true)}>
        <ChevronLeft size={24} /> Quay lại cấu hình
      </button>

      <div className="rsvp-display">
        <div className="word-container">
          {activeWords.map((word, i) => (
            <span key={i} className="rsvp-word">{word}</span>
          ))}
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentIndex / allContent.length) * 100}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {currentIndex + 1} / {allContent.length}
        </div>
      </div>

      <div className="rsvp-controls">
        <button className="btn btn-icon btn-lg" onClick={handleReset}>
          <RotateCcw size={24} />
        </button>
        <button className="btn btn-primary btn-icon btn-xl" onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <Pause size={32} /> : <Play size={32} />}
        </button>
        <div className="speed-badge">
          {wpm} WPM
        </div>
      </div>
    </div>
  );
};

export default RSVPPage;
