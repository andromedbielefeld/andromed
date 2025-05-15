export interface Examination {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  durationMinutes: number;
  deviceIds: string[];
  bodySideRequired: boolean;
}

export interface ExaminationCategory {
  id: string;
  name: string;
}

export interface Device {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  workingHours: WorkingHours[];
  exceptions: Exception[];
}

export interface WorkingHours {
  day: number; // 0 = Sunday, 1 = Monday, etc.
  start: string; // HH:MM format
  end: string; // HH:MM format
}

export interface Exception {
  date: string; // YYYY-MM-DD format
  reason: string;
}

export interface Slot {
  id: string;
  deviceId: string;
  examinationId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  isBooked: boolean;
}

export interface Appointment {
  id: string;
  slotId: string;
  doctorId: string;
  patientData: PatientData;
  insuranceType: InsuranceType;
  bodySide?: 'left' | 'right' | 'bilateral';
  createdAt: string; // ISO string
  status: AppointmentStatus;
}

export interface PatientData {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD format
  email: string;
  phone?: string;
}

export type InsuranceType = 'public' | 'private' | 'accident' | 'selfPay';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor';
}