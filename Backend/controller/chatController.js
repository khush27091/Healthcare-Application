const supabase = require('../config/supabase');

const getMyAssignments = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  try {
    let query;

    if (role === 'doctor') {
      query = supabase
        .from('doctor_assignments')
        .select(`
          id,
          patient:users!doctor_assignments_patient_id_fkey (
            id,
            full_name
          )
        `)
        .eq('doctor_id', userId);
    } else {
      query = supabase
        .from('doctor_assignments')
        .select(`
          id,
          doctor:users!doctor_assignments_doctor_id_fkey (
            id,
            full_name
          )
        `)
        .eq('patient_id', userId);
    }

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getMessages = async (req, res) => {
  const { assignmentId } = req.params;
  const userId = req.user.id;

  try {
    // Verify user belongs to this assignment
    const { data: assignment } = await supabase
      .from('doctor_assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (
      assignment.patient_id !== userId &&
      assignment.doctor_id !== userId
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('created_at', { ascending: true });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getMyAssignments,
  getMessages
};