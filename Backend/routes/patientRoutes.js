const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const supabase = require("../config/supabase");

router.get("/:patientId", authMiddleware, async (req, res) => {
  const { patientId } = req.params;
  const currentUser = req.user;

  try {
    // 🚫 Basic validation
    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    // =========================
    // ROLE VALIDATION
    // =========================

    // 🟢 If logged-in user is PATIENT → can only access their own profile
    if (currentUser.role === "patient") {
      if (currentUser.id !== patientId) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // 🟢 If logged-in user is DOCTOR → must be assigned
    if (currentUser.role === "doctor") {
      const { data: assignment, error: assignError } = await supabase
        .from("doctor_assignments")
        .select("id")
        .eq("doctor_id", currentUser.id)
        .eq("patient_id", patientId)
        .maybeSingle(); // ✅ safer than single()

      if (assignError) {
        console.error("Assignment error:", assignError.message);
        return res.status(400).json({ message: "Error verifying assignment" });
      }

      if (!assignment) {
        return res
          .status(403)
          .json({ message: "Doctor not assigned to this patient" });
      }
    }

    // 🚫 If some other role tries
    if (currentUser.role !== "doctor" && currentUser.role !== "patient") {
      return res.status(403).json({ message: "Access denied" });
    }

    // =========================
    // FETCH PATIENT PROFILE
    // =========================
    const { data: patient, error } = await supabase
    .from('patient_profiles')
    .select('*')
    .eq('user_id', patientId)
    .single();

    if (error) {
      console.error("Patient fetch error:", error.message);
      return res.status(400).json({ message: "Error fetching patient profile" });
    }

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.status(200).json(patient);

  } catch (error) {
    console.error("Server error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;