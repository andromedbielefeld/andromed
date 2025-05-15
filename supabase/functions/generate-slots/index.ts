// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// Typen für bessere Typsicherheit
interface Device {
  id: string;
  name: string;
  categoryId: string;
  workingHours: Array<{ 
    day: number;  // 0=Sonntag, 1=Montag, ..., 6=Samstag
    start: string; // "HH:MM" Format
    end: string;  // "HH:MM" Format
  }>;
  exceptions: Array<{
    date: string; // "YYYY-MM-DD" Format
    reason: string;
  }>;
}

interface Examination {
  id: string;
  name: string;
  categoryId: string;
  durationMinutes: number;
  deviceIds: string[]; // Geräte, die diese Untersuchung durchführen können
}

interface GenerateSlotParams {
  device_ids?: string[];
  examination_ids?: string[];
  startDate?: string;
  numberOfDays?: number;
}

// Hilfsfunktionen
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(date: Date): string { // HH:MM
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Die eigentliche Serverlogik
Deno.serve(async (req) => {
  try {
    // CORS-Headers für lokale Entwicklung
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      });
    }

    // Parameter aus Request-Body extrahieren
    const params: GenerateSlotParams = await req.json();
    
    const startDate = params.startDate ? new Date(params.startDate) : new Date();
    startDate.setHours(0, 0, 0, 0); // Auf Mitternacht setzen
    const numberOfDays = params.numberOfDays || 14;

    // Supabase-Client initialisieren
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log(`Generating slots for ${numberOfDays} days starting from ${startDate.toISOString().split('T')[0]}`);
    
    // 1. Geräte laden
    let deviceQuery = supabase.from('devices').select(`
      id,
      name,
      category_id,
      device_working_hours!inner ( day_of_week, start_time, end_time ),
      device_exceptions ( exception_date, reason )
    `);
    if (params.device_ids && params.device_ids.length > 0) {
      deviceQuery = deviceQuery.in('id', params.device_ids);
    }
    const { data: rawDevices, error: deviceError } = await deviceQuery;
    
    if (deviceError) {
      throw new Error(`Fehler beim Laden der Geräte: ${deviceError.message}`);
    }
    
    // Umwandlung in ein besser verwendbares Format
    const devices: Device[] = rawDevices!.map((d: any) => ({
      id: d.id,
      name: d.name,
      categoryId: d.category_id,
      workingHours: d.device_working_hours.map((wh: any) => ({
        day: wh.day_of_week,
        start: wh.start_time,
        end: wh.end_time
      })),
      exceptions: d.device_exceptions.map((ex: any) => ({
        date: ex.exception_date,
        reason: ex.reason
      }))
    }));
    console.log(`Loaded ${devices.length} devices`);

    // 2. Untersuchungen laden
    let examinationQuery = supabase.from('examinations').select(`
      id,
      name,
      category_id,
      duration_minutes,
      examination_devices ( device_id )
    `);
    if (params.examination_ids && params.examination_ids.length > 0) {
      examinationQuery = examinationQuery.in('id', params.examination_ids);
    }
    const { data: rawExaminations, error: examinationError } = await examinationQuery;
    
    if (examinationError) {
      throw new Error(`Fehler beim Laden der Untersuchungen: ${examinationError.message}`);
    }
    
    const examinations: Examination[] = rawExaminations!.map((e: any) => ({
      id: e.id,
      name: e.name,
      categoryId: e.category_id,
      durationMinutes: e.duration_minutes,
      deviceIds: e.examination_devices.map((ed: any) => ed.device_id)
    }));
    console.log(`Loaded ${examinations.length} examinations`);

    // Sammelt alle generierten Slots für die Rückmeldung
    const generatedSlotsInfo: any[] = [];
    // Gruppiert nach "Untersuchung-Tag" für die spätere Freigabe
    const slotsByExaminationAndDay: Record<string, string[]> = {};

    // 3. Iteriere über Geräte und Tage
    for (const device of devices) {
      console.log(`Processing device: ${device.name} (ID: ${device.id})`);
      
      // 3.1 Finde passende Untersuchungen für dieses Gerät
      const relevantExaminations = examinations.filter(ex => ex.deviceIds.includes(device.id));
      if (relevantExaminations.length === 0) {
        console.log(`  No relevant examinations for device ${device.name}, skipping`);
        continue;
      }
      
      // 3.2 Iteriere über jeden Tag
      for (let day = 0; day < numberOfDays; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + day);
        const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const dayOfWeek = currentDate.getDay(); // 0=Sonntag, 1=Montag, ...
        
        // 3.3 Prüfe auf Ausnahmen für diesen Tag
        const exception = device.exceptions.find(ex => ex.date === dateString);
        if (exception) {
          console.log(`  Skipping ${dateString} for device ${device.name} due to exception: ${exception.reason}`);
          continue;
        }
        
        // 3.4 Finde Arbeitszeiten für diesen Wochentag
        const workHours = device.workingHours.find(wh => wh.day === dayOfWeek);
        if (!workHours) {
          console.log(`  No working hours for device ${device.name} on ${dateString} (day ${dayOfWeek})`);
          continue;
        }
        
        // 3.5 Konvertiere Arbeitszeiten in Minuten seit Mitternacht für einfachere Berechnung
        const workStartMinutes = parseTimeToMinutes(workHours.start);
        const workEndMinutes = parseTimeToMinutes(workHours.end);
        
        // 3.6 Iteriere über jede relevante Untersuchung
        for (const exam of relevantExaminations) {
          console.log(`    Processing examination: ${exam.name} (${exam.durationMinutes} min) for device ${device.name} on ${dateString}`);
          
          // Erstelle Slots während der Arbeitszeit mit der Dauer dieser Untersuchung
          let currentTime = new Date(currentDate);
          currentTime.setHours(
            Math.floor(workStartMinutes / 60),
            workStartMinutes % 60,
            0,
            0
          );
          
          let slotCount = 0;
          
          // Der Schlüssel für die "Untersuchung-Tag" Gruppierung
          const examDayKey = `${exam.id}-${dateString}`;
          if (!slotsByExaminationAndDay[examDayKey]) {
            slotsByExaminationAndDay[examDayKey] = [];
          }
          
          // Solange weitere Slots in diesen Arbeitstag passen
          while (true) {
            const slotEndTime = addMinutes(currentTime, exam.durationMinutes);
            
            // Prüfe, ob der Slot noch in der Arbeitszeit liegt
            const endMinutesSinceMidnight = 
              slotEndTime.getHours() * 60 + slotEndTime.getMinutes();
            if (endMinutesSinceMidnight > workEndMinutes) {
              break; // Slot würde über das Arbeitsende hinausgehen
            }
            
            // Prüfe auf Überlappungen mit existierenden Slots
            const { data: overlappingSlots, error: overlapCheckError } = await supabase
              .from('time_slots')
              .select('id', { count: 'exact' })
              .eq('device_id', device.id)
              .lt('start_time', slotEndTime.toISOString())
              .gt('end_time', currentTime.toISOString());
              
            if (overlapCheckError) {
              console.error(`    Error checking for slot overlap: ${overlapCheckError.message}`);
              break;
            }
            
            // Wenn keine Überlappung, erstelle einen neuen Slot
            const overlapCount = overlappingSlots?.length || 0;
            if (overlapCount === 0) {
              // Standard-Status ist 'blocked', wird später selektiv auf 'available' gesetzt
              const { data: newSlot, error: insertError } = await supabase
                .from('time_slots')
                .insert({
                  device_id: device.id,
                  examination_id: exam.id,
                  start_time: currentTime.toISOString(),
                  end_time: slotEndTime.toISOString(),
                  status: 'blocked' // Alle initial auf "blocked", wir setzen später den frühesten auf "available"
                })
                .select('id')
                .single();
                
              if (insertError) {
                console.error(`    Error inserting slot: ${insertError.message}`);
              } else {
                slotCount++;
                
                // Slot-ID für spätere Freigabe speichern
                slotsByExaminationAndDay[examDayKey].push(newSlot.id);
                
                generatedSlotsInfo.push({
                  device: device.name,
                  examination: exam.name,
                  date: dateString,
                  startTime: formatTime(currentTime),
                  endTime: formatTime(slotEndTime),
                  status: 'blocked'
                });
              }
            }
            
            // Weiter zum nächsten möglichen Slot-Startpunkt
            currentTime = slotEndTime;
          }
          
          console.log(`    Created ${slotCount} slots for ${exam.name} on ${device.name} (${dateString})`);
        }
      }
    }

    console.log('Freigabe der frühesten Slots pro Tag und Untersuchung...');

    // 4. Für jede Untersuchung und jeden Tag nur den frühesten Slot freigeben
    for (const [examDayKey, slotIds] of Object.entries(slotsByExaminationAndDay)) {
      if (slotIds.length === 0) continue;

      // Sortiere die Slots nach Startzeit
      const { data: sortedSlots, error: sortError } = await supabase
        .from('time_slots')
        .select('id, start_time')
        .in('id', slotIds)
        .order('start_time', { ascending: true });

      if (sortError) {
        console.error(`Error sorting slots for ${examDayKey}: ${sortError.message}`);
        continue;
      }

      if (sortedSlots && sortedSlots.length > 0) {
        // Setze nur den frühesten Slot auf "available"
        const earliestSlotId = sortedSlots[0].id;
        const { error: updateError } = await supabase
          .from('time_slots')
          .update({ status: 'available' })
          .eq('id', earliestSlotId);

        if (updateError) {
          console.error(`Error updating earliest slot ${earliestSlotId}: ${updateError.message}`);
        } else {
          const [examId, dateString] = examDayKey.split('-');
          console.log(`Set earliest slot for exam ${examId} on ${dateString} to "available"`);
        }
      }
    }

    // Optional: Befülle den slot_pool für optimierte Frontend-Abfragen
    await updateSlotPool(supabase);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated ${generatedSlotsInfo.length} slots`,
        details: generatedSlotsInfo.length > 50 ? `${generatedSlotsInfo.length} slots generated` : generatedSlotsInfo
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error in generate-slots function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error during slot generation'
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500
      },
    );
  }
});

// Helper-Funktion zum Aktualisieren des Slot-Pools
async function updateSlotPool(supabase: any) {
  try {
    console.log("Updating slot_pool table...");
    
    // 1. Lösche alte Einträge im Slot-Pool
    await supabase.from('slot_pool').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // 2. Lade alle verfügbaren Slots
    const { data: availableSlots, error: slotError } = await supabase
      .from('time_slots')
      .select(`
        id,
        device_id,
        examination_id,
        start_time,
        end_time,
        status,
        devices:device_id (name)
      `)
      .eq('status', 'available');
      
    if (slotError) {
      throw new Error(`Failed to load available slots: ${slotError.message}`);
    }
    
    if (!availableSlots || availableSlots.length === 0) {
      console.log("No available slots found for slot_pool");
      return;
    }
    
    // 3. Gruppiere nach Untersuchung und Datum
    const slotsByExamDay: Record<string, any[]> = {};
    
    for (const slot of availableSlots) {
      const date = slot.start_time.split('T')[0];
      const key = `${slot.examination_id}-${date}`;
      
      if (!slotsByExamDay[key]) {
        slotsByExamDay[key] = [];
      }
      
      slotsByExamDay[key].push(slot);
    }
    
    // 4. Für jede Gruppe den frühesten Slot im Pool speichern
    const poolEntries = [];
    
    for (const [key, slots] of Object.entries(slotsByExamDay)) {
      // Sortiere Slots nach Startzeit
      slots.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      
      // Der früheste Slot für diese Kombination
      const earliestSlot = slots[0];
      const [examId, date] = key.split('-');
      
      poolEntries.push({
        examination_id: examId,
        slot_date: date,
        slot_id: earliestSlot.id,
        device_id: earliestSlot.device_id,
        device_name: earliestSlot.devices.name,
        start_time: earliestSlot.start_time,
        end_time: earliestSlot.end_time,
        is_earliest: true
      });
    }
    
    // 5. Füge Einträge zum slot_pool hinzu
    if (poolEntries.length > 0) {
      const { error: insertError } = await supabase
        .from('slot_pool')
        .insert(poolEntries);
        
      if (insertError) {
        throw new Error(`Failed to insert entries into slot_pool: ${insertError.message}`);
      }
      
      console.log(`Updated slot_pool with ${poolEntries.length} entries`);
    }
  } catch (error) {
    console.error("Error updating slot_pool:", error.message);
  }
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-slots' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
