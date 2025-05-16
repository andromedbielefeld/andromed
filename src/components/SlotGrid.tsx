import { format, addDays, startOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { useState } from 'react';
import { WorkingHours, Exception } from '../types';

interface SlotGridProps {
  selectedDate: Date;
  workingHours: WorkingHours[];
  exceptions: Exception[];
  onWorkingHoursChange: (workingHours: WorkingHours[]) => void;
  onExceptionAdd: (exception: Exception) => void;
  onExceptionRemove: (date: string) => void;
}

function SlotGrid({ 
  selectedDate, 
  workingHours, 
  exceptions,
  onWorkingHoursChange,
  onExceptionAdd,
  onExceptionRemove
}: SlotGridProps) {
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
  const [hoveredSlot, setHoveredSlot] = useState<{ day: number; time: string } | null>(null);

  // Helper to check if a time slot is within working hours
  const isWithinWorkingHours = (day: number, time: string) => {
    const workingDay = workingHours.find(wh => wh.day === day);
    if (!workingDay) return false;

    return time >= workingDay.start && time <= workingDay.end;
  };

  // Helper to check if a date has an exception
  const hasException = (date: string) => {
    return exceptions.some(ex => ex.date === date);
  };

  // Handle working hours toggle
  const handleWorkingHoursToggle = (day: number, time: string) => {
    const workingDay = workingHours.find(wh => wh.day === day);
    
    if (workingDay) {
      // Update existing working hours
      const updatedWorkingHours = workingHours.map(wh => 
        wh.day === day 
          ? { ...wh, start: time, end: time }
          : wh
      );
      onWorkingHoursChange(updatedWorkingHours);
    } else {
      // Add new working hours
      onWorkingHoursChange([
        ...workingHours,
        { day, start: time, end: time }
      ]);
    }
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
            {timeSlots.map((time) => (
              <tr key={time} className={time.endsWith('00') ? 'bg-muted/30' : ''}>
                <td className="py-2 px-4 font-medium border-r border-border">{time}</td>
                {weekDays.map(day => {
                  const dayOfWeek = day.getDay();
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isWorking = isWithinWorkingHours(dayOfWeek, time);
                  const hasExceptionDay = hasException(dateStr);
                  const isHovered = hoveredSlot?.day === dayOfWeek && hoveredSlot?.time === time;
                  
                  return (
                    <td 
                      key={`${dateStr}-${time}`} 
                      className={`py-2 px-4 text-center border-r border-border ${
                        isHovered ? 'bg-muted' : ''
                      } ${hasExceptionDay ? 'bg-error/10' : ''}`}
                    >
                      <label
                        onMouseEnter={() => setHoveredSlot({ day: dayOfWeek, time })}
                        onMouseLeave={() => setHoveredSlot(null)}
                        className={`block w-full h-full p-2 rounded transition-colors cursor-pointer ${
                          isWorking 
                            ? 'bg-green-500/20 hover:bg-green-500/30' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isWorking}
                          onChange={() => handleWorkingHoursToggle(dayOfWeek, time)}
                          className={`w-4 h-4 mx-auto rounded border ${
                            isWorking 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-input'
                          }`}
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

      <div className="text-sm text-muted-foreground">
        Klicken Sie auf die Checkboxen, um die Arbeitszeiten zu ändern.
        Rot hinterlegte Tage sind als Ausnahmen markiert.
      </div>
    </div>
  );
}

export default SlotGrid;