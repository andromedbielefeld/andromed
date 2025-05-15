<script lang="ts">
  import { onMount } from 'svelte';
  import { slotStore, type SlotPoolEntry, type TimeSlot } from '../stores/slotStore';
  import { format } from 'date-fns';
  import { de } from 'date-fns/locale';

  // Props
  export let examinationId: string;
  export let patientId: string;
  export let onSlotSelected: (slot: TimeSlot) => void = () => {};
  
  // Reaktive Variablen
  $: slotPoolByDate = groupSlotsByDate($slotStore.slotPool);
  $: selectedSlots = $slotStore.slots;
  $: loading = $slotStore.loading;
  $: error = $slotStore.error;
  $: selectedDate = $slotStore.selectedDate;

  // Gruppiert Slots nach Datum für die Kalenderansicht
  function groupSlotsByDate(slotPool: SlotPoolEntry[]): Record<string, SlotPoolEntry[]> {
    const grouped: Record<string, SlotPoolEntry[]> = {};
    
    slotPool.forEach(slot => {
      if (!grouped[slot.slot_date]) {
        grouped[slot.slot_date] = [];
      }
      grouped[slot.slot_date].push(slot);
    });
    
    return grouped;
  }

  // Formatiert das Datum für die Anzeige
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return format(date, 'EEEE, d. MMMM', { locale: de });
  }

  // Formatiert die Uhrzeit für die Anzeige
  function formatTime(timeString: string): string {
    const date = new Date(timeString);
    return format(date, 'HH:mm');
  }

  // Slot auswählen
  async function selectDate(date: string) {
    await slotStore.loadSlotsForExaminationAndDate(examinationId, date);
  }

  // Slot buchen
  async function bookSlot(slotId: string) {
    const success = await slotStore.bookSlot(slotId, patientId);
    if (success) {
      const bookedSlot = selectedSlots.find(s => s.id === slotId);
      if (bookedSlot) {
        onSlotSelected(bookedSlot);
      }
    }
  }

  // Beim Mounten Slots aus dem Pool für die gewählte Untersuchung laden
  onMount(async () => {
    await slotStore.loadAvailableSlotPoolForExamination(examinationId);
  });
</script>

<div class="slot-selector">
  <h2>Verfügbare Termine wählen</h2>
  
  {#if loading}
    <div class="loading">Termine werden geladen...</div>
  {:else if error}
    <div class="error">Fehler beim Laden der Termine: {error.message}</div>
  {:else if Object.keys(slotPoolByDate).length === 0}
    <div class="empty">
      <p>Keine verfügbaren Termine für diese Untersuchung.</p>
      <button on:click={() => slotStore.updateSlotPool()}>Termine aktualisieren</button>
    </div>
  {:else}
    <div class="calendar">
      <div class="date-selector">
        <h3>Wählen Sie ein Datum</h3>
        <div class="date-list">
          {#each Object.entries(slotPoolByDate) as [date, slots]}
            <div 
              class="date-item {selectedDate === date ? 'selected' : ''}" 
              on:click={() => selectDate(date)}
            >
              <span class="date-text">{formatDate(date)}</span>
              <span class="badge">{slots.length}</span>
            </div>
          {/each}
        </div>
      </div>
      
      {#if selectedDate && selectedSlots.length > 0}
        <div class="time-selector">
          <h3>Wählen Sie eine Uhrzeit am {formatDate(selectedDate)}</h3>
          <div class="time-list">
            {#each selectedSlots as slot}
              <div class="time-item {slot.status !== 'available' ? 'disabled' : ''}">
                <div class="time-info">
                  <div class="time">{formatTime(slot.start_time)}</div>
                  <div class="device">Gerät: {slot.device?.name || 'Unbekannt'}</div>
                </div>
                <button 
                  disabled={slot.status !== 'available'}
                  on:click={() => bookSlot(slot.id)}
                >
                  Termin buchen
                </button>
              </div>
            {/each}
          </div>
        </div>
      {:else if selectedDate}
        <div class="no-slots">
          <p>Keine Uhrzeiten verfügbar für {formatDate(selectedDate)}.</p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .slot-selector {
    width: 100%;
    margin: 1rem 0;
  }
  
  h2 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
  
  .loading, .error, .empty {
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 0.25rem;
  }
  
  .loading {
    background-color: #f8f9fa;
    color: #495057;
  }
  
  .error {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .empty {
    background-color: #fff3cd;
    color: #856404;
  }
  
  .calendar {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  @media (min-width: 768px) {
    .calendar {
      flex-direction: row;
    }
    
    .date-selector {
      flex-basis: 40%;
    }
    
    .time-selector {
      flex-basis: 60%;
    }
  }
  
  .date-list, .time-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 400px;
    overflow-y: auto;
  }
  
  .date-item {
    padding: 0.75rem 1rem;
    border-radius: 0.25rem;
    background-color: #f8f9fa;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s;
  }
  
  .date-item:hover {
    background-color: #e9ecef;
  }
  
  .date-item.selected {
    background-color: #007bff;
    color: white;
  }
  
  .badge {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 1rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .date-item.selected .badge {
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  .time-item {
    padding: 0.75rem 1rem;
    border-radius: 0.25rem;
    background-color: #f8f9fa;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .time-item.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .time {
    font-size: 1.1rem;
    font-weight: 500;
  }
  
  .device {
    font-size: 0.85rem;
    color: #6c757d;
  }
  
  button {
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 0.25rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  button:hover:not(:disabled) {
    background-color: #0069d9;
  }
  
  button:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
</style> 