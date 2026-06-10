import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessão no mount
  useEffect(() => {
    (async () => {
      try {
        if (api.getToken()) {
          const u = await api.me();
          setUser(u);
        }
      } catch {
        api.setToken(null);
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email, senha) => {
    const r = await api.login({ email, senha });
    api.setToken(r.token);
    setUser(r.user);
    return r.user;
  }, []);

  const signup = useCallback(async (data) => {
    const r = await api.signup(data);
    api.setToken(r.token);
    setUser(r.user);
    return r.user;
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try { setUser(await api.me()); } catch {}
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
