import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Divider,
  CircularProgress
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import DashboardLayout from "../../layouts/DashboardLayout";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";

export default function Chat() {
  const { user, token } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [assignment, setAssignment] = useState(null);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 🚀 Initialize chat only when token exists
  useEffect(() => {
    if (!token) return;

    const start = async () => {
      setLoading(true);
      await initializeChat();
      setLoading(false);
    };

    start();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token]);

  const initializeChat = async () => {
    try {
      // 1️⃣ Get assignments
      const { data } = await api.get("/chat/assignments");

      if (!data || !data.length) return;

      const firstAssignment = data[0];
      setAssignment(firstAssignment);

      // 2️⃣ Load old messages
      const res = await api.get(`/chat/messages/${firstAssignment.id}`);
      setMessages(res.data || []);

      // 3️⃣ Setup socket safely
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      socketRef.current = io("http://localhost:5000", {
        auth: { token }
      });

      socketRef.current.on("connect", () => {
        console.log("✅ Connected:", socketRef.current.id);
        socketRef.current.emit("join_room", firstAssignment.id);
      });

      socketRef.current.on("connect_error", (err) => {
        console.log("❌ Socket error:", err.message);
      });

      // ✅ Prevent duplicate messages
      socketRef.current.on("receive_message", (data) => {
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === data.id)) return prev;
          return [...prev, data];
        });
      });

      socketRef.current.on("user_typing", () => {
        setTyping(true);
        setTimeout(() => setTyping(false), 1500);
      });

    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = () => {
    if (!message.trim() || !assignment || !socketRef.current) return;

    socketRef.current.emit("send_message", {
      assignmentId: assignment.id,
      content: message
    });

    setMessage("");
  };

  const handleTyping = () => {
    if (!assignment || !socketRef.current) return;
    socketRef.current.emit("typing", assignment.id);
  };

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const chatPartnerName =
    user?.role === "patient"
      ? assignment?.doctor?.full_name
      : assignment?.patient?.full_name;

  return (
    <DashboardLayout>
      <Paper
        sx={{
          p: 3,
          height: "75vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Chat with {chatPartnerName || "User"}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {loading ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {messages.length === 0 && (
              <Typography color="text.secondary">
                No messages yet. Start the conversation.
              </Typography>
            )}

            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.sender_id === user.id
                      ? "flex-end"
                      : "flex-start",
                  mb: 1
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor:
                      msg.sender_id === user.id
                        ? "#1976d2"
                        : "#e0e0e0",
                    color:
                      msg.sender_id === user.id
                        ? "white"
                        : "black",
                    maxWidth: "60%"
                  }}
                >
                  {msg.content}
                </Box>
              </Box>
            ))}

            {typing && (
              <Typography variant="caption">Typing...</Typography>
            )}

            <div ref={messagesEndRef} />
          </Box>
        )}

        <Box sx={{ display: "flex", mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
          />
          <IconButton onClick={sendMessage} color="primary">
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </DashboardLayout>
  );
}