import { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  Users,
  BarChart3,
  ArrowRight
} from 'lucide-react';

function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-primary/5 border-primary/20">
          <div className="flex items-center">
            <div className="rounded-full bg-primary/10 p-3 mr-4">
              <CalendarCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Gebuchte Termine</div>
              <div className="text-2xl font-bold">28</div>
            </div>
          </div>
          <div className="text-xs text-primary mt-4">
            +12% im Vergleich zur Vorwoche
          </div>
        </div>
        
        <div className="card bg-secondary/5 border-secondary/20">
          <div className="flex items-center">
            <div className="rounded-full bg-secondary/10 p-3 mr-4">
              <Clock className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Auslastung (Ø)</div>
              <div className="text-2xl font-bold">86%</div>
            </div>
          </div>
          <div className="text-xs text-secondary mt-4">
            +5% im Vergleich zum Vormonat
          </div>
        </div>
        
        <div className="card bg-warning/5 border-warning/20">
          <div className="flex items-center">
            <div className="rounded-full bg-warning/10 p-3 mr-4">
              <AlertCircle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Offene Fragebögen</div>
              <div className="text-2xl font-bold">7</div>
            </div>
          </div>
          <div className="text-xs text-warning mt-4">
            3 überfällig
          </div>
        </div>
        
        <div className="card bg-success/5 border-success/20">
          <div className="flex items-center">
            <div className="rounded-full bg-success/10 p-3 mr-4">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Überweisende Ärzte</div>
              <div className="text-2xl font-bold">18</div>
            </div>
          </div>
          <div className="text-xs text-success mt-4">
            +3 neue Partnerärzte
          </div>
        </div>
      </div>
      
      {/* Appointments today */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Heutige Termine</h2>
            <div className="flex items-center text-primary text-sm">
              <span>Alle anzeigen</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { time: '08:30', patient: 'Maria Schmidt', doctor: 'Dr. Müller', exam: 'CT Kopf nativ', status: 'confirmed' },
              { time: '09:15', patient: 'Thomas Weber', doctor: 'Dr. Fischer', exam: 'MRT Knie nativ', status: 'completed' },
              { time: '10:30', patient: 'Charlotte Jung', doctor: 'Dr. Schmidt', exam: 'MRT Abdomen mit KM', status: 'confirmed' },
              { time: '11:45', patient: 'Michael Berger', doctor: 'Dr. Müller', exam: 'CT Thorax nativ', status: 'confirmed' },
              { time: '14:00', patient: 'Sophie Wagner', doctor: 'Dr. Fischer', exam: 'MRT Becken mit KM', status: 'confirmed' },
            ].map((appointment, index) => (
              <div key={index} className="flex items-center p-3 rounded-md hover:bg-muted/50 transition-colors">
                <div className="w-16 text-sm font-medium">
                  {appointment.time}
                </div>
                <div className="flex-grow">
                  <div className="font-medium">{appointment.patient}</div>
                  <div className="text-sm text-muted-foreground">
                    {appointment.exam}
                  </div>
                </div>
                <div className="w-24 text-right">
                  {appointment.status === 'confirmed' ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Bestätigt
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Erledigt
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Aktuelle Auslastung</h2>
            <div className="flex items-center text-primary text-sm">
              <span>Details</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </div>
          
          {/* Device utilization */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Siemens Avanto (MRT)</span>
                </div>
                <span className="text-sm font-medium">92%</span>
              </div>
              <div className="h-2 bg-muted overflow-hidden rounded-full">
                <div className="h-2 bg-primary rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Siemens Somatom (CT)</span>
                </div>
                <span className="text-sm font-medium">78%</span>
              </div>
              <div className="h-2 bg-muted overflow-hidden rounded-full">
                <div className="h-2 bg-primary rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium mb-3">Top Untersuchungen</h3>
              <div className="space-y-3">
                {[
                  { name: 'MRT Knie nativ', count: 14 },
                  { name: 'CT Kopf nativ', count: 9 },
                  { name: 'MRT Abdomen mit KM', count: 8 },
                ].map((exam, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{exam.name}</span>
                    <span className="text-sm font-medium">{exam.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Calendar */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Kommende Wartungstermine</h2>
          <div className="flex items-center text-primary text-sm">
            <span>Kalender anzeigen</span>
            <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </div>
        
        <div className="space-y-4">
          {[
            { date: '15.05.2025', time: '08:00 - 12:00', device: 'Siemens Somatom (CT)', type: 'Reguläre Wartung' },
            { date: '22.05.2025', time: '13:00 - 17:00', device: 'Siemens Avanto (MRT)', type: 'Software-Update' },
          ].map((maintenance, index) => (
            <div key={index} className="flex items-center p-3 rounded-md hover:bg-muted/50 transition-colors">
              <div className="w-32 font-medium">
                {maintenance.date}
              </div>
              <div className="w-32">
                {maintenance.time}
              </div>
              <div className="flex-grow">
                <div className="font-medium">{maintenance.device}</div>
                <div className="text-sm text-muted-foreground">
                  {maintenance.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;