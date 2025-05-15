import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface ExaminationCategory {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface ExaminationCategoryState {
  categories: ExaminationCategory[];
  isLoading: boolean;
  error: string | null;
  
  fetchCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const isAdmin = (session: any) => {
  return session?.user?.user_metadata?.role === 'admin';
};

export const useExaminationCategoryStore = create<ExaminationCategoryState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,
  
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      if (!isAdmin(session)) {
        throw new Error('Admin access required');
      }

      const { data, error } = await supabase
        .from('examination_categories')
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      if (!isAdmin(session)) {
        throw new Error('Admin access required');
      }

      const { data, error } = await supabase
        .from('examination_categories')
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      if (!isAdmin(session)) {
        throw new Error('Admin access required');
      }

      const { data: existingCategory, error: checkError } = await supabase
        .from('examination_categories')
        .select()
        .eq('id', id)
        .maybeSingle();

      if (checkError) throw checkError;
      if (!existingCategory) throw new Error('Category not found');

      const { data, error } = await supabase
        .from('examination_categories')
        .update({ name })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      if (!isAdmin(session)) {
        throw new Error('Admin access required');
      }

      const { error } = await supabase
        .from('examination_categories')
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