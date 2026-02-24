import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  Divider
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axios";

export default function Step1() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    date_of_birth: "",
    gender: "",
    phone: "",
    emergency_contact_name: "",
    emergency_contact_phone: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await api.post("/onboarding/step1", form);
      navigate("/onboarding/step2");
    } catch (error) {
      alert(error.response?.data?.message || "Error saving Step 1");
    }
  };

  return (
    <DashboardLayout>
      <Box
        sx={{
          maxWidth: 900,
          mx: "auto"
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: 5,
            borderRadius: 4
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Personal Information
          </Typography>

          <Typography variant="body1" color="text.secondary" mb={3}>
            Please provide your basic personal and emergency details.
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                type="date"
                label="Date of Birth"
                name="date_of_birth"
                fullWidth
                required
                value={form.date_of_birth}
                InputLabelProps={{ shrink: true }}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Gender"
                name="gender"
              sx={{ width: '200px' }} // Use '100%' for fluid or px for fixed
                required
                value={form.gender}
                onChange={handleChange}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
                <MenuItem value="Prefer not to say">
                  Prefer not to say
                </MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Phone Number"
                name="phone"
                fullWidth
                required
                value={form.phone}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Emergency Contact Name"
                name="emergency_contact_name"
                fullWidth
                required
                value={form.emergency_contact_name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Emergency Contact Phone"
                name="emergency_contact_phone"
                fullWidth
                required
                value={form.emergency_contact_phone}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 4
            }}
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 5,
                borderRadius: 3
              }}
              onClick={handleSubmit}
            >
              Save & Continue
            </Button>
          </Box>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}