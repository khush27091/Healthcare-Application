import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const storedUser = sessionStorage.getItem("user");
  const storedToken = sessionStorage.getItem("token");

  const [user, setUser] = useState(
    storedUser ? JSON.parse(storedUser) : null
  );

  const [token, setToken] = useState(
    storedToken ? storedToken : null
  );

  const login = (data) => {
    // data.token must come from backend login response
    sessionStorage.setItem("token", data.token);
    setToken(data.token);

    if (data.user) {
      sessionStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    }
  };

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};