const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const supabase = require("../config/supabase");

router.get("/", authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name")
    .eq("role", "doctor");

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

module.exports = router;