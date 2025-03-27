import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/connectDb.js";
import { Server } from "socket.io";
import { createServer } from "node:http";

// dotenv config - Ensure path is correct relative to this file's location
dotenv.config({
  path: new URL("../.env", import.meta.url).pathname,
});

// server config
const PORT = process.env.PORT || 8000;

// socket.io config with enhanced CORS
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Fallback for development
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// Store connected users
let users = [];

// Add user to the array
const addUsers = (userId, socketId) => {
  if (!userId || !socketId) {
    console.error("Invalid userId or socketId:", { userId, socketId });
    return;
  }

  if (!users.some((user) => user.userId === userId)) {
    users.push({ userId, socketId });
    console.log(`User added: ${userId}`);
  }
};

// Remove user from the array
const removeUsers = (socketId) => {
  if (!socketId) return;

  const initialLength = users.length;
  users = users.filter((user) => user.socketId !== socketId);
  if (initialLength !== users.length) {
    console.log(`User removed with socket: ${socketId}`);
  }
};

// Get user by ID
const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Add user to socket
  socket.on("AddUserSocket", (userId) => {
    try {
      if (!userId) {
        console.error("No userId provided to AddUserSocket");
        return;
      }
      addUsers(userId, socket.id);
      io.emit("getUsers", users);
    } catch (error) {
      console.error("Error in AddUserSocket:", error);
    }
  });

  // Handle message sending
  socket.on("sendMessage", (data) => {
    try {
      // Validate incoming data
      if (!data?.messageData) {
        console.error("Invalid message data:", data);
        return;
      }

      const { userId, receiverId, message } = data.messageData;

      if (!userId || !receiverId || !message) {
        console.error("Missing message parameters:", {
          userId,
          receiverId,
          message,
        });
        return;
      }

      console.log("Message data:", { userId, receiverId, message });
      const receiver = getUser(receiverId);

      if (receiver?.socketId) {
        io.to(receiver.socketId).emit("receiveMessage", {
          userId,
          message,
          timestamp: new Date().toISOString(),
        });
        console.log(`Message sent to ${receiverId}`);
      } else {
        console.log(`Receiver ${receiverId} not connected`);
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    try {
      removeUsers(socket.id);
      io.emit("getUsers", users);
      console.log(`User disconnected: ${socket.id}`);
    } catch (error) {
      console.error("Error in disconnect:", error);
    }
  });
});

// Connect to database and start server
connectDB()
  .then(() => {
    // Handle server errors
    server.on("error", (error) => {
      console.error("Server error:", error);
    });

    // Start server
    server.listen(PORT, () => {
      console.log(`Server is running at: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("DB Connection Error:", error);
    process.exit(1); // Exit with failure code
  });

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

export { io, server }; // Export for potential use in other modules
