import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Step1 from "./pages/onboarding/Step1";
import Step2 from "./pages/onboarding/Step2";
import Step3 from "./pages/onboarding/Step3";
import Summary from "./pages/onboarding/Summary";
import ChatPage from "./pages/chat/ChatPage";

function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/" replace />;
}

function App() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" replace /> : <Register />}
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/onboarding/step1"
          element={
            <PrivateRoute>
              <Step1 />
            </PrivateRoute>
          }
        />

        <Route
          path="/onboarding/step2"
          element={
            <PrivateRoute>
              <Step2 />
            </PrivateRoute>
          }
        />

        <Route
          path="/onboarding/step3"
          element={
            <PrivateRoute>
              <Step3 />
            </PrivateRoute>
          }
        />
        <Route
          path="/onboarding/summary"
          element={
            <PrivateRoute>
              <Summary />
            </PrivateRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;