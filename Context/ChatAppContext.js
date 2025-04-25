import React ,{useState,useEffect, Children} from 'react'
import { useRouter } from 'next/router'

//internal import
import { CheckIfWalletConnected,connectWallet,connectingWithContract } from '@/Utils/apiFeature';
import { uploadFileToIPFS, getFileMetadata, formatFileSize, getFileIcon } from '@/Utils/pinataService';
import socketService from '@/Utils/socketService';

export const ChatAppContext=React.createContext();

export const ChatAppProvider=({children})=>{
    const[account,setAccount] = useState("");
    const[userName,setUserName]=useState("");
    const[friendLists,setFriendLists]=useState([]);
    const[friendMsg,setFriendMsg]=useState([]);
    const[loading,setLoading]=useState(false);
    const[userLists,setUserLists]=useState([]);
    const[error,setError]=useState("");

    //chat user data
    const[currentUserName,setCurrentUserName]=useState("");
    const[currentUserAddress,setCurrentUserAddress]=useState("");
    
    // Group chat related states
    const[myGroups, setMyGroups] = useState([]);
    const[currentGroupId, setCurrentGroupId] = useState(null);
    const[currentGroupName, setCurrentGroupName] = useState("");
    const[currentGroupMembers, setCurrentGroupMembers] = useState([]);
    const[currentGroupMessages, setCurrentGroupMessages] = useState([]);
    
    // File sharing states
    const[isFileUploading, setIsFileUploading] = useState(false);
    const[uploadProgress, setUploadProgress] = useState(0);
    
    // WebSocket and online status related states
    const[onlineUsers, setOnlineUsers] = useState({});
    const[isSocketConnected, setIsSocketConnected] = useState(false);
    const[typingUsers, setTypingUsers] = useState({});
    const[unreadMessages, setUnreadMessages] = useState({});

    const router=useRouter();

    //fetch data time of page load
    const fetchData=async()=>{
        try {
            if (!window.ethereum) {
                setError("Please Install and Connect Your Wallet");
                return;
            }
            
            //get account
            const connectAccount=await connectWallet();
            if (!connectAccount) {
                setError("Please connect your wallet");
                return;
            }
            setAccount(connectAccount);
            
            //get contract
            const contract=await connectingWithContract();
            if (!contract) {
                setError("Error connecting to contract");
                return;
            }
            
            try {
                //get username
                const userName = await contract.getUsername(connectAccount);
                if (userName) {
                    setUserName(userName);
                }
            } catch (nameError) {
                console.log("No username found - user hasn't created account yet");
            }
            
            try {
                //get all app user list
                const userList = await contract.getAllAppUsers();
                if (userList) {
                    setUserLists(userList);
                }
            } catch (error) {
                console.log("Error fetching user list:", error);
                setUserLists([]);
            }
            
            try {
                //get my friend list
                const friendLists = await contract.getMyFriendList();
                if (friendLists) {
                    setFriendLists(friendLists);
                }
            } catch (error) {
                console.log("Error fetching friend list:", error);
                setFriendLists([]);
            }
            
            try {
                // Get my groups
                console.log("Attempting to fetch groups...");
                const myGroupIds = await contract.getMyGroups();
                console.log("Got groups:", myGroupIds);
                if (myGroupIds) {
                    setMyGroups(myGroupIds.map(id => Number(id)));
                }
            } catch (error) {
                console.log("Error fetching groups:", error);
                setMyGroups([]);
            }
            
        } catch (error) {
            console.error("Fetch data error:", error);
            // setError("Please Install and Connect Your Wallet");
        }
    };
    
    useEffect(()=>{
        fetchData();
    },[]);
    
    //read message
    const readMessage=async(friendAddress)=>{
        try {
            const contract=await connectingWithContract();
            const read =await contract.readMessage(friendAddress);
            setFriendMsg(read);
        } catch (error) {
            console.log("Currently You have no Message")
        }
    }
    
    // create account
    const createAccount=async ({name,accountAddress})=>{
        try {
            if (!name || name.trim() === "") {
                setError("Name cannot be empty");
                return;
            }

            setLoading(true);
            const contract=await connectingWithContract();
            const getCreatedUser=await contract.createAccount(name);
            await getCreatedUser.wait();
            
            // Set the username immediately
            setUserName(name);
            
            // Update the user list
            try {
                const userList = await contract.getAllAppUsers();
                if (userList) {
                    setUserLists(userList);
                }
            } catch (listError) {
                console.log("Error fetching updated user list:", listError);
            }
            
            setLoading(false);
            setError("");
            
            // Close any open dialogs by dispatching a custom event
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('accountCreated'));
            }
        } catch (error) {
            console.error("Create account error:", error);
            if (error.message && error.message.includes("User already exists")) {
                setError("This wallet address already has an account");
            } else {
                setError("Error while creating your account. Please try again.");
            }
            setLoading(false);
        }
    }

    //add your friend
    const addFriends=async({name,accountAddress})=>{
        try {
            // if(name||accountAddress) return setError("Please provide name and account address");
            const contract=await connectingWithContract();
            const addMyFriend=await contract.addFriend(accountAddress,name);
            setLoading(true);
            await addMyFriend.wait();
            setLoading(false);
            router.push("/");
            window.location.reload();

        } catch (error) {
            console.error("Add friend error:", error);
            setError("Something went wrong while adding friends,try again");
        }
    }
  //send message to you friend
  const sendMessage=async({msg,address})=>{
    try {
        if(!msg || !address) {
            setError("Please type your message and select a recipient");
            return;
        }

        const contract=await connectingWithContract();
        console.log("Sending message:", msg);
        console.log("To address:", address);
        
        const addMessage=await contract.sendMessage(address,msg);
        setLoading(true);
        await addMessage.wait();
        setLoading(false);
        
        // Refresh messages
        await readMessage(address);
    } catch (error) {
      console.error("Send message error:", error);
      setError("Failed to send message: " + (error.message || "Please reload and try again"));  
    }
  }
  //read info
  const readUser=async(userAddress)=>{
    const contract=await connectingWithContract();
    // const userName=await contract.getUsername(userAddress);
    setCurrentUserName(userName);
    setCurrentUserAddress(userAddress);
  }

    // Group chat functions
    
    // Create a new group
    const createGroup = async ({ name, members }) => {
        try {
            if (!name || name.trim() === "") {
                setError("Group name cannot be empty");
                return;
            }
            
            if (!members || members.length === 0) {
                setError("Please select at least one friend to add to the group");
                return;
            }
            
            setLoading(true);
            const contract = await connectingWithContract();
            
            console.log("Creating group:", name);
            console.log("With members:", members);
            console.log("Contract methods:", Object.keys(contract));
            
            try {
                const createGroupTx = await contract.createGroupChat(name, members);
                console.log("Transaction sent:", createGroupTx);
                await createGroupTx.wait();
                console.log("Transaction completed");
                
                // Refresh groups
                try {
                    const myGroupIds = await contract.getMyGroups();
                    console.log("New groups:", myGroupIds);
                    if (myGroupIds) {
                        setMyGroups(myGroupIds.map(id => Number(id)));
                    }
                } catch (error) {
                    console.log("Error fetching updated groups:", error);
                }
                
                setLoading(false);
                setError("");
                router.push("/groupchat");
            } catch (txError) {
                console.error("Transaction error:", txError);
                setError("Error creating group: " + (txError.message || "Unknown error"));
                setLoading(false);
            }
        } catch (error) {
            console.error("Create group error:", error);
            setError("Error creating group: " + (error.message || "Unknown error"));
            setLoading(false);
        }
    };
    
    // Get group details
    const getGroupDetails = async (groupId) => {
        try {
            console.log("Getting details for group:", groupId);
            const contract = await connectingWithContract();
            const details = await contract.getGroupDetails(groupId);
            console.log("Group details:", details);

            setCurrentGroupId(groupId);
            setCurrentGroupName(details.name);
            setCurrentGroupMembers(details.members);
            
            return {
                name: details.name,
                admin: details.admin,
                members: details.members
            };
        } catch (error) {
            console.error("Get group details error:", error);
            setError("Error fetching group details");
            return null;
        }
    };
    
    // Get group messages
    const getGroupMessages = async (groupId) => {
        try {
            console.log("Getting messages for group:", groupId);
            const contract = await connectingWithContract();
            const messages = await contract.getGroupMessages(groupId);
            console.log("Group messages:", messages);
            setCurrentGroupMessages(messages);
            return messages;
        } catch (error) {
            console.error("Get group messages error:", error);
            setError("Error fetching group messages");
            return [];
        }
    };
    
    // Send message to group
    const sendGroupMessage = async ({ groupId, msg }) => {
        try {
            if (!msg || msg.trim() === "") {
                setError("Message cannot be empty");
                return;
            }
            
            setLoading(true);
            console.log("Sending message to group:", groupId);
            console.log("Message:", msg);
            
            const contract = await connectingWithContract();
            const sendMsgTx = await contract.sendGroupMessage(groupId, msg);
            await sendMsgTx.wait();
            console.log("Message sent successfully");

            // Refresh messages
            const messages = await contract.getGroupMessages(groupId);
            setCurrentGroupMessages(messages);
            
            setLoading(false);
            setError("");
        } catch (error) {
            console.error("Send group message error:", error);
            setError("Error sending message: " + (error.message || "Please try again"));
            setLoading(false);
        }
    };

    // New function for sending file message
    const sendFileMessage = async({ file, address }) => {
        try {
            if (!file || !address) {
                setError("Please select a file and recipient");
                return;
            }

            setIsFileUploading(true);
            setUploadProgress(10);
            
            // Upload file to IPFS via Pinata
            const uploadResult = await uploadFileToIPFS(file);
            setUploadProgress(70);
            
            if (!uploadResult.success) {
                throw new Error(uploadResult.error || "Failed to upload file");
            }
            
            // Prepare file message in JSON format
            const fileData = {
                type: 'file',
                name: file.name,
                size: file.size,
                fileType: file.type,
                ipfsHash: uploadResult.ipfsHash,
                url: uploadResult.fileUrl
            };
            
            // Convert to string for blockchain storage
            const fileMessage = JSON.stringify(fileData);
            setUploadProgress(80);
            
            // Send the file data via the normal message function on the contract
            const contract = await connectingWithContract();
            const sendFileTx = await contract.sendMessage(address, fileMessage);
            setUploadProgress(90);
            await sendFileTx.wait();
            
            // Refresh messages
            await readMessage(address);
            
            setIsFileUploading(false);
            setUploadProgress(100);
            return uploadResult;
        } catch (error) {
            setIsFileUploading(false);
            setUploadProgress(0);
            console.error("Send file error:", error);
            setError("Failed to send file: " + (error.message || "Please try again"));
            return { success: false, error: error.message };
        }
    };
    
    // New function for sending file to group
    const sendGroupFileMessage = async({ file, groupId }) => {
        try {
            if (!file || !groupId) {
                setError("Please select a file and group");
                return;
            }

            setIsFileUploading(true);
            setUploadProgress(10);
            
            // Upload file to IPFS via Pinata
            const uploadResult = await uploadFileToIPFS(file);
            setUploadProgress(70);
            
            if (!uploadResult.success) {
                throw new Error(uploadResult.error || "Failed to upload file");
            }
            
            // Prepare file message in JSON format
            const fileData = {
                type: 'file',
                name: file.name,
                size: file.size,
                fileType: file.type,
                ipfsHash: uploadResult.ipfsHash,
                url: uploadResult.fileUrl
            };
            
            // Convert to string for blockchain storage
            const fileMessage = JSON.stringify(fileData);
            setUploadProgress(80);
            
            // Send the file data via the normal group message function
            const contract = await connectingWithContract();
            const sendFileTx = await contract.sendGroupMessage(groupId, fileMessage);
            setUploadProgress(90);
            await sendFileTx.wait();
            
            // Refresh messages
            const messages = await contract.getGroupMessages(groupId);
            setCurrentGroupMessages(messages);
            
            setIsFileUploading(false);
            setUploadProgress(100);
            return uploadResult;
        } catch (error) {
            setIsFileUploading(false);
            setUploadProgress(0);
            console.error("Send group file error:", error);
            setError("Failed to send file to group: " + (error.message || "Please try again"));
            return { success: false, error: error.message };
        }
    };
    
    // Helper function to detect if a message contains file data
    const isFileMessage = (message) => {
        try {
            const msgData = JSON.parse(message);
            return msgData && msgData.type === 'file' && msgData.ipfsHash;
        } catch (error) {
            return false;
        }
    };
    
    // Parse file data from message string
    const parseFileData = (message) => {
        try {
            return JSON.parse(message);
        } catch (error) {
            console.error("Error parsing file data:", error);
            return null;
        }
    };

    return(
        
        <ChatAppContext.Provider value ={{ readMessage,createAccount,addFriends,sendMessage,readUser,connectWallet,account,
            CheckIfWalletConnected,
            userName,
            friendLists,
            friendMsg,
            loading,userLists,error,currentUserAddress,currentUserName,
            // Group chat related
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
            sendFileMessage,
            sendGroupFileMessage,
            isFileUploading,
            uploadProgress,
            isFileMessage,
            parseFileData,
            formatFileSize,
            getFileIcon,
            // WebSocket and online status related
            onlineUsers,
            setOnlineUsers,
            isSocketConnected,
            setIsSocketConnected,
            typingUsers,
            setTypingUsers,
            unreadMessages,
            setUnreadMessages
        }}>
            {children}
        </ChatAppContext.Provider>
    )

}