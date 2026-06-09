"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type User = {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
  plan: "FREE" | "PREMIUM";
};

type AuthContextType = {
  user: User | null;
  login: (email: string, pass: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const session = typeof window !== 'undefined' ? localStorage.getItem("bizsearch24_session") : null;
    let initialUser = null;
    if (session) {
      try {
        initialUser = JSON.parse(session);
      } catch (e) {
        console.error(e);
      }
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (initialUser && JSON.stringify(initialUser) !== JSON.stringify(user)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(initialUser);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(false);
  }, [user]);

  const login = (email: string, pass: string) => {
    // Mock login logic based on user's exact instructions
    let loggedInUser: User;
    
    if (email === "nicholauscostochetty@gmail.com" && pass === "Nic6604211989!?") {
      loggedInUser = {
        id: "admin-1",
        email,
        role: "ADMIN",
        plan: "PREMIUM",
      };
    } else {
      loggedInUser = {
        id: "user-" + Math.random().toString(36).substring(7),
        email,
        role: "USER",
        plan: email.includes("premium") ? "PREMIUM" : "FREE",
      };
    }
    
    setUser(loggedInUser);
    localStorage.setItem("bizsearch24_session", JSON.stringify(loggedInUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("bizsearch24_session");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
