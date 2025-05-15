import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface DiagnosisSelectionProps {
  onSubmit: (diagnosis: string) => void;
  onBack: () => void;
}

function DiagnosisSelection({ onSubmit, onBack }: DiagnosisSelectionProps) {
  const [diagnosis, setDiagnosis] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (diagnosis.trim()) {
      onSubmit(diagnosis.trim());
    }
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
        Welche Verdachtsdiagnose hat Ihre Untersuchung ergeben?
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
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

export default DiagnosisSelection;