import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Examination, ExaminationCategory } from '../types';

interface ExaminationState {
  examinations: Examination[];
  categories: ExaminationCategory[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchExaminations: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  addExamination: (examination: Omit<Examination, 'id'>) => Promise<void>;
  updateExamination: (id: string, data: Partial<Examination>) => Promise<void>;
  deleteExamination: (id: string) => Promise<void>;
  addCategory: (category: Omit<ExaminationCategory, 'id'>) => Promise<void>;
  updateCategory: (id: string, data: Partial<ExaminationCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

// Mock data for demonstration
const mockCategories: ExaminationCategory[] = [
  { id: 'cat1', name: 'CT' },
  { id: 'cat2', name: 'MRT' },
];

const mockExaminations: Examination[] = [
  { 
    id: 'ex1', 
    name: 'MRT Knie nativ', 
    categoryId: 'cat2', 
    durationMinutes: 30, 
    deviceIds: ['dev2']
  },
  { 
    id: 'ex2', 
    name: 'MRT Abdomen nativ', 
    categoryId: 'cat2', 
    durationMinutes: 45, 
    deviceIds: ['dev2']
  },
  { 
    id: 'ex3', 
    name: 'MRT Abdomen-Becken mit KM', 
    categoryId: 'cat2', 
    durationMinutes: 60, 
    deviceIds: ['dev2']
  },
  { 
    id: 'ex4', 
    name: 'CT Kopf nativ', 
    categoryId: 'cat1', 
    durationMinutes: 20, 
    deviceIds: ['dev1']
  },
  { 
    id: 'ex5', 
    name: 'CT Thorax nativ', 
    categoryId: 'cat1', 
    durationMinutes: 25, 
    deviceIds: ['dev1']
  },
];

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

      // 1. Untersuchung in 'examinations' einfügen
      const { data: newExamination, error: examinationError } = await supabase
        .from('examinations')
        .insert([{
          name: examinationData.name,
          category_id: examinationData.categoryId, // Sicherstellen, dass das DB-Spaltenname korrekt ist
          duration_minutes: examinationData.durationMinutes // Sicherstellen, dass das DB-Spaltenname korrekt ist
        }])
        .select()
        .single();

      if (examinationError) throw examinationError;
      if (!newExamination) throw new Error('Failed to create examination entry');

      // 2. Geräteverknüpfungen in 'examination_devices' einfügen
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

      // Neuen Datensatz lokal hinzufügen (optional, fetchExaminations kann auch erneut aufgerufen werden)
      set(state => ({
        examinations: [...state.examinations, { ...newExamination, deviceIds }],
        isLoading: false
      }));
      // Alternativ: get().fetchExaminations(); um die Liste komplett neu zu laden

    } catch (error: any) {
      set({ error: error?.message || 'Failed to add examination', isLoading: false });
    }
  },
  
  updateExamination: async (id, data) => {
    console.warn('updateExamination not implemented with Supabase yet');
    set(state => ({
      examinations: state.examinations.map(exam => 
        exam.id === id ? { ...exam, ...data } : exam
      ),
    }));
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
    console.warn('addCategory not implemented with Supabase yet');
    const newCategory = {
      ...category,
      id: `cat${Math.floor(Math.random() * 1000)}` // Mock ID
    };
    set(state => ({
      categories: [...state.categories, newCategory],
    }));
  },

  updateCategory: async (id, data) => {
    console.warn('updateCategory not implemented with Supabase yet');
    set(state => ({
      categories: state.categories.map(cat => 
        cat.id === id ? { ...cat, ...data } : cat
      ),
    }));
  },

  deleteCategory: async (id) => {
    console.warn('deleteCategory not implemented with Supabase yet');
    set(state => ({
      categories: state.categories.filter(cat => cat.id !== id),
    }));
  },
}));