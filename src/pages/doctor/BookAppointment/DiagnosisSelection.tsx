import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface DiagnosisSelectionProps {
  onSubmit: (diagnosis: string, needsContrastMedium: boolean, creatinineValue: string | null, hasClaustrophobia: boolean) => void;
  onBack: () => void;
}

type Step = 'diagnosis' | 'contrast' | 'creatinine' | 'claustrophobia';

function DiagnosisSelection({ onSubmit, onBack }: DiagnosisSelectionProps) {
  const [step, setStep] = useState<Step>('diagnosis');
  const [diagnosis, setDiagnosis] = useState('');
  const [needsContrastMedium, setNeedsContrastMedium] = useState(false);
  const [creatinineValue, setCreatinineValue] = useState('');
  const [hasClaustrophobia, setHasClaustrophobia] = useState(false);

  const handleDiagnosisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (diagnosis.trim()) {
      setStep('contrast');
    }
  };

  const handleContrastSelection = (value: boolean) => {
    setNeedsContrastMedium(value);
    if (value) {
      setStep('creatinine');
    } else {
      setStep('claustrophobia');
    }
  };

  const handleCreatinineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (creatinineValue.trim()) {
      setStep('claustrophobia');
    }
  };

  const handleClaustrophobiaSelection = (value: boolean) => {
    setHasClaustrophobia(value);
    onSubmit(diagnosis, needsContrastMedium, needsContrastMedium ? creatinineValue : null, value);
  };

  const handleStepBack = () => {
    switch (step) {
      case 'contrast':
        setStep('diagnosis');
        break;
      case 'creatinine':
        setStep('contrast');
        break;
      case 'claustrophobia':
        setStep(needsContrastMedium ? 'creatinine' : 'contrast');
        break;
      default:
        onBack();
    }
  };

  if (step === 'diagnosis') {
    return (
      <div className="animate-fade-in">
        <button 
          onClick={handleStepBack}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Zurück
        </button>
        
        <h2 className="text-xl font-semibold mb-6">
          Welche Verdachtsdiagnose hat Ihre Untersuchung ergeben?
        </h2>

        <form onSubmit={handleDiagnosisSubmit} className="space-y-6">
          <div>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="input w-full min-h-[150px]"
              placeholder="Beschreiben Sie hier die Verdachtsdiagnose..."
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!diagnosis.trim()}
            >
              Weiter
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (step === 'contrast') {
    return (
      <div className="animate-fade-in">
        <button 
          onClick={handleStepBack}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Zurück
        </button>
        
        <h2 className="text-xl font-semibold mb-6">
          Soll die Untersuchung mit Kontrastmittel durchgeführt werden?
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleContrastSelection(false)}
            className="card hover:bg-muted/50 transition-colors text-center py-8"
          >
            <div className="font-medium">Nein</div>
          </button>

          <button
            onClick={() => handleContrastSelection(true)}
            className="card hover:bg-muted/50 transition-colors text-center py-8"
          >
            <div className="font-medium">Ja</div>
          </button>
        </div>
      </div>
    );
  }

  if (step === 'creatinine') {
    return (
      <div className="animate-fade-in">
        <button 
          onClick={handleStepBack}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Zurück
        </button>
        
        <h2 className="text-xl font-semibold mb-6">
          Kreatinin-Wert (falls Kontrastmittel-Gabe)
        </h2>

        <form onSubmit={handleCreatinineSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={creatinineValue}
              onChange={(e) => setCreatinineValue(e.target.value)}
              className="input w-full"
              placeholder="Kreatinin-Wert eingeben"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!creatinineValue.trim()}
            >
              Weiter
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <button 
        onClick={handleStepBack}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Zurück
      </button>
      
      <h2 className="text-xl font-semibold mb-6">
        Leidet der Patient an Klaustrophobie?
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleClaustrophobiaSelection(false)}
          className="card hover:bg-muted/50 transition-colors text-center py-8"
        >
          <div className="font-medium">Nein</div>
        </button>

        <button
          onClick={() => handleClaustrophobiaSelection(true)}
          className="card hover:bg-muted/50 transition-colors text-center py-8"
        >
          <div className="font-medium">Ja</div>
        </button>
      </div>
    </div>
  );
}

export default DiagnosisSelection;