import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface DiagnosisSelectionProps {
  onSubmit: (diagnosis: string, needsContrastMedium: boolean, creatinineValue: string | null, hasClaustrophobia: boolean) => void;
  onBack: () => void;
}

function DiagnosisSelection({ onSubmit, onBack }: DiagnosisSelectionProps) {
  const [diagnosis, setDiagnosis] = useState('');
  const [needsContrastMedium, setNeedsContrastMedium] = useState(false);
  const [creatinineValue, setCreatinineValue] = useState('');
  const [hasClaustrophobia, setHasClaustrophobia] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (diagnosis.trim()) {
      onSubmit(
        diagnosis.trim(),
        needsContrastMedium,
        needsContrastMedium ? creatinineValue.trim() : null,
        hasClaustrophobia
      );
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

        {/* Kontrastmittel-Frage */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Soll die Untersuchung mit Kontrastmittel durchgeführt werden?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  className="mr-2"
                  checked={!needsContrastMedium}
                  onChange={() => setNeedsContrastMedium(false)}
                />
                Nein
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  className="mr-2"
                  checked={needsContrastMedium}
                  onChange={() => setNeedsContrastMedium(true)}
                />
                Ja
              </label>
            </div>
          </div>

          {/* Kreatinin-Wert Eingabe */}
          {needsContrastMedium && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Kreatinin-Wert (falls Kontrastmittel-Gabe)
              </label>
              <input
                type="text"
                value={creatinineValue}
                onChange={(e) => setCreatinineValue(e.target.value)}
                className="input w-full"
                placeholder="Kreatinin-Wert eingeben"
                required
              />
            </div>
          )}
        </div>

        {/* Klaustrophobie-Frage */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Leidet der Patient an Klaustrophobie?
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                className="mr-2"
                checked={!hasClaustrophobia}
                onChange={() => setHasClaustrophobia(false)}
              />
              Nein
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                className="mr-2"
                checked={hasClaustrophobia}
                onChange={() => setHasClaustrophobia(true)}
              />
              Ja
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!diagnosis.trim() || (needsContrastMedium && !creatinineValue.trim())}
          >
            Weiter
          </button>
        </div>
      </form>
    </div>
  );
}

export default DiagnosisSelection;