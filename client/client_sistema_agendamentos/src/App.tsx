import { useState } from 'react';
import { Login } from "./components/Login";
import { ClientLogin } from './components/ClientLogin';
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
      <Toaster />
    </>
  );
}

export default App
