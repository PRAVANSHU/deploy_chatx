const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// User status management
const onlineUsers = new Map(); // Maps wallet addresses to socket IDs
const userSockets = new Map(); // Maps socket IDs to wallet addresses

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: dev ? ['http://localhost:3000'] : ['https://your-production-domain.com'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User authentication/connection
    socket.on('user_connect', ({ address, userName }) => {
      if (!address) return;

      // Store user connection info
      userSockets.set(socket.id, { address, userName });
      
      // Update online users
      onlineUsers.set(address, {
        socketId: socket.id,
        userName: userName || 'Anonymous',
        lastSeen: new Date(),
        isOnline: true
      });
      
      // Broadcast user online status to all clients
      io.emit('users_status', Array.from(onlineUsers.entries()).map(([address, data]) => ({
        address,
        userName: data.userName,
        isOnline: data.isOnline,
        lastSeen: data.lastSeen
      })));
      
      console.log(`User connected: ${address} (${userName || 'Anonymous'})`);
    });

    // Handle new chat message
    socket.on('send_message', (messageData) => {
      console.log('New message:', messageData);
      
      // For direct messages
      if (messageData.type === 'direct' && messageData.to) {
        // Find recipient's socket if they're online
        const recipientData = onlineUsers.get(messageData.to);
        if (recipientData && recipientData.socketId) {
          // Send to specific recipient
          io.to(recipientData.socketId).emit('new_message', messageData);
        }
        
        // Also send back to sender for confirmation
        socket.emit('new_message', {
          ...messageData,
          delivered: true,
          timestamp: messageData.timestamp || Date.now()
        });
      } 
      // For group messages
      else if (messageData.type === 'group' && messageData.groupId) {
        // Broadcast to everyone in the group (we'll handle group membership later)
        io.emit('new_group_message', messageData);
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ from, to, isTyping }) => {
      const recipientData = onlineUsers.get(to);
      if (recipientData && recipientData.socketId) {
        io.to(recipientData.socketId).emit('user_typing', { from, isTyping });
      }
    });

    // Handle read receipts
    socket.on('message_read', ({ messageId, reader, sender }) => {
      const senderData = onlineUsers.get(sender);
      if (senderData && senderData.socketId) {
        io.to(senderData.socketId).emit('read_receipt', { messageId, reader });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      // Get user address from socket ID
      const userData = userSockets.get(socket.id);
      if (userData && userData.address) {
        const { address } = userData;
        
        // Update last seen time
        if (onlineUsers.has(address)) {
          const user = onlineUsers.get(address);
          user.isOnline = false;
          user.lastSeen = new Date();
          onlineUsers.set(address, user);
        }
        
        // Broadcast updated status
        io.emit('users_status', Array.from(onlineUsers.entries()).map(([address, data]) => ({
          address,
          userName: data.userName,
          isOnline: data.isOnline,
          lastSeen: data.lastSeen
        })));
        
        console.log(`User disconnected: ${address}`);
      }
      
      // Clean up maps
      userSockets.delete(socket.id);
      console.log('Client disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}); 