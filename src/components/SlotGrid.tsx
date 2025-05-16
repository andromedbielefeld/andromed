import { format, addDays, startOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { useState } from 'react';

interface SlotGridProps {
  selectedDate: Date;
  slots: { [date: string]: boolean[] };
  onSlotToggle: (date: string, index: number) => void;
  onDateChange: (date: Date) => void;
}

function SlotGrid({ selectedDate, slots, onSlotToggle, onDateChange }: SlotGridProps) {
  // Generate time slots from 8:00 to 20:00 in 30-minute intervals
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek(selectedDate, { locale: de }), i)
  );

  // Track hover state for better UX
  const [hoveredSlot, setHoveredSlot] = useState<{ date: string; index: number } | null>(null);

  const handleSlotClick = (date: string, index: number) => {
    onSlotToggle(date, index);
  };

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onDateChange(addDays(selectedDate, -7))}
          className="btn btn-outline"
        >
          Vorherige Woche
        </button>
        <span className="font-medium">
          {format(weekDays[0], 'd. MMMM', { locale: de })} - {format(weekDays[6], 'd. MMMM yyyy', { locale: de })}
        </span>
        <button
          onClick={() => onDateChange(addDays(selectedDate, 7))}
          className="btn btn-outline"
        >
          Nächste Woche
        </button>
      </div>

      {/* Grid */}
      <div className="relative overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="py-3 px-4 text-left font-medium border-b border-border">Zeit</th>
              {weekDays.map(day => (
                <th key={day.toISOString()} className="py-3 px-4 text-center font-medium border-b border-border">
                  <div className="font-medium">{format(day, 'EEEE', { locale: de })}</div>
                  <div className="text-sm text-muted-foreground">{format(day, 'dd.MM.', { locale: de })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time, i) => (
              <tr key={time} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                <td className="py-2 px-4 font-medium border-r border-border">{time}</td>
                {weekDays.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const daySlots = slots[dateStr] || Array(24).fill(false);
                  const isSelected = daySlots[i];
                  const isHovered = hoveredSlot?.date === dateStr && hoveredSlot?.index === i;
                  
                  return (
                    <td 
                      key={`${dateStr}-${time}`} 
                      className={`py-2 px-4 text-center border-r border-border ${
                        isHovered ? 'bg-muted' : ''
                      }`}
                    >
                      <button
                        onClick={() => handleSlotClick(dateStr, i)}
                        onMouseEnter={() => setHoveredSlot({ date: dateStr, index: i })}
                        onMouseLeave={() => setHoveredSlot(null)}
                        className={`w-full h-full p-2 rounded transition-colors ${
                          isSelected 
                            ? 'bg-primary/20 hover:bg-primary/30' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div 
                          className={`w-4 h-4 mx-auto rounded border ${
                            isSelected 
                              ? 'bg-primary border-primary' 
                              : 'border-input'
                          }`}
                        >
                          {isSelected && (
                            <svg 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="4"
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                              className="text-primary-foreground"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-muted-foreground">
        Klicken Sie auf die Zeitslots, um die Verfügbarkeit zu ändern.
      </div>
    </div>
  );
}

export default SlotGrid;