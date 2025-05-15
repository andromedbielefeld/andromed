import { Outlet, NavLink } from 'react-router-dom';
import { 
  ActivitySquare, 
  LayoutDashboard, 
  FileText, 
  Tablet, 
  CalendarClock, 
  Settings,
  Users,
  LogOut 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border shadow-sm hidden md:block">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <ActivitySquare className="h-6 w-6 text-primary mr-2" />
          <span className="font-semibold">Klinik-Admin</span>
        </div>
        
        <div className="py-4">
          <nav className="space-y-1 px-2">
            <NavLink 
              to="/admin" 
              end
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </NavLink>
            
            <NavLink 
              to="/admin/examinations" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <FileText className="mr-3 h-5 w-5" />
              Untersuchungen
            </NavLink>
            
            <NavLink 
              to="/admin/devices" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Tablet className="mr-3 h-5 w-5" />
              Geräte
            </NavLink>
            
            <NavLink 
              to="/admin/appointments" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <CalendarClock className="mr-3 h-5 w-5" />
              Termine
            </NavLink>

            <NavLink 
              to="/admin/doctors" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Users className="mr-3 h-5 w-5" />
              Ärzte
            </NavLink>
            
            <NavLink 
              to="/admin/settings" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Settings className="mr-3 h-5 w-5" />
              Einstellungen
            </NavLink>
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-64 border-t border-border p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium text-sm">
                {user?.name.charAt(0)}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name}</p>
              <button 
                onClick={logout} 
                className="group flex items-center text-xs text-muted-foreground hover:text-foreground"
              >
                <LogOut className="mr-1 h-3 w-3" />
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile header */}
      <div className="bg-card border-b border-border shadow-sm fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 md:hidden z-10">
        <div className="flex items-center">
          <ActivitySquare className="h-6 w-6 text-primary mr-2" />
          <span className="font-semibold">Klinik-Admin</span>
        </div>
        {/* Mobile menu button would go here */}
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 md:p-8 pt-20 md:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;