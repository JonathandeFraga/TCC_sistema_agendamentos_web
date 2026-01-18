import { useState } from 'react';
import { Login } from "./components/Login";
import { ClientLogin } from './components/ClientLogin';
import { ProfessionalLogin } from './components/ProfessionalLogin';
import { ProfessionalDashboard } from './components/ProfessionalDashboard';
import { ClientBooking } from './components/ClientBooking';
import { Toaster } from "./components/ui/sonner";

type UserType = 'professional' | 'client' | null;
type AppView = 'select' | 'professional-login' | 'professional-dashboard' | 'client-login' | 'client-booking';

function App() {
  const [userType, setUserType] = useState<UserType>(null);
  const [view, setView] = useState<AppView>('select');

  const handleSelectUserType = (type: 'professional' | 'client') => {
    setUserType(type);
    if (type === 'professional') {
      setView('professional-login');
    } else {
      setView('client-login')
    }
  };

  const handleClientLogin = () => {
    setView('client-booking');
  };

  const handleProfessionalLogin = () => {
    setView('professional-dashboard');
  };

  const handleBack = () => {
    setUserType(null);
    setView('select');
  };

  return (
    <>
      {view === 'select' && <Login onSelectUserType={handleSelectUserType} />}
      {view === 'client-login' && (
        <ClientLogin onBack={handleBack} onLogin={handleClientLogin} />
      )}
      {view === 'professional-login' && (
        <ProfessionalLogin onBack={handleBack} onLogin={handleProfessionalLogin} />
      )}
      {view === 'professional-dashboard' && <ProfessionalDashboard onBack={handleBack} />}
      {view === 'client-booking' && <ClientBooking onBack={handleBack} />}
      <Toaster />
    </>
  );
}

export default App
