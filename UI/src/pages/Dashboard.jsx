import {
  Paper,
  Typography,
  Box,
  Button,
  Divider
} from "@mui/material";
import DashboardLayout from "../layouts/DashboardLayout";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "patient") {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/onboarding/profile");
      setProfile(data);
    } catch (error) {
      console.error(error);
    }
  };

  const isCompleted = profile?.onboarding_completed;

  return (
    <DashboardLayout>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>

        <Typography mt={2}>
          Role: {user?.role}
        </Typography>

        <Typography mt={1} mb={3}>
          Welcome to your healthcare portal.
        </Typography>

        {user?.role === "patient" && (
          <>
            <Divider sx={{ my: 3 }} />

            {isCompleted ? (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  💬 Chat with Your Doctor
                </Typography>

                <Typography color="text.secondary" mb={2}>
                  You can now communicate with your assigned doctor.
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  sx={{ borderRadius: 3 }}
                  onClick={() => navigate("/chat")}
                >
                  Open Chat
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" color="warning.main">
                  Complete onboarding to access chat.
                </Typography>

                <Button
                  sx={{ mt: 2 }}
                  variant="outlined"
                  onClick={() => navigate("/onboarding/step1")}
                >
                  Complete Onboarding
                </Button>
              </Box>
            )}
          </>
        )}
      </Paper>
    </DashboardLayout>
  );
}