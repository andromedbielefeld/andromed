import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash, 
  AlertCircle,
  X,
  Save
} from 'lucide-react';
import { useSpecialtyStore } from '../../../stores/specialtyStore';

function SpecialtiesManager() {
  const { 
    specialties, 
    isLoading, 
    error,
    fetchSpecialties,
    addSpecialty,
    updateSpecialty,
    deleteSpecialty
  } = useSpecialtyStore();

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchSpecialties();
  }, [fetchSpecialties]);

  const resetForm = () => {
    setEditingId(null);
    setFormName('');
    setFormError('');
  };

  const handleEdit = (id: string, name: string) => {
    setEditingId(id);
    setFormName(name);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Name ist erforderlich');
      return;
    }

    try {
      if (editingId) {
        await updateSpecialty(editingId, formName.trim());
      } else {
        await addSpecialty(formName.trim());
      }
      resetForm();
    } catch (error: any) {
      setFormError(error.message || 'Ein Fehler ist aufgetreten');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie dieses Fachgebiet wirklich löschen?')) {
      return;
    }

    try {
      await deleteSpecialty(id);
      if (editingId === id) {
        resetForm();
      }
    } catch (error: any) {
      setFormError(error.message || 'Fehler beim Löschen');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Fachgebiete verwalten</h2>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/30 text-error rounded-md p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">
                {editingId ? 'Fachgebiet bearbeiten' : 'Neues Fachgebiet'}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {formError && (
              <div className="bg-error/10 border border-error/30 text-error rounded-md p-3 text-sm">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Name
                <span className="text-error">*</span>
              </label>
              <input
                type="text"
                className="input w-full"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Name des Fachgebiets"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-outline"
                  disabled={isLoading}
                >
                  Abbrechen
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {editingId ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Speichern
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Hinzufügen
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="card">
          <h3 className="font-medium mb-4">Vorhandene Fachgebiete</h3>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : specialties.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Keine Fachgebiete vorhanden
            </div>
          ) : (
            <div className="space-y-3">
              {specialties.map((specialty) => (
                <div
                  key={specialty.id}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="font-medium">{specialty.name}</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(specialty.id, specialty.name)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Bearbeiten"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(specialty.id)}
                      className="text-muted-foreground hover:text-error transition-colors"
                      title="Löschen"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SpecialtiesManager;