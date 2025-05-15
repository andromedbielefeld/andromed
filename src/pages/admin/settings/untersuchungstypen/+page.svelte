<script lang="ts">
  import { onMount } from 'svelte';
  import { Plus, Edit2, Trash } from 'lucide-svelte';
  import { supabase } from '$lib/supabaseClient';

  interface ExaminationType {
    id: string;
    name: string;
  }

  let examinationTypes: ExaminationType[] = [];
  let newTypeName = '';
  let editingId: string | null = null;
  let editName = '';
  let loading = false;
  let error = '';

  // Alle Untersuchungstypen laden
  async function loadExaminationTypes() {
    loading = true;
    try {
      const { data, error: fetchError } = await supabase
        .from('examination_categories')
        .select('id, name')
        .order('name');

      if (fetchError) throw fetchError;
      examinationTypes = data || [];
    } catch (err) {
      console.error('Fehler beim Laden der Untersuchungstypen:', err);
      error = err.message || 'Fehler beim Laden der Daten';
    } finally {
      loading = false;
    }
  }

  // Neuen Untersuchungstyp hinzufügen
  async function addExaminationType() {
    if (!newTypeName.trim()) return;
    
    loading = true;
    try {
      const { data, error: insertError } = await supabase
        .from('examination_categories')
        .insert({ name: newTypeName.trim() })
        .select()
        .single();

      if (insertError) throw insertError;
      
      examinationTypes = [...examinationTypes, data];
      newTypeName = '';
      error = '';
    } catch (err) {
      console.error('Fehler beim Hinzufügen des Untersuchungstyps:', err);
      error = err.message || 'Fehler beim Hinzufügen';
    } finally {
      loading = false;
    }
  }

  // Untersuchungstyp bearbeiten starten
  function startEditing(id: string, name: string) {
    editingId = id;
    editName = name;
  }

  // Untersuchungstyp aktualisieren
  async function updateExaminationType(id: string) {
    if (!editName.trim()) return;
    
    loading = true;
    try {
      const { error: updateError } = await supabase
        .from('examination_categories')
        .update({ name: editName.trim() })
        .eq('id', id);

      if (updateError) throw updateError;
      
      examinationTypes = examinationTypes.map(type => 
        type.id === id ? { ...type, name: editName.trim() } : type
      );
      editingId = null;
      editName = '';
      error = '';
    } catch (err) {
      console.error('Fehler beim Aktualisieren des Untersuchungstyps:', err);
      error = err.message || 'Fehler beim Aktualisieren';
    } finally {
      loading = false;
    }
  }

  // Untersuchungstyp löschen
  async function deleteExaminationType(id: string) {
    if (!confirm('Möchten Sie diesen Untersuchungstyp wirklich löschen?')) return;
    
    loading = true;
    try {
      const { error: deleteError } = await supabase
        .from('examination_categories')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      examinationTypes = examinationTypes.filter(type => type.id !== id);
      error = '';
    } catch (err) {
      console.error('Fehler beim Löschen des Untersuchungstyps:', err);
      error = err.message || 'Fehler beim Löschen';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadExaminationTypes();
  });
</script>

<div class="settings-container">
  <h2>Untersuchungstypen</h2>

  <!-- Fehleranzeige -->
  {#if error}
    <div class="error-message">
      {error}
    </div>
  {/if}

  <!-- Eingabefeld für neuen Typ -->
  <div class="input-wrapper">
    <form on:submit|preventDefault={addExaminationType} class="flex gap-2">
      <input 
        type="text" 
        bind:value={newTypeName} 
        placeholder="Neuen Typ eingeben..." 
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

  <!-- Liste der Untersuchungstypen -->
  <div class="type-list">
    {#if loading && examinationTypes.length === 0}
      <div class="loading">Lade Untersuchungstypen...</div>
    {:else if examinationTypes.length === 0}
      <div class="empty">Keine Untersuchungstypen vorhanden.</div>
    {:else}
      {#each examinationTypes as type}
        <div class="type-item">
          {#if editingId === type.id}
            <form 
              on:submit|preventDefault={() => updateExaminationType(type.id)}
              class="flex items-center gap-2 flex-grow"
            >
              <input
                type="text"
                bind:value={editName}
                class="input flex-grow"
                placeholder="Typ-Name"
                required
              />
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
                }}
              >
                Abbrechen
              </button>
            </form>
          {:else}
            <span class="type-name">{type.name}</span>
            <div class="flex items-center gap-2">
              <button 
                class="btn icon"
                on:click={() => startEditing(type.id, type.name)}
                disabled={loading}
                title="Bearbeiten"
              >
                <Edit2 class="h-4 w-4" />
              </button>
              <button 
                class="btn icon danger"
                on:click={() => deleteExaminationType(type.id)}
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
</style>