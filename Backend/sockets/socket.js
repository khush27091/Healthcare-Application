const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

const onlineUsers = new Map();

const setupSocket = (io) => {

  // 🔐 SOCKET AUTH MIDDLEWARE (Custom JWT)
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        console.log("❌ No token received");
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = decoded; // contains id + role
      next();

    } catch (err) {
      console.log("❌ Socket JWT error:", err.message);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {

    const userId = socket.user.id;

    onlineUsers.set(userId, socket.id);

    console.log("✅ User connected:", userId);

    // JOIN ROOM
    socket.on("join_room", async (assignmentId) => {
      try {
        const { data: assignment, error } = await supabase
          .from("doctor_assignments")
          .select("*")
          .eq("id", assignmentId)
          .single();

        if (error || !assignment) return;

        if (
          assignment.patient_id !== userId &&
          assignment.doctor_id !== userId
        ) return;

        socket.join(assignmentId);
        console.log("User joined room:", assignmentId);

      } catch (err) {
        console.log("Join room error:", err.message);
      }
    });

    // SEND MESSAGE
    socket.on("send_message", async ({ assignmentId, content }) => {
      try {
        const { data: assignment, error: assignError } = await supabase
          .from("doctor_assignments")
          .select("*")
          .eq("id", assignmentId)
          .single();

        if (assignError || !assignment) return;

        if (
          assignment.patient_id !== userId &&
          assignment.doctor_id !== userId
        ) return;

        const { data, error } = await supabase
          .from("messages")
          .insert({
            assignment_id: assignmentId,
            sender_id: userId,
            content
          })
          .select()
          .single();

        if (error) {
          console.log("Insert message error:", error.message);
          return;
        }

        io.to(assignmentId).emit("receive_message", data);

      } catch (err) {
        console.log("Send message error:", err.message);
      }
    });

    // TYPING
    socket.on("typing", (assignmentId) => {
      socket.to(assignmentId).emit("user_typing");
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      console.log("❌ User disconnected:", userId);
    });

  });
};

module.exports = setupSocket;