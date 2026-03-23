
import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

// Create the context object
const AuthContext = createContext();

// ── Provider component ────────────────────────────────────────────────────
// Wrap your entire app with <AuthProvider> (done in index.js).
export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session

  // On first load: check if a valid token is already saved
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      API.get('/auth/me')
        .then(res  => setUser(res.data))
        .catch(()  => localStorage.removeItem('token')) // bad/expired token
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // login: calls POST /api/auth/login, saves token, sets user in state
  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user; // return so the caller can check role and redirect
  };

  // logout: remove token and clear user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {/* Don't render children until we know the auth state */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ── Custom hook ───────────────────────────────────────────────────────────
// Use this instead of useContext(AuthContext) directly in every component.
// Example: const { user, login, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);
