const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: '*' } });

// Middleware - ORDER IS IMPORTANT
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

// Debug route to test if server is running
app.get('/', (req, res) => {
  res.send('API is running...');
});

// WebSocket logic
let onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('New WebSocket connection');
  
  socket.on('user-connected', (userId) => {
    console.log(`User connected: ${userId}`);
    onlineUsers.set(userId, socket.id);
    io.emit('online-users', Array.from(onlineUsers.keys()));
  });

  socket.on('send-message', ({ chatId, message }) => {
    console.log(`Message received in chat: ${chatId}`);
    for (let [uid, sid] of onlineUsers.entries()) {
      if (uid !== message.sender) {
        io.to(sid).emit('receive-message', message);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    for (let [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(uid);
        break;
      }
    }
    io.emit('online-users', Array.from(onlineUsers.keys()));
  });
});

// Mongo connection & server start
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

startServer();