import Dexie from 'dexie';

// Initialize Dexie database
export const db = new Dexie('FlashCardDB');

// Define database schema
db.version(1).stores({
  folders: '++id, name, parentId, createdAt, updatedAt',
  templates: '++id, name, fields, createdAt, updatedAt',
  flashcards: '++id, folderId, templateId, fields, createdAt, updatedAt, lastReviewed'
});

// ============================================
// FOLDER OPERATIONS
// ============================================

export const folderService = {
  // Get all folders
  async getAll() {
    return await db.folders.toArray();
  },

  // Get folder by ID
  async getById(id) {
    return await db.folders.get(id);
  },

  // Get root folders (no parent)
  async getRootFolders() {
    return await db.folders.where('parentId').equals(null).toArray();
  },

  // Get child folders
  async getChildFolders(parentId) {
    return await db.folders.where('parentId').equals(parentId).toArray();
  },

  // Create new folder
  async create(folderData) {
    const folder = {
      name: folderData.name,
      parentId: folderData.parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const id = await db.folders.add(folder);
    return { ...folder, id };
  },

  // Update folder
  async update(id, updates) {
    await db.folders.update(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return await db.folders.get(id);
  },

  // Delete folder and all its contents (recursive)
  async delete(id) {
    // Get all child folders recursively
    const childFolders = await this.getChildFolders(id);

    // Delete all child folders
    for (const child of childFolders) {
      await this.delete(child.id);
    }

    // Delete all flashcards in this folder
    await db.flashcards.where('folderId').equals(id).delete();

    // Delete the folder itself
    await db.folders.delete(id);
  },

  // Get folder tree structure
  async getFolderTree() {
    const allFolders = await this.getAll();

    const buildTree = (parentId = null) => {
      return allFolders
        .filter(folder => folder.parentId === parentId)
        .map(folder => ({
          ...folder,
          children: buildTree(folder.id)
        }));
    };

    return buildTree();
  }
};

// ============================================
// TEMPLATE OPERATIONS
// ============================================

export const templateService = {
  // Get all templates
  async getAll() {
    return await db.templates.orderBy('name').toArray();
  },

  // Get template by ID
  async getById(id) {
    return await db.templates.get(id);
  },

  // Create new template
  async create(templateData) {
    const template = {
      name: templateData.name,
      fields: templateData.fields, // Array of field definitions: [{name, type, placeholder}]
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const id = await db.templates.add(template);
    return { ...template, id };
  },

  // Update template
  async update(id, updates) {
    await db.templates.update(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return await db.templates.get(id);
  },

  // Delete template
  async delete(id) {
    await db.templates.delete(id);
  },

  // Get default templates
  getDefaultTemplates() {
    return [
      {
        name: 'Basic',
        fields: [
          { name: 'Question', type: 'text', placeholder: 'Enter your question...' },
          { name: 'Answer', type: 'textarea', placeholder: 'Enter the answer...' }
        ]
      },
      {
        name: 'Detailed',
        fields: [
          { name: 'Question', type: 'text', placeholder: 'Enter your question...' },
          { name: 'Answer', type: 'textarea', placeholder: 'Enter the answer...' },
          { name: 'Note', type: 'textarea', placeholder: 'Additional notes...' },
          { name: 'Example', type: 'textarea', placeholder: 'Example usage...' }
        ]
      },
      {
        name: 'Language Learning',
        fields: [
          { name: 'Word', type: 'text', placeholder: 'Enter the word...' },
          { name: 'Translation', type: 'text', placeholder: 'Translation...' },
          { name: 'Pronunciation', type: 'text', placeholder: 'Pronunciation...' },
          { name: 'Example Sentence', type: 'textarea', placeholder: 'Example sentence...' },
          { name: 'Image URL', type: 'text', placeholder: 'https://...' }
        ]
      }
    ];
  }
};

// ============================================
// FLASHCARD OPERATIONS
// ============================================

export const flashcardService = {
  // Get all flashcards
  async getAll() {
    return await db.flashcards.toArray();
  },

  // Get flashcard by ID
  async getById(id) {
    return await db.flashcards.get(id);
  },

  // Get flashcards by folder
  async getByFolder(folderId) {
    return await db.flashcards.where('folderId').equals(folderId).toArray();
  },

  // Get flashcards by template
  async getByTemplate(templateId) {
    return await db.flashcards.where('templateId').equals(templateId).toArray();
  },

  // Create new flashcard
  async create(flashcardData) {
    const flashcard = {
      folderId: flashcardData.folderId,
      templateId: flashcardData.templateId || null,
      fields: flashcardData.fields, // Object with field values: {fieldName: value}
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastReviewed: null
    };
    const id = await db.flashcards.add(flashcard);
    return { ...flashcard, id };
  },

  // Update flashcard
  async update(id, updates) {
    await db.flashcards.update(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return await db.flashcards.get(id);
  },

  // Delete flashcard
  async delete(id) {
    await db.flashcards.delete(id);
  },

  // Mark flashcard as reviewed
  async markReviewed(id) {
    await db.flashcards.update(id, {
      lastReviewed: new Date().toISOString()
    });
  },

  // Reset review status
  async resetReview(id) {
    await db.flashcards.update(id, {
      lastReviewed: null
    });
  },

  // Search flashcards
  async search(query) {
    const allCards = await this.getAll();
    const lowerQuery = query.toLowerCase();

    return allCards.filter(card => {
      return Object.values(card.fields).some(value =>
        String(value).toLowerCase().includes(lowerQuery)
      );
    });
  },

  // Get statistics
  async getStats() {
    const allCards = await this.getAll();
    const reviewedCards = allCards.filter(card => card.lastReviewed);

    return {
      total: allCards.length,
      reviewed: reviewedCards.length,
      pending: allCards.length - reviewedCards.length
    };
  }
};

// ============================================
// DATA EXPORT/IMPORT
// ============================================

export const dataService = {
  // Export all data as JSON
  async exportJSON() {
    const data = {
      folders: await db.folders.toArray(),
      templates: await db.templates.toArray(),
      flashcards: await db.flashcards.toArray(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    return data;
  },

  // Import data from JSON
  async importJSON(data) {
    try {
      // Clear existing data
      await db.folders.clear();
      await db.templates.clear();
      await db.flashcards.clear();

      // Import new data
      if (data.folders && data.folders.length > 0) {
        await db.folders.bulkAdd(data.folders);
      }
      if (data.templates && data.templates.length > 0) {
        await db.templates.bulkAdd(data.templates);
      }
      if (data.flashcards && data.flashcards.length > 0) {
        await db.flashcards.bulkAdd(data.flashcards);
      }

      return { success: true };
    } catch (error) {
      console.error('Import error:', error);
      return { success: false, error: error.message };
    }
  },

  // Clear all data
  async clearAll() {
    await db.folders.clear();
    await db.templates.clear();
    await db.flashcards.clear();
  },

  // Initialize with sample data
  async initializeSampleData() {
    if (localStorage.getItem('flashcard_initialized')) return;

    const count = await db.flashcards.count();
    if (count > 0) {
      localStorage.setItem('flashcard_initialized', 'true');
      return;
    }

    // Create default templates
    const basicTemplate = await templateService.create({
      name: 'Basic',
      fields: [
        { name: 'Question', type: 'text', placeholder: 'Enter your question...' },
        { name: 'Answer', type: 'textarea', placeholder: 'Enter the answer...' }
      ]
    });

    // Create sample folder
    const sampleFolder = await folderService.create({
      name: 'Sample Flashcards',
      parentId: null
    });

    // Create sample flashcards
    await flashcardService.create({
      folderId: sampleFolder.id,
      templateId: basicTemplate.id,
      fields: {
        Question: 'What is React?',
        Answer: 'React is a JavaScript library for building user interfaces, particularly single-page applications.'
      }
    });

    await flashcardService.create({
      folderId: sampleFolder.id,
      templateId: basicTemplate.id,
      fields: {
        Question: 'What is IndexedDB?',
        Answer: 'IndexedDB is a low-level API for client-side storage of significant amounts of structured data.'
      }
    });

    localStorage.setItem('flashcard_initialized', 'true');
  }
};

export default db;
