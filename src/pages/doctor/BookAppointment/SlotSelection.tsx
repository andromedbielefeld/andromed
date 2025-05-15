import { useEffect } from 'react';
import { ArrowLeft, ChevronDown, Clock } from 'lucide-react';
import { useAppointmentStore } from '../../../stores/appointmentStore';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

interface SlotSelectionProps {
  examinationId: string;
  onSelectSlot: (slotId: string) => void;
  onBack: () => void;
}

function SlotSelection({ examinationId, onSelectSlot, onBack }: SlotSelectionProps) {
  const { slots, fetchSlots, isLoading, error } = useAppointmentStore();
  
  useEffect(() => {
    fetchSlots(examinationId);
  }, [fetchSlots, examinationId]);
  
  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    const date = format(parseISO(slot.startTime), 'yyyy-MM-dd');
    
    if (!acc[date]) {
      acc[date] = [];
    }
    
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, typeof slots>);
  
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "EEEE, d. MMMM", { locale: de });
  };
  
  const formatTime = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "HH:mm");
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
        Wählen Sie das Datum für den Termin
      </h2>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-error/10 border border-error/30 text-error rounded-md p-4">
          {error}
        </div>
      ) : Object.keys(slotsByDate).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Keine verfügbaren Termine gefunden
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(slotsByDate).map(([date, dateSlots]) => (
            <div key={date} className="border border-border rounded-lg overflow-hidden">
              <div className="border-b border-border p-4 bg-card flex justify-between items-center">
                <div>
                  <span className="font-medium capitalize">{formatDate(date)}</span>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </div>
              
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {dateSlots.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => onSelectSlot(slot.id)}
                    className="inline-flex items-center justify-center rounded-md bg-muted hover:bg-secondary hover:text-secondary-foreground transition-colors p-3"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {formatTime(slot.startTime)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-sm text-muted-foreground">
        <p>
          <strong>Hinweis:</strong> Es wird immer nur der nächstmögliche verfügbare Termin angezeigt.
        </p>
      </div>
    </div>
  );
}

export default SlotSelection;