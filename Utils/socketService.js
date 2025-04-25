import { io } from 'socket.io-client';

// Determine the socket server URL based on environment
const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-domain.com' // Change to your production URL
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

/**
 * Initialize socket connection
 * @returns {Object} Socket instance
 */
export const initializeSocket = (user) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
    
    // Setup event listeners
    setupSocketListeners(socket);
  }
  
  // Connect user if credentials provided
  if (user && user.address) {
    connectUser(user);
  }
  
  return socket;
};

/**
 * Get the socket instance if initialized
 * @returns {Object|null} Socket instance or null
 */
export const getSocket = () => socket;

/**
 * Connect user to socket with their wallet address
 * @param {Object} user User object with address and userName
 */
export const connectUser = (user) => {
  if (!socket) {
    initializeSocket();
  }
  
  if (user && user.address) {
    socket.emit('user_connect', {
      address: user.address,
      userName: user.userName || ''
    });
    console.log('Connected user to socket:', user.address);
  }
};

/**
 * Send a direct message via socket
 * @param {Object} messageData Message data
 */
export const sendDirectMessage = (messageData) => {
  if (!socket) return false;
  
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
  if (!socket) return false;
  
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
  if (!socket) return;
  
  socket.emit('typing', { from, to, isTyping });
};

/**
 * Send read receipt for a message
 * @param {string} messageId ID of the message that was read
 * @param {string} reader Address of the user who read the message
 * @param {string} sender Address of the user who sent the message
 */
export const sendReadReceipt = (messageId, reader, sender) => {
  if (!socket) return;
  
  socket.emit('message_read', { messageId, reader, sender });
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
  });
  
  socketInstance.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
  socketInstance.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  // Handle custom events
  socketInstance.on('users_status', (usersData) => {
    callbacks.users_status.forEach(callback => callback(usersData));
  });
  
  socketInstance.on('new_message', (messageData) => {
    callbacks.new_message.forEach(callback => callback(messageData));
  });
  
  socketInstance.on('new_group_message', (messageData) => {
    callbacks.new_group_message.forEach(callback => callback(messageData));
  });
  
  socketInstance.on('user_typing', (typingData) => {
    callbacks.user_typing.forEach(callback => callback(typingData));
  });
  
  socketInstance.on('read_receipt', (receiptData) => {
    callbacks.read_receipt.forEach(callback => callback(receiptData));
  });
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  initializeSocket,
  getSocket,
  connectUser,
  sendDirectMessage,
  sendGroupMessage,
  sendTypingIndicator,
  sendReadReceipt,
  subscribeToEvent,
  disconnectSocket
}; 