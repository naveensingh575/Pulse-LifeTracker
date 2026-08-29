import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pulse_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default to null so user goes through Google Sign-In or selects Google Account
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('pulse_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pulse_user');
    }
  }, [user]);

  const loginWithGoogle = (googleProfile) => {
    const profile = googleProfile || {
      name: 'Naveen Kumar',
      email: 'naveen.kumar@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      provider: 'google'
    };
    setUser(profile);
    return profile;
  };

  const loginWithEmail = (email, name) => {
    const profile = {
      name: name || email.split('@')[0] || 'User',
      email: email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
      provider: 'email'
    };
    setUser(profile);
    return profile;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
