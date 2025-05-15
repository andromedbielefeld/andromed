<script lang="ts">
  import { onMount } from 'svelte';
  import { useInsuranceTypeStore } from '../../../../stores/insuranceTypeStore';
  import { Plus, Edit2, Trash, AlertCircle } from 'lucide-svelte';

  // Store-State
  let editingId: string | null = null;
  let formName = '';
  let formDescription = '';
  let formError = '';
  
  // Reaktive Variablen für den Store-State
  $: insuranceTypes = $insuranceTypeStore.insuranceTypes;
  $: loading = $insuranceTypeStore.loading;
  $: error = $insuranceTypeStore.error;

  // Formular zurücksetzen
  function resetForm() {
    editingId = null;
    formName = '';
    formDescription = '';
    formError = '';
  }

  // Versicherungsart zum Bearbeiten laden
  function editInsuranceType(insuranceType: any) {
    editingId = insuranceType.id;
    formName = insuranceType.name;
    formDescription = insuranceType.description || '';
    formError = '';
  }

  // Versicherungsart speichern
  async function saveInsuranceType() {
    if (!formName.trim()) {
      formError = 'Name ist erforderlich';
      return;
    }

    formError = '';

    try {
      if (editingId) {
        await insuranceTypeStore.update({
          id: editingId,
          name: formName.trim(),
          description: formDescription.trim()
        });
      } else {
        await insuranceTypeStore.create({
          name: formName.trim(),
          description: formDescription.trim()
        });
      }
      resetForm();
    } catch (e: any) {
      formError = e.message || 'Fehler beim Speichern';
    }
  }

  // Versicherungsart löschen
  async function deleteInsuranceType(id: string) {
    if (!confirm('Möchten Sie diese Versicherungsart wirklich löschen?')) return;
    
    await insuranceTypeStore.delete(id);
    
    if (editingId === id) {
      resetForm();
    }
  }

  // Daten beim Laden der Komponente laden
  onMount(() => {
    insuranceTypeStore.load();
  });
</script>

<div class="insurance-types">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Form -->
    <div class="card">
      <h2 class="text-lg font-semibold mb-4">
        {editingId ? 'Versicherungsart bearbeiten' : 'Neue Versicherungsart'}
      </h2>
      
      {#if formError}
        <div class="alert error mb-4">
          {formError}
        </div>
      {/if}

      <form on:submit|preventDefault={saveInsuranceType} class="space-y-4">
        <div class="form-group">
          <label for="name">Name*</label>
          <input 
            type="text"
            id="name"
            bind:value={formName}
            placeholder="Name der Versicherungsart"
            class="input w-full"
            required
          />
        </div>

        <div class="form-group">
          <label for="description">Beschreibung</label>
          <textarea 
            id="description"
            bind:value={formDescription}
            placeholder="Beschreibung (optional)"
            class="input w-full"
            rows="3"
          ></textarea>
        </div>

        <div class="flex justify-end gap-2">
          {#if editingId}
            <button 
              type="button" 
              class="btn btn-outline"
              on:click={resetForm}
            >
              Abbrechen
            </button>
          {/if}
          <button 
            type="submit" 
            class="btn btn-primary"
            disabled={loading}
          >
            {editingId ? 'Aktualisieren' : 'Erstellen'}
          </button>
        </div>
      </form>
    </div>

    <!-- List -->
    <div class="card">
      <h2 class="text-lg font-semibold mb-4">Vorhandene Versicherungsarten</h2>

      {#if error}
        <div class="alert error mb-4">
          <AlertCircle class="h-5 w-5 mr-2" />
          {error}
        </div>
      {/if}

      {#if loading}
        <div class="loading">Lade Versicherungsarten...</div>
      {:else if insuranceTypes.length === 0}
        <div class="empty">Keine Versicherungsarten gefunden.</div>
      {:else}
        <div class="space-y-3">
          {#each insuranceTypes as type}
            <div class="insurance-item">
              <div class="insurance-info">
                <h3>{type.name}</h3>
                {#if type.description}
                  <p>{type.description}</p>
                {/if}
              </div>
              <div class="insurance-actions">
                <button 
                  class="btn icon" 
                  on:click={() => editInsuranceType(type)}
                  title="Bearbeiten"
                >
                  <Edit2 class="h-4 w-4" />
                </button>
                <button 
                  class="btn icon danger" 
                  on:click={() => deleteInsuranceType(type.id)}
                  title="Löschen"
                >
                  <Trash class="h-4 w-4" />
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .insurance-types {
    width: 100%;
  }

  .card {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .alert {
    padding: 0.75rem 1rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }

  .alert.error {
    background-color: #f8d7da;
    color: #721c24;
  }

  .loading, .empty {
    padding: 1rem;
    text-align: center;
    color: #6c757d;
  }

  .insurance-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    border: 1px solid #e9ecef;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
  }

  .insurance-item:hover {
    background-color: #f8f9fa;
  }

  .insurance-info h3 {
    margin: 0;
    font-size: 1rem;
  }

  .insurance-info p {
    margin: 0.25rem 0 0 0;
    color: #6c757d;
    font-size: 0.85rem;
  }

  .insurance-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn.icon {
    padding: 0.35rem;
    background: none;
  }

  .btn.danger:hover {
    color: #dc3545;
    background-color: rgba(220, 53, 69, 0.1);
  }

  .btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
</style>