import { useEffect, useState } from 'react';
import { 
  CalendarIcon, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  XCircle,
  ChevronDown 
} from 'lucide-react';
import { useAppointmentStore } from '../../stores/appointmentStore';
import { useExaminationStore } from '../../stores/examinationStore';
import { Appointment, AppointmentStatus, Examination } from '../../types';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

function MyAppointments() {
  const { appointments, fetchAppointments } = useAppointmentStore();
  const { examinations, fetchExaminations } = useExaminationStore();
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  
  // Load initial data
  useEffect(() => {
    fetchAppointments();
    fetchExaminations();
  }, [fetchAppointments, fetchExaminations]);
  
  // Apply filters
  const filteredAppointments = appointments.filter(appointment => {
    // Status filter
    if (statusFilter !== 'all' && appointment.status !== statusFilter) {
      return false;
    }
    
    // Date filter
    if (dateFilter) {
      const appointmentSlot = mockSlots.find(slot => slot.id === appointment.slotId);
      if (!appointmentSlot) return false;
      
      const appointmentDate = format(parseISO(appointmentSlot.startTime), 'yyyy-MM-dd');
      if (appointmentDate !== dateFilter) return false;
    }
    
    // Search filter (patient name, email, etc.)
    if (searchTerm) {
      const patientName = `${appointment.patientData.firstName} ${appointment.patientData.lastName}`.toLowerCase();
      const patientEmail = appointment.patientData.email.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return patientName.includes(searchLower) || patientEmail.includes(searchLower);
    }
    
    return true;
  });
  
  // Mock slots for demonstration
  const mockSlots = [
    {
      id: 'slot-1-0',
      startTime: '2025-05-20T13:30:00.000Z',
      endTime: '2025-05-20T14:00:00.000Z',
      examinationId: 'ex1',
    },
    {
      id: 'slot-3-1',
      startTime: '2025-05-21T14:00:00.000Z',
      endTime: '2025-05-21T14:30:00.000Z',
      examinationId: 'ex2',
    },
  ];
  
  const getAppointmentSlot = (appointment: Appointment) => {
    return mockSlots.find(slot => slot.id === appointment.slotId);
  };
  
  const getExaminationForAppointment = (appointment: Appointment) => {
    const slot = getAppointmentSlot(appointment);
    if (!slot) return null;
    
    return examinations.find(exam => exam.id === slot.examinationId);
  };
  
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "dd.MM.yyyy", { locale: de });
  };
  
  const formatTime = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "HH:mm", { locale: de });
  };
  
  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-error" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return 'Bestätigt';
      case 'pending':
        return 'Ausstehend';
      case 'cancelled':
        return 'Storniert';
      case 'completed':
        return 'Abgeschlossen';
      default:
        return 'Unbekannt';
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Meine Termine</h1>
      
      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Patient suchen..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4">
            <div className="w-40">
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">Alle Status</option>
                <option value="pending">Ausstehend</option>
                <option value="confirmed">Bestätigt</option>
                <option value="completed">Abgeschlossen</option>
                <option value="cancelled">Storniert</option>
              </select>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="date"
                className="input pl-10"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Appointments list */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Keine Termine gefunden
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const slot = getAppointmentSlot(appointment);
            const examination = getExaminationForAppointment(appointment);
            
            if (!slot || !examination) return null;
            
            return (
              <div key={appointment.id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                  <div className="flex items-center">
                    {getStatusIcon(appointment.status)}
                    <span className="ml-2">{getStatusLabel(appointment.status)}</span>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="font-medium">{examination.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(slot.startTime)} | {formatTime(slot.startTime)} Uhr
                    </div>
                  </div>
                  
                  <div className="md:text-right">
                    <div className="font-medium">
                      {appointment.patientData.firstName} {appointment.patientData.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {appointment.patientData.email}
                    </div>
                  </div>
                  
                  <button className="btn btn-outline text-sm md:self-start">
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyAppointments;