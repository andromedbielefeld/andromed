import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import type { PostgrestError } from '@supabase/supabase-js';

// Typdefinitionen
export interface TimeSlot {
  id: string;
  device_id: string;
  examination_id: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'booked' | 'blocked';
  device?: {
    name: string;
  };
  examination?: {
    name: string;
  };
}

export interface SlotPoolEntry {
  id: string;
  examination_id: string;
  slot_date: string;
  slot_id: string;
  device_id: string;
  device_name: string;
  start_time: string;
  end_time: string;
  is_earliest: boolean;
}

export interface GenerateSlotParams {
  device_ids?: string[];
  examination_ids?: string[];
  startDate?: string;
  numberOfDays?: number;
}

interface SlotStore {
  slots: TimeSlot[];
  slotPool: SlotPoolEntry[];
  loading: boolean;
  error: PostgrestError | null;
  selectedDate: string | null;
  selectedExaminationId: string | null;
}

const createSlotStore = () => {
  // Initialer Store-Zustand
  const initialState: SlotStore = {
    slots: [],
    slotPool: [],
    loading: false,
    error: null,
    selectedDate: null,
    selectedExaminationId: null
  };

  const { subscribe, set, update } = writable<SlotStore>(initialState);

  return {
    subscribe,
    
    // Datum und Untersuchung auswählen
    selectExaminationAndDate: (examinationId: string, date: string) => {
      update(state => ({
        ...state,
        selectedExaminationId: examinationId,
        selectedDate: date
      }));
    },

    // Verfügbare Slots aus dem Pool für eine bestimmte Untersuchung laden
    loadAvailableSlotPoolForExamination: async (examinationId: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const { data, error } = await supabase
          .from('slot_pool')
          .select('*')
          .eq('examination_id', examinationId)
          .order('slot_date', { ascending: true });
          
        if (error) throw error;
        
        update(state => ({
          ...state, 
          slotPool: data || [],
          loading: false
        }));
        
        return data;
      } catch (error) {
        console.error('Error loading slot pool:', error);
        update(state => ({ ...state, error, loading: false }));
        return null;
      }
    },

    // Alle Slots für eine Untersuchung und Datum laden
    loadSlotsForExaminationAndDate: async (examinationId: string, date: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const { data, error } = await supabase
          .from('time_slots')
          .select(`
            *,
            devices:device_id (name),
            examinations:examination_id (name, duration_minutes)
          `)
          .eq('examination_id', examinationId)
          .gte('start_time', `${date}T00:00:00`)
          .lt('start_time', `${date}T23:59:59`)
          .order('start_time', { ascending: true });
          
        if (error) throw error;
        
        update(state => ({
          ...state, 
          slots: data || [],
          loading: false,
          selectedExaminationId: examinationId,
          selectedDate: date
        }));
        
        return data;
      } catch (error) {
        console.error('Error loading slots:', error);
        update(state => ({ ...state, error, loading: false }));
        return null;
      }
    },

    // Slot buchen
    bookSlot: async (slotId: string, patientId: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        // 1. Slot auf "booked" setzen
        const { error: updateError } = await supabase
          .from('time_slots')
          .update({ status: 'booked' })
          .eq('id', slotId);
          
        if (updateError) throw updateError;
        
        // 2. Termin erstellen
        const { data: slot } = await supabase
          .from('time_slots')
          .select('*')
          .eq('id', slotId)
          .single();
          
        if (!slot) throw new Error('Slot nicht gefunden');
        
        const { error: appointmentError } = await supabase
          .from('appointments')
          .insert({
            patient_id: patientId,
            examination_id: slot.examination_id,
            device_id: slot.device_id,
            slot_id: slotId,
            start_time: slot.start_time,
            end_time: slot.end_time,
            status: 'scheduled'
          });
          
        if (appointmentError) throw appointmentError;

        // 3. Nächsten Slot für diese Untersuchung an diesem Tag freigeben
        await findAndReleaseNextSlot(slot.examination_id, new Date(slot.start_time).toISOString().split('T')[0]);
        
        // 4. Store aktualisieren
        update(state => {
          const updatedSlots = state.slots.map(s => 
            s.id === slotId ? { ...s, status: 'booked' } : s
          );
          
          return { ...state, slots: updatedSlots, loading: false };
        });
        
        return true;
      } catch (error) {
        console.error('Error booking slot:', error);
        update(state => ({ ...state, error, loading: false }));
        return false;
      }
    },

    // Slot-Pool für optimierte Abfragen aktualisieren
    updateSlotPool: async () => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        // Rufe die Edge Function auf, um den Slot-Pool zu aktualisieren
        const { error } = await supabase.functions.invoke('generate-slots', {
          body: { updatePoolOnly: true }
        });
        
        if (error) throw error;
        
        update(state => ({ ...state, loading: false }));
        return true;
      } catch (error) {
        console.error('Error updating slot pool:', error);
        update(state => ({ ...state, error, loading: false }));
        return false;
      }
    },

    // Slots generieren
    generateSlots: async (params: GenerateSlotParams) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const { error } = await supabase.functions.invoke('generate-slots', {
          body: params
        });
        
        if (error) throw error;
        
        update(state => ({ ...state, loading: false }));
        return true;
      } catch (error) {
        console.error('Error generating slots:', error);
        update(state => ({ ...state, error, loading: false }));
        return false;
      }
    },

    // Store zurücksetzen
    reset: () => {
      set(initialState);
    }
  };
};

// Hilfsfunktion zum Freigeben des nächsten Slots
async function findAndReleaseNextSlot(examinationId: string, date: string) {
  try {
    // 1. Finde alle verfügbaren Slots für diese Untersuchung und Datum
    const { data: blockedSlots } = await supabase
      .from('time_slots')
      .select('*')
      .eq('examination_id', examinationId)
      .eq('status', 'blocked')
      .gte('start_time', `${date}T00:00:00`)
      .lt('start_time', `${date}T23:59:59`)
      .order('start_time', { ascending: true });
      
    if (!blockedSlots || blockedSlots.length === 0) {
      console.log('Keine weiteren Slots zum Freigeben verfügbar');
      return false;
    }
    
    // 2. Setze den frühesten Slot auf "available"
    const earliestSlot = blockedSlots[0];
    const { error } = await supabase
      .from('time_slots')
      .update({ status: 'available' })
      .eq('id', earliestSlot.id);
      
    if (error) throw error;
    
    // 3. Aktualisiere den Slot-Pool
    const { data: slotData } = await supabase
      .from('time_slots')
      .select(`
        id,
        device_id,
        examination_id,
        start_time,
        end_time,
        devices:device_id (name)
      `)
      .eq('id', earliestSlot.id)
      .single();

    if (!slotData) {
      console.error('Slot data not found after update');
      return false;
    }
      
    const { error: poolError } = await supabase
      .from('slot_pool')
      .insert({
        examination_id: examinationId,
        slot_date: date,
        slot_id: earliestSlot.id,
        device_id: slotData.device_id,
        device_name: slotData.devices.name,
        start_time: slotData.start_time,
        end_time: slotData.end_time,
        is_earliest: true
      });
      
    if (poolError) {
      console.error('Error updating slot pool:', poolError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error releasing next slot:', error);
    return false;
  }
}

// Erstelle und exportiere den Store
export const slotStore = createSlotStore(); 