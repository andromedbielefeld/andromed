import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface ReasonSelectionProps {
  onSubmit: (reason: string) => void;
  onBack: () => void;
}

function ReasonSelection({ onSubmit, onBack }: ReasonSelectionProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onSubmit(reason.trim());
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
        Mit welcher Fragestellung kam der/die Patient*in in Ihre Praxis?
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="input w-full min-h-[150px]"
            placeholder="Beschreiben Sie hier die Fragestellung..."
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!reason.trim()}
          >
            Weiter
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReasonSelection;