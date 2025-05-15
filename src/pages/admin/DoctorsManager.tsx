import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash, 
  Search, 
  AlertCircle,
  X,
  Save,
  Mail
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToaster } from '../../components/ui/Toaster';

interface Doctor {
  id: string;
  title: string;
  first_name: string;
  last_name: string;
  specialty: string;
  practice_name: string;
  street: string;
  zip_code: string;
  city: string;
  phone: string;
  fax?: string;
  email: string;
  is_active: boolean;
  needs_password_change: boolean;
}

const TITLES = [
  'Dr. med.',
  'Prof. Dr. med.',
];

function DoctorsManager() {
  const { addToast } = useToaster();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Omit<Doctor, 'id' | 'needs_password_change'>>({
    title: TITLES[0],
    first_name: '',
    last_name: '',
    specialty: '',
    practice_name: '',
    street: '',
    zip_code: '',
    city: '',
    phone: '',
    fax: '',
    email: '',
    is_active: true
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('last_name');

      if (error) throw error;
      setDoctors(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (editingId) {
        // Update existing doctor
        const { error } = await supabase
          .from('doctors')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        addToast('Arzt wurde erfolgreich aktualisiert', 'success');
      } else {
        // Create new doctor with temporary password
        const tempPassword = Math.random().toString(36).slice(-8);

        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: tempPassword,
          options: {
            data: {
              role: 'doctor'
            }
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Failed to create user');

        // 2. Create doctor profile
        const { error: profileError } = await supabase
          .from('doctors')
          .insert([{
            id: authData.user.id,
            ...formData,
            needs_password_change: true
          }]);

        if (profileError) throw profileError;

        addToast('Arzt wurde erfolgreich angelegt', 'success');
        addToast(`Temporäres Passwort: ${tempPassword}`, 'info');
      }

      await loadDoctors();
      resetForm();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diesen Arzt wirklich löschen?')) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.admin.deleteUser(id);
      if (error) throw error;

      addToast('Arzt wurde erfolgreich gelöscht', 'success');
      await loadDoctors();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: TITLES[0],
      first_name: '',
      last_name: '',
      specialty: '',
      practice_name: '',
      street: '',
      zip_code: '',
      city: '',
      phone: '',
      fax: '',
      email: '',
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (doctor: Doctor) => {
    setFormData({
      title: doctor.title,
      first_name: doctor.first_name,
      last_name: doctor.last_name,
      specialty: doctor.specialty,
      practice_name: doctor.practice_name,
      street: doctor.street,
      zip_code: doctor.zip_code,
      city: doctor.city,
      phone: doctor.phone,
      fax: doctor.fax || '',
      email: doctor.email,
      is_active: doctor.is_active
    });
    setEditingId(doctor.id);
    setShowForm(true);
  };

  const filteredDoctors = doctors.filter(doctor => {
    const searchString = searchTerm.toLowerCase();
    return (
      doctor.first_name.toLowerCase().includes(searchString) ||
      doctor.last_name.toLowerCase().includes(searchString) ||
      doctor.practice_name.toLowerCase().includes(searchString) ||
      doctor.email.toLowerCase().includes(searchString)
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Ärzte verwalten</h1>
        
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Neuer Arzt
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
            placeholder="Nach Ärzten suchen..."
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
              {editingId ? 'Arzt bearbeiten' : 'Neuen Arzt anlegen'}
            </h2>
            <button
              onClick={resetForm}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Titel
                </label>
                <select
                  className="input w-full"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                >
                  {TITLES.map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Vorname
                  <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Nachname
                  <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Fachgebiet
                  <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Praxisname
                  <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.practice_name}
                  onChange={(e) => setFormData({ ...formData, practice_name: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Straße
                  <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  PLZ
                  <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Ort
                  <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Telefon
                  <span className="text-error">*</span>
                </label>
                <input
                  type="tel"
                  className="input w-full"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Fax
                </label>
                <input
                  type="tel"
                  className="input w-full"
                  value={formData.fax}
                  onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  E-Mail
                  <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  className="input w-full"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={editingId !== null}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                className="rounded border-input h-4 w-4 text-primary focus:ring-primary"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <label htmlFor="is_active" className="text-sm font-medium">
                Aktiv
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-outline"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                {editingId ? 'Aktualisieren' : 'Anlegen'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Doctors list */}
      {isLoading && doctors.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Keine Ärzte gefunden
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {doctor.title} {doctor.first_name} {doctor.last_name}
                    </span>
                    {!doctor.is_active && (
                      <span className="text-xs bg-error/10 text-error px-2 py-1 rounded">
                        Inaktiv
                      </span>
                    )}
                    {doctor.needs_password_change && (
                      <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded">
                        Passwort-Änderung erforderlich
                      </span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1 text-sm">
                    <div className="text-muted-foreground">
                      {doctor.specialty}
                    </div>
                    <div>
                      {doctor.practice_name}
                    </div>
                    <div className="text-muted-foreground">
                      {doctor.street}, {doctor.zip_code} {doctor.city}
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>Tel: {doctor.phone}</span>
                      {doctor.fax && <span>Fax: {doctor.fax}</span>}
                    </div>
                    <div className="flex items-center gap-1 text-primary">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${doctor.email}`} className="hover:underline">
                        {doctor.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 md:self-start">
                  <button
                    onClick={() => handleEdit(doctor)}
                    className="btn btn-outline"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Bearbeiten
                  </button>

                  <button
                    onClick={() => handleDelete(doctor.id)}
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

export default DoctorsManager;