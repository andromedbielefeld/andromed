import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  
  const getRedirectPath = (role: string) => {
    const from = (location.state as any)?.from?.pathname;
    if (from) return from;
    return role === 'admin' ? '/admin' : '/doctor';
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await auth.login(email, password);
      const redirectPath = getRedirectPath(auth.user?.role || 'doctor');
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      if (err.message === 'Invalid login credentials') {
        setError('E-Mail oder Passwort ist falsch. Bitte überprüfen Sie Ihre Eingaben.');
      } else {
        setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      }
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const demoCredentials = [
    { email: 'admin@example.com', role: 'Admin' },
    { email: 'doctor@example.com', role: 'Arzt' },
  ];
  
  return (
    <div className="card animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6">Anmelden</h2>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
          <div className="text-sm text-yellow-800">
            <h3 className="font-medium mb-1">Demo-Modus Hinweis</h3>
            <p>
              Um die Demo-Anmeldedaten nutzen zu können, müssen zuerst die entsprechenden Benutzerkonten in Supabase erstellt werden. Bitte stellen Sie sicher, dass die Benutzer existieren und die korrekten Passwörter gesetzt sind.
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-error/10 border border-error/30 text-error rounded-md p-3 mb-4 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
            Passwort
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />
        </div>
        
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Anmelden...
            </span>
          ) : (
            'Anmelden'
          )}
        </button>
      </form>
      
      <div className="mt-6 pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          <h3 className="font-medium text-foreground mb-2">Demo-Anmeldedaten:</h3>
          {demoCredentials.map((cred) => (
            <div key={cred.email} className="flex justify-between items-center mb-1">
              <span>{cred.role}:</span>
              <button
                type="button"
                onClick={() => {
                  setEmail(cred.email);
                  setPassword('password');
                }}
                className="text-primary hover:underline"
              >
                {cred.email}
              </button>
            </div>
          ))}
          <p className="mt-2 text-xs">
            Klicken Sie auf eine E-Mail-Adresse, um sie automatisch einzutragen.
            <br />
            Passwort: <code className="bg-muted px-1 py-0.5 rounded text-xs">password</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;