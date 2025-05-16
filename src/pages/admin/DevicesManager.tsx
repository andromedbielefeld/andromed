import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash, 
  Search, 
  AlertCircle,
  X,
  Save
} from 'lucide-react';
import { useDeviceStore } from '../../stores/deviceStore';
import { useExaminationCategoryStore } from '../../stores/examinationCategoryStore';
import { Device, WorkingHours, Exception } from '../../types';
import SlotGrid from '../../components/SlotGrid';

function DevicesManager() {
  const { 
    devices, 
    isLoading, 
    error,
    fetchDevices,
    addDevice,
    updateDevice,
    deleteDevice,
    updateAvailableSlots,
    updateWorkingHours
  } = useDeviceStore();
  
  const { categories, fetchCategories } = useExaminationCategoryStore();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formError, setFormError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<{
    name: string;
    categoryId: string;
  }>({
    name: '',
    categoryId: '',
  });

  // Load initial data
  useEffect(() => {
    fetchDevices();
    fetchCategories();
  }, [fetchDevices, fetchCategories]);

  // Handlers
  const handleAddNew = () => {
    setFormData({
      name: '',
      categoryId: categories[0]?.id || '',
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (device: Device) => {
    setFormData({
      name: device.name,
      categoryId: device.categoryId,
    });
    setEditingId(device.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (editingId) {
        await updateDevice(editingId, formData);
      } else {
        await addDevice(formData);
      }
      setShowForm(false);
      setEditingId(null);
    } catch (error: any) {
      setFormError(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Sind Sie sicher, dass Sie dieses Gerät löschen möchten?')) {
      await deleteDevice(id);
    }
  };

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice({
      ...device,
      workingHours: device.workingHours || [],
      exceptions: device.exceptions || []
    });
  };

  const handleWorkingHoursChange = async (workingHours: WorkingHours[]) => {
    if (!selectedDevice) return;
    try {
      await updateWorkingHours(selectedDevice.id, workingHours);
      setSelectedDevice({
        ...selectedDevice,
        workingHours
      });
    } catch (error) {
      console.error('Failed to update working hours:', error);
    }
  };

  const handleExceptionAdd = async (exception: Exception) => {
    if (!selectedDevice) return;
    // Implementation for adding exceptions
  };

  const handleExceptionRemove = async (date: string) => {
    if (!selectedDevice) return;
    // Implementation for removing exceptions
  };

  // Filter devices based on search term
  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {error && (
        <div className="bg-error/10 border border-error/30 text-error rounded-md p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
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

      {/* Form */}
      {showForm && (
        <div className="card mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Gerät bearbeiten' : 'Neues Gerät anlegen'}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {formError && (
            <div className="bg-error/10 border border-error/30 text-error rounded-md p-3 mb-4">
              {formError}
            </div>
          )}

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
                <option value="">Kategorie wählen</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-outline"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                {editingId ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Speichern
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Anlegen
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Devices list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Devices sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredDevices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Keine Geräte gefunden
            </div>
          ) : (
            filteredDevices.map((device) => (
              <div 
                key={device.id} 
                className={`card hover:shadow-md transition-shadow cursor-pointer ${
                  selectedDevice?.id === device.id ? 'border-primary' : ''
                }`}
                onClick={() => handleDeviceSelect(device)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{device.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {device.categoryName}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(device);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(device.id);
                      }}
                      className="text-muted-foreground hover:text-error"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Slot grid */}
        <div className="lg:col-span-2">
          {selectedDevice ? (
            <div className="card">
              <h2 className="text-lg font-semibold mb-6">
                Verfügbarkeit: {selectedDevice.name}
              </h2>
              <SlotGrid
                selectedDate={selectedDate}
                workingHours={selectedDevice.workingHours || []}
                exceptions={selectedDevice.exceptions || []}
                onWorkingHoursChange={handleWorkingHoursChange}
                onExceptionAdd={handleExceptionAdd}
                onExceptionRemove={handleExceptionRemove}
                onDateChange={setSelectedDate}
              />
            </div>
          ) : (
            <div className="card">
              <div className="text-center py-12 text-muted-foreground">
                Wählen Sie ein Gerät aus, um dessen Verfügbarkeit zu bearbeiten
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DevicesManager;