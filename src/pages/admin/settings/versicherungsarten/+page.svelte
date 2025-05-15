<script lang="ts">
  import { onMount } from 'svelte';
  import { Plus, CreditCard as Edit2, Trash } from 'lucide-svelte';
  import { supabase } from '$lib/supabaseClient';

  interface InsuranceType {
    id: string;
    name: string;
    description?: string;
  }

  let insuranceTypes: InsuranceType[] = [];
  let newTypeName = '';
  let editingId: string | null = null;
  let editName = '';
  let editDescription = '';
  let loading = false;
  let error = '';

  // Alle Versicherungsarten laden
  async function loadInsuranceTypes() {
    loading = true;
    try {
      const { data, error: fetchError } = await supabase
        .from('insurance_types')
        .select('id, name, description')
        .order('name');

      if (fetchError) throw fetchError;
      insuranceTypes = data || [];
    } catch (err) {
      console.error('Fehler beim Laden der Versicherungsarten:', err);
      error = err.message || 'Fehler beim Laden der Daten';
    } finally {
      loading = false;
    }
  }

  // Neue Versicherungsart hinzufügen
  async function addInsuranceType() {
    if (!newTypeName.trim()) return;
    
    loading = true;
    try {
      const { data, error: insertError } = await supabase
        .from('insurance_types')
        .insert({ name: newTypeName.trim() })
        .select()
        .single();

      if (insertError) throw insertError;
      
      insuranceTypes = [...insuranceTypes, data];
      newTypeName = '';
      error = '';
    } catch (err) {
      console.error('Fehler beim Hinzufügen der Versicherungsart:', err);
      error = err.message || 'Fehler beim Hinzufügen';
    } finally {
      loading = false;
    }
  }

  // Versicherungsart bearbeiten starten
  function startEditing(type: InsuranceType) {
    editingId = type.id;
    editName = type.name;
    editDescription = type.description || '';
  }

  // Versicherungsart aktualisieren
  async function updateInsuranceType(id: string) {
    if (!editName.trim()) return;
    
    loading = true;
    try {
      const { error: updateError } = await supabase
        .from('insurance_types')
        .update({ 
          name: editName.trim(),
          description: editDescription.trim() || null
        })
        .eq('id', id);

      if (updateError) throw updateError;
      
      insuranceTypes = insuranceTypes.map(type => 
        type.id === id ? { 
          ...type, 
          name: editName.trim(),
          description: editDescription.trim() || null
        } : type
      );
      editingId = null;
      editName = '';
      editDescription = '';
      error = '';
    } catch (err) {
      console.error('Fehler beim Aktualisieren der Versicherungsart:', err);
      error = err.message || 'Fehler beim Aktualisieren';
    } finally {
      loading = false;
    }
  }

  // Versicherungsart löschen
  async function deleteInsuranceType(id: string) {
    if (!confirm('Möchten Sie diese Versicherungsart wirklich löschen?')) return;
    
    loading = true;
    try {
      const { error: deleteError } = await supabase
        .from('insurance_types')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      insuranceTypes = insuranceTypes.filter(type => type.id !== id);
      error = '';
    } catch (err) {
      console.error('Fehler beim Löschen der Versicherungsart:', err);
      error = err.message || 'Fehler beim Löschen';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadInsuranceTypes();
  });
</script>

<div class="settings-container">
  <h2>Versicherungsarten</h2>

  <!-- Fehleranzeige -->
  {#if error}
    <div class="error-message">
      {error}
    </div>
  {/if}

  <!-- Eingabefeld für neue Versicherungsart -->
  <div class="input-wrapper">
    <form on:submit|preventDefault={addInsuranceType} class="flex gap-2">
      <input 
        type="text" 
        bind:value={newTypeName} 
        placeholder="Neue Versicherungsart eingeben..." 
        disabled={loading}
        class="input flex-grow"
      />
      <button 
        type="submit" 
        class="btn btn-primary" 
        disabled={loading || !newTypeName.trim()}
      >
        <Plus class="h-4 w-4 mr-2" />
        Hinzufügen
      </button>
    </form>
  </div>

  <!-- Liste der Versicherungsarten -->
  <div class="type-list">
    {#if loading && insuranceTypes.length === 0}
      <div class="loading">Lade Versicherungsarten...</div>
    {:else if insuranceTypes.length === 0}
      <div class="empty">Keine Versicherungsarten vorhanden.</div>
    {:else}
      {#each insuranceTypes as type}
        <div class="type-item">
          {#if editingId === type.id}
            <form 
              on:submit|preventDefault={() => updateInsuranceType(type.id)}
              class="w-full space-y-3"
            >
              <div>
                <input
                  type="text"
                  bind:value={editName}
                  class="input w-full"
                  placeholder="Name der Versicherungsart"
                  required
                />
              </div>
              <div>
                <textarea
                  bind:value={editDescription}
                  class="input w-full"
                  placeholder="Beschreibung (optional)"
                  rows="2"
                />
              </div>
              <div class="flex justify-end gap-2">
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  disabled={loading || !editName.trim()}
                >
                  Speichern
                </button>
                <button 
                  type="button"
                  class="btn btn-outline"
                  on:click={() => {
                    editingId = null;
                    editName = '';
                    editDescription = '';
                  }}
                >
                  Abbrechen
                </button>
              </div>
            </form>
          {:else}
            <div class="flex-grow">
              <div class="type-name">{type.name}</div>
              {#if type.description}
                <div class="type-description">{type.description}</div>
              {/if}
            </div>
            <div class="flex items-center gap-2">
              <button 
                class="btn icon"
                on:click={() => startEditing(type)}
                disabled={loading}
                title="Bearbeiten"
              >
                <Edit2 class="h-4 w-4" />
              </button>
              <button 
                class="btn icon danger"
                on:click={() => deleteInsuranceType(type.id)}
                disabled={loading}
                title="Löschen"
              >
                <Trash class="h-4 w-4" />
              </button>
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .settings-container {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    margin: 20px 0;
    width: 100%;
  }

  h2 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: 500;
  }

  .input-wrapper {
    margin-bottom: 20px;
  }

  .input {
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 16px;
  }

  .type-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .type-item {
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 4px;
    background-color: #f8f9fa;
    transition: background-color 0.2s;
  }

  .type-item:hover {
    background-color: #e9ecef;
  }

  .type-name {
    font-size: 16px;
    font-weight: 500;
  }

  .type-description {
    font-size: 14px;
    color: #6c757d;
    margin-top: 4px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn.primary {
    background-color: #007bff;
    color: white;
  }

  .btn.primary:hover:not(:disabled) {
    background-color: #0056b3;
  }

  .btn.outline {
    background: none;
    border: 1px solid #ced4da;
  }

  .btn.outline:hover:not(:disabled) {
    background-color: #f8f9fa;
  }

  .btn.icon {
    padding: 8px;
    background: none;
  }

  .btn.danger:hover {
    color: #dc3545;
  }

  .btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .error-message {
    background-color: #f8d7da;
    color: #721c24;
    padding: 10px 15px;
    border-radius: 4px;
    margin-bottom: 15px;
  }

  .loading, .empty {
    padding: 15px;
    text-align: center;
    color: #6c757d;
  }

  .space-y-3 {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
</style>