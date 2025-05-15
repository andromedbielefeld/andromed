import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { PatientData, InsuranceType, Examination } from '../../../types';

interface PatientFormProps {
  examination: Examination;
  onSubmit: (data: PatientData, insuranceType: InsuranceType, bodySide?: 'left' | 'right' | 'bilateral') => void;
  onBack: () => void;
}

const insuranceOptions: { value: InsuranceType; label: string }[] = [
  { value: 'public', label: 'Gesetzlich versichert' },
  { value: 'private', label: 'Privat versichert' },
  { value: 'accident', label: 'Berufsgenossenschaft (BG)' },
  { value: 'selfPay', label: 'Selbstzahler' },
];

function PatientForm({ examination, onSubmit, onBack }: PatientFormProps) {
  const [insuranceType, setInsuranceType] = useState<InsuranceType>('public');
  const [bodySide, setBodySide] = useState<'left' | 'right' | 'bilateral'>('left');
  
  const { register, handleSubmit, formState: { errors } } = useForm<PatientData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      email: '',
      phone: '',
    },
  });
  
  const onFormSubmit = (data: PatientData) => {
    onSubmit(data, insuranceType, examination.bodySideRequired ? bodySide : undefined);
  };
  
  return (
    <div className="animate-fade-in">
      <button 
        onClick={onBack}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Zurück
      </button>
      
      <h2 className="text-xl font-semibold mb-6">
        Patientendaten eingeben
      </h2>
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Versicherungsart
          </label>
          <select
            className="input"
            value={insuranceType}
            onChange={(e) => setInsuranceType(e.target.value as InsuranceType)}
          >
            {insuranceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {examination.bodySideRequired && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Körperseite
              <span className="text-error">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                className={`p-3 rounded-md border ${
                  bodySide === 'left' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-input hover:bg-muted'
                }`}
                onClick={() => setBodySide('left')}
              >
                Links
              </button>
              <button
                type="button"
                className={`p-3 rounded-md border ${
                  bodySide === 'right' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-input hover:bg-muted'
                }`}
                onClick={() => setBodySide('right')}
              >
                Rechts
              </button>
              <button
                type="button"
                className={`p-3 rounded-md border ${
                  bodySide === 'bilateral' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-input hover:bg-muted'
                }`}
                onClick={() => setBodySide('bilateral')}
              >
                Beidseitig
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Vorname
              <span className="text-error">*</span>
            </label>
            <input
              className={`input ${errors.firstName ? 'border-error focus-visible:ring-error' : ''}`}
              {...register('firstName', { required: 'Vorname ist erforderlich' })}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-error">{errors.firstName.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Nachname
              <span className="text-error">*</span>
            </label>
            <input
              className={`input ${errors.lastName ? 'border-error focus-visible:ring-error' : ''}`}
              {...register('lastName', { required: 'Nachname ist erforderlich' })}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-error">{errors.lastName.message}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Geburtsdatum
            <span className="text-error">*</span>
          </label>
          <input
            type="date"
            className={`input ${errors.dateOfBirth ? 'border-error focus-visible:ring-error' : ''}`}
            {...register('dateOfBirth', { required: 'Geburtsdatum ist erforderlich' })}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-xs text-error">{errors.dateOfBirth.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            E-Mail
            <span className="text-error">*</span>
          </label>
          <input
            type="email"
            className={`input ${errors.email ? 'border-error focus-visible:ring-error' : ''}`}
            {...register('email', { 
              required: 'E-Mail ist erforderlich',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Ungültige E-Mail-Adresse',
              }
            })}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-error">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Telefon
          </label>
          <input
            type="tel"
            className="input"
            {...register('phone')}
          />
        </div>
        
        <div className="pt-4">
          <button type="submit" className="btn btn-primary w-full">
            Termin bestätigen
          </button>
        </div>
      </form>
    </div>
  );
}

export default PatientForm;