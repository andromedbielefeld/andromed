import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash, 
  Search,
  Calendar,
  Clock,
  X,
  AlertCircle
} from 'lucide-react';
import { useDeviceStore } from '../../stores/deviceStore';
import { useExaminationCategoryStore } from '../../stores/examinationCategoryStore';
import { Device, WorkingHours, Exception } from '../../types';

function DevicesManager() {
  const { devices, addDevice, updateDevice, deleteDevice, isLoading, error } = useDeviceStore();
  const { categories, fetchCategories, error: categoryError } = useExaminationCategoryStore();
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    categoryId: string;
    workingHours: WorkingHours[];
    exceptions: Exception[];
  }>({
    name: '',
    categoryId: '',
    workingHours: [],
    exceptions: []
  });
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  const handleAddNew = () => {
    if (categories.length === 0) {
      setFormError('Bitte erstellen Sie zuerst eine Gerätekategorie, bevor Sie ein Gerät anlegen.');
      return;
    }

    setFormData({
      name: '',
      categoryId: categories[0].id,
      workingHours: [
        { day: 1, start: '08:00', end: '17:59' }, // Monday
        { day: 2, start: '08:00', end: '17:59' }, // Tuesday
        { day: 3, start: '08:00', end: '17:59' }, // Wednesday
        { day: 4, start: '08:00', end: '17:59' }, // Thursday
        { day: 5, start: '08:00', end: '13:59' }, // Friday
      ],
      exceptions: []
    });
    setEditingId(null);
    setShowForm(true);
    setFormError(null);
  };
  
  const handleEdit = (device: Device) => {
    // Verify that the device's category still exists
    const categoryExists = categories.some(category => category.id === device.categoryId);
    
    if (!categoryExists) {
      setFormError(`Die Kategorie dieses Geräts existiert nicht mehr. Bitte wählen Sie eine neue Kategorie aus.`);
      return;
    }

    setFormData({
      name: device.name,
      categoryId: device.categoryId,
      workingHours: device.workingHours,
      exceptions: device.exceptions
    });
    setEditingId(device.id);
    setShowForm(true);
    setFormError(null);
  };
  
  const handleDelete = async (id: string) => {
    if (confirm('Sind Sie sicher, dass Sie dieses Gerät löschen möchten?')) {
      await deleteDevice(id);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate category existence
    if (!categories.some(category => category.id === formData.categoryId)) {
      setFormError('Die ausgewählte Kategorie existiert nicht mehr. Bitte wählen Sie eine andere Kategorie.');
      return;
    }
    
    try {
      if (editingId) {
        await updateDevice(editingId, formData);
      } else {
        await addDevice(formData);
      }
      
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Failed to save device:', error);
      setFormError('Fehler beim Speichern des Geräts. Bitte versuchen Sie es erneut.');
    }
  };
  
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError(null);
  };
  
  const addWorkingDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      workingHours: [
        ...prev.workingHours,
        { day, start: '08:00', end: '17:59' }
      ]
    }));
  };
  
  const updateWorkingHours = (index: number, field: 'start' | 'end', value: string) => {
    setFormData(prev => ({
      ...prev,
      workingHours: prev.workingHours.map((hours, i) => 
        i === index ? { ...hours, [field]: value } : hours
      )
    }));
  };
  
  const removeWorkingDay = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workingHours: prev.workingHours.filter((_, i) => i !== index)
    }));
  };
  
  const addException = () => {
    setFormData(prev => ({
      ...prev,
      exceptions: [
        ...prev.exceptions,
        { date: '', reason: '' }
      ]
    }));
  };
  
  const updateException = (index: number, field: keyof Exception, value: string) => {
    setFormData(prev => ({
      ...prev,
      exceptions: prev.exceptions.map((exception, i) => 
        i === index ? { ...exception, [field]: value } : exception
      )
    }));
  };
  
  const removeException = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exceptions: prev.exceptions.filter((_, i) => i !== index)
    }));
  };
  
  const getDayName = (day: number): string => {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return days[day];
  };
  
  const getAvailableDays = () => {
    const usedDays = formData.workingHours.map(h => h.day);
    return Array.from({ length: 7 }, (_, i) => i).filter(day => !usedDays.includes(day));
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unbekannt';
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Geräte verwalten</h1>
        
        <button
          onClick={handleAddNew}
          className="btn btn-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Neues Gerät
        </button>
      </div>

      {/* Category Error */}
      {categoryError && (
        <div className="bg-error/10 border border-error/30 text-error rounded-md p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Fehler beim Laden der Kategorien: {categoryError}
          </div>
        </div>
      )}
      
      {/* Search */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Nach Geräten suchen..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Form Error */}
      {formError && (
        <div className="bg-error/10 border border-error/30 text-error rounded-md p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {formError}
          </div>
        </div>
      )}
      
      {/* Form */}
      {showForm && (
        <div className="card mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Gerät bearbeiten' : 'Neues Gerät anlegen'}
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
              {categories.length === 0 ? (
                <div className="text-sm text-error">
                  Keine Kategorien verfügbar. Bitte erstellen Sie zuerst eine Kategorie.
                </div>
              ) : (
                <select
                  className="input w-full"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="">Kategorie wählen</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            {/* Working Hours */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium">
                  Arbeitszeiten
                </label>
                <div className="relative">
                  <select
                    className="input py-1 pl-2 pr-8"
                    onChange={(e) => addWorkingDay(parseInt(e.target.value))}
                    value=""
                  >
                    <option value="">Tag hinzufügen...</option>
                    {getAvailableDays().map(day => (
                      <option key={day} value={day}>{getDayName(day)}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-3">
                {formData.workingHours.map((hours, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-32">
                      <span className="text-sm font-medium">{getDayName(hours.day)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        className="input py-1 px-2"
                        value={hours.start}
                        onChange={(e) => updateWorkingHours(index, 'start', e.target.value)}
                      />
                      <span className="text-sm text-muted-foreground">bis</span>
                      <input
                        type="time"
                        className="input py-1 px-2"
                        value={hours.end}
                        onChange={(e) => updateWorkingHours(index, 'end', e.target.value)}
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeWorkingDay(index)}
                      className="text-muted-foreground hover:text-error"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Exceptions */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium">
                  Ausnahmen
                </label>
                <button
                  type="button"
                  onClick={addException}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  + Ausnahme hinzufügen
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.exceptions.map((exception, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <input
                      type="date"
                      className="input py-1 px-2"
                      value={exception.date}
                      onChange={(e) => updateException(index, 'date', e.target.value)}
                    />
                    
                    <input
                      type="text"
                      placeholder="Grund (z.B. Wartung)"
                      className="input flex-grow"
                      value={exception.reason}
                      onChange={(e) => updateException(index, 'reason', e.target.value)}
                    />
                    
                    <button
                      type="button"
                      onClick={() => removeException(index)}
                      className="text-muted-foreground hover:text-error"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
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
                disabled={categories.length === 0}
              >
                {editingId ? 'Aktualisieren' : 'Gerät anlegen'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Devices list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-error/10 border border-error/30 text-error rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      ) : devices.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Keine Geräte gefunden
        </div>
      ) : (
        <div className="space-y-4">
          {devices
            .filter(device => 
              device.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((device) => (
              <div key={device.id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      {device.categoryId === 'cat1' ? (
                        <Calendar className="h-5 w-5 text-primary" />
                      ) : (
                        <Clock className="h-5 w-5 text-primary" />
                      )}
                      <span className="font-medium">{device.name}</span>
                    </div>
                    
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Kategorie:</span>
                        <span>{getCategoryName(device.categoryId)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Arbeitszeiten:</span>
                        <span>
                          {device.workingHours
                            .sort((a, b) => a.day - b.day)
                            .map(hours => `${getDayName(hours.day)} ${hours.start}–${hours.end}`)
                            .join(', ')}
                        </span>
                      </div>
                      
                      {device.exceptions.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Ausnahmen:</span>
                          <span>
                            {device.exceptions
                              .map(ex => `${ex.date} (${ex.reason})`)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 md:self-start">
                    <button
                      onClick={() => handleEdit(device)}
                      className="btn btn-outline"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Bearbeiten
                    </button>
                    
                    <button
                      onClick={() => handleDelete(device.id)}
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

export default DevicesManager;