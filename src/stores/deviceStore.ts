import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Device, WorkingHours, Exception } from '../types';

interface DeviceState {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
  
  fetchDevices: () => Promise<void>;
  addDevice: (device: Omit<Device, 'id'>) => Promise<void>;
  updateDevice: (id: string, data: Partial<Device>) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
}

const isAdmin = (session: any) => {
  return session?.user?.user_metadata?.role === 'admin';
};

// Helper function to verify category exists
const verifyCategoryExists = async (categoryId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('examination_categories')
    .select('id')
    .eq('id', categoryId)
    .single();
  
  if (error) {
    throw new Error('Failed to verify category');
  }
  
  return !!data;
};

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [],
  isLoading: false,
  error: null,
  
  fetchDevices: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      // Fetch devices with their working hours and exceptions
      const { data: devices, error: devicesError } = await supabase
        .from('devices')
        .select(`
          *,
          examination_categories ( name ), 
          device_working_hours (*),
          device_exceptions (*)
        `)
        .order('name');
      
      if (devicesError) throw devicesError;
      
      // Transform the data to match our Device type
      const transformedDevices = devices.map((device: any) => ({
        id: device.id,
        name: device.name,
        categoryId: device.category_id,
        categoryName: device.examination_categories?.name || 'Unbekannt',
        workingHours: device.device_working_hours.map((wh: any) => ({
          day: wh.day_of_week,
          start: wh.start_time,
          end: wh.end_time
        })),
        exceptions: device.device_exceptions.map((ex: any) => ({
          date: ex.exception_date,
          reason: ex.reason
        }))
      }));

      set({ devices: transformedDevices, isLoading: false });
    } catch (error: any) {
      let specificMessage = 'Failed to fetch devices';
      if (error && typeof error === 'object' && error.message && typeof error.message === 'string') {
        specificMessage = error.message;
      } else if (error instanceof Error && error.message) {
        specificMessage = error.message;
      }
      set({ error: specificMessage, isLoading: false });
    }
  },
  
  addDevice: async (device) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      if (!isAdmin(session)) {
        throw new Error('Admin access required');
      }

      // Verify category exists before proceeding
      const categoryExists = await verifyCategoryExists(device.categoryId);
      if (!categoryExists) {
        throw new Error('Selected category does not exist');
      }

      // Start a transaction by using a single connection
      const { data: newDevice, error: deviceError } = await supabase
        .from('devices')
        .insert([{
          name: device.name,
          category_id: device.categoryId
        }])
        .select()
        .single();
      
      if (deviceError) throw deviceError;

      // Insert working hours
      const workingHoursData = device.workingHours.map(wh => ({
        device_id: newDevice.id,
        day_of_week: wh.day,
        start_time: wh.start,
        end_time: wh.end
      }));

      const { error: whError } = await supabase
        .from('device_working_hours')
        .insert(workingHoursData);
      
      if (whError) throw whError;

      // Insert exceptions if any
      if (device.exceptions.length > 0) {
        const exceptionsData = device.exceptions.map(ex => ({
          device_id: newDevice.id,
          exception_date: ex.date,
          reason: ex.reason
        }));

        const { error: exError } = await supabase
          .from('device_exceptions')
          .insert(exceptionsData);
        
        if (exError) throw exError;
      }

      // Fetch the complete device data
      await set(state => ({ 
        devices: [...state.devices, {
          id: newDevice.id,
          name: newDevice.name,
          categoryId: newDevice.category_id,
          categoryName: newDevice.examination_categories?.name || 'Unbekannt',
          workingHours: device.workingHours,
          exceptions: device.exceptions
        }],
        isLoading: false 
      }));
    } catch (error: any) {
      let specificMessage = 'Failed to add device';
      if (error && typeof error === 'object' && error.message && typeof error.message === 'string') {
        specificMessage = error.message;
      } else if (error instanceof Error && error.message) {
        specificMessage = error.message;
      }
      set({ error: specificMessage, isLoading: false });
    }
  },
  
  updateDevice: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      if (!isAdmin(session)) {
        throw new Error('Admin access required');
      }

      // Verify category exists before proceeding if categoryId is being updated
      if (data.categoryId) {
        const categoryExists = await verifyCategoryExists(data.categoryId);
        if (!categoryExists) {
          throw new Error('Selected category does not exist');
        }
      }

      // Update device basic info
      const { error: deviceError } = await supabase
        .from('devices')
        .update({
          name: data.name,
          category_id: data.categoryId
        })
        .eq('id', id);
      
      if (deviceError) throw deviceError;

      // Update working hours if provided
      if (data.workingHours) {
        // Delete existing working hours
        const { error: deleteWhError } = await supabase
          .from('device_working_hours')
          .delete()
          .eq('device_id', id);
        
        if (deleteWhError) throw deleteWhError;

        // Insert new working hours
        const workingHoursData = data.workingHours.map(wh => ({
          device_id: id,
          day_of_week: wh.day,
          start_time: wh.start,
          end_time: wh.end
        }));

        const { error: whError } = await supabase
          .from('device_working_hours')
          .insert(workingHoursData);
        
        if (whError) throw whError;
      }

      // Update exceptions if provided
      if (data.exceptions) {
        // Delete existing exceptions
        const { error: deleteExError } = await supabase
          .from('device_exceptions')
          .delete()
          .eq('device_id', id);
        
        if (deleteExError) throw deleteExError;

        // Insert new exceptions
        if (data.exceptions.length > 0) {
          const exceptionsData = data.exceptions.map(ex => ({
            device_id: id,
            exception_date: ex.date,
            reason: ex.reason
          }));

          const { error: exError } = await supabase
            .from('device_exceptions')
            .insert(exceptionsData);
          
          if (exError) throw exError;
        }
      }

      // Update local state
      set(state => ({
        devices: state.devices.map(device => 
          device.id === id 
            ? { ...device, ...data }
            : device
        ),
        isLoading: false
      }));
    } catch (error: any) {
      let specificMessage = 'Failed to update device';
      if (error && typeof error === 'object' && error.message && typeof error.message === 'string') {
        specificMessage = error.message;
      } else if (error instanceof Error && error.message) {
        specificMessage = error.message;
      }
      set({ error: specificMessage, isLoading: false });
    }
  },
  
  deleteDevice: async (id) => {
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
        .from('devices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        devices: state.devices.filter(device => device.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      let specificMessage = 'Failed to delete device';
      if (error && typeof error === 'object' && error.message && typeof error.message === 'string') {
        specificMessage = error.message;
      } else if (error instanceof Error && error.message) {
        specificMessage = error.message;
      }
      set({ error: specificMessage, isLoading: false });
    }
  },
}));