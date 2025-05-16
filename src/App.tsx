import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/Toaster';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import DoctorLayout from './layouts/DoctorLayout';
import PublicLayout from './layouts/PublicLayout';

// Public pages
import Login from './pages/Login';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ExaminationsManager from './pages/admin/ExaminationsManager';
import DevicesManager from './pages/admin/DevicesManager';
import DoctorsManager from './pages/admin/DoctorsManager';
import AppointmentsManager from './pages/admin/AppointmentsManager';
import SettingsManager from './pages/admin/SettingsManager';

// Doctor pages
import BookAppointment from './pages/doctor/BookAppointment';
import MyAppointments from './pages/doctor/MyAppointments';

// Protected route component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Toaster>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Route>
            
            {/* Admin routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="examinations" element={<ExaminationsManager />} />
              <Route path="devices" element={<DevicesManager />} />
              <Route path="doctors" element={<DoctorsManager />} />
              <Route path="appointments" element={<AppointmentsManager />} />
              <Route path="settings" element={<SettingsManager />} />
            </Route>
            
            {/* Doctor routes */}
            <Route 
              path="/doctor" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<BookAppointment />} />
              <Route path="book" element={<BookAppointment />} />
              <Route path="appointments" element={<MyAppointments />} />
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </Toaster>
    </AuthProvider>
  );
}

export default App