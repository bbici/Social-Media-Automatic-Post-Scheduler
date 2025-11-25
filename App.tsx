
import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import { User } from './types';
import { getCurrentSession, setSession, clearSession } from './services/authService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [originalAdmin, setOriginalAdmin] = useState<User | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      setUser(session);
    }
    setLoading(false);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setSession(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setOriginalAdmin(null);
    clearSession();
  };

  const handleImpersonate = (targetUser: User) => {
    setOriginalAdmin(user);
    setUser(targetUser);
  };

  const handleStopImpersonation = () => {
    if (originalAdmin) {
      setUser(originalAdmin);
      setOriginalAdmin(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // If user is admin AND NOT impersonating someone else, show Admin Dashboard
  if (user.role === 'admin' && !originalAdmin) {
    return <AdminDashboard admin={user} onLogout={handleLogout} onImpersonate={handleImpersonate} />;
  }

  // Otherwise show User Dashboard (regular user OR admin impersonating regular user)
  return <UserDashboard 
    user={user} 
    onLogout={handleLogout} 
    impersonatingAdmin={originalAdmin}
    onStopImpersonation={handleStopImpersonation}
  />;
};

export default App;
