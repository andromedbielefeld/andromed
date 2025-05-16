import { format, addDays, startOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';

interface SlotGridProps {
  selectedDate: Date;
  slots: boolean[];
  onSlotToggle: (index: number) => void;
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
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left font-medium">Zeit</th>
              {weekDays.map(day => (
                <th key={day.toISOString()} className="py-2 px-4 text-center font-medium">
                  {format(day, 'EEEEEE', { locale: de })}
                  <br />
                  {format(day, 'dd.MM.', { locale: de })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time, i) => (
              <tr key={time} className={i % 2 === 0 ? 'bg-muted/50' : ''}>
                <td className="py-2 px-4 font-medium">{time}</td>
                {weekDays.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isSelected = slots[i];
                  
                  return (
                    <td key={`${dateStr}-${time}`} className="py-2 px-4 text-center">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-input h-4 w-4 text-primary focus:ring-primary"
                          checked={isSelected}
                          onChange={() => onSlotToggle(i)}
                        />
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SlotGrid;