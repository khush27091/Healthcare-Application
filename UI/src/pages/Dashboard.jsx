import {
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip
} from "@mui/material";
import DashboardLayout from "../layouts/DashboardLayout";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "patient") {
      fetchProfile();
    }

    if (user?.role === "doctor") {
      fetchPatients();
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

  const fetchPatients = async () => {
    try {
      const { data } = await api.get("/chat/assignments");
      setPatients(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const isCompleted = profile?.onboarding_completed;

  return (
    <DashboardLayout>
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>

        <Typography mt={2}>
          Role: <strong>{user?.role}</strong>
        </Typography>

        <Typography mt={1} mb={3} color="text.secondary">
          Welcome to your healthcare portal.
        </Typography>

        {/* ================= PATIENT VIEW ================= */}
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

        {/* ================= DOCTOR VIEW ================= */}
        {user?.role === "doctor" && (
          <>
            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" fontWeight="bold" mb={2}>
              👥 Assigned Patients
            </Typography>

            {patients.length === 0 ? (
              <Typography color="text.secondary">
                No patients assigned yet.
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {patients.map((assignment) => (
                  <Grid item xs={12} sm={6} md={4} key={assignment.id}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        transition: "0.3s",
                        "&:hover": {
                          boxShadow: 6,
                          transform: "translateY(-4px)"
                        }
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" fontWeight="bold">
                          {assignment.patient?.full_name}
                        </Typography>

                        <Chip
                          label="Active"
                          color="success"
                          size="small"
                          sx={{ mt: 1 }}
                        />

                        <Box mt={2}>
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => navigate("/chat")}
                          >
                            Open Chat
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Paper>
    </DashboardLayout>
  );
}