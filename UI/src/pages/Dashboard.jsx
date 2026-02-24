import {
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    if (user.role === "patient") {
      fetchProfile();
    }

    if (user.role === "doctor") {
      fetchPatients();
    }
  }, [user]);

  // ================= PATIENT PROFILE =================
  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/onboarding/profile");
      setProfile(data);
    } catch (error) {
      console.error(error);
    }
  };

  // ================= DOCTOR FLOW =================
  const fetchPatients = async () => {
    try {
      const { data: assignments } = await api.get("/chat/assignments");

      if (!assignments || assignments.length === 0) {
        setPatients([]);
        return;
      }

      const detailedPatients = await Promise.all(
        assignments.map(async (assignment) => {
          const patientId = assignment.patient?.id;
          if (!patientId) return null;

          const { data } = await api.get(`/patients/${patientId}`);

          return {
            basic: assignment.patient,
            profile: data
          };
        })
      );

      setPatients(detailedPatients.filter(Boolean));
    } catch (error) {
      console.error(error);
    }
  };

  const isCompleted = profile?.onboarding_completed;

  const InfoItem = ({ label, value }) => (
  <Box
    sx={{
      backgroundColor: "white",
      p: 2,
      borderRadius: 2,
      border: "1px solid #e0e0e0"
    }}
  >
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>

    <Typography variant="body1" fontWeight={500}>
      {value || "-"}
    </Typography>
  </Box>
);

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
                {patients.map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
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
                          {item.basic?.full_name}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {item.basic?.email}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="body2">
                          <strong>Blood Type:</strong>{" "}
                          {item.profile?.blood_type}
                        </Typography>

                        <Typography variant="body2">
                          <strong>Insurance:</strong>{" "}
                          {item.profile?.insurance_provider}
                        </Typography>

                        <Box mt={2}>
                          <Chip
                            label={
                              item.profile?.onboarding_completed
                                ? "Onboarding Complete"
                                : "Incomplete"
                            }
                            color={
                              item.profile?.onboarding_completed
                                ? "success"
                                : "warning"
                            }
                            size="small"
                          />
                        </Box>

                        <Box mt={3} display="flex" gap={1}>
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => {
                              setSelectedPatient(item.profile);
                              setOpen(true);
                            }}
                          >
                            View Details
                          </Button>

                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => navigate("/chat")}
                          >
                            Chat
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

      {/* ================= PATIENT DETAIL DIALOG ================= */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Patient Details</DialogTitle>

<DialogContent dividers sx={{ backgroundColor: "#f9fafc" }}>
  {selectedPatient && (
    <Box>

      {/* ================= PERSONAL INFO ================= */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Personal Information
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InfoItem label="Gender" value={selectedPatient.gender} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InfoItem label="Date of Birth" value={selectedPatient.date_of_birth} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InfoItem label="Phone" value={selectedPatient.phone} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InfoItem label="Blood Type" value={selectedPatient.blood_type} />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* ================= MEDICAL INFO ================= */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Medical Information
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <InfoItem label="Current Medications" value={selectedPatient.current_medications} />
          </Grid>

          <Grid item xs={12}>
            <InfoItem label="Previous Surgeries" value={selectedPatient.previous_surgeries} />
          </Grid>

          <Grid item xs={12}>
            <InfoItem label="Family Medical History" value={selectedPatient.family_medical_history} />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* ================= INSURANCE ================= */}
      <Box>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Insurance Information
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InfoItem label="Provider" value={selectedPatient.insurance_provider} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InfoItem label="Policy Holder" value={selectedPatient.policy_holder_name} />
          </Grid>

          <Grid item xs={12}>
            <InfoItem label="Additional Notes" value={selectedPatient.additional_notes} />
          </Grid>
        </Grid>
      </Box>

    </Box>
  )}
</DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}