 // SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract ChatApp {

    // User struct
    struct User {
        string name;
        Friend[] friendList;
        uint256[] groupIDs; // Store group IDs the user belongs to
    }

    struct Friend {
        address pubkey;
        string name;
    }

    struct Message {
        address sender;
        uint timestamp;
        string msg;
    }

    struct AllUserStruct {
        string name;
        address accountAddress;
    }

    // Group chat related structs
    struct GroupChat {
        uint256 id;
        string name;
        address admin;
        address[] members;
        bool exists;
    }

    struct GroupMessage {
        address sender;
        uint timestamp;
        string msg;
        string senderName;
    }

    AllUserStruct[] getAllUsers;

    mapping(address => User) userList;
    mapping(bytes32 => Message[]) allMessages;
    
    // Group chat mappings
    mapping(uint256 => GroupChat) public groupChats;
    mapping(uint256 => GroupMessage[]) public groupMessages;
    uint256 public groupChatCounter = 0;
    
    // Events for tracking actions
    event GroupCreated(uint256 groupId, string name, address admin);
    event GroupMessageSent(uint256 groupId, address sender, string message);
    
    // Check if user exists
    function checkUserExists(address pubkey) public view returns (bool) {
        return bytes(userList[pubkey].name).length > 0;
    }

    // Create account
    function createAccount(string calldata name) external {
        require(!checkUserExists(msg.sender), "User already exists");
        require(bytes(name).length > 0, "Username cannot be empty");

        userList[msg.sender].name = name;

        getAllUsers.push(AllUserStruct(name, msg.sender));
    }

    // Get Username
    function getUsername(address pubkey) external view returns (string memory) {
        require(checkUserExists(pubkey), "User not registered");
        return userList[pubkey].name;
    }

    // Add friend
    function addFriend(address friend_key, string calldata name) external {
        require(checkUserExists(msg.sender), "Create an account first");
        require(checkUserExists(friend_key), "User is not registered");
        require(msg.sender != friend_key, "User cannot add themselves as a friend");
        require(!checkAlreadyFriends(msg.sender, friend_key), "These users are already friends");

        _addFriend(msg.sender, friend_key, name);
        _addFriend(friend_key, msg.sender, userList[msg.sender].name);
    }

    // Check if already friends
    function checkAlreadyFriends(address pubkey1, address pubkey2) internal view returns (bool) {
        if (userList[pubkey1].friendList.length > userList[pubkey2].friendList.length) {
            address tmp = pubkey1;
            pubkey1 = pubkey2;
            pubkey2 = tmp;
        }

        for (uint256 i = 0; i < userList[pubkey1].friendList.length; i++) {
            if (userList[pubkey1].friendList[i].pubkey == pubkey2) return true;
        }
        return false;
    }

    // Add friend (internal function)
    function _addFriend(address me, address friend_key, string memory name) internal {
        Friend memory newFriend = Friend(friend_key, name);
        userList[me].friendList.push(newFriend);
    }

    // Get my friend list
    function getMyFriendList() external view returns (Friend[] memory) {
        return userList[msg.sender].friendList;
    }

    // Get chat code
    function _getChatCode(address pubkey1, address pubkey2) internal pure returns (bytes32) {
        if (pubkey1 < pubkey2) {
            return keccak256(abi.encodePacked(pubkey1, pubkey2));
        } else {
            return keccak256(abi.encodePacked(pubkey2, pubkey1));
        }
    }

    // Send message
    function sendMessage(address friend_key, string calldata _msg) external {
        require(checkUserExists(msg.sender), "Create an account first");
        require(checkUserExists(friend_key), "User is not registered");
        require(checkAlreadyFriends(msg.sender, friend_key), "You are not friends with the given user");

        bytes32 chatCode = _getChatCode(msg.sender, friend_key);
        Message memory newMsg = Message(msg.sender, block.timestamp, _msg);
        allMessages[chatCode].push(newMsg);
    }

    // Read message
    function readMessage(address friend_key) external view returns (Message[] memory) {
        bytes32 chatCode = _getChatCode(msg.sender, friend_key);
        return allMessages[chatCode];
    }

    // Get all app users
    function getAllAppUsers() public view returns (AllUserStruct[] memory) {
        return getAllUsers;
    }

    // Group chat functions
    
    // Create a new group
    function createGroupChat(string calldata _name, address[] calldata _members) external {
        require(checkUserExists(msg.sender), "Create an account first");
        require(bytes(_name).length > 0, "Group name cannot be empty");
        require(_members.length > 0, "Group must have at least one member");
        
        // Create a new unique ID for the group
        uint256 groupID = groupChatCounter;
        groupChatCounter++;
        
        // Create array for all members including the creator
        address[] memory allMembers = new address[](_members.length + 1);
        allMembers[0] = msg.sender; // Creator is first member
        
        // Add the provided members
        for (uint i = 0; i < _members.length; i++) {
            require(checkUserExists(_members[i]), "One of the members is not registered");
            require(checkAlreadyFriends(msg.sender, _members[i]), "You must be friends with all members");
            allMembers[i+1] = _members[i];
            
            // Add group to each member's list
            userList[_members[i]].groupIDs.push(groupID);
        }
        
        // Add group to creator's list
        userList[msg.sender].groupIDs.push(groupID);
        
        // Create and store the group
        groupChats[groupID] = GroupChat({
            id: groupID,
            name: _name,
            admin: msg.sender, // Creator is admin
            members: allMembers,
            exists: true
        });
        
        // Emit event for tracking
        emit GroupCreated(groupID, _name, msg.sender);
    }
    
    // Send message to group
    function sendGroupMessage(uint256 _groupID, string calldata _msg) external {
        require(checkUserExists(msg.sender), "Create an account first");
        require(groupChats[_groupID].exists, "Group does not exist");
        require(isGroupMember(_groupID, msg.sender), "You are not a member of this group");
        
        string memory senderName = userList[msg.sender].name;
        GroupMessage memory newMsg = GroupMessage({
            sender: msg.sender,
            timestamp: block.timestamp,
            msg: _msg,
            senderName: senderName
        });
        
        groupMessages[_groupID].push(newMsg);
        
        // Emit event for tracking
        emit GroupMessageSent(_groupID, msg.sender, _msg);
    }
    
    // Get all messages from a group
    function getGroupMessages(uint256 _groupID) external view returns (GroupMessage[] memory) {
        require(groupChats[_groupID].exists, "Group does not exist");
        require(isGroupMember(_groupID, msg.sender), "You are not a member of this group");
        
        return groupMessages[_groupID];
    }
    
    // Get group details
    function getGroupDetails(uint256 _groupID) external view returns (
        string memory name,
        address admin,
        address[] memory members
    ) {
        require(groupChats[_groupID].exists, "Group does not exist");
        require(isGroupMember(_groupID, msg.sender), "You are not a member of this group");
        
        GroupChat storage group = groupChats[_groupID];
        return (group.name, group.admin, group.members);
    }
    
    // Get all groups a user belongs to
    function getMyGroups() external view returns (uint256[] memory) {
        require(checkUserExists(msg.sender), "Create an account first");
        return userList[msg.sender].groupIDs;
    }
    
    // Helper function to check if an address is a member of a group
    function isGroupMember(uint256 _groupID, address _user) public view returns (bool) {
        if (!groupChats[_groupID].exists) {
            return false;
        }
        
        address[] storage members = groupChats[_groupID].members;
        for (uint i = 0; i < members.length; i++) {
            if (members[i] == _user) {
                return true;
            }
        }
        return false;
    }
    
    // Check if a group exists
    function groupExists(uint256 _groupID) public view returns (bool) {
        return groupChats[_groupID].exists;
    }
    
    // Get group name
    function getGroupName(uint256 _groupID) external view returns (string memory) {
        require(groupChats[_groupID].exists, "Group does not exist");
        return groupChats[_groupID].name;
    }
    
    // Get group member count
    function getGroupMemberCount(uint256 _groupID) external view returns (uint256) {
        require(groupChats[_groupID].exists, "Group does not exist");
        return groupChats[_groupID].members.length;
    }
}