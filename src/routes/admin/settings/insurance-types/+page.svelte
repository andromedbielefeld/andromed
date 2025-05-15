<script lang="ts">
  import { onMount } from 'svelte';
  import { insuranceTypeStore, type InsuranceType } from '../../../../stores/insuranceTypeStore';

  // Form-State für neue/zu bearbeitende Versicherungsarten
  let editingInsuranceType: InsuranceType | null = null;
  let formName = '';
  let formDescription = '';
  let isEditing = false;
  let formError = '';
  
  // Reaktive Variablen für den Store-State
  $: insuranceTypes = $insuranceTypeStore.insuranceTypes;
  $: loading = $insuranceTypeStore.loading;
  $: error = $insuranceTypeStore.error;

  // Formular zurücksetzen
  function resetForm() {
    editingInsuranceType = null;
    formName = '';
    formDescription = '';
    isEditing = false;
    formError = '';
  }

  // Versicherungsart zum Bearbeiten laden
  function editInsuranceType(insuranceType: InsuranceType) {
    editingInsuranceType = { ...insuranceType };
    formName = insuranceType.name;
    formDescription = insuranceType.description || '';
    isEditing = true;
    formError = '';
  }

  // Versicherungsart speichern (erstellen oder aktualisieren)
  async function saveInsuranceType() {
    // Formular validieren
    if (!formName.trim()) {
      formError = 'Name ist erforderlich';
      return;
    }

    formError = '';

    try {
      if (isEditing && editingInsuranceType) {
        // Bestehende Versicherungsart aktualisieren
        await insuranceTypeStore.update({
          ...editingInsuranceType,
          name: formName.trim(),
          description: formDescription.trim()
        });
      } else {
        // Neue Versicherungsart erstellen
        await insuranceTypeStore.create({
          name: formName.trim(),
          description: formDescription.trim()
        });
      }
      
      // Formular zurücksetzen nach erfolgreichem Speichern
      resetForm();
    } catch (e) {
      console.error('Fehler beim Speichern:', e);
      formError = e.message || 'Fehler beim Speichern der Versicherungsart';
    }
  }

  // Versicherungsart löschen
  async function deleteInsuranceType(id: string) {
    if (!confirm('Möchten Sie diese Versicherungsart wirklich löschen?')) return;
    
    await insuranceTypeStore.delete(id);
    
    // Falls die gelöschte Versicherungsart gerade bearbeitet wurde, Formular zurücksetzen
    if (editingInsuranceType && editingInsuranceType.id === id) {
      resetForm();
    }
  }

  // Daten beim Laden der Komponente laden
  onMount(() => {
    insuranceTypeStore.load();
  });
</script>

<div class="admin-settings">
  <h1>Versicherungsarten verwalten</h1>

  <!-- Fehleranzeige -->
  {#if error}
    <div class="alert error">
      Fehler beim Laden der Daten: {error.message}
    </div>
  {/if}

  <div class="settings-layout">
    <!-- Formular -->
    <div class="settings-section">
      <div class="card">
        <h2>{isEditing ? 'Versicherungsart bearbeiten' : 'Neue Versicherungsart'}</h2>
        
        <form on:submit|preventDefault={saveInsuranceType}>
          {#if formError}
            <div class="alert error">
              {formError}
            </div>
          {/if}

          <div class="form-group">
            <label for="insuranceName">Name*</label>
            <input 
              type="text" 
              id="insuranceName"
              bind:value={formName}
              placeholder="Name der Versicherungsart"
              required
            />
          </div>

          <div class="form-group">
            <label for="insuranceDescription">Beschreibung</label>
            <textarea 
              id="insuranceDescription"
              bind:value={formDescription}
              placeholder="Beschreibung (optional)"
              rows="3"
            ></textarea>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn primary" 
              disabled={loading}
            >
              {isEditing ? 'Aktualisieren' : 'Erstellen'}
            </button>
            {#if isEditing}
              <button 
                type="button" 
                class="btn secondary" 
                on:click={resetForm}
                disabled={loading}
              >
                Abbrechen
              </button>
            {/if}
          </div>
        </form>
      </div>
    </div>
    
    <!-- Liste der Versicherungsarten -->
    <div class="settings-section">
      <div class="card">
        <h2>Verfügbare Versicherungsarten</h2>
        
        {#if loading && insuranceTypes.length === 0}
          <div class="loading">Lade Versicherungsarten...</div>
        {:else if insuranceTypes.length === 0}
          <div class="empty">Keine Versicherungsarten gefunden.</div>
        {:else}
          <div class="insurance-list">
            {#each insuranceTypes as insuranceType}
              <div class="insurance-item">
                <div class="insurance-info">
                  <h3>{insuranceType.name}</h3>
                  {#if insuranceType.description}
                    <p>{insuranceType.description}</p>
                  {/if}
                </div>
                <div class="insurance-actions">
                  <button 
                    class="btn icon" 
                    on:click={() => editInsuranceType(insuranceType)} 
                    title="Bearbeiten"
                  >
                    ✏️
                  </button>
                  <button 
                    class="btn icon danger" 
                    on:click={() => deleteInsuranceType(insuranceType.id)} 
                    title="Löschen"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .admin-settings {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  h1 {
    margin-bottom: 1.5rem;
  }

  .settings-layout {
    display: grid;
    gap: 1.5rem;
  }
  
  @media (min-width: 768px) {
    .settings-layout {
      grid-template-columns: 1fr 1fr;
    }
  }

  .card {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    height: 100%;
  }

  h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  input, textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    font-size: 1rem;
  }

  .form-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }

  .btn {
    padding: 0.65rem 1.25rem;
    border: none;
    border-radius: 0.25rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .btn.primary {
    background-color: #007bff;
    color: white;
  }

  .btn.primary:hover:not(:disabled) {
    background-color: #0069d9;
  }

  .btn.secondary {
    background-color: #6c757d;
    color: white;
  }

  .btn.secondary:hover:not(:disabled) {
    background-color: #5a6268;
  }

  .btn.icon {
    padding: 0.35rem 0.5rem;
    background: none;
  }

  .btn.danger:hover {
    background-color: rgba(220, 53, 69, 0.1);
  }

  .btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
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
    background-color: #f8f9fa;
    border-radius: 0.25rem;
  }

  .insurance-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 400px;
    overflow-y: auto;
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

  .insurance-info {
    flex-grow: 1;
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
</style> 