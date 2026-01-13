import { useState } from 'react';
import { Login } from "./components/Login";

type UserType = 'professional' | 'client' | null;
type AppView = 'select' | 'professional-login' | 'client-login';

function App() {
  const [userType, setUserType] = useState<UserType>(null);
  const [view, setView] = useState<AppView>('select');

  const handleSelectUserType = (type: 'professional' | 'client') => {
    handleSelectUserType(type);
    if (type === 'professional') {
      setView('professional-login');
    } else {
      setView('client-login')
    }
  };

  return (
    <>
      {view === 'select' && <Login onSelectUserType={handleSelectUserType} />}
    </>
  );
}

export default App
