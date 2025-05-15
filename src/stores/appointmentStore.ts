import { create } from 'zustand';
import { Appointment, Slot, PatientData, InsuranceType } from '../types';
import { format, addDays } from 'date-fns';

interface AppointmentState {
  appointments: Appointment[];
  slots: Slot[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAppointments: () => Promise<void>;
  fetchSlots: (examinationId: string) => Promise<void>;
  bookAppointment: (
    slotId: string, 
    doctorId: string, 
    patientData: PatientData, 
    insuranceType: InsuranceType
  ) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
}

// Helper to create mock slots for the next 14 days
const createMockSlots = (examinationId: string): Slot[] => {
  const slots: Slot[] = [];
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);
  
  // For each of the next 14 days
  for (let i = 1; i <= 14; i++) {
    const date = addDays(baseDate, i);
    const dayOfWeek = date.getDay();
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    // Add 1-2 slots per day
    const numSlots = Math.floor(Math.random() * 2) + 1;
    for (let j = 0; j < numSlots; j++) {
      const hour = 8 + Math.floor(Math.random() * 8); // Between 8-16
      const minute = Math.random() < 0.5 ? 0 : 30; // Either :00 or :30
      
      date.setHours(hour, minute, 0, 0);
      const startTime = new Date(date);
      
      // End time is start time + duration (default to 30 min)
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);
      
      slots.push({
        id: `slot-${i}-${j}`,
        deviceId: examinationId === 'ex1' || examinationId === 'ex2' || examinationId === 'ex3' ? 'dev2' : 'dev1',
        examinationId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isBooked: false
      });
    }
  }
  
  return slots;
};

// Mock appointments
const mockAppointments: Appointment[] = [
  {
    id: 'app1',
    slotId: 'slot-1-0',
    doctorId: '2',
    patientData: {
      firstName: 'Max',
      lastName: 'Mustermann',
      dateOfBirth: '1980-05-15',
      email: 'max.mustermann@example.com',
      phone: '0123456789'
    },
    insuranceType: 'public',
    createdAt: new Date().toISOString(),
    status: 'confirmed'
  },
  {
    id: 'app2',
    slotId: 'slot-3-1',
    doctorId: '2',
    patientData: {
      firstName: 'Anna',
      lastName: 'Schmidt',
      dateOfBirth: '1975-09-20',
      email: 'anna.schmidt@example.com'
    },
    insuranceType: 'private',
    createdAt: new Date().toISOString(),
    status: 'pending'
  }
];

export const useAppointmentStore = create<AppointmentState>((set) => ({
  appointments: [],
  slots: [],
  isLoading: false,
  error: null,
  
  fetchAppointments: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ appointments: mockAppointments, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch appointments', isLoading: false });
    }
  },
  
  fetchSlots: async (examinationId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock slots for the given examination
      const mockSlots = createMockSlots(examinationId);
      
      // Sort by date
      mockSlots.sort((a, b) => {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });
      
      // For the sequential release logic, we only show the first available slot
      const firstAvailableSlot = mockSlots.find(slot => !slot.isBooked);
      
      set({ 
        slots: firstAvailableSlot ? [firstAvailableSlot] : [],
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to fetch slots', isLoading: false });
    }
  },
  
  bookAppointment: async (slotId, doctorId, patientData, insuranceType) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newAppointment: Appointment = {
        id: `app${Math.floor(Math.random() * 1000)}`,
        slotId,
        doctorId,
        patientData,
        insuranceType,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      
      set(state => ({
        appointments: [...state.appointments, newAppointment],
        // Mark the slot as booked
        slots: state.slots.map(slot => 
          slot.id === slotId ? { ...slot, isBooked: true } : slot
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to book appointment', isLoading: false });
    }
  },
  
  cancelAppointment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => {
        const appointment = state.appointments.find(app => app.id === id);
        if (!appointment) return state;
        
        return {
          appointments: state.appointments.map(app => 
            app.id === id ? { ...app, status: 'cancelled' as const } : app
          ),
          // Release the slot if it was previously booked
          slots: state.slots.map(slot => 
            slot.id === appointment.slotId ? { ...slot, isBooked: false } : slot
          ),
          isLoading: false
        };
      });
    } catch (error) {
      set({ error: 'Failed to cancel appointment', isLoading: false });
    }
  },
  
  updateAppointmentStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        appointments: state.appointments.map(app => 
          app.id === id ? { ...app, status } : app
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to update appointment status', isLoading: false });
    }
  },
}));