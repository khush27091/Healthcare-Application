import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axios";

export default function Step3() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    insurance_provider: "",
    insurance_id: "",
    policy_holder_name: "",
    preferred_doctor: "",
    preferred_time_slot: "",
    referral_source: "",
    additional_notes: ""
  });

  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get("/doctors");
      setDoctors(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
await api.post("/onboarding/step3", form);
navigate("/onboarding/summary");
    } catch (error) {
      alert(error.response?.data?.error || "Error completing onboarding");
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 1000, mx: "auto" }}>
        <Paper elevation={4} sx={{ p: 5, borderRadius: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Insurance & Preferences
          </Typography>

          <Typography variant="body1" color="text.secondary" mb={4}>
            Provide your insurance details and doctor preference.
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={4}>

            {/* LEFT COLUMN */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Insurance Provider"
                name="insurance_provider"
                fullWidth
                required
                value={form.insurance_provider}
                onChange={handleChange}
                sx={{ mb: 3 }}
              />

              <TextField
                label="Insurance ID"
                name="insurance_id"
                fullWidth
                required
                value={form.insurance_id}
                onChange={handleChange}
                sx={{ mb: 3 }}
              />

              <TextField
                label="Policy Holder Name"
                name="policy_holder_name"
                fullWidth
                required
                value={form.policy_holder_name}
                onChange={handleChange}
              />
            </Grid>

            {/* RIGHT COLUMN */}
            <Grid item xs={12} md={6}>

              {/* Preferred Doctor */}
              <TextField
                select
                label="Preferred Doctor"
                name="preferred_doctor"
                fullWidth
                required
                value={form.preferred_doctor}
                onChange={handleChange}
                sx={{ mb: 3 }}
              >
                {doctors.map((doc) => (
                  <MenuItem key={doc.id} value={doc.id}>
                    {doc.full_name}
                  </MenuItem>
                ))}
              </TextField>

              {/* Preferred Time Slot */}
              <Box sx={{ mb: 3 }}>
                <FormLabel>Preferred Time Slot</FormLabel>
                <RadioGroup
                  row
                  name="preferred_time_slot"
                  value={form.preferred_time_slot}
                  onChange={handleChange}
                >
                  <FormControlLabel value="Morning" control={<Radio />} label="Morning" />
                  <FormControlLabel value="Afternoon" control={<Radio />} label="Afternoon" />
                  <FormControlLabel value="Evening" control={<Radio />} label="Evening" />
                </RadioGroup>
              </Box>

              {/* Referral Source */}
              <TextField
                select
                label="Referral Source"
                name="referral_source"
                fullWidth
                value={form.referral_source}
                onChange={handleChange}
                sx={{ mb: 3 }}
              >
                <MenuItem value="Google">Google</MenuItem>
                <MenuItem value="Friend">Friend</MenuItem>
                <MenuItem value="Doctor Referral">Doctor Referral</MenuItem>
                <MenuItem value="Ad">Ad</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>

              {/* Additional Notes */}
              <TextField
                label="Additional Notes"
                name="additional_notes"
                multiline
                rows={3}
                fullWidth
                inputProps={{ maxLength: 200 }}
                helperText="Maximum 200 characters"
                value={form.additional_notes}
                onChange={handleChange}
              />

            </Grid>
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 5
            }}
          >
            <Button onClick={() => navigate(-1)}>
              Back
            </Button>

            <Button
              variant="contained"
              size="large"
              sx={{ px: 5, borderRadius: 3 }}
              onClick={handleSubmit}
            >
              Continue to Summary
            </Button>
          </Box>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}