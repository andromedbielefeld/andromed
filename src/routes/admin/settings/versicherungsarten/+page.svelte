<script lang="ts">
  import { onMount } from 'svelte';
  import { insuranceTypeStore, type InsuranceType } from '../../../../stores/insuranceTypeStore';

  let newInsuranceTypeName = '';
  let loading = false;
  let error = '';

  // Reaktive Variablen
  $: insuranceTypes = $insuranceTypeStore.insuranceTypes;
  
  // Versicherungsart hinzufügen
  async function addInsuranceType() {
    if (!newInsuranceTypeName.trim()) return;
    
    loading = true;
    try {
      await insuranceTypeStore.create({
        name: newInsuranceTypeName.trim(),
        description: ''
      });
      newInsuranceTypeName = '';
      error = '';
    } catch (err) {
      error = err.message || 'Fehler beim Hinzufügen der Versicherungsart';
      console.error('Fehler beim Hinzufügen der Versicherungsart:', err);
    } finally {
      loading = false;
    }
  }

  // Versicherungsart löschen
  async function deleteInsuranceType(id: string) {
    if (!confirm('Möchten Sie diese Versicherungsart wirklich löschen?')) return;
    
    loading = true;
    try {
      await insuranceTypeStore.delete(id);
      error = '';
    } catch (err) {
      error = err.message || 'Fehler beim Löschen der Versicherungsart';
      console.error('Fehler beim Löschen der Versicherungsart:', err);
    } finally {
      loading = false;
    }
  }

  // Beim Laden der Komponente Daten laden
  onMount(() => {
    console.log("Versicherungsarten-Komponente wurde geladen!");
    insuranceTypeStore.load();
  });
</script>

<div class="settings-container">
  <h2>Versicherungsarten</h2>
  
  <!-- Debug-Information -->
  <div class="debug-info">
    Komponente geladen: Ja | 
    Anzahl Versicherungsarten: {insuranceTypes ? insuranceTypes.length : 0}
  </div>

  <!-- Fehleranzeige -->
  {#if error}
    <div class="error-message">
      {error}
    </div>
  {/if}

  <!-- Eingabefeld für neue Versicherungsart -->
  <div class="input-wrapper">
    <form on:submit|preventDefault={addInsuranceType}>
      <input 
        type="text" 
        bind:value={newInsuranceTypeName} 
        placeholder="Neue Versicherungsart eingeben..." 
        disabled={loading} 
      />
    </form>
  </div>

  <!-- Liste der Versicherungsarten -->
  <div class="insurance-type-list">
    {#if insuranceTypes && insuranceTypes.length > 0}
      {#each insuranceTypes as insuranceType}
        <div class="insurance-type-item">
          <span class="insurance-name">{insuranceType.name}</span>
          <button 
            class="delete-btn"
            on:click={() => deleteInsuranceType(insuranceType.id)}
            disabled={loading}
            title="Löschen"
          >
            ×
          </button>
        </div>
      {/each}
    {:else}
      <div class="empty-message">
        {loading ? 'Lade Versicherungsarten...' : 'Keine Versicherungsarten gefunden.'}
      </div>
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

  .insurance-type-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .insurance-type-item {
    padding: 15px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
  }

  .insurance-name {
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

  .debug-info {
    background-color: #e2f0fd;
    color: #0c5460;
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 4px;
    font-family: monospace;
  }

  .empty-message {
    padding: 15px 0;
    color: #6c757d;
    text-align: center;
    font-style: italic;
  }
</style> 