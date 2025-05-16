export interface Examination {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  durationMinutes: number;
  deviceIds: string[];
  bodySideRequired: boolean;
  specialtyIds: string[];
}