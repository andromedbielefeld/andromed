import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash, 
  Search,
  Calendar,
  Clock,
  X,
  AlertCircle,
  Save
} from 'lucide-react';
import { useDeviceStore } from '../../stores/deviceStore';
import { useExaminationCategoryStore } from '../../stores/examinationCategoryStore';
import { Device } from '../../types';
import { format } from 'date-fns';
import SlotGrid from '../../components/SlotGrid';

function DevicesManager() {
  const { devices, addDevice, updateDevice, deleteDevice, isLoading, error, updateAvailableSlots } = useDeviceStore();
  const { categories, fetchCategories, error: categoryError } = useExaminationCategoryStore();
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    categoryId: string;
  }>({
    name: '',
    categoryId: ''
  });
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Slot management state
  const [showSlotManager, setShowSlotManager] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState<boolean[]>(Array(24).fill(false));

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  const handleAddNew = () => {
    if (!categories?.length) {
      setFormError('Bitte erstellen Sie zuerst eine Gerätekategorie, bevor Sie ein Gerät anlegen.');
      return;
    }

    setFormData({
      name: '',
      categoryId: categories[0].id
    });
    setEditingId(null);
    setShowForm(true);
    setFormError(null);
  };
  
  const handleEdit = (device: Device) => {
    // Verify that the device's category still exists
    const categoryExists = categories?.some(category => category.id === device.categoryId);
    
    if (!categoryExists) {
      setFormError(`Die Kategorie dieses Geräts existiert nicht mehr. Bitte wählen Sie eine neue Kategorie aus.`);
      return;
    }

    setFormData({
      name: device.name,
      categoryId: device.categoryId
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
    if (!categories?.some(category => category.id === formData.categoryId)) {
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

  const handleManageSlots = (device: Device) => {
    setSelectedDevice(device);
    setShowSlotManager(true);
    
    // Load slots for the selected date
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const deviceSlots = device.availableSlots[dateStr] || Array(24).fill(false);
    setSlots(deviceSlots);
  };

  const handleSlotToggle = async (index: number) => {
    if (!selectedDevice) return;

    const newSlots = [...slots];
    newSlots[index] = !newSlots[index];
    setSlots(newSlots);

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    await updateAvailableSlots(selectedDevice.id, dateStr, newSlots);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    if (selectedDevice) {
      const dateStr = format(date, 'yyyy-MM-dd');
      const deviceSlots = selectedDevice.availableSlots[dateStr] || Array(24).fill(false);
      setSlots(deviceSlots);
    }
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
              {!categories?.length ? (
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
            
            <div className="flex justify-end gap-3">
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
                disabled={!categories?.length}
              >
                {editingId ? 'Aktualisieren' : 'Gerät anlegen'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slot Manager */}
      {showSlotManager && selectedDevice && (
        <div className="card mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              Verfügbarkeit verwalten: {selectedDevice.name}
            </h2>
            <button
              onClick={() => setShowSlotManager(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <SlotGrid
            selectedDate={selectedDate}
            slots={slots}
            onSlotToggle={handleSlotToggle}
            onDateChange={handleDateChange}
          />
        </div>
      )}
      
      {/* Devices list */}
      {isLoading && !devices?.length ? (
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
      ) : !devices?.length ? (
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
                        <span>{device.categoryName || 'Unbekannt'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 md:self-start">
                    <button
                      onClick={() => handleManageSlots(device)}
                      className="btn btn-outline"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Verfügbarkeit
                    </button>

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