import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Examination, ExaminationCategory } from '../types';

interface ExaminationState {
  examinations: Examination[];
  categories: ExaminationCategory[];
  isLoading: boolean;
  error: string | null;
  
  fetchExaminations: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  addExamination: (examination: Omit<Examination, 'id'>) => Promise<void>;
  updateExamination: (id: string, data: Partial<Examination>) => Promise<void>;
  deleteExamination: (id: string) => Promise<void>;
  addCategory: (category: Omit<ExaminationCategory, 'id'>) => Promise<void>;
  updateCategory: (id: string, data: Partial<ExaminationCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useExaminationStore = create<ExaminationState>((set, get) => ({
  examinations: [],
  categories: [],
  isLoading: false,
  error: null,
  
  fetchExaminations: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('examinations')
        .select(`
          id,
          name,
          category_id,
          duration_minutes,
          body_side_required,
          examination_categories ( name ),
          examination_devices ( device_id )
        `);

      if (error) throw error;

      const transformedExaminations = data.map((exam: any) => ({
        id: exam.id,
        name: exam.name,
        categoryId: exam.category_id,
        categoryName: (exam.examination_categories && typeof exam.examination_categories === 'object' && exam.examination_categories.name) || 'Unbekannt',
        durationMinutes: exam.duration_minutes,
        bodySideRequired: exam.body_side_required || false,
        deviceIds: exam.examination_devices.map((ed: any) => ed.device_id)
      }));

      set({ examinations: transformedExaminations, isLoading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Failed to fetch examinations', isLoading: false });
    }
  },
  
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('examination_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      set({ categories: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Failed to fetch categories', isLoading: false });
    }
  },
  
  addExamination: async (examination) => {
    set({ isLoading: true, error: null });
    try {
      const { deviceIds, ...examinationData } = examination;

      // 1. Insert examination
      const { data: newExamination, error: examinationError } = await supabase
        .from('examinations')
        .insert([{
          name: examinationData.name,
          category_id: examinationData.categoryId,
          duration_minutes: examinationData.durationMinutes,
          body_side_required: examinationData.bodySideRequired || false
        }])
        .select()
        .single();

      if (examinationError) throw examinationError;
      if (!newExamination) throw new Error('Failed to create examination entry');

      // 2. Insert device associations
      if (deviceIds && deviceIds.length > 0) {
        const examinationDevicesData = deviceIds.map(deviceId => ({
          examination_id: newExamination.id,
          device_id: deviceId
        }));

        const { error: edError } = await supabase
          .from('examination_devices')
          .insert(examinationDevicesData);

        if (edError) throw edError;
      }

      // Fetch updated list
      await get().fetchExaminations();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Failed to add examination', isLoading: false });
    }
  },
  
  updateExamination: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Update examination data
      const { error: updateError } = await supabase
        .from('examinations')
        .update({
          name: data.name,
          category_id: data.categoryId,
          duration_minutes: data.durationMinutes,
          body_side_required: data.bodySideRequired
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // 2. Update device associations if provided
      if (data.deviceIds) {
        // First delete existing associations
        const { error: deleteError } = await supabase
          .from('examination_devices')
          .delete()
          .eq('examination_id', id);

        if (deleteError) throw deleteError;

        // Then insert new ones
        if (data.deviceIds.length > 0) {
          const examinationDevicesData = data.deviceIds.map(deviceId => ({
            examination_id: id,
            device_id: deviceId
          }));

          const { error: insertError } = await supabase
            .from('examination_devices')
            .insert(examinationDevicesData);

          if (insertError) throw insertError;
        }
      }

      // Fetch updated list
      await get().fetchExaminations();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Failed to update examination', isLoading: false });
    }
  },
  
  deleteExamination: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('examinations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        examinations: state.examinations.filter(exam => exam.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error?.message || 'Failed to delete examination', isLoading: false });
    }
  },

  addCategory: async (category) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('examination_categories')
        .insert([category])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        categories: [...state.categories, data],
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error?.message || 'Failed to add category', isLoading: false });
    }
  },

  updateCategory: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('examination_categories')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        categories: state.categories.map(cat => 
          cat.id === id ? { ...cat, ...data } : cat
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error?.message || 'Failed to update category', isLoading: false });
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('examination_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        categories: state.categories.filter(cat => cat.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error?.message || 'Failed to delete category', isLoading: false });
    }
  },
}));