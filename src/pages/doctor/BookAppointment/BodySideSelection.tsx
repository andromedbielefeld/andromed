import { ArrowLeft } from 'lucide-react';
import { Examination } from '../../../types';

interface BodySideSelectionProps {
  examination: Examination;
  onSelectBodySide: (bodySide: 'left' | 'right' | 'bilateral') => void;
  onBack: () => void;
}

function BodySideSelection({ examination, onSelectBodySide, onBack }: BodySideSelectionProps) {
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
        Welche Körperseite soll untersucht werden?
      </h2>

      <p className="text-muted-foreground mb-6">
        Für {examination.name} muss die zu untersuchende Körperseite angegeben werden.
      </p>
      
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => onSelectBodySide('left')}
          className="card hover:bg-muted/50 transition-colors text-center py-8"
        >
          <div className="font-medium">Links</div>
        </button>

        <button
          onClick={() => onSelectBodySide('right')}
          className="card hover:bg-muted/50 transition-colors text-center py-8"
        >
          <div className="font-medium">Rechts</div>
        </button>

        <button
          onClick={() => onSelectBodySide('bilateral')}
          className="card hover:bg-muted/50 transition-colors text-center py-8"
        >
          <div className="font-medium">Beidseitig</div>
        </button>
      </div>
    </div>
  );
}

export default BodySideSelection;