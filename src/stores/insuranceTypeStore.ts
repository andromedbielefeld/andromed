import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface InsuranceType {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface InsuranceTypeState {
  insuranceTypes: InsuranceType[];
  isLoading: boolean;
  error: string | null;
  
  load: () => Promise<void>;
  create: (data: Omit<InsuranceType, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  update: (data: InsuranceType) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

export const useInsuranceTypeStore = create<InsuranceTypeState>((set) => ({
  insuranceTypes: [],
  isLoading: false,
  error: null,
  
  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('insurance_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      set({ insuranceTypes: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load insurance types', isLoading: false });
    }
  },
  
  create: async (insuranceType) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('insurance_types')
        .insert([insuranceType])
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({
        insuranceTypes: [...state.insuranceTypes, data],
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to create insurance type', isLoading: false });
    }
  },
  
  update: async (insuranceType) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('insurance_types')
        .update({
          name: insuranceType.name,
          description: insuranceType.description
        })
        .eq('id', insuranceType.id);
      
      if (error) throw error;
      
      set(state => ({
        insuranceTypes: state.insuranceTypes.map(type => 
          type.id === insuranceType.id ? insuranceType : type
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update insurance type', isLoading: false });
    }
  },
  
  delete: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('insurance_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        insuranceTypes: state.insuranceTypes.filter(type => type.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete insurance type', isLoading: false });
    }
  }
}));