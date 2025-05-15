import { useEffect, useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash, 
  Search, 
  Filter, 
  Clock, 
  FileText, 
  X 
} from 'lucide-react';
import { useExaminationStore } from '../../stores/examinationStore';
import { useDeviceStore } from '../../stores/deviceStore';
import { Examination, ExaminationCategory, Device } from '../../types';

function ExaminationsManager() {
  const { 
    examinations, 
    categories, 
    fetchExaminations, 
    fetchCategories,
    addExamination,
    updateExamination,
    deleteExamination,
    addCategory,
    updateCategory,
    deleteCategory
  } = useExaminationStore();
  
  const { devices, fetchDevices } = useDeviceStore();
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // State for form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    categoryId: string;
    durationMinutes: number;
    deviceIds: string[];
  }>({
    name: '',
    categoryId: '',
    durationMinutes: 30,
    deviceIds: [],
  });
  
  // Load initial data
  useEffect(() => {
    fetchExaminations();
    fetchCategories();
    fetchDevices();
  }, [fetchExaminations, fetchCategories, fetchDevices]);
  
  // Apply filters
  const filteredExaminations = examinations.filter(examination => {
    // Category filter
    if (categoryFilter !== 'all' && examination.categoryId !== categoryFilter) {
      return false;
    }
    
    // Search filter
    if (searchTerm && !examination.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Helpers
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unbekannt';
  };
  
  const getDeviceNames = (deviceIds: string[]) => {
    return deviceIds.map(id => {
      const device = devices.find(d => d.id === id);
      return device ? device.name : 'Unbekannt';
    }).join(', ');
  };
  
  // Form handlers
  const handleAddNew = () => {
    setFormData({
      name: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      durationMinutes: 30,
      deviceIds: [],
    });
    setEditingId(null);
    setShowForm(true);
  };
  
  const handleEdit = (examination: Examination) => {
    setFormData({
      name: examination.name,
      categoryId: examination.categoryId,
      durationMinutes: examination.durationMinutes,
      deviceIds: examination.deviceIds,
    });
    setEditingId(examination.id);
    setShowForm(true);
  };
  
  const handleDelete = async (id: string) => {
    if (confirm('Sind Sie sicher, dass Sie diese Untersuchung löschen möchten?')) {
      await deleteExamination(id);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateExamination(editingId, formData);
      } else {
        await addExamination(formData);
      }
      
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Failed to save examination:', error);
    }
  };
  
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };
  
  const toggleDeviceSelection = (deviceId: string) => {
    setFormData(prev => {
      const isSelected = prev.deviceIds.includes(deviceId);
      
      if (isSelected) {
        return {
          ...prev,
          deviceIds: prev.deviceIds.filter(id => id !== deviceId)
        };
      } else {
        return {
          ...prev,
          deviceIds: [...prev.deviceIds, deviceId]
        };
      }
    });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Untersuchungen verwalten</h1>
        
        <button
          onClick={handleAddNew}
          className="btn btn-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Neue Untersuchung
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Nach Untersuchungen suchen..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-64">
            <select
              className="input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Alle Kategorien</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Form */}
      {showForm && (
        <div className="card mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Untersuchung bearbeiten' : 'Neue Untersuchung anlegen'}
            </h2>
            <button
              onClick={handleCancel}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name
                <span className="text-error">*</span>
              </label>
              <input
                className="input w-full"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Kategorie
                <span className="text-error">*</span>
              </label>
              <select
                className="input w-full"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
              >
                <option value="" disabled>Kategorie wählen</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Dauer (Minuten)
                <span className="text-error">*</span>
              </label>
              <input
                type="number"
                min="5"
                step="5"
                className="input w-full"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 30 })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Geräte
                <span className="text-error">*</span>
              </label>
              <div className="space-y-2 mt-2">
                {devices.map(device => (
                  <label key={device.id} className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-input h-4 w-4 text-primary focus:ring-primary"
                      checked={formData.deviceIds.includes(device.id)}
                      onChange={() => toggleDeviceSelection(device.id)}
                    />
                    <span className="ml-2">{device.name} ({device.categoryName || getCategoryName(device.categoryId)})</span>
                  </label>
                ))}
              </div>
              {formData.deviceIds.length === 0 && (
                <p className="text-xs text-error mt-1">Mindestens ein Gerät muss ausgewählt werden</p>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-outline"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={formData.deviceIds.length === 0}
              >
                {editingId ? 'Aktualisieren' : 'Untersuchung anlegen'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Examinations list */}
      {filteredExaminations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Keine Untersuchungen gefunden
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExaminations.map((examination) => (
            <div key={examination.id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-medium">{examination.name}</span>
                  </div>
                  
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Kategorie:</span>
                      <span>{examination.categoryName || 'Unbekannt'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Dauer:</span>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{examination.durationMinutes} Minuten</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Geräte:</span>
                      <span>{getDeviceNames(examination.deviceIds)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 md:self-start">
                  <button
                    onClick={() => handleEdit(examination)}
                    className="btn btn-outline"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Bearbeiten
                  </button>
                  
                  <button
                    onClick={() => handleDelete(examination.id)}
                    className="btn bg-error/10 hover:bg-error/20 text-error border-error/20"
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExaminationsManager;