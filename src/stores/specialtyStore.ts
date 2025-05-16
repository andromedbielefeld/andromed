import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Specialty {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

interface SpecialtyState {
  specialties: Specialty[];
  isLoading: boolean;
  error: string | null;
  
  fetchSpecialties: () => Promise<void>;
  addSpecialty: (name: string) => Promise<void>;
  updateSpecialty: (id: string, name: string) => Promise<void>;
  deleteSpecialty: (id: string) => Promise<void>;
}

export const useSpecialtyStore = create<SpecialtyState>((set) => ({
  specialties: [],
  isLoading: false,
  error: null,
  
  fetchSpecialties: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .order('name');
      
      if (error) throw error;
      set({ specialties: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch specialties', isLoading: false });
    }
  },
  
  addSpecialty: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('specialties')
        .insert([{ name }])
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({
        specialties: [...state.specialties, data],
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to add specialty', isLoading: false });
    }
  },
  
  updateSpecialty: async (id: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('specialties')
        .update({ name })
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        specialties: state.specialties.map(specialty => 
          specialty.id === id ? { ...specialty, name } : specialty
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update specialty', isLoading: false });
    }
  },
  
  deleteSpecialty: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('specialties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        specialties: state.specialties.filter(specialty => specialty.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete specialty', isLoading: false });
    }
  }
}));