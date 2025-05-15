import { useEffect, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { useExaminationStore } from '../../../stores/examinationStore';
import { Examination } from '../../../types';

interface ExaminationSelectionProps {
  categoryId: string;
  onSelectExamination: (examinationId: string) => void;
  onBack: () => void;
}

function ExaminationSelection({ categoryId, onSelectExamination, onBack }: ExaminationSelectionProps) {
  const { examinations, fetchExaminations, isLoading, error } = useExaminationStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchExaminations();
  }, [fetchExaminations]);
  
  const filteredExaminations = examinations
    .filter(exam => exam.categoryId === categoryId)
    .filter(exam => 
      exam.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
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
        Wählen Sie die Terminart
      </h2>
      
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Nach Terminart suchen"
          className="input pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-error/10 border border-error/30 text-error rounded-md p-4">
          {error}
        </div>
      ) : filteredExaminations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Keine Untersuchungen gefunden
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredExaminations.map((examination: Examination) => (
            <button
              key={examination.id}
              onClick={() => onSelectExamination(examination.id)}
              className="card hover:bg-muted/50 transition-colors text-left"
            >
              <div className="font-medium">{examination.name}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Dauer: {examination.durationMinutes} Minuten
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExaminationSelection;