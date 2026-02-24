import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  OutlinedInput,
  Select
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axios";

export default function Step2() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    blood_type: "",
    current_medications: "",
    previous_surgeries: "",
    family_medical_history: "",
    allergies: [],
    conditions: []
  });

  const [allergyOptions, setAllergyOptions] = useState([]);
  const [conditionOptions, setConditionOptions] = useState([]);

  useEffect(() => {
    fetchAllergies();
    fetchConditions();
  }, []);

  const fetchAllergies = async () => {
    const { data } = await api.get("/onboarding/allergies");
    setAllergyOptions(data || []);
  };

  const fetchConditions = async () => {
    const { data } = await api.get("/onboarding/conditions");
    setConditionOptions(data || []);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (type, id) => {
    setForm((prev) => {
      const current = prev[type];
      return {
        ...prev,
        [type]: current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current, id]
      };
    });
  };

  const handleSubmit = async () => {
    try {
      await api.post("/onboarding/step2", form);
      navigate("/onboarding/step3");
    } catch (error) {
      alert(error.response?.data?.message || "Error saving Step 2");
    }
  };

return (
  <DashboardLayout>
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      <Paper elevation={4} sx={{ p: 5, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Medical Information
        </Typography>

        <Typography variant="body1" color="text.secondary" mb={4}>
          Provide your medical background to help doctors assist you better.
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={4}>
          
          {/* LEFT COLUMN */}
          <Grid item xs={12} md={6}>

            {/* Blood Type */}
            <TextField
              select
              label="Blood Type"
              name="blood_type"
              fullWidth
              value={form.blood_type}
              onChange={handleChange}
              sx={{ mb: 3 }}
            >
              {[
                "A+","A-","B+","B-",
                "O+","O-","AB+","AB-","Unknown"
              ].map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>

            {/* Current Medications */}
            <TextField
              label="Current Medications"
              name="current_medications"
              multiline
              rows={4}
              fullWidth
              inputProps={{ maxLength: 500 }}
              value={form.current_medications}
              onChange={handleChange}
              helperText="Maximum 500 characters"
              sx={{ mb: 3 }}
            />

            {/* Previous Surgeries */}
            <TextField
              label="Previous Surgeries"
              name="previous_surgeries"
              multiline
              rows={4}
              fullWidth
              value={form.previous_surgeries}
              onChange={handleChange}
            />

          </Grid>

          {/* RIGHT COLUMN */}
          <Grid item xs={12} md={6}>

            {/* Allergies */}
            <Box sx={{ mb: 4 }}>
              <Typography fontWeight="bold" mb={1}>
                Known Allergies
              </Typography>

              <Select
                multiple
                fullWidth
                value={form.allergies}
                onChange={(e) =>
                  setForm({ ...form, allergies: e.target.value })
                }
                renderValue={(selected) =>
                  selected
                    .map(
                      (id) =>
                        allergyOptions.find(a => a.id === id)?.name
                    )
                    .join(", ")
                }
              >
                {allergyOptions.map((allergy) => (
                  <MenuItem key={allergy.id} value={allergy.id}>
                    {allergy.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            {/* Chronic Conditions */}
            <Box sx={{ mb: 4 }}>
              <Typography fontWeight="bold" mb={1}>
                Chronic Conditions
              </Typography>

              <Grid container spacing={1}>
                {conditionOptions.map((condition) => (
                  <Grid item xs={6} key={condition.id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.conditions.includes(condition.id)}
                          onChange={() =>
                            handleCheckboxChange(
                              "conditions",
                              condition.id
                            )
                          }
                        />
                      }
                      label={condition.name}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Family History */}
            <TextField
              label="Family Medical History"
              name="family_medical_history"
              multiline
              rows={4}
              fullWidth
              inputProps={{ maxLength: 300 }}
              helperText="Maximum 300 characters"
              value={form.family_medical_history}
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
            Save & Continue
          </Button>
        </Box>

      </Paper>
    </Box>
  </DashboardLayout>
);
}