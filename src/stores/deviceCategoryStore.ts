import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

interface DeviceCategory {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface DeviceCategoryState {
  categories: DeviceCategory[];
  isLoading: boolean;
  error: string | null;
  
  fetchCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useDeviceCategoryStore = create<DeviceCategoryState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,
  
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      // First check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('device_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      set({ categories: data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch categories';
      set({ error: message, isLoading: false });
    }
  },
  
  addCategory: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      // Check authentication before adding
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('device_categories')
        .insert([{ name }])
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({
        categories: [...state.categories, data],
        isLoading: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add category';
      set({ error: message, isLoading: false });
    }
  },
  
  updateCategory: async (id: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      // Check authentication before updating
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      // First check if the category exists
      const { data: existingCategory, error: checkError } = await supabase
        .from('device_categories')
        .select()
        .eq('id', id)
        .maybeSingle();

      if (checkError) throw checkError;
      if (!existingCategory) throw new Error('Category not found');

      // Proceed with update if category exists
      const { data, error } = await supabase
        .from('device_categories')
        .update({ name })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      // Since we confirmed the category exists and update succeeded,
      // data[0] will be the updated category
      set(state => ({
        categories: state.categories.map(cat => 
          cat.id === id ? data[0] : cat
        ),
        isLoading: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update category';
      set({ error: message, isLoading: false });
    }
  },
  
  deleteCategory: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Check authentication before deleting
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const { error } = await supabase
        .from('device_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        categories: state.categories.filter(cat => cat.id !== id),
        isLoading: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete category';
      set({ error: message, isLoading: false });
    }
  },
}));