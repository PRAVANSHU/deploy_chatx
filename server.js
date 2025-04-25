const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Helper to normalize addresses to lowercase
const normalizeAddress = (address) => address ? address.toLowerCase() : null;

// User status management
const onlineUsers = new Map(); // Maps wallet addresses to socket IDs
const userSockets = new Map(); // Maps socket IDs to wallet addresses
const groupUsers = new Map(); // Maps group IDs to arrays of user socket IDs

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: dev ? ['http://localhost:3000'] : [process.env.APP_URL || 'https://deploy-chatx.onrender.com'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Periodically broadcast online users
  const broadcastOnlineUsers = () => {
    io.emit('users_status', Array.from(onlineUsers.entries()).map(([address, data]) => ({
      address,
      userName: data.userName,
      isOnline: data.isOnline,
      lastSeen: data.lastSeen
    })));
  };

  // Start broadcasting online users every 5 seconds
  const broadcastInterval = setInterval(broadcastOnlineUsers, 5000);

  // Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle heartbeat to keep connection alive
    socket.on('heartbeat', (data) => {
      // Respond with acknowledgment
      socket.emit('heartbeat_ack', { timestamp: Date.now() });
      
      // Update last activity time for the user
      const userData = userSockets.get(socket.id);
      if (userData && userData.address) {
        const userInfo = onlineUsers.get(userData.address);
        if (userInfo) {
          userInfo.lastSeen = new Date();
          userInfo.isOnline = true;
          onlineUsers.set(userData.address, userInfo);
        }
      }
    });

    // User authentication/connection
    socket.on('user_connect', ({ address, userName }) => {
      if (!address) return;
      
      const normalizedAddress = normalizeAddress(address);

      // Store user connection info
      userSockets.set(socket.id, { address: normalizedAddress, userName });
      
      // Update online users
      onlineUsers.set(normalizedAddress, {
        socketId: socket.id,
        userName: userName || 'Anonymous',
        lastSeen: new Date(),
        isOnline: true
      });
      
      // Broadcast user online status to all clients immediately
      broadcastOnlineUsers();
      
      console.log(`User connected: ${normalizedAddress} (${userName || 'Anonymous'})`);
    });

    // Handle new chat message
    socket.on('send_message', (messageData) => {
      console.log('New message received:', messageData);
      
      let normalizedFrom, normalizedTo;
      
      if (messageData.from) {
        normalizedFrom = normalizeAddress(messageData.from);
        messageData.from = normalizedFrom;
      }
      
      if (messageData.sender) {
        const normalizedSender = normalizeAddress(messageData.sender);
        messageData.sender = normalizedSender;
      }
      
      if (messageData.to) {
        normalizedTo = normalizeAddress(messageData.to);
        messageData.to = normalizedTo;
      }
      
      // For direct messages
      if (messageData.type === 'direct' && normalizedTo) {
        // Find recipient's socket if they're online
        const recipientData = onlineUsers.get(normalizedTo);
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
        // Format data for group message event
        const formattedMessage = {
          groupId: messageData.groupId,
          sender: normalizedFrom || messageData.sender,
          senderName: messageData.fromName || messageData.senderName,
          msg: messageData.msg,
          timestamp: messageData.timestamp || Date.now()
        };
        
        // Broadcast to everyone (clients will filter based on group membership)
        socket.broadcast.emit('new_group_message', formattedMessage);
        
        // Also send back to sender for confirmation
        socket.emit('new_group_message', {
          ...formattedMessage,
          delivered: true
        });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ from, to, isTyping }) => {
      console.log('Typing indicator received:', { from, to, isTyping });
      
      const normalizedFrom = normalizeAddress(from);
      
      // Check if this is a group typing indicator
      if (to && to.startsWith('group:')) {
        // Broadcast typing status to all clients (they will filter based on group membership)
        socket.broadcast.emit('user_typing', { 
          from: normalizedFrom,
          to: to, // Keep the group identifier as is
          isTyping,
          timestamp: Date.now()
        });
      } 
      // Individual chat typing indicator
      else if (to) {
        const normalizedTo = normalizeAddress(to);
        const recipientData = onlineUsers.get(normalizedTo);
        if (recipientData && recipientData.socketId) {
          io.to(recipientData.socketId).emit('user_typing', { 
            from: normalizedFrom, 
            isTyping,
            timestamp: Date.now()
          });
        }
      }
    });

    // Handle read receipts
    socket.on('message_read', ({ messageId, reader, sender }) => {
      if (!sender || !reader) return;
      
      const normalizedReader = normalizeAddress(reader);
      const normalizedSender = normalizeAddress(sender);
      
      const senderData = onlineUsers.get(normalizedSender);
      if (senderData && senderData.socketId) {
        io.to(senderData.socketId).emit('read_receipt', { 
          messageId, 
          reader: normalizedReader 
        });
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
        broadcastOnlineUsers();
        
        console.log(`User disconnected: ${address}`);
      }
      
      // Clean up maps
      userSockets.delete(socket.id);
      console.log('Client disconnected:', socket.id);
    });
  });

  // Clean up on server shutdown
  const cleanup = () => {
    clearInterval(broadcastInterval);
    console.log('Cleaning up broadcast interval');
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}); 