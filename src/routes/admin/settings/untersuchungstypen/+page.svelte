<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';

  interface ExaminationType {
    id: string;
    name: string;
  }

  let examinationTypes: ExaminationType[] = [];
  let newTypeName = '';
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
    <form on:submit|preventDefault={addExaminationType}>
      <input 
        type="text" 
        bind:value={newTypeName} 
        placeholder="Neuen Typ eingeben..." 
        disabled={loading} 
      />
    </form>
  </div>

  <!-- Liste der Untersuchungstypen -->
  <div class="type-list">
    {#each examinationTypes as type}
      <div class="type-item">
        <span class="type-name">{type.name}</span>
        <button 
          class="delete-btn"
          on:click={() => deleteExaminationType(type.id)}
          disabled={loading}
          title="Löschen"
        >
          ×
        </button>
      </div>
    {/each}

    {#if loading && examinationTypes.length === 0}
      <div class="loading">Lade Untersuchungstypen...</div>
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

  input {
    width: 100%;
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
    padding: 15px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
  }

  .type-name {
    font-size: 16px;
  }

  .delete-btn {
    background: none;
    border: none;
    color: #999;
    font-size: 20px;
    cursor: pointer;
    padding: 0 10px;
  }

  .delete-btn:hover {
    color: #ff4d4d;
  }

  .error-message {
    background-color: #f8d7da;
    color: #721c24;
    padding: 10px 15px;
    border-radius: 4px;
    margin-bottom: 15px;
  }

  .loading {
    padding: 15px 0;
    color: #6c757d;
    text-align: center;
  }
</style> 