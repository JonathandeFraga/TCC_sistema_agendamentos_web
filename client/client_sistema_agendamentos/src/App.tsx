import { useState } from 'react';
import { Login } from "./components/Login";
import { ClientLogin } from './components/ClientLogin';
import { ProfessionalLogin } from './components/ProfessionalLogin';
import { ProfessionalDashboard } from './components/ProfessionalDashboard';
import { ClientBooking } from './components/ClientBooking';
import { Toaster } from "./components/ui/sonner";

type UserType = 'professional' | 'client';
type Screen =
  | { name: "select" }
  | { name: "login"; userType: UserType }
  | { name: "client-booking" }
  | { name: "professional-dashboard" };

function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'select' });

  const handleSelectUserType = (type: UserType) => { setScreen({ name: "login", userType: type }); };

  const handleClientLogin = () => { setScreen({ name: "client-booking" }) };

  const handleProfessionalLogin = () => { setScreen({ name: "professional-dashboard" }) };

  const handleBack = () => { setScreen({ name: "select" }) };

  return (
    <>
      {screen.name === 'select' && (<Login onSelectUserType={handleSelectUserType} />)}

      {screen.name === 'login' && screen.userType === 'client' && (
        <ClientLogin onBack={handleBack} onLogin={handleClientLogin} />
      )}

      {screen.name === 'login' && screen.userType === 'professional' &&(
        <ProfessionalLogin onBack={handleBack} onLogin={handleProfessionalLogin} />
      )}

      {screen.name === 'professional-dashboard' && (
        <ProfessionalDashboard onBack={handleBack} />
      )}

      {screen.name === 'client-booking' && (
        <ClientBooking onBack={handleBack} />
      )}
      
      <Toaster />
    </>
  );
}

export default App
