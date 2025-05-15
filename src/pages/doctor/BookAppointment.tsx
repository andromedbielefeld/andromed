import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useExaminationStore } from '../../stores/examinationStore';
import { useAppointmentStore } from '../../stores/appointmentStore';
import { PatientData, InsuranceType, Appointment } from '../../types';

// Booking flow components
import CategorySelection from './BookAppointment/CategorySelection';
import ExaminationSelection from './BookAppointment/ExaminationSelection';
import BodySideSelection from './BookAppointment/BodySideSelection';
import ReasonSelection from './BookAppointment/ReasonSelection';
import DiagnosisSelection from './BookAppointment/DiagnosisSelection';
import SlotSelection from './BookAppointment/SlotSelection';
import PatientForm from './BookAppointment/PatientForm';
import Confirmation from './BookAppointment/Confirmation';

// Booking flow steps
type BookingStep = 
  | 'category' 
  | 'examination' 
  | 'bodySide' 
  | 'reason' 
  | 'diagnosis' 
  | 'slot' 
  | 'patient' 
  | 'confirmation';

function BookAppointment() {
  const { user } = useAuth();
  const { examinations, fetchExaminations, fetchCategories } = useExaminationStore();
  const { bookAppointment } = useAppointmentStore();
  
  // Booking flow state
  const [step, setStep] = useState<BookingStep>('category');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedExaminationId, setSelectedExaminationId] = useState<string>('');
  const [selectedBodySide, setSelectedBodySide] = useState<'left' | 'right' | 'bilateral'>('left');
  const [visitReason, setVisitReason] = useState('');
  const [suspectedDiagnosis, setSuspectedDiagnosis] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [completedAppointment, setCompletedAppointment] = useState<Appointment | null>(null);
  
  // Load initial data
  useEffect(() => {
    fetchCategories();
    fetchExaminations();
  }, [fetchCategories, fetchExaminations]);
  
  // Step handlers
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setStep('examination');
  };
  
  const handleExaminationSelect = (examinationId: string) => {
    setSelectedExaminationId(examinationId);
    const examination = examinations.find(e => e.id === examinationId);
    
    if (examination?.bodySideRequired) {
      setStep('bodySide');
    } else {
      setStep('reason');
    }
  };
  
  const handleBodySideSelect = (bodySide: 'left' | 'right' | 'bilateral') => {
    setSelectedBodySide(bodySide);
    setStep('reason');
  };

  const handleReasonSubmit = (reason: string) => {
    setVisitReason(reason);
    setStep('diagnosis');
  };

  const handleDiagnosisSubmit = (diagnosis: string) => {
    setSuspectedDiagnosis(diagnosis);
    setStep('slot');
  };
  
  const handleSlotSelect = (slotId: string) => {
    setSelectedSlotId(slotId);
    setStep('patient');
  };
  
  const handlePatientSubmit = async (patientData: PatientData, insuranceType: InsuranceType) => {
    try {
      if (!user) return;
      
      const selectedExamination = examinations.find(e => e.id === selectedExaminationId);
      if (!selectedExamination) return;

      await bookAppointment(
        selectedSlotId,
        user.id,
        patientData,
        insuranceType,
        selectedExamination.bodySideRequired ? selectedBodySide : undefined,
        visitReason,
        suspectedDiagnosis
      );
      
      // Create local appointment object for confirmation
      const newAppointment: Appointment = {
        id: 'temp-id', // This would normally come from the backend
        slotId: selectedSlotId,
        doctorId: user.id,
        patientData,
        insuranceType,
        bodySide: selectedExamination.bodySideRequired ? selectedBodySide : undefined,
        visitReason,
        suspectedDiagnosis,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      
      setCompletedAppointment(newAppointment);
      setStep('confirmation');
    } catch (error) {
      console.error('Failed to book appointment:', error);
      // Handle error
    }
  };
  
  const resetBookingFlow = () => {
    setStep('category');
    setSelectedCategoryId('');
    setSelectedExaminationId('');
    setSelectedBodySide('left');
    setVisitReason('');
    setSuspectedDiagnosis('');
    setSelectedSlotId('');
    setCompletedAppointment(null);
  };
  
  // Step back handlers
  const goBack = () => {
    switch (step) {
      case 'examination':
        setStep('category');
        break;
      case 'bodySide':
        setStep('examination');
        break;
      case 'reason':
        const examination = examinations.find(e => e.id === selectedExaminationId);
        setStep(examination?.bodySideRequired ? 'bodySide' : 'examination');
        break;
      case 'diagnosis':
        setStep('reason');
        break;
      case 'slot':
        setStep('diagnosis');
        break;
      case 'patient':
        setStep('slot');
        break;
      default:
        break;
    }
  };
  
  // Get the selected examination for the patient form
  const selectedExamination = examinations.find(e => e.id === selectedExaminationId);
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Termin online vereinbaren</h1>
      
      <div className="max-w-2xl mx-auto">
        <div className="card">
          {step === 'category' && (
            <CategorySelection onSelectCategory={handleCategorySelect} />
          )}
          
          {step === 'examination' && (
            <ExaminationSelection 
              categoryId={selectedCategoryId}
              onSelectExamination={handleExaminationSelect}
              onBack={goBack}
            />
          )}
          
          {step === 'bodySide' && selectedExamination && (
            <BodySideSelection 
              examination={selectedExamination}
              onSelectBodySide={handleBodySideSelect}
              onBack={goBack}
            />
          )}

          {step === 'reason' && (
            <ReasonSelection
              onSubmit={handleReasonSubmit}
              onBack={goBack}
            />
          )}

          {step === 'diagnosis' && (
            <DiagnosisSelection
              onSubmit={handleDiagnosisSubmit}
              onBack={goBack}
            />
          )}
          
          {step === 'slot' && (
            <SlotSelection 
              examinationId={selectedExaminationId}
              onSelectSlot={handleSlotSelect}
              onBack={goBack}
            />
          )}
          
          {step === 'patient' && selectedExamination && (
            <PatientForm 
              examination={selectedExamination}
              onSubmit={handlePatientSubmit}
              onBack={goBack}
            />
          )}
          
          {step === 'confirmation' && completedAppointment && (
            <Confirmation 
              appointment={completedAppointment}
              onNewBooking={resetBookingFlow}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default BookAppointment;