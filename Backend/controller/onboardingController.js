const supabase = require('../config/supabase');

const getProfile = async (req, res) => {
  const userId = req.user.id; // ✅ FIXED

  const { data, error } = await supabase
    .from('patient_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116')
    return res.status(400).json({ error: error.message });

  res.json(data || null);
};

const saveStep1 = async (req, res) => {
  console.log("saveStep1 called with body:", req.body);

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.user.id;  // ✅ FIXED

  const {
    date_of_birth,
    gender,
    phone,
    emergency_contact_name,
    emergency_contact_phone
  } = req.body;  // ✅ FIXED

  if (!date_of_birth || !phone || !emergency_contact_name || !emergency_contact_phone) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const { data, error } = await supabase
    .from('patient_profiles')
    .upsert({
      user_id: userId,
      date_of_birth,
      gender,
      phone,
      emergency_contact_name,
      emergency_contact_phone,
      onboarding_completed: false
    })
    .select()
    .single();

  if (error) {
    console.log("DB Error:", error);
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: "Step 1 saved", data });
};

const saveStep2 = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.user.id;

  const {
    blood_type,
    current_medications,
    previous_surgeries,
    family_medical_history,
    allergies,
    conditions
  } = req.body;

  try {
    // 1️⃣ Update main medical fields
    const { error: profileError } = await supabase
      .from('patient_profiles')
      .update({
        blood_type,
        current_medications,
        previous_surgeries,
        family_medical_history
      })
      .eq('user_id', userId);

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    // 2️⃣ Handle Allergies (Replace old with new)
    if (Array.isArray(allergies)) {
      await supabase
        .from('patient_allergies')
        .delete()
        .eq('patient_id', userId);

      const allergyInserts = allergies.map(id => ({
        patient_id: userId,
        allergy_id: id
      }));

      if (allergyInserts.length > 0) {
        await supabase
          .from('patient_allergies')
          .insert(allergyInserts);
      }
    }

    // 3️⃣ Handle Chronic Conditions
    if (Array.isArray(conditions)) {
      await supabase
        .from('patient_conditions')
        .delete()
        .eq('patient_id', userId);

      const conditionInserts = conditions.map(id => ({
        patient_id: userId,
        condition_id: id
      }));

      if (conditionInserts.length > 0) {
        await supabase
          .from('patient_conditions')
          .insert(conditionInserts);
      }
    }

    res.json({ message: "Step 2 saved successfully" });

  } catch (error) {
    console.log("Step 2 Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const saveStep3 = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.user.id;

  const {
    insurance_provider,
    insurance_id,
    policy_holder_name,
    preferred_doctor,  // ✅ ADD THIS
    preferred_time_slot,
    referral_source,
    additional_notes
  } = req.body;

  if (
    !insurance_provider ||
    !insurance_id ||
    !policy_holder_name ||
    !preferred_doctor
  ) {
    return res.status(400).json({
      message: "All required fields must be filled"
    });
  }

  try {
    const { data, error } = await supabase
      .from("patient_profiles")
      .update({
        insurance_provider,
        insurance_id,
        policy_holder_name,
        preferred_doctor,  // ✅ SAVE IT
        preferred_time_slot,
        referral_source,
        additional_notes
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: "Step 3 saved successfully",
      data
    });

  } catch (error) {
    console.log("Step 3 Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const completeOnboarding = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.user.id;

  try {
    // 1️⃣ Fetch patient profile
    const { data: profile, error: profileError } = await supabase
      .from("patient_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return res.status(400).json({ message: "Profile not found" });
    }

    // 2️⃣ Validate required fields
    if (
      !profile.date_of_birth ||
      !profile.phone ||
      !profile.emergency_contact_name ||
      !profile.emergency_contact_phone ||
      !profile.insurance_provider ||
      !profile.insurance_id ||
      !profile.policy_holder_name ||
      !profile.preferred_doctor
    ) {
      return res.status(400).json({
        message: "Please complete all required onboarding fields"
      });
    }

    // 3️⃣ Validate doctor exists
    const { data: doctor, error: doctorError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", profile.preferred_doctor)
      .single();

    if (doctorError || !doctor || doctor.role !== "doctor") {
      return res.status(400).json({ message: "Invalid doctor selected" });
    }

    // 4️⃣ Prevent duplicate assignment
    const { data: existingAssignment } = await supabase
      .from("doctor_assignments")
      .select("*")
      .eq("patient_id", userId)
      .single();

    if (existingAssignment) {
      return res.status(400).json({
        message: "Doctor already assigned"
      });
    }

    // 5️⃣ Create assignment
    const { error: assignError } = await supabase
      .from("doctor_assignments")
      .insert({
        patient_id: userId,
        doctor_id: profile.preferred_doctor
      });

    if (assignError) {
      return res.status(400).json({ error: assignError.message });
    }

    // 6️⃣ Mark onboarding completed
    await supabase
      .from("patient_profiles")
      .update({ onboarding_completed: true })
      .eq("user_id", userId);

    res.json({
      message: "Onboarding completed successfully"
    });

  } catch (error) {
    console.log("Complete onboarding error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllergies = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("allergies")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getConditions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("chronic_conditions")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  saveStep1,
  saveStep2,
  saveStep3,
  getProfile,
  completeOnboarding,
  getAllergies,
  getConditions
};