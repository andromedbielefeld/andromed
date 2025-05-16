import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Device } from '../types';

interface DeviceState {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
  
  fetchDevices: () => Promise<void>;
  addDevice: (device: Omit<Device, 'id'>) => Promise<void>;
  updateDevice: (id: string, data: Partial<Device>) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
  updateAvailableSlots: (id: string, date: string, slots: boolean[]) => Promise<void>;
}

const isAdmin = (session: any) => {
  return session?.user?.user_metadata?.role === 'admin';
};

export const useDeviceStore = create<DeviceState>((set, get) => ({
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

      const { data, error } = await supabase
        .from('devices')
        .select(`
          *,
          examination_categories (name)
        `)
        .order('name');
      
      if (error) throw error;
      
      const transformedDevices = data.map((device: any) => ({
        id: device.id,
        name: device.name,
        categoryId: device.category_id,
        categoryName: device.examination_categories?.name || 'Unbekannt',
        availableSlots: device.available_slots || {}
      }));

      set({ devices: transformedDevices, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch devices', isLoading: false });
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

      const { data: newDevice, error } = await supabase
        .from('devices')
        .insert([{
          name: device.name,
          category_id: device.categoryId,
          available_slots: device.availableSlots || {}
        }])
        .select()
        .single();
      
      if (error) throw error;

      set(state => ({
        devices: [...state.devices, {
          id: newDevice.id,
          name: newDevice.name,
          categoryId: newDevice.category_id,
          availableSlots: newDevice.available_slots || {}
        }],
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to add device', isLoading: false });
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

      const { error } = await supabase
        .from('devices')
        .update({
          name: data.name,
          category_id: data.categoryId,
          available_slots: data.availableSlots
        })
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        devices: state.devices.map(device => 
          device.id === id ? { ...device, ...data } : device
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update device', isLoading: false });
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
      set({ error: error.message || 'Failed to delete device', isLoading: false });
    }
  },

  updateAvailableSlots: async (id: string, date: string, slots: boolean[]) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      if (!isAdmin(session)) {
        throw new Error('Admin access required');
      }

      const device = get().devices.find(d => d.id === id);
      if (!device) throw new Error('Device not found');

      const updatedSlots = {
        ...device.availableSlots,
        [date]: slots
      };

      const { error } = await supabase
        .from('devices')
        .update({
          available_slots: updatedSlots
        })
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        devices: state.devices.map(device => 
          device.id === id 
            ? { ...device, availableSlots: updatedSlots }
            : device
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update slots', isLoading: false });
    }
  }
}));