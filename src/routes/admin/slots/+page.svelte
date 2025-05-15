<script lang="ts">
  import { onMount } from 'svelte';
  import { slotStore, type GenerateSlotParams } from '../../../stores/slotStore';
  import { examinationStore } from '../../../stores/examinationStore';
  import { deviceStore } from '../../../stores/deviceStore';
  import { format } from 'date-fns';
  import { de } from 'date-fns/locale';

  let generating = false;
  let generationSuccess = false;
  let generationError = '';

  // Forms für Slot-Generierung
  let generateForm: GenerateSlotParams = {
    startDate: format(new Date(), 'yyyy-MM-dd'),
    numberOfDays: 14,
    device_ids: [],
    examination_ids: []
  };

  // Prüft, ob das Formular gültig ist
  $: isFormValid = generateForm.startDate && generateForm.numberOfDays;

  // Formatiert das Datum für die Anzeige
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return format(date, 'EEEE, d. MMMM yyyy', { locale: de });
  }

  // Formatiert die Uhrzeit für die Anzeige
  function formatTime(timeString: string): string {
    const date = new Date(timeString);
    return format(date, 'HH:mm');
  }

  // Slots generieren
  async function generateSlots() {
    generating = true;
    generationSuccess = false;
    generationError = '';

    try {
      // Formular für API-Aufruf aufbereiten
      const params: GenerateSlotParams = {
        startDate: generateForm.startDate,
        numberOfDays: generateForm.numberOfDays
      };

      // Füge optionale Parameter hinzu, wenn ausgewählt
      if (generateForm.device_ids && generateForm.device_ids.length > 0) {
        params.device_ids = generateForm.device_ids;
      }

      if (generateForm.examination_ids && generateForm.examination_ids.length > 0) {
        params.examination_ids = generateForm.examination_ids;
      }

      // Edge Function aufrufen
      const success = await slotStore.generateSlots(params);

      if (success) {
        generationSuccess = true;
      } else {
        generationError = 'Ein unbekannter Fehler ist aufgetreten.';
      }
    } catch (error) {
      console.error('Fehler bei der Slot-Generierung:', error);
      generationError = error.message || 'Ein unbekannter Fehler ist aufgetreten.';
    } finally {
      generating = false;
    }
  }

  // Geräte und Untersuchungen laden
  onMount(async () => {
    await deviceStore.load();
    await examinationStore.load();
  });
</script>

<div class="admin-slots">
  <h1>Slot-Verwaltung</h1>

  <div class="card">
    <h2>Slots generieren</h2>
    <form on:submit|preventDefault={generateSlots} class="generate-form">
      <div class="form-group">
        <label for="startDate">Startdatum</label>
        <input 
          type="date" 
          id="startDate"
          bind:value={generateForm.startDate}
          required
        />
      </div>

      <div class="form-group">
        <label for="numberOfDays">Anzahl Tage</label>
        <input 
          type="number" 
          id="numberOfDays"
          bind:value={generateForm.numberOfDays}
          min="1"
          max="90"
          required
        />
      </div>

      <div class="form-group">
        <label for="deviceSelect">Geräte (optional)</label>
        <select 
          id="deviceSelect" 
          bind:value={generateForm.device_ids}
          multiple
        >
          {#each $deviceStore.devices as device}
            <option value={device.id}>{device.name}</option>
          {/each}
        </select>
        <small>Strg+Klick für Mehrfachauswahl</small>
      </div>

      <div class="form-group">
        <label for="examinationSelect">Untersuchungen (optional)</label>
        <select 
          id="examinationSelect" 
          bind:value={generateForm.examination_ids}
          multiple
        >
          {#each $examinationStore.examinations as examination}
            <option value={examination.id}>{examination.name}</option>
          {/each}
        </select>
        <small>Strg+Klick für Mehrfachauswahl</small>
      </div>

      <div class="form-actions">
        <button 
          type="submit" 
          class="btn primary" 
          disabled={!isFormValid || generating}
        >
          {#if generating}
            Slots werden generiert...
          {:else}
            Slots generieren
          {/if}
        </button>
      </div>

      {#if generationSuccess}
        <div class="alert success">
          Slots wurden erfolgreich generiert!
        </div>
      {/if}

      {#if generationError}
        <div class="alert error">
          {generationError}
        </div>
      {/if}
    </form>
  </div>

  <div class="card">
    <h2>Slot-Pool aktualisieren</h2>
    <p>
      Der Slot-Pool enthält die frühesten verfügbaren Slots pro Untersuchung und Tag.
      Dies hilft dem Frontend, schnell freie Termine anzuzeigen, ohne alle Slots laden zu müssen.
    </p>
    <button 
      class="btn secondary" 
      disabled={$slotStore.loading}
      on:click={() => slotStore.updateSlotPool()}
    >
      {#if $slotStore.loading}
        Aktualisiere...
      {:else}
        Slot-Pool aktualisieren
      {/if}
    </button>
  </div>

  <div class="card">
    <h2>Entwicklungshinweise</h2>
    <div class="dev-notes">
      <h3>Funktionsweise der Slot-Generierung</h3>
      <ul>
        <li>Slots werden für jedes Gerät und jede kompatible Untersuchung im angegebenen Zeitraum erstellt</li>
        <li>Slots werden initial als <code>blocked</code> angelegt</li>
        <li>Pro Untersuchung und Tag wird nur der früheste Slot auf <code>available</code> gesetzt</li>
        <li>Wenn ein Slot gebucht wird, wird der nächste verfügbare Slot für diese Untersuchung am selben Tag freigegeben</li>
      </ul>

      <h3>API-Endpunkte</h3>
      <pre><code>POST /functions/v1/generate-slots</code></pre>
      <p>Parameter:</p>
      <pre><code>{JSON.stringify({
  "device_ids": ["optional", "Gerät-IDs als Array"],
  "examination_ids": ["optional", "Untersuchungs-IDs als Array"],
  "startDate": "YYYY-MM-DD (optional, Default: heute)",
  "numberOfDays": "Anzahl Tage (optional, Default: 14)"
}, null, 2)}</code></pre>
    </div>
  </div>
</div>

<style>
  .admin-slots {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 1rem;
  }

  h1 {
    margin-bottom: 1.5rem;
  }

  .card {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
  }

  h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }

  .generate-form {
    display: grid;
    gap: 1rem;
  }

  @media (min-width: 768px) {
    .generate-form {
      grid-template-columns: 1fr 1fr;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-weight: 500;
  }

  input, select {
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    font-size: 1rem;
  }

  select[multiple] {
    height: 150px;
  }

  small {
    color: #6c757d;
    font-size: 0.85rem;
  }

  .form-actions {
    grid-column: 1 / -1;
    margin-top: 1rem;
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

  .btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .alert {
    padding: 0.75rem 1rem;
    border-radius: 0.25rem;
    margin-top: 1rem;
    grid-column: 1 / -1;
  }

  .alert.success {
    background-color: #d4edda;
    color: #155724;
  }

  .alert.error {
    background-color: #f8d7da;
    color: #721c24;
  }

  .dev-notes {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 0.25rem;
  }

  pre {
    background-color: #e9ecef;
    padding: 0.75rem;
    border-radius: 0.25rem;
    overflow-x: auto;
  }

  code {
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 0.9rem;
  }

  ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  li {
    margin-bottom: 0.35rem;
  }

  h3 {
    font-size: 1rem;
    margin: 1.5rem 0 0.5rem 0;
  }

  h3:first-child {
    margin-top: 0;
  }
</style> 