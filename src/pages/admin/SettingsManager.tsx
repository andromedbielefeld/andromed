import { useEffect, useState } from 'react';
import { 
  Settings, 
  Plus,
  Edit2,
  Trash,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import { useExaminationCategoryStore } from '../../stores/examinationCategoryStore';

export default function SettingsManager() {
  const { 
    categories, 
    isLoading, 
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory
  } = useExaminationCategoryStore();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [editName, setEditName] = useState('');
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      await addCategory(newCategory.trim());
      setNewCategory('');
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };
  
  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };
  
  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    
    try {
      await updateCategory(id, editName.trim());
      setEditingId(null);
      setEditName('');
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (confirm('Sind Sie sicher, dass Sie diese Kategorie löschen möchten?')) {
      try {
        await deleteCategory(id);
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };
  
  // Filter out any invalid categories (those without an id)
  const validCategories = categories.filter(category => category && category.id);
  
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-6 h-6" />
        <h1 className="text-2xl font-semibold">Einstellungen</h1>
      </div>
      
      <div className="space-y-8">
        {/* Examination Categories Section */}
        <div className="card">
          <h2 className="text-xl font-medium mb-6">Untersuchungstypen</h2>
          
          {error && (
            <div className="bg-error/10 border border-error/30 text-error rounded-md p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            </div>
          )}
          
          {/* Add new category */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Neuen Typ eingeben..."
              className="input flex-grow"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button
              onClick={handleAddCategory}
              className="btn btn-primary"
              disabled={!newCategory.trim() || isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Hinzufügen
            </button>
          </div>
          
          {/* Categories list */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : validCategories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine Kategorien vorhanden
            </div>
          ) : (
            <div className="space-y-3">
              {validCategories.map(category => (
                <div 
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                >
                  {editingId === category.id ? (
                    <div className="flex items-center gap-2 flex-grow mr-2">
                      <input
                        type="text"
                        className="input flex-grow"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(category.id)}
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(category.id)}
                        className="btn btn-primary py-1 px-2"
                        disabled={isLoading}
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn btn-outline py-1 px-2"
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium">{category.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditing(category.id, category.name)}
                          className="text-muted-foreground hover:text-foreground"
                          disabled={isLoading}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-muted-foreground hover:text-error"
                          disabled={isLoading}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}