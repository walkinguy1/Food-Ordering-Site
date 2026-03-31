const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Logistics Service Running' });
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Agent joins a specific order tracking room
  socket.on('join_tracking', (orderId) => {
    socket.join(`track_${orderId}`);
    console.log(`Socket ${socket.id} joined tracking room for order ${orderId}`);
  });

  // Agent broadcasts location
  socket.on('update_location', (data) => {
    const { orderId, latitude, longitude } = data;
    console.log(`Agent location for ${orderId}: ${latitude}, ${longitude}`);
    // Broadcast to everyone else in the room (Customer)
    socket.to(`track_${orderId}`).emit('location_updated', {
      latitude,
      longitude,
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4004;

server.listen(PORT, () => {
  console.log(`Logistics Service (Socket.io) listening on port ${PORT}`);
});
