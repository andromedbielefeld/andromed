import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import type { PostgrestError } from '@supabase/supabase-js';

// Typdefinition für Versicherungsart
export interface InsuranceType {
  id: string;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

// Interface für den Store-Zustand
interface InsuranceTypeStore {
  insuranceTypes: InsuranceType[];
  loading: boolean;
  error: PostgrestError | null;
}

// Store erstellen
const createInsuranceTypeStore = () => {
  // Initialer Zustand
  const initialState: InsuranceTypeStore = {
    insuranceTypes: [],
    loading: false,
    error: null
  };

  // Svelte Store initialisieren
  const { subscribe, set, update } = writable<InsuranceTypeStore>(initialState);

  return {
    subscribe,

    // Alle Versicherungsarten laden
    load: async () => {
      update(state => ({ ...state, loading: true, error: null }));

      try {
        const { data, error } = await supabase
          .from('insurance_types')
          .select('*')
          .order('name');

        if (error) throw error;

        update(state => ({
          ...state,
          insuranceTypes: data || [],
          loading: false
        }));
      } catch (error) {
        console.error('Fehler beim Laden der Versicherungsarten:', error);
        update(state => ({ ...state, error, loading: false }));
      }
    },

    // Neue Versicherungsart erstellen
    create: async (insuranceType: Omit<InsuranceType, 'id' | 'created_at' | 'updated_at'>) => {
      update(state => ({ ...state, loading: true, error: null }));

      try {
        const { data, error } = await supabase
          .from('insurance_types')
          .insert(insuranceType)
          .select()
          .single();

        if (error) throw error;

        // Store aktualisieren mit der neuen Versicherungsart
        update(state => ({
          ...state,
          insuranceTypes: [...state.insuranceTypes, data],
          loading: false
        }));
      } catch (error) {
        console.error('Fehler beim Erstellen der Versicherungsart:', error);
        update(state => ({ ...state, error, loading: false }));
      }
    },

    // Versicherungsart aktualisieren
    update: async (insuranceType: InsuranceType) => {
      update(state => ({ ...state, loading: true, error: null }));

      try {
        const { error } = await supabase
          .from('insurance_types')
          .update({
            name: insuranceType.name,
            description: insuranceType.description
          })
          .eq('id', insuranceType.id);

        if (error) throw error;

        // Store aktualisieren
        update(state => ({
          ...state,
          insuranceTypes: state.insuranceTypes.map(item =>
            item.id === insuranceType.id ? { ...item, ...insuranceType } : item
          ),
          loading: false
        }));
      } catch (error) {
        console.error('Fehler beim Aktualisieren der Versicherungsart:', error);
        update(state => ({ ...state, error, loading: false }));
      }
    },

    // Versicherungsart löschen
    delete: async (id: string) => {
      update(state => ({ ...state, loading: true, error: null }));

      try {
        const { error } = await supabase
          .from('insurance_types')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Store aktualisieren
        update(state => ({
          ...state,
          insuranceTypes: state.insuranceTypes.filter(item => item.id !== id),
          loading: false
        }));
      } catch (error) {
        console.error('Fehler beim Löschen der Versicherungsart:', error);
        update(state => ({ ...state, error, loading: false }));
      }
    },

    // Store zurücksetzen
    reset: () => {
      set(initialState);
    }
  };
};

// Store exportieren
export const insuranceTypeStore = createInsuranceTypeStore(); 