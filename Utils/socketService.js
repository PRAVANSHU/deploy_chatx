import { io } from 'socket.io-client';

// Determine the socket server URL based on environment
const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? process.env.APP_URL || 'https://deploy-chatx.onrender.com' // Use APP_URL environment variable
  : 'http://localhost:3000';

// Singleton instance for socket
let socket;

// Callbacks store for event handlers
const callbacks = {
  users_status: new Set(),
  new_message: new Set(),
  new_group_message: new Set(),
  user_typing: new Set(),
  read_receipt: new Set(),
};

// Connection status
let isConnecting = false;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Add a heartbeat mechanism to keep the socket alive
let heartbeatInterval = null;

/**
 * Initialize socket connection
 * @returns {Object} Socket instance
 */
export const initializeSocket = (user) => {
  if (isConnecting) return socket;
  
  isConnecting = true;
  
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    
    // Setup event listeners
    setupSocketListeners(socket);
    
    // Start heartbeat
    startHeartbeat();
  }
  
  // Connect user if credentials provided
  if (user && user.address) {
    connectUser(user);
  }
  
  isConnecting = false;
  return socket;
};

/**
 * Get the socket instance if initialized
 * @returns {Object|null} Socket instance or null
 */
export const getSocket = () => socket;

/**
 * Check if socket is connected
 * @returns {boolean} Connection status
 */
export const isSocketConnected = () => {
  return socket?.connected || false;
};

/**
 * Connect user to socket with their wallet address
 * @param {Object} user User object with address and userName
 */
export const connectUser = (user) => {
  if (!socket) {
    initializeSocket();
  }
  
  if (user && user.address) {
    if (socket.connected) {
      // If already connected, just emit user_connect
      emitUserConnect(user);
    } else {
      // Wait for connection and then emit
      socket.on('connect', () => {
        emitUserConnect(user);
      });
      
      // Ensure socket is connecting
      if (socket.disconnected) {
        socket.connect();
      }
    }
  }
};

/**
 * Helper function to emit user_connect
 */
const emitUserConnect = (user) => {
  socket.emit('user_connect', {
    address: user.address,
    userName: user.userName || ''
  });
  console.log('Connected user to socket:', user.address);
};

/**
 * Send a direct message via socket
 * @param {Object} messageData Message data
 */
export const sendDirectMessage = (messageData) => {
  if (!isSocketConnected()) {
    console.warn('Socket not connected. Attempting to reconnect...');
    reconnectSocket();
    return false;
  }
  
  socket.emit('send_message', {
    ...messageData,
    type: 'direct',
    timestamp: Date.now()
  });
  
  return true;
};

/**
 * Send a group message via socket
 * @param {Object} messageData Message data including groupId
 */
export const sendGroupMessage = (messageData) => {
  if (!isSocketConnected()) {
    console.warn('Socket not connected. Attempting to reconnect...');
    reconnectSocket();
    return false;
  }
  
  socket.emit('send_message', {
    ...messageData,
    type: 'group',
    timestamp: Date.now()
  });
  
  return true;
};

/**
 * Send typing indicator
 * @param {string} from Sender address
 * @param {string} to Recipient address
 * @param {boolean} isTyping Whether the user is typing
 */
export const sendTypingIndicator = (from, to, isTyping) => {
  if (!isSocketConnected()) {
    console.warn('Socket not connected. Attempting to reconnect...');
    reconnectSocket();
    return false;
  }
  
  socket.emit('typing', { from, to, isTyping });
  return true;
};

/**
 * Send read receipt for a message
 * @param {string} messageId ID of the message that was read
 * @param {string} reader Address of the user who read the message
 * @param {string} sender Address of the user who sent the message
 */
export const sendReadReceipt = (messageId, reader, sender) => {
  if (!isSocketConnected()) {
    console.warn('Socket not connected. Attempting to reconnect...');
    reconnectSocket();
    return false;
  }
  
  socket.emit('message_read', { messageId, reader, sender });
  return true;
};

/**
 * Attempt to reconnect socket
 */
export const reconnectSocket = () => {
  if (connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('Max reconnection attempts reached');
    return;
  }
  
  if (socket) {
    connectionAttempts++;
    console.log(`Reconnection attempt ${connectionAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
    
    if (socket.disconnected) {
      socket.connect();
    }
  }
};

/**
 * Subscribe to socket events
 * @param {string} event Event name
 * @param {Function} callback Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToEvent = (event, callback) => {
  if (!callbacks[event]) {
    callbacks[event] = new Set();
  }
  
  callbacks[event].add(callback);
  
  // Return unsubscribe function
  return () => {
    callbacks[event].delete(callback);
  };
};

/**
 * Setup internal socket event listeners
 * @param {Object} socketInstance Socket.IO instance
 */
const setupSocketListeners = (socketInstance) => {
  // Handle connection events
  socketInstance.on('connect', () => {
    console.log('Socket connected');
    connectionAttempts = 0; // Reset counter on successful connection
    
    // Trigger all registered callbacks with empty data to notify connection
    Object.keys(callbacks).forEach(event => {
      if (callbacks[event].size > 0) {
        callbacks[event].forEach(callback => callback({ connected: true }));
      }
    });
  });
  
  socketInstance.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
  socketInstance.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    if (connectionAttempts < MAX_RECONNECT_ATTEMPTS) {
      setTimeout(() => {
        if (socketInstance.disconnected) {
          socketInstance.connect();
        }
        connectionAttempts++;
      }, 2000);
    }
  });
  
  // Handle custom events
  socketInstance.on('users_status', (usersData) => {
    console.log('Received users_status update:', usersData);
    callbacks.users_status.forEach(callback => callback(usersData));
  });
  
  socketInstance.on('new_message', (messageData) => {
    console.log('Received new_message:', messageData);
    callbacks.new_message.forEach(callback => callback(messageData));
  });
  
  socketInstance.on('new_group_message', (messageData) => {
    console.log('Received new_group_message:', messageData);
    callbacks.new_group_message.forEach(callback => callback(messageData));
  });
  
  socketInstance.on('user_typing', (typingData) => {
    console.log('Received typing indicator:', typingData);
    callbacks.user_typing.forEach(callback => callback(typingData));
  });
  
  socketInstance.on('read_receipt', (receiptData) => {
    console.log('Received read receipt:', receiptData);
    callbacks.read_receipt.forEach(callback => callback(receiptData));
  });
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    stopHeartbeat();
    socket.disconnect();
    socket = null;
    connectionAttempts = 0;
  }
};

/**
 * Start heartbeat to keep connection alive
 */
const startHeartbeat = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
  
  // Send a ping every 30 seconds
  heartbeatInterval = setInterval(() => {
    if (socket && socket.connected) {
      socket.emit('heartbeat', { timestamp: Date.now() });
      console.log('Heartbeat sent');
    } else if (socket) {
      console.warn('Socket disconnected, attempting to reconnect');
      reconnectSocket();
    }
  }, 30000);
};

/**
 * Stop heartbeat
 */
const stopHeartbeat = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
};

export default {
  initializeSocket,
  getSocket,
  isSocketConnected,
  connectUser,
  sendDirectMessage,
  sendGroupMessage,
  sendTypingIndicator,
  sendReadReceipt,
  subscribeToEvent,
  reconnectSocket,
  disconnectSocket,
  startHeartbeat,
  stopHeartbeat
}; 