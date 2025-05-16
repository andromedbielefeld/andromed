import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Examination {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  durationMinutes: number;
  bodySideRequired: boolean;
  deviceIds: string[];
  specialtyIds: string[];
}

interface ExaminationCategory {
  id: string;
  name: string;
}

interface ExaminationStore {
  examinations: Examination[];
  categories: ExaminationCategory[];
  isLoading: boolean;
  error: string | null;
  fetchExaminations: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  addExamination: (examination: {
    name: string;
    categoryId: string;
    durationMinutes: number;
    bodySideRequired?: boolean;
    deviceIds?: string[];
    specialtyIds?: string[];
  }) => Promise<void>;
  updateExamination: (id: string, data: {
    name: string;
    categoryId: string;
    durationMinutes: number;
    bodySideRequired: boolean;
    deviceIds?: string[];
    specialtyIds?: string[];
  }) => Promise<void>;
  deleteExamination: (id: string) => Promise<void>;
  addCategory: (category: { name: string }) => Promise<void>;
  updateCategory: (id: string, data: { name: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useExaminationStore = create<ExaminationStore>((set, get) => ({
  examinations: [],
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('examination_categories')
        .select('id, name')
        .order('name');

      if (error) throw error;

      set({ categories: data, isLoading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Failed to fetch categories', isLoading: false });
    }
  },

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
          examination_devices ( device_id ),
          examination_specialties ( specialty_id )
        `);

      if (error) throw error;

      const transformedExaminations = data.map((exam: any) => ({
        id: exam.id,
        name: exam.name,
        categoryId: exam.category_id,
        categoryName: (exam.examination_categories && exam.examination_categories.name) || 'Unbekannt',
        durationMinutes: exam.duration_minutes,
        bodySideRequired: exam.body_side_required || false,
        deviceIds: exam.examination_devices.map((ed: any) => ed.device_id),
        specialtyIds: exam.examination_specialties.map((es: any) => es.specialty_id)
      }));

      set({ examinations: transformedExaminations, isLoading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Failed to fetch examinations', isLoading: false });
    }
  },

  addExamination: async (examination) => {
    set({ isLoading: true, error: null });
    try {
      const { deviceIds, specialtyIds, ...examinationData } = examination;

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

      // 3. Insert specialty associations
      if (specialtyIds && specialtyIds.length > 0) {
        const examinationSpecialtiesData = specialtyIds.map(specialtyId => ({
          examination_id: newExamination.id,
          specialty_id: specialtyId
        }));

        const { error: esError } = await supabase
          .from('examination_specialties')
          .insert(examinationSpecialtiesData);

        if (esError) throw esError;
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
        const { error: deleteDevicesError } = await supabase
          .from('examination_devices')
          .delete()
          .eq('examination_id', id);

        if (deleteDevicesError) throw deleteDevicesError;

        // Then insert new ones
        if (data.deviceIds.length > 0) {
          const examinationDevicesData = data.deviceIds.map(deviceId => ({
            examination_id: id,
            device_id: deviceId
          }));

          const { error: insertDevicesError } = await supabase
            .from('examination_devices')
            .insert(examinationDevicesData);

          if (insertDevicesError) throw insertDevicesError;
        }
      }

      // 3. Update specialty associations if provided
      if (data.specialtyIds) {
        // First delete existing associations
        const { error: deleteSpecialtiesError } = await supabase
          .from('examination_specialties')
          .delete()
          .eq('examination_id', id);

        if (deleteSpecialtiesError) throw deleteSpecialtiesError;

        // Then insert new ones
        if (data.specialtyIds.length > 0) {
          const examinationSpecialtiesData = data.specialtyIds.map(specialtyId => ({
            examination_id: id,
            specialty_id: specialtyId
          }));

          const { error: insertSpecialtiesError } = await supabase
            .from('examination_specialties')
            .insert(examinationSpecialtiesData);

          if (insertSpecialtiesError) throw insertSpecialtiesError;
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

      // Update local state
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

      // Update local state
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

      // Update local state
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

      // Update local state
      set(state => ({
        categories: state.categories.filter(cat => cat.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error?.message || 'Failed to delete category', isLoading: false });
    }
  }
}));