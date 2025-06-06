import React, { useState, useEffect, useContext, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Style from "./groupchat.module.css"
import { ChatAppContext } from '@/Context/ChatAppContext'
import images from '../assets'
import EmojiPicker from 'emoji-picker-react'
import FileInput from '@/Components/FileInput'
import FileMessage from '@/Components/FileMessage'
import UploadProgress from '@/Components/UploadProgress'
import socketService from '@/Utils/socketService'

const GroupChat = () => {
  const { 
    account, 
    userName, 
    friendLists, 
    loading,
    error,
    myGroups,
    createGroup,
    getGroupDetails,
    getGroupMessages,
    sendGroupMessage,
    currentGroupId,
    currentGroupName,
    currentGroupMembers,
    currentGroupMessages,
    setCurrentGroupId,
    // File sharing functions
    sendGroupFileMessage,
    isFileUploading,
    uploadProgress,
    isFileMessage,
    parseFileData,
    // Online status states
    onlineUsers,
    setOnlineUsers,
    isSocketConnected,
    setIsSocketConnected
  } = useContext(ChatAppContext)

  // States for UI
  const [message, setMessage] = useState("")
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [selectedFriends, setSelectedFriends] = useState([])
  const [localError, setLocalError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [replyingTo, setReplyingTo] = useState(null)
  const [typingUsers, setTypingUsers] = useState({})
  const [localGroupMessages, setLocalGroupMessages] = useState([])
  
  const emojiPickerRef = useRef(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [localGroupMessages])
  
  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiPickerRef]);
  
  // Initialize socket connection
  useEffect(() => {
    if (account && userName) {
      // Initialize socket connection with user info
      const socket = socketService.initializeSocket({
        address: account,
        userName: userName
      });
      
      // Set socket connection status
      setIsSocketConnected(true);
      
      // Clean up socket connection on unmount
      return () => {
        socketService.disconnectSocket();
        setIsSocketConnected(false);
      };
    }
  }, [account, userName, setIsSocketConnected]);
  
  // Subscribe to socket events for real-time updates
  useEffect(() => {
    if (isSocketConnected) {
      // Subscribe to user status updates
      const unsubscribeUserStatus = socketService.subscribeToEvent('users_status', (statusData) => {
        if (statusData.connected) return; // Skip the connection notification
        console.log("Received online status update:", statusData);
        setOnlineUsers(statusData.reduce((acc, user) => {
          acc[user.address.toLowerCase()] = user;
          return acc;
        }, {}));
      });
      
      // Subscribe to new group messages
      const unsubscribeGroupMessage = socketService.subscribeToEvent('new_group_message', (messageData) => {
        console.log("Received new group message:", messageData);
        if (messageData.groupId && Number(messageData.groupId) === Number(currentGroupId)) {
          // Add the new message to the current group messages
          setLocalGroupMessages(prev => {
            // Check if message already exists to prevent duplicates
            const messageExists = prev.some(msg => 
              msg.timestamp === messageData.timestamp && 
              msg.sender === messageData.sender && 
              msg.msg === messageData.msg
            );
            
            if (messageExists) return prev;
            return [...prev, messageData];
          });
        }
      });
      
      // Subscribe to typing indicators
      const unsubscribeTyping = socketService.subscribeToEvent('user_typing', (typingData) => {
        console.log("Received typing indicator:", typingData);
        
        // Check if this is a group typing indicator
        if (typingData.to && typingData.to.startsWith('group:')) {
          const groupId = typingData.to.replace('group:', '');
          
          // Only process if it's for the current group
          if (Number(groupId) === Number(currentGroupId)) {
            setTypingUsers(prev => ({
              ...prev,
              [typingData.from.toLowerCase()]: {
                isTyping: typingData.isTyping,
                timestamp: typingData.timestamp || Date.now()
              }
            }));
          }
        }
      });
      
      // Return cleanup functions
      return () => {
        unsubscribeUserStatus();
        unsubscribeGroupMessage();
        unsubscribeTyping();
      };
    }
  }, [isSocketConnected, currentGroupId, setOnlineUsers]);
  
  // Clean up typing indicators after timeout
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => {
        const now = Date.now();
        const updated = { ...prev };
        let changed = false;
        
        // Clear typing indicators older than 3 seconds
        Object.keys(updated).forEach(userId => {
          if (updated[userId] && now - updated[userId].timestamp > 3000 && updated[userId].isTyping) {
            updated[userId].isTyping = false;
            changed = true;
          }
        });
        
        return changed ? updated : prev;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Sync localGroupMessages with context currentGroupMessages
  useEffect(() => {
    if (currentGroupMessages) {
      setLocalGroupMessages(currentGroupMessages);
    }
  }, [currentGroupMessages]);
  
  // Load groups effect
  useEffect(() => {
    console.log("Available groups:", myGroups);
    if (myGroups.length > 0 && !currentGroupId) {
      loadGroupDetails(myGroups[0]);
    }
  }, [myGroups]);
  
  // Effect to handle context error
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);
  
  // Load group details and messages
  const loadGroupDetails = async (groupId) => {
    try {
      setIsLoading(true);
      console.log("Loading details for group:", groupId);
      await getGroupDetails(groupId);
      await getGroupMessages(groupId);
      setCurrentGroupId(groupId);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading group details:", error);
      setLocalError("Error loading group information. Please try again.");
      setIsLoading(false);
    }
  }
  
  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // If there's a file selected, send it as a file message
    if (selectedFile) {
      try {
        setLocalError("");
        console.log("Sending file to group:", currentGroupId);
        console.log("File:", selectedFile);
        
        const result = await sendGroupFileMessage({
          groupId: currentGroupId,
          file: selectedFile
        });
        
        if (result && result.success) {
          setSelectedFile(null);
          
          // Also send via socket for real-time update
          socketService.sendGroupMessage({
            from: account,
            fromName: userName,
            groupId: currentGroupId,
            msg: JSON.stringify(result.fileData),
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error("Error sending file:", error);
        setLocalError("Failed to send file. Please try again.");
      }
      return;
    }
    
    // Otherwise send a regular text message
    if (message.trim() === "") {
      setLocalError("Message cannot be empty");
      return;
    }
    
    try {
      setLocalError("");
      console.log("Sending message to group:", currentGroupId);
      
      // Prepare message text with reply information if replying to a message
      let messageText = message;
      
      if (replyingTo) {
        // Format: "REPLY:{originalSender}:{originalMsgId}:{originalMsgPreview}:{actualMessage}"
        // This keeps the contract unchanged but adds reply context in the message itself
        const replyPrefix = `REPLY:${replyingTo.sender}:${replyingTo.id || '0'}:${replyingTo.msg.substring(0, 30)}:`;
        messageText = replyPrefix + message;
      }
      
      // Send message to blockchain
      await sendGroupMessage({
        groupId: currentGroupId,
        msg: messageText
      });
      
      // Also send via socket for real-time update
      socketService.sendGroupMessage({
        from: account,
        fromName: userName,
        groupId: currentGroupId,
        msg: messageText,
        timestamp: Date.now()
      });
      
      setMessage("");
      setReplyingTo(null);
      
      // Clear typing indicator
      sendTypingIndicator(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setLocalError("Failed to send message. Please try again.");
    }
  }
  
  // Handle emoji selection
  const handleEmojiClick = (emojiObject) => {
    setMessage(prevMsg => prevMsg + emojiObject.emoji);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev);
  };
  
  // Handle file selection
  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };
  
  // Handle group selection
  const handleSelectGroup = (groupId) => {
    setLocalError("");
    loadGroupDetails(groupId);
  }
  
  // Handle creating a new group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    if (newGroupName.trim() === "") {
      setLocalError("Group name cannot be empty");
      return;
    }
    
    if (selectedFriends.length === 0) {
      setLocalError("Please select at least one friend to add to the group");
      return;
    }
    
    try {
      setLocalError("");
      console.log("Creating group:", newGroupName);
      console.log("Selected friends:", selectedFriends);
      
      await createGroup({
        name: newGroupName,
        members: selectedFriends
      });
      
      setShowCreateGroup(false);
      setNewGroupName("");
      setSelectedFriends([]);
    } catch (error) {
      console.error("Error creating group:", error);
      setLocalError("Failed to create group. Please try again.");
    }
  }
  
  // Toggle friend selection for group creation
  const toggleFriendSelection = (friendAddress) => {
    if (selectedFriends.includes(friendAddress)) {
      setSelectedFriends(selectedFriends.filter(addr => addr !== friendAddress));
    } else {
      setSelectedFriends([...selectedFriends, friendAddress]);
    }
  }
  
  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Handle typing indicator with debounce
  const handleMessageInputChange = (e) => {
    setMessage(e.target.value);
    
    // Send typing indicator
    sendTypingIndicator(true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 3000);
  };
  
  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  // Send typing indicator through socket
  const sendTypingIndicator = (isTyping) => {
    if (!currentGroupId || !account || !isSocketConnected) return;
    
    console.log(`Sending typing indicator: ${isTyping} for group:${currentGroupId}`);
    
    try {
      const success = socketService.sendTypingIndicator(
        account.toLowerCase(), 
        `group:${currentGroupId}`, 
        isTyping
      );
      
      if (!success) {
        console.warn("Failed to send typing indicator - socket not connected");
      }
    } catch (error) {
      console.error("Error sending typing indicator:", error);
    }
  };

  // New function to handle selecting a message to reply to
  const handleSelectReply = (message) => {
    setReplyingTo(message);
    // Focus on input after selecting a message to reply to
    document.querySelector(`.${Style.message_input_form} input`).focus();
  };
  
  // New function to cancel the current reply
  const cancelReply = () => {
    setReplyingTo(null);
  };
  
  // New function to check if a message is a reply and extract reply data
  const extractReplyData = (messageText) => {
    if (!messageText.startsWith('REPLY:')) return null;
    
    try {
      // Extract reply data from message format: "REPLY:{originalSender}:{originalMsgId}:{originalMsgPreview}:{actualMessage}"
      const parts = messageText.split(':');
      const originalSender = parts[1];
      const originalMsgId = parts[2];
      const originalMsgPreview = parts[3];
      const actualMessage = parts.slice(4).join(':'); // Rejoin rest in case message itself has colons
      
      return {
        originalSender,
        originalMsgId,
        originalMsgPreview,
        actualMessage
      };
    } catch (error) {
      console.error('Error parsing reply data:', error);
      return null;
    }
  };
  
  // Function to get the actual message content from possibly reply-prefixed message
  const getMessageText = (messageText) => {
    const replyData = extractReplyData(messageText);
    if (replyData) {
      return replyData.actualMessage;
    }
    return messageText;
  };
  
  // Get sender name from address
  const getSenderNameByAddress = (address) => {
    // Check if this is you
    if (address.toLowerCase() === account.toLowerCase()) {
      return 'You';
    }
    
    // Try to find in currentGroupMembers
    const memberName = currentGroupMembers.find(member => 
      member.toLowerCase() === address.toLowerCase()
    );
    
    if (memberName) return memberName;
    
    // Try to find in friendLists
    const friend = friendLists.find(f => 
      f.pubkey.toLowerCase() === address.toLowerCase()
    );
    
    if (friend) return friend.name;
    
    // Fallback to short address format
    return address.slice(0, 6) + '...' + address.slice(-4);
  };

  // Function to check if user is online
  const isUserOnline = (address) => {
    if (!address || !onlineUsers) return false;
    const userStatus = onlineUsers[address.toLowerCase()];
    return !!userStatus?.isOnline;
  };
  
  // Check if any group member is typing
  const getTypingMembers = () => {
    if (!currentGroupMembers || !typingUsers) return [];
    
    return currentGroupMembers
      .filter(memberAddress => {
        const lowerAddress = memberAddress.toLowerCase();
        return typingUsers[lowerAddress]?.isTyping && 
               lowerAddress !== account.toLowerCase();
      })
      .map(addr => getSenderNameByAddress(addr));
  };
  
  // Display typing indicator message
  const getTypingIndicator = () => {
    const typingMembers = getTypingMembers();
    
    if (typingMembers.length === 0) return null;
    if (typingMembers.length === 1) return `${typingMembers[0]} is typing...`;
    if (typingMembers.length === 2) return `${typingMembers[0]} and ${typingMembers[1]} are typing...`;
    return 'Several people are typing...';
  };
  
  return (
    <div className={Style.chat}>
      <div className={Style.groupchat_box}>
        
        {/* Error message display */}
        {(localError || error) && (
          <div className={Style.error_container}>
            <p className={Style.error_message}>{localError || error}</p>
            <button onClick={() => setLocalError("")} className={Style.error_close}>×</button>
          </div>
        )}
        
        <div className={Style.groupchat_box_container}>
          {/* Left sidebar - Group list */}
          <div className={Style.groupchat_box_sidebar}>
            <div className={Style.groupchat_box_sidebar_header}>
              <h3>My Groups</h3>
              <button 
                className={Style.create_group_btn}
                onClick={() => setShowCreateGroup(!showCreateGroup)}
              >
                {showCreateGroup ? "Cancel" : "Create Group"}
              </button>
            </div>
            
            {showCreateGroup ? (
              <div className={Style.create_group_form}>
                <input 
                  type="text"
                  placeholder="Group Name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                
                <h4>Select Friends ({selectedFriends.length} selected)</h4>
                <div className={Style.friend_selection_list}>
                  {friendLists.length > 0 ? (
                    friendLists.map((friend, i) => (
                      <div key={i} className={Style.friend_selection_item}>
                        <input 
                          type="checkbox"
                          id={`friend-${i}`}
                          checked={selectedFriends.includes(friend.pubkey)}
                          onChange={() => toggleFriendSelection(friend.pubkey)}
                        />
                        <label htmlFor={`friend-${i}`}>{friend.name}</label>
                        {isUserOnline(friend.pubkey) && (
                          <span className={Style.online_indicator} title="Online"></span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className={Style.no_friends_message}>
                      You need to add friends first. <a href="/alluser">Go to All Users</a>
                    </p>
                  )}
                </div>
                
                <button 
                  className={Style.create_group_submit_btn}
                  onClick={handleCreateGroup}
                  disabled={newGroupName.trim() === "" || selectedFriends.length === 0 || loading || isLoading}
                >
                  {loading ? "Creating..." : "Create Group"}
                </button>
              </div>
            ) : (
              <div className={Style.group_list}>
                {myGroups.length > 0 ? (
                  myGroups.map((groupId, i) => (
                    <div 
                      key={i} 
                      className={`${Style.group_item} ${currentGroupId === groupId ? Style.active_group : ""}`}
                      onClick={() => handleSelectGroup(groupId)}
                    >
                      <div className={Style.group_icon}>
                        <Image src={images.accountName} alt="Group" width={30} height={30} />
                      </div>
                      <div className={Style.group_info}>
                        <h4>{currentGroupId === groupId && currentGroupName ? currentGroupName : `Group ${groupId}`}</h4>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={Style.no_groups_message}>No groups yet. Create one!</p>
                )}
              </div>
            )}
          </div>
          
          {/* Right side - Chat area */}
          <div className={Style.groupchat_box_chat}>
            {currentGroupId ? (
              <>
                <div className={Style.chat_header}>
                  <h3>{currentGroupName || `Group ${currentGroupId}`}</h3>
                  <p>{currentGroupMembers.length} members</p>
                </div>
                
                <div className={Style.chat_messages}>
                  {isLoading || loading ? (
                    <div className={Style.loading_container}>
                      <p className={Style.loading_message}>Loading messages...</p>
                    </div>
                  ) : localGroupMessages.length > 0 ? (
                    localGroupMessages.map((msg, i) => {
                      const isFileMsg = isFileMessage(msg.msg);
                      const isCurrentUser = msg.sender.toLowerCase() === account.toLowerCase();
                      const replyData = !isFileMsg ? extractReplyData(msg.msg) : null;
                      
                      return (
                        <div 
                          key={i} 
                          className={`${Style.message_item} ${isCurrentUser ? Style.my_message : ""}`}
                        >
                          <div className={Style.message_content}>
                            <span className={Style.sender_name}>
                              {msg.senderName || getSenderNameByAddress(msg.sender)}
                              {isUserOnline(msg.sender) && (
                                <span className={Style.online_dot} title="Online"></span>
                              )}
                            </span>
                            
                            {replyData && (
                              <div className={Style.reply_preview} onClick={() => {
                                // Could add scroll to original message functionality here
                              }}>
                                <div className={Style.reply_line}></div>
                                <div className={Style.reply_content}>
                                  <span className={Style.reply_sender}>
                                    {getSenderNameByAddress(replyData.originalSender)}
                                  </span>
                                  <p className={Style.reply_text}>{replyData.originalMsgPreview}</p>
                                </div>
                              </div>
                            )}
                            
                            {isFileMsg ? (
                              <FileMessage fileData={parseFileData(msg.msg)} />
                            ) : (
                              <p>{getMessageText(msg.msg)}</p>
                            )}
                            
                            <div className={Style.message_footer}>
                              <span className={Style.message_time}>{formatTime(msg.timestamp)}</span>
                              
                              <span 
                                className={Style.reply_button}
                                onClick={() => handleSelectReply(msg)}
                                title="Reply to this message"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 8L5 12L9 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M5 12H16C18.2091 12 20 10.2091 20 8V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className={Style.no_messages}>No messages yet. Start the conversation!</p>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Typing indicator */}
                {getTypingIndicator() && (
                  <div className={Style.typing_indicator}>
                    <p>{getTypingIndicator()}</p>
                  </div>
                )}
                
                {/* File upload progress indicator */}
                {isFileUploading && (
                  <div className={Style.upload_progress_container}>
                    <p className={Style.uploading_text}>Uploading file...</p>
                    <UploadProgress progress={uploadProgress} />
                  </div>
                )}
                
                <form className={Style.message_input_form} onSubmit={handleSendMessage}>
                  {/* Display reply preview when replying to a message */}
                  {replyingTo && (
                    <div className={Style.reply_container}>
                      <div className={Style.reply_preview_input}>
                        <div className={Style.reply_line_input}></div>
                        <div className={Style.reply_content_input}>
                          <span className={Style.reply_sender_input}>
                            Replying to {replyingTo.senderName || getSenderNameByAddress(replyingTo.sender)}
                          </span>
                          <p className={Style.reply_text_input}>
                            {isFileMessage(replyingTo.msg) 
                              ? 'File message' 
                              : replyingTo.msg.substring(0, 50) + (replyingTo.msg.length > 50 ? '...' : '')}
                          </p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        className={Style.cancel_reply_button} 
                        onClick={cancelReply}
                        title="Cancel reply"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  <div className={Style.message_input_wrapper}>
                    <div className={Style.input_actions}>
                      <div className={Style.emoji_container} ref={emojiPickerRef}>
                        <div className={Style.emoji_btn} onClick={toggleEmojiPicker} title="Add emoji">
                          <div className={Style.emojiIconWrapper}>
                            <Image src={images.smile} alt="Emoji" width={30} height={30} className={Style.emojiIcon} />
                          </div>
                        </div>
                        {showEmojiPicker && (
                          <div className={Style.emoji_picker_container}>
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                          </div>
                        )}
                      </div>
                      
                      <FileInput 
                        onFileSelect={handleFileSelect} 
                        disabled={loading || isLoading || isFileUploading}
                      />
                    </div>
                    
                    <input 
                      type="text"
                      placeholder={selectedFile ? "Press send to upload file" : "Type your message here..."}
                      value={message}
                      onChange={handleMessageInputChange}
                      disabled={loading || isLoading || isFileUploading || selectedFile}
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={(message.trim() === "" && !selectedFile) || loading || isLoading || isFileUploading}
                  >
                    {selectedFile ? "Upload" : loading ? "Sending..." : "Send"}
                  </button>
                </form>
              </>
            ) : (
              <div className={Style.groupchat_box_content_message}>
                <p>{myGroups.length > 0 ? "Select a group to start chatting" : "Create a group to start chatting"}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GroupChat