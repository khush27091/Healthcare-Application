import {
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
  Box
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axios";

export default function Summary() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [doctorName, setDoctorName] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

const fetchProfile = async () => {
  try {
    const { data } = await api.get("/onboarding/profile");
    setProfile(data);

    if (data?.preferred_doctor) {
      const res = await api.get("/doctors");

      const doctorsList = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      const selectedDoctor = doctorsList.find(
        (doc) => doc.id.toString() === data.preferred_doctor.toString()
      );

      if (selectedDoctor) {
        setDoctorName(selectedDoctor.full_name);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

  const handleComplete = async () => {
    try {
      await api.post("/onboarding/complete");

      navigate("/dashboard");
      window.location.reload(); // refresh sidebar
    } catch (error) {
      alert(error.response?.data?.message || "Completion failed");
    }
  };

  if (!profile) return null;

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 1000, mx: "auto" }}>
        <Paper elevation={4} sx={{ p: 5, borderRadius: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Review & Confirm
          </Typography>

          <Typography variant="body1" color="text.secondary" mb={4}>
            Please review your information before completing onboarding.
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={4}>
            
            {/* Personal */}
            <Grid item xs={12} md={6}>
              <Typography fontWeight="bold" mb={1}>
                Personal Information
              </Typography>

              <Typography>Date of Birth: {profile.date_of_birth}</Typography>
              <Typography>Gender: {profile.gender}</Typography>
              <Typography>Phone: {profile.phone}</Typography>
              <Typography>
                Emergency Contact: {profile.emergency_contact_name}
              </Typography>
            </Grid>

            {/* Medical */}
            <Grid item xs={12} md={6}>
              <Typography fontWeight="bold" mb={1}>
                Medical Information
              </Typography>

              <Typography>Blood Type: {profile.blood_type}</Typography>
              <Typography>
                Current Medications: {profile.current_medications}
              </Typography>
              <Typography>
                Previous Surgeries: {profile.previous_surgeries}
              </Typography>
            </Grid>

            {/* Insurance */}
            <Grid item xs={12} md={6}>
              <Typography fontWeight="bold" mb={1}>
                Insurance Details
              </Typography>

              <Typography>
                Provider: {profile.insurance_provider}
              </Typography>
              <Typography>
                Insurance ID: {profile.insurance_id}
              </Typography>
              <Typography>
                Policy Holder: {profile.policy_holder_name}
              </Typography>
            </Grid>

            {/* Preferences */}
            <Grid item xs={12} md={6}>
              <Typography fontWeight="bold" mb={1}>
                Preferences
              </Typography>

              <Typography>
                Preferred Doctor: {doctorName}
              </Typography>
              <Typography>
                Time Slot: {profile.preferred_time_slot}
              </Typography>
              <Typography>
                Referral Source: {profile.referral_source}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

{!profile.onboarding_completed ? (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between"
    }}
  >
    <Button onClick={() => navigate(-1)}>
      Back
    </Button>

    <Button
      variant="contained"
      size="large"
      sx={{ px: 5, borderRadius: 3 }}
      onClick={handleComplete}
    >
      Confirm & Complete
    </Button>
  </Box>
) : (
  <Box sx={{ textAlign: "center", mt: 3 }}>
    <Typography
      variant="h6"
      color="success.main"
      fontWeight="bold"
    >
      ✔ Onboarding Completed
    </Typography>
  </Box>
)}
        </Paper>
      </Box>
    </DashboardLayout>
  );
}