import { createContext, useContext, useState, useEffect } from 'react';
import { folderService, templateService, flashcardService, dataService } from './db';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [folders, setFolders] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Initialize sample data if empty
      await dataService.initializeSampleData();
      
      const [foldersData, templatesData, flashcardsData] = await Promise.all([
        folderService.getAll(),
        templateService.getAll(),
        flashcardService.getAll()
      ]);
      
      setFolders(foldersData);
      setTemplates(templatesData);
      setFlashcards(flashcardsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Folder operations
  const createFolder = async (folderData) => {
    const newFolder = await folderService.create(folderData);
    setFolders([...folders, newFolder]);
    return newFolder;
  };

  const updateFolder = async (id, updates) => {
    const updated = await folderService.update(id, updates);
    setFolders(folders.map(f => f.id === id ? updated : f));
    return updated;
  };

  const deleteFolder = async (id) => {
    await folderService.delete(id);
    setFolders(folders.filter(f => f.id !== id));
    // Also remove flashcards from this folder
    setFlashcards(flashcards.filter(fc => fc.folderId !== id));
    if (currentFolder?.id === id) {
      setCurrentFolder(null);
    }
  };

  // Template operations
  const createTemplate = async (templateData) => {
    const newTemplate = await templateService.create(templateData);
    setTemplates([...templates, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = async (id, updates) => {
    const updated = await templateService.update(id, updates);
    setTemplates(templates.map(t => t.id === id ? updated : t));
    return updated;
  };

  const deleteTemplate = async (id) => {
    await templateService.delete(id);
    setTemplates(templates.filter(t => t.id !== id));
  };

  // Flashcard operations
  const createFlashcard = async (flashcardData) => {
    const newFlashcard = await flashcardService.create(flashcardData);
    setFlashcards([...flashcards, newFlashcard]);
    return newFlashcard;
  };

  const updateFlashcard = async (id, updates) => {
    const updated = await flashcardService.update(id, updates);
    setFlashcards(flashcards.map(fc => fc.id === id ? updated : fc));
    return updated;
  };

  const deleteFlashcard = async (id) => {
    await flashcardService.delete(id);
    setFlashcards(flashcards.filter(fc => fc.id !== id));
  };

  const markFlashcardReviewed = async (id) => {
    await flashcardService.markReviewed(id);
    const updated = await flashcardService.getById(id);
    setFlashcards(flashcards.map(fc => fc.id === id ? updated : fc));
  };

  const resetFlashcardReview = async (id) => {
    await flashcardService.resetReview(id);
    const updated = await flashcardService.getById(id);
    setFlashcards(flashcards.map(fc => fc.id === id ? updated : fc));
  };

  // Get flashcards for current folder
  const getCurrentFolderFlashcards = () => {
    if (!currentFolder) return [];
    return flashcards.filter(fc => fc.folderId === currentFolder.id);
  };

  // Export/Import operations
  const exportToJSON = async () => {
    const data = await dataService.exportJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFromJSON = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = await dataService.importJSON(data);
      if (result.success) {
        await loadData();
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    // State
    folders,
    templates,
    flashcards,
    currentFolder,
    loading,
    
    // Setters
    setCurrentFolder,
    
    // Folder operations
    createFolder,
    updateFolder,
    deleteFolder,
    
    // Template operations
    createTemplate,
    updateTemplate,
    deleteTemplate,
    
    // Flashcard operations
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    markFlashcardReviewed,
    resetFlashcardReview,
    getCurrentFolderFlashcards,
    
    // Data operations
    exportToJSON,
    importFromJSON,
    loadData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
