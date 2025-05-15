import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash, 
  AlertCircle,
  X,
  Save
} from 'lucide-react';
import { useInsuranceTypeStore } from '../../../stores/insuranceTypeStore';
import type { InsuranceType } from '../../../types';

function InsuranceTypesManager() {
  const { 
    insuranceTypes, 
    isLoading, 
    error,
    create: addInsuranceType,
    update: updateInsuranceType,
    delete: deleteInsuranceType,
    load: loadInsuranceTypes
  } = useInsuranceTypeStore();

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadInsuranceTypes();
  }, [loadInsuranceTypes]);

  const resetForm = () => {
    setEditingId(null);
    setFormName('');
    setFormDescription('');
    setFormError('');
  };

  const handleEdit = (insuranceType: InsuranceType) => {
    setEditingId(insuranceType.id);
    setFormName(insuranceType.name);
    setFormDescription(insuranceType.description || '');
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
        await updateInsuranceType({
          id: editingId,
          name: formName.trim(),
          description: formDescription.trim()
        });
      } else {
        await addInsuranceType({
          name: formName.trim(),
          description: formDescription.trim()
        });
      }
      resetForm();
    } catch (error: any) {
      setFormError(error.message || 'Ein Fehler ist aufgetreten');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diese Versicherungsart wirklich löschen?')) {
      return;
    }

    try {
      await deleteInsuranceType(id);
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
        <h2 className="text-xl font-semibold">Versicherungsarten verwalten</h2>
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
                {editingId ? 'Versicherungsart bearbeiten' : 'Neue Versicherungsart'}
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
                placeholder="Name der Versicherungsart"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Beschreibung
              </label>
              <textarea
                className="input w-full"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Optionale Beschreibung"
                rows={3}
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
          <h3 className="font-medium mb-4">Vorhandene Versicherungsarten</h3>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : insuranceTypes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Keine Versicherungsarten vorhanden
            </div>
          ) : (
            <div className="space-y-3">
              {insuranceTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <div className="font-medium">{type.name}</div>
                    {type.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {type.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(type)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Bearbeiten"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(type.id)}
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

export default InsuranceTypesManager;