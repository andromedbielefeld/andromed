import { useEffect, useState } from 'react';
import { CheckCircle, Calendar, Clock, User, Mail, Phone, CreditCard } from 'lucide-react';
import { useExaminationStore } from '../../../stores/examinationStore';
import { useAppointmentStore } from '../../../stores/appointmentStore';
import { Appointment, Examination, Slot, InsuranceType } from '../../../types';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

interface ConfirmationProps {
  appointment: Appointment;
  onNewBooking: () => void;
}

const insuranceLabels: Record<InsuranceType, string> = {
  'public': 'Gesetzlich versichert',
  'private': 'Privat versichert',
  'accident': 'Berufsgenossenschaft (BG)',
  'selfPay': 'Selbstzahler',
};

function Confirmation({ appointment, onNewBooking }: ConfirmationProps) {
  const { examinations } = useExaminationStore();
  const { slots } = useAppointmentStore();
  
  const [slot, setSlot] = useState<Slot | null>(null);
  const [examination, setExamination] = useState<Examination | null>(null);
  
  useEffect(() => {
    // Find the slot and examination for this appointment
    const appointmentSlot = slots.find(s => s.id === appointment.slotId);
    if (appointmentSlot) {
      setSlot(appointmentSlot);
      const appointmentExamination = examinations.find(e => e.id === appointmentSlot.examinationId);
      if (appointmentExamination) {
        setExamination(appointmentExamination);
      }
    }
  }, [appointment, slots, examinations]);
  
  if (!slot || !examination) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "EEEE, d. MMMM yyyy", { locale: de });
  };
  
  const formatTime = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "HH:mm");
  };
  
  return (
    <div className="animate-fade-in text-center">
      <div className="flex flex-col items-center mb-8">
        <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        
        <h2 className="text-xl font-semibold">
          Termin erfolgreich gebucht!
        </h2>
        <p className="text-muted-foreground mt-1">
          Eine Bestätigung wurde an die angegebene E-Mail-Adresse versandt.
        </p>
      </div>
      
      <div className="card border-2 border-primary/20 mb-8">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="font-medium">{examination.name}</h3>
            <div className="text-sm text-muted-foreground mt-1">
              Dauer: {examination.durationMinutes} Minuten
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <span>{formatDate(slot.startTime)}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <span>{formatTime(slot.startTime)} Uhr</span>
          </div>
          
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <span>{appointment.patientData.firstName} {appointment.patientData.lastName}</span>
            </div>
            
            <div className="flex items-center gap-3 mt-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>{appointment.patientData.email}</span>
            </div>
            
            {appointment.patientData.phone && (
              <div className="flex items-center gap-3 mt-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>{appointment.patientData.phone}</span>
              </div>
            )}
            
            <div className="flex items-center gap-3 mt-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span>{insuranceLabels[appointment.insuranceType]}</span>
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={onNewBooking}
        className="btn btn-primary"
      >
        Neuen Termin buchen
      </button>
      
      <div className="mt-8 text-sm text-muted-foreground">
        <p>
          Bitte beachten Sie: Der Patient erhält automatisch einen Link zur digitalen Überlassungserklärung per E-Mail.
        </p>
      </div>
    </div>
  );
}

export default Confirmation;