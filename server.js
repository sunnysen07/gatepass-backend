// server.js
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/database/db');

// ✅ Connect MongoDB
connectDB();

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Initialize Socket.IO (FIXED CORS)
const io = new Server(server, {
  cors: {
    origin: "*", // 🔥 Dev ke liye best (Expo + Mobile + Web)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// ✅ Make io available in Express routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Optional global access
app.set('io', io);

// ✅ Socket.IO events
io.on("connection", (socket) => {
  console.log(`🟢 Client connected: ${socket.id}`);

  socket.on("joinTG", (room) => {
    socket.join(room);
    console.log(`🎓 TG joined room: ${room}`);
  });

  socket.on("joinHOD", (room) => {
    socket.join(room);
    console.log(`👔 HOD joined room: ${room}`);
  });

  socket.on("joinStudent", (room) => {
    socket.join(room);
    console.log(`👨‍🎓 Student joined room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
});

// ✅ Start server (IMPORTANT for mobile)
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  // console.log(`📱 Mobile/Local access: http://<your-ip>:${PORT}`);
  console.log(`📡 Socket.IO ready`);
});
